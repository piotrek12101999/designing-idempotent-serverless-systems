import { HttpStatus } from "../../utils/HttpStatus";
import { HttpException } from "../HttpException/HttpException";

export class BadRequestException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
