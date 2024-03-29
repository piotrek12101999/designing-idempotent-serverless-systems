import { SQSHandler } from "aws-lambda";
import { persistenceStore } from "../../database/DynamoPersistenceStore/DynamoPersistenceStore";
import {
  IdempotencyConfig,
  makeIdempotent,
} from "@aws-lambda-powertools/idempotency";
import { BookingRepository } from "../../database/types/BookingRepository";
import { DynamoBookingRepository } from "../../database/DynamoBookingRepository/DynamoBookingRepository";
import { PaymentToBeProcessedMessage } from "../../queue/types/PaymentToBeProcessedMessage";

const config = new IdempotencyConfig({});

const bookingRepository: BookingRepository = new DynamoBookingRepository();

const processingFunction = async ({ id }: PaymentToBeProcessedMessage) => {
  // Here goes 3rd party payment API service call
  const paymentProcessedSuccessfully = true; // await paymentService.process(record)

  // console.log("Charging customer");

  await bookingRepository.updateStatus(
    id,
    paymentProcessedSuccessfully ? "CONFIRMED" : "PAYMENT_DECLINED"
  );

  return paymentProcessedSuccessfully;
};

const handleBookingPayment = makeIdempotent(processingFunction, {
  persistenceStore,
  config,
});

export const handler: SQSHandler = async (event, context) => {
  config.registerLambdaContext(context);

  for (const record of event.Records) {
    await handleBookingPayment(JSON.parse(record.body));
  }
};
