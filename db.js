// db.js
import mongoose from "mongoose";



export async function connectDB() {
  try {
    await mongoose.connect(process.env.atlas_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

  
    console.log(" MongoDB connected");
  } catch (err) {
    console.error(" MongoDB connection error:", err.message);
    process.exit(1);
  }
}
