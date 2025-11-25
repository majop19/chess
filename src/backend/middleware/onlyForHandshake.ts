// @ts-nocheck
import { type NextFunction, type Request, type Response } from "express";

// ensures that the middlewares are only applied to the first HTTP request of the session.
export function onlyForHandshake(
  middleware: (req: Request, res: Response, next: NextFunction) => void
) {
  return (req: Request, res: Response, next: NextFunction) => {
    // @ts-expect-error follow doc socket.io https://socket.io/fr/how-to/use-with-passport
    const isHandshake = req._query.sid === undefined;
    if (isHandshake) {
      middleware(req, res, next);
    } else {
      next();
    }
  };
}
