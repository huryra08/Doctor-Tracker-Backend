import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import config from "../../config";
import { IUser, IUserModel } from "./auth.interface";

const userSchema = new Schema<IUser, IUserModel>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin"], default: "admin" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) 
    return ;
  this.password = await bcrypt.hash(this.password, config.bcrypt_salt_rounds);
  
});

userSchema.statics.isPasswordMatched = async function (
  plain: string,
  hashed: string
) {
  return bcrypt.compare(plain, hashed);
};

export const User = model<IUser, IUserModel>("User", userSchema);