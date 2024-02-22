import { Booking, BookingStatus } from "../../models/Booking";

export interface BookingRepository {
  create(booking: Booking): Promise<void>;
  updateStatus(id: Booking["id"], status: BookingStatus): Promise<void>;
  findById(id: Booking["id"]): Promise<Booking>;
}
