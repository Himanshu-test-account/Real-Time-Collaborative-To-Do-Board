import mongoose from 'mongoose';

const actionLogSchema = new mongoose.Schema({
  actionType: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  description: { type: String },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('ActionLog', actionLogSchema); 