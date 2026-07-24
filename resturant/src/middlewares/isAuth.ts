import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  image: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Please login - No auth header" });
    }

    const token: any = authHeader?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Please login - Token missing" });
    }

    const decodedValue = jwt.verify(
      token,
      process.env.JWT_SEC as string,
    ) as JwtPayload;

    if (!decodedValue || !decodedValue.user) {
      res.status(401).json({ message: "Invalid token" });
    }

    req.user = decodedValue.user;
    next();
  } catch (error) {
    res.status(500).json({ message: "Please login - jwt error" });
  }
};
