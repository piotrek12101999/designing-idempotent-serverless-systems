import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import {
  MessageQueue,
  SystemMessage,
} from "./types/PaymentToBeProcessedMessage";
import { checkForEnv } from "../utils/checkForEnv";

export class SQSMessageQueue implements MessageQueue {
  private readonly client = new SQSClient();

  private readonly queueUrl = checkForEnv(process.env.QUEUE_URL);

  async publishMessage(messageBody: SystemMessage): Promise<void> {
    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(messageBody),
    });

    await this.client.send(command);
  }
}
