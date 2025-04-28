import { ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import { FailedResponse } from "./types";

export type SchemaValidationErrors = Record<string, string[]>;

export class HTTPError extends Error {
    status: number;
    constructor(status: number, message?: string) {
        super(message || "Server error");
        this.status = status;
    }
}

export class HTTPNotFoundError extends HTTPError {
    constructor(message?: string) {
        super(404, message || "Not found");
    }
}

export class HTTPConflictError extends HTTPError {
    constructor(message?: string) {
        super(409, message || "Conflict");
    }
}

export class HTTPUnauthorizedError extends HTTPError {
    constructor(message?: string) {
        super(401, message || "Unauthorized");
    }
}

export class HTTPBadRequestError extends HTTPError {
    constructor(message?: string) {
        super(400, message || "Bad request");
    }
}

export class HTTPForbiddenError extends HTTPError {
    constructor(message?: string) {
        super(403, message || "Forbidden");
    }
}

export class HTTPValidationError extends HTTPError {
    constructor(
        public errors: SchemaValidationErrors,
        message?: string,
    ) {
        super(422, message || "Validation error");
        this.errors = errors;
    }

    static fromZodError(err: ZodError): HTTPValidationError {
        const rawErrors = err.format();
        const keys = Object.keys(rawErrors);
        if (keys.length == 1 && keys[0] === "_errors") {
            return new this({}, rawErrors._errors[0]);
        }
        const formattedErrors: SchemaValidationErrors = {};
        Object.entries(rawErrors).forEach(([key, value]) => {
            if (key === "_errors") {
                // change key name for _errors key
                formattedErrors["others"] = value;
            } else {
                formattedErrors[key] = (
                    value as unknown as { _errors: string[] }
                )._errors;
            }
        });
        return new this(formattedErrors);
    }
}

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    _: NextFunction,
) => {
    const body: FailedResponse & { errors?: SchemaValidationErrors } = {
        success: false,
        message: err.message,
    };
    console.log("Error: ", err);
    if (err instanceof HTTPError) {
        if (err instanceof HTTPValidationError) {
            body.errors = err.errors;
        }
        res.status(err.status).json(body);
        return;
    }
    res.status(500).json({ ...body, message: "Unexpected server error" });
};
