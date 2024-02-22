import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { BookingRepository } from "../types/BookingRepository";
import { Booking, BookingStatus } from "../../models/Booking";
import { checkForEnv } from "../../utils/checkForEnv";
import { NotFoundException } from "../../exceptions/NotFoundException/NotFoundException";
import { BadRequestException } from "../../exceptions/BadRequestException/BadRequestException";

export class DynamoBookingRepository implements BookingRepository {
  private readonly client = new DynamoDBClient();

  private readonly docClient = DynamoDBDocumentClient.from(this.client);

  private readonly tableName = checkForEnv(process.env.BOOKING_TABLE);

  async findById(id: Booking["id"]): Promise<Booking> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: {
        id,
      },
    });

    const { Item } = await this.docClient.send(command);

    if (!Item) {
      throw new NotFoundException("Booking not found");
    }

    return Item as Booking;
  }

  async updateStatus(id: Booking["id"], status: BookingStatus): Promise<void> {
    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: {
        id,
      },
      UpdateExpression: "SET #status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": status,
        ":id": id,
      },
      ConditionExpression: "id = :id",
    });

    try {
      await this.docClient.send(command);
    } catch (err) {
      if ((err as Error).name === "ConditionalCheckFailedException") {
        throw new NotFoundException("Booking not found");
      }

      throw new Error((err as Error).message);
    }
  }

  async create(booking: Booking): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: booking,
      ConditionExpression: "attribute_not_exists(id)",
    });

    try {
      await this.docClient.send(command);
    } catch (err) {
      if ((err as Error).name === "ConditionalCheckFailedException") {
        throw new BadRequestException("Booking already exists");
      }

      throw new Error((err as Error).message);
    }
  }
}
