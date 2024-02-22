import { DynamoDBPersistenceLayer } from "@aws-lambda-powertools/idempotency/dynamodb";
import { BasePersistenceLayer } from "@aws-lambda-powertools/idempotency/persistence";
import { checkForEnv } from "../../utils/checkForEnv";

export const persistenceStore: BasePersistenceLayer =
  new DynamoDBPersistenceLayer({
    tableName: checkForEnv(process.env.IDEMPOTENCY_TABLE),
  });
