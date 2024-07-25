import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

// this method is asynchronous 
// it return a promise when its complete

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n MONGODB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MONGODB CONNECTION FAILED:", error);
    process.exit(1);
  }
};

export default connectDB;