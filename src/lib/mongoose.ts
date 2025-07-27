// src/lib/mongodb.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) throw new Error("MongoDB URI is not defined");

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) return;

    try {
        await mongoose.connect(MONGODB_URI, {
            dbName: "marketplace",
            bufferCommands: true,
        });

        isConnected = true;
        console.log("✅ MongoDB connected");
    } catch (err) {
        console.error("MongoDB connection error:", err);
    }
};
