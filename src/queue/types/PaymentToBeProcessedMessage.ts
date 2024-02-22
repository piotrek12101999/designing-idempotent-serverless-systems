import { PaymentToBeProcessedMessage } from "../../models/PaymentToBeProcessedMessage";

export type SystemMessage = PaymentToBeProcessedMessage;

export interface MessageQueue {
  publishMessage(messageBody: SystemMessage): Promise<void>;
}
