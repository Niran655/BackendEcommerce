import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
});

export const Book = mongoose.model("Book", bookSchema);
