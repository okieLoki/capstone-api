import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "http-errors";

export const errorHandler: ErrorRequestHandler = async (
  err,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Bad Request",
      errors: err.errors.map((error) => error.message),
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      message: "An error has occured",
      error: err.message,
    });
  }

  if (err instanceof Error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }

  next(err);
};
