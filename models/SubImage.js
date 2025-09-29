// models/SubImage.js
import mongoose from 'mongoose';

const subImageSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
});

export default mongoose.model('SubImage', subImageSchema);