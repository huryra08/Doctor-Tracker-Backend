import httpStatus from "http-status";
import config from "../../config";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";

const cookieOptions = {
  httpOnly: true,
  secure: config.node_env === "production",
  sameSite: (config.node_env === "production" ? "none" : "lax") as
    | "none"
    | "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const login = catchAsync(async (req, res) => {
  const { token, user } = await AuthServices.loginUser(req.body);

  res.cookie("accessToken", token, cookieOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged in successfully",
    data: user,
  });
});

const logout = catchAsync(async (_req, res) => {
  res.clearCookie("accessToken", { ...cookieOptions, maxAge: undefined });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged out successfully",
    data: null,
  });
});

const getMe = catchAsync(async (req, res) => {
  const user = await AuthServices.getMe(req.user!.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Current user fetched",
    data: user,
  });
});

export const AuthControllers = { login, logout, getMe };