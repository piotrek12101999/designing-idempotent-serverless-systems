export type BookingStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "CONFIRMED"
  | "PAYMENT_DECLINED";

type Id = string;

export interface Booking {
  id: Id;
  status: BookingStatus;
  amount: string;
  propertyId: Id;
  checkInDate: string;
  checkOutDate: string;
}
