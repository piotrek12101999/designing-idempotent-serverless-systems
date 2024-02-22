import { APIGatewayProxyHandler } from "aws-lambda";
import { BookingRepository } from "../../database/types/BookingRepository";
import { DynamoBookingRepository } from "../../database/DynamoBookingRepository/DynamoBookingRepository";
import { MessageQueue } from "../../queue/types/PaymentToBeProcessedMessage";
import { SQSMessageQueue } from "../../queue/SQSMessageQueue";
import { getIdFromPathParams } from "../../utils/getIdFromPathParams";
import { httpMiddleware } from "../../utils/httpMiddleware";

const bookingRepository: BookingRepository = new DynamoBookingRepository();

const messageQueue: MessageQueue = new SQSMessageQueue();

export const handler: APIGatewayProxyHandler = httpMiddleware(async (event) => {
  const id = getIdFromPathParams(event);

  // Here we also check if booking exists, if not findById will throw 404 error
  const { amount } = await bookingRepository.findById(id);

  try {
    await bookingRepository.updateStatus(id, "ACCEPTED");

    // Here we by accident publish two identical messages
    await messageQueue.publishMessage({ id, amount });
    return messageQueue.publishMessage({ id, amount });
  } catch (err) {
    // Reverting to initial state in case of error
    await bookingRepository.updateStatus(id, "REQUESTED");

    // Throwing error so can be processed by middleware
    throw new Error((err as Error).message);
  }
});
