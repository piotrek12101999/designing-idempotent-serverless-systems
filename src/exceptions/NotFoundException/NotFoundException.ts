import { HttpStatus } from "../../utils/HttpStatus";
import { HttpException } from "../HttpException/HttpException";

export class NotFoundException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.NOT_FOUND);
  }
}
