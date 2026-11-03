import { Types } from "mongoose";

export type TGender = "male" | "female" | "other";

export interface IPatient {
  name: string;
  age: number;
  gender: TGender;
  phone: string;
  condition: string;
  doctor: Types.ObjectId;
}