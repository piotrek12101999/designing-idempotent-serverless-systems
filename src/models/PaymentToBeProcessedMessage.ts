import { Booking } from "./Booking";

export interface PaymentToBeProcessedMessage {
  id: Booking["id"];
  amount: Booking["amount"];
}
