import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import config from "../config";

export const signToken = (payload: { id: string; role: string }) => {
  const options: SignOptions = {
    expiresIn: config.jwt_expires_in as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, config.jwt_secret, options);
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.jwt_secret) as JwtPayload & {
    id: string;
    role: string;
  };
};