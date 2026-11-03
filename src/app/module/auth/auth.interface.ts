import { Model } from "mongoose";

export type TUserRole = "admin";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: TUserRole;
}

export interface IUserModel extends Model<IUser> {
  isPasswordMatched(plain: string, hashed: string): Promise<boolean>;
}

export interface ILogin {
  email: string;
  password: string;
}