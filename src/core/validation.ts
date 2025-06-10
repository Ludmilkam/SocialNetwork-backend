import { Request } from "express";
import { AnyZodObject, z, ZodError, ZodType } from "zod";
import { HTTPValidationError } from "./http-errors";

function validateSchema<T extends ZodType>(
  schema: T,
  input: unknown,
): z.infer<T> {
  try {
    return schema.parse(input);
  } catch (err) {
    if (err instanceof ZodError) {
      throw HTTPValidationError.fromZodError(err);
    }
    throw err;
  }
}

export function validateObjectId(id: string): number {
  const schema = z.coerce.number().gt(0);
  return validateSchema(schema, id);
}

export function validateRequest<T extends AnyZodObject>(
  req: Request,
  schema: T,
  location: "params" | "body" | "query" = "body",
): z.infer<T> {
  return validateSchema(schema, req[location]);
}
