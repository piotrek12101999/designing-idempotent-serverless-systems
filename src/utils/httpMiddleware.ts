import { APIGatewayProxyResult, Callback, Context } from "aws-lambda";
import { HttpException } from "../exceptions/HttpException/HttpException";
import { HttpStatus } from "./HttpStatus";

interface Options {
  successCode?: number;
}

function makeResponse(
  message: unknown,
  statusCode: number
): APIGatewayProxyResult {
  return {
    statusCode,
    body: JSON.stringify(message),
  };
}

export const httpMiddleware =
  <E = unknown, R = unknown, C extends Context = Context>(
    handler: (event: E, context: C, ctx: Callback) => Promise<R>,
    options: Options = {}
  ) =>
  async (event: E, context: C, ctx: Callback) => {
    try {
      const result = await handler(event, context, ctx);

      return makeResponse(result, options?.successCode || HttpStatus.OK);
    } catch (err) {
      console.log(err);

      if (err instanceof HttpException) {
        return makeResponse(err.message, err.code);
      }

      return makeResponse(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  };
