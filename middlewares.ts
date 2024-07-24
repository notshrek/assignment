import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Payload } from "./types";
import type { MongoError } from "mongodb";

// checks the jwt token passed in the authorization header
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers["authorization"];

  // If no authorization header is provided return an error
  if (!header) {
    res.status(401).json({ message: "Authorization token is required." });
    return;
  }

  // extract the jwt token from the header
  const token = header.split(" ")[1];

  // verify token integrity and content
  // checks whether the token has been expired or not and if the role is admin
  jwt.verify(token, process.env.JWT_SECRET!, (error, data) => {
    if (error) {
      res.status(401).json({ message: "Authorization token is invalid." });
      return;
    } else if ((data as Payload).role !== "admin") {
      res
        .status(403)
        .json({ message: "Role must be admin to perform this action." });
      return;
    } else if (Number((data as Payload).expires_at) < Date.now()) {
      res.status(403).json({ message: "Authorization token has expired." });
      return;
    }

    next();
  });
}

// this middleware handles errors gracefully, logging the request and error and returning appropriate messages
export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(req, err);
  if (err.name === "MongoServerError" && (err as MongoError).code === 11000) {
    return res
      .status(409)
      .json({ message: "A user with this name already exists." });
  }
  res.status(500).json({ message: "Something went wrong." });
}
