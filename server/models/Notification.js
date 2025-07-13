const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // recipient
  type: { type: String, enum: ['swap_request', 'swap_accepted', 'swap_rejected'], required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  swapRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'SwapRequest' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema); 