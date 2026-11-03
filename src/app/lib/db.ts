import mongoose from "mongoose";
import config from "../config";

export const connectDB = async () => {
  await mongoose.connect(config.database_url);
  console.log("MongoDB connected");
};