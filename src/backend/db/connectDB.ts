import mongoose, { MongooseError } from "mongoose";
import dotenv from "dotenv";

dotenv.config();
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI!);
    console.log(`MongoDB Connecte ${conn.connection.host}`);
    console.log("MongoDB collections are ready.");
  } catch (error) {
    console.log("Error connection to MongoDB: ");
    if (error instanceof MongooseError) {
      console.log(error.message);
    }

    process.exit(1); // stop if failure
  }
};
