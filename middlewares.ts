import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Payload } from "./types";

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
