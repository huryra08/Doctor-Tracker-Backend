import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";
import { verifyToken } from "../lib/jwt";
import { User } from "../module/auth/auth.model";

const auth = (...requiredRoles: string[]) => {
  return catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    const token =
      req.cookies?.accessToken ||
      (header && header.startsWith("Bearer ") ? header.slice(7) : undefined);

    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized");
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User no longer exists");
    }

    if (requiredRoles.length && !requiredRoles.includes(user.role)) {
      throw new AppError(httpStatus.FORBIDDEN, "You do not have permission");
    }

    req.user = { id: user._id.toString(), role: user.role };
    next();
  });
};

export default auth;