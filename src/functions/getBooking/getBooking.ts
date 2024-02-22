import { APIGatewayProxyHandler } from "aws-lambda";
import { BookingRepository } from "../../database/types/BookingRepository";
import { DynamoBookingRepository } from "../../database/DynamoBookingRepository/DynamoBookingRepository";
import { getIdFromPathParams } from "../../utils/getIdFromPathParams";
import { httpMiddleware } from "../../utils/httpMiddleware";

const bookingRepository: BookingRepository = new DynamoBookingRepository();

export const handler: APIGatewayProxyHandler = httpMiddleware(async (event) => {
  const id = getIdFromPathParams(event);

  return bookingRepository.findById(id);
});
