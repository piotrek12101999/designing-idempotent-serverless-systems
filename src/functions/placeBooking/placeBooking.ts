import {
  IdempotencyConfig,
  makeIdempotent,
} from "@aws-lambda-powertools/idempotency";
import { DynamoDBPersistenceLayer } from "@aws-lambda-powertools/idempotency/dynamodb";
import { BasePersistenceLayer } from "@aws-lambda-powertools/idempotency/persistence";
import type { APIGatewayProxyHandler, APIGatewayProxyEvent } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { BookingRepository } from "../../database/types/BookingRepository";
import { DynamoBookingRepository } from "../../database/DynamoBookingRepository/DynamoBookingRepository";
import { Booking } from "../../models/Booking";
import { schema } from "./schema";
import { checkForEnv } from "../../utils/checkForEnv";
import { BadRequestException } from "../../exceptions/BadRequestException/BadRequestException";
import { httpMiddleware } from "../../utils/httpMiddleware";
import { HttpStatus } from "../../utils/HttpStatus";

interface PartialBooking extends Omit<Booking, "id" | "status"> {}

const persistenceStore: BasePersistenceLayer = new DynamoDBPersistenceLayer({
  tableName: checkForEnv(process.env.IDEMPOTENCY_TABLE),
});

const config = new IdempotencyConfig({
  eventKeyJmesPath: 'headers."X-Idempotency-Key"',
});

const bookingRepository: BookingRepository = new DynamoBookingRepository();

const processingFunction = async ({ body }: APIGatewayProxyEvent) => {
  if (!body) {
    throw new BadRequestException("Missing body");
  }

  const booking: PartialBooking = JSON.parse(body);

  const { error } = schema.validate(booking);

  if (error) {
    throw new BadRequestException(error.message);
  }

  const id = uuid();

  await bookingRepository.create({
    ...booking,
    id,
    status: "REQUESTED",
  });

  return id;
};

const processIdempotently = makeIdempotent(processingFunction, {
  persistenceStore,
  config,
});

export const handler: APIGatewayProxyHandler = httpMiddleware(
  async (event, context) => {
    if (!event.headers["X-Idempotency-Key"]) {
      throw new BadRequestException("Missing idempotency key");
    }

    config.registerLambdaContext(context);

    return processIdempotently(event);
  },
  {
    successCode: HttpStatus.CREATED,
  }
);
