import httpStatus from "http-status";
import AppError from "../../utils/AppError";
import { signToken } from "../../lib/jwt";
import { ILogin } from "./auth.interface";
import { User } from "./auth.model";

const loginUser = async (payload: ILogin) => {
  const user = await User.findOne({ email: payload.email }).select("+password");

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  const matched = await User.isPasswordMatched(payload.password, user.password);
  if (!matched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  const token = signToken({ id: user._id.toString(), role: user.role });

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

const getMe = async (id: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  return user;
};

export const AuthServices = { loginUser, getMe };