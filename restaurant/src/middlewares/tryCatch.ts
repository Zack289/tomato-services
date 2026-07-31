import { Request, Response, RequestHandler, NextFunction } from "express";

const tryCatch = (handler: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Internal server error";
      res.status(500).json({
        message,
      });
    }
  };
};

export default tryCatch;
