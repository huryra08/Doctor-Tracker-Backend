import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

const validateRequest = (schema: ZodTypeAny) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      })) as { body?: unknown };

      if (parsed.body) req.body = parsed.body;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validateRequest;