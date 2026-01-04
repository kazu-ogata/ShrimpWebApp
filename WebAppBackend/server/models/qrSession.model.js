import mongoose from 'mongoose';

const qrSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now, expires: 300 } // Deletes itself after 5 mins
});

export default mongoose.model('QrSession', qrSessionSchema);