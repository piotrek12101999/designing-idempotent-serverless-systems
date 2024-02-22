import { APIGatewayProxyEvent } from "aws-lambda";
import joi from "joi";
import { BadRequestException } from "../exceptions/BadRequestException/BadRequestException";

const schema = joi
  .object({
    id: joi.string().uuid().required(),
  })
  .required();

export const getIdFromPathParams = (event: APIGatewayProxyEvent): string => {
  const { pathParameters } = event;

  if (!pathParameters) {
    throw new BadRequestException("Missing params");
  }

  const { error } = schema.validate(pathParameters);

  if (error) {
    throw new BadRequestException(error.message);
  }

  return pathParameters.id as string;
};
