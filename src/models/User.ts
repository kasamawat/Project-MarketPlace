// models/User.ts

import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    role: "customer" | "seller" | "admin";
    createdAt: Date;
    firstname: string;
    lastname: string;
    gender: string;
    dob: Date
}

const UserSchema = new Schema<IUser>(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ["customer", "seller", "admin"],
            default: "customer",
        },
        firstname: { type: String },
        lastname: { type: String },
    },
    { timestamps: true }
);


// ป้องกันการ recompile ใน hot reload
const UserModel: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default UserModel;
