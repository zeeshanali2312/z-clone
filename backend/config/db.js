import mongoose from "mongoose";
import { ENV } from "./env.js";

const connectDB = async () => {
  if (!ENV.MONGO_URI) {
    throw new Error("mongoo id not found");
  }

  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log("Database connected successfully ✅");
  } catch (error) {
    console.error("failed to connect to db ", error);
    process.exit(1);
  }
};

export default connectDB;