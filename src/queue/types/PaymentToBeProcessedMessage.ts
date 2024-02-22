import { Booking } from "../../models/Booking";

export interface PaymentToBeProcessedMessage {
  id: Booking["id"];
  amount: Booking["amount"];
}

export type SystemMessage = PaymentToBeProcessedMessage;

export interface MessageQueue {
  publishMessage(messageBody: SystemMessage): Promise<void>;
}
