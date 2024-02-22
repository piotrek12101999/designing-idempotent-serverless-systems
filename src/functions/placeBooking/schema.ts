import joi from "joi";

export const schema = joi
  .object({
    amount: joi.string().required(),
    propertyId: joi.string().uuid().required(),
    checkInDate: joi.string().isoDate().required(),
    checkOutDate: joi.string().isoDate().required(),
  })
  .required();
