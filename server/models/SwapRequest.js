const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },
  requesterSkill: {
    type: String,
    required: true,
    trim: true
  },
  recipientSkill: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    maxlength: [500, 'Message cannot exceed 500 characters'],
    trim: true
  },
  scheduledDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: {
    type: String,
    maxlength: [200, 'Cancellation reason cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

// Index for efficient queries
swapRequestSchema.index({ requesterId: 1, status: 1 });
swapRequestSchema.index({ recipientId: 1, status: 1 });
swapRequestSchema.index({ status: 1, createdAt: -1 });

// Virtual for checking if swap is active
swapRequestSchema.virtual('isActive').get(function() {
  return ['pending', 'accepted'].includes(this.status);
});

// Virtual for checking if swap is completed
swapRequestSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

// Method to accept swap request
swapRequestSchema.methods.accept = function() {
  this.status = 'accepted';
  return this.save();
};

// Method to reject swap request
swapRequestSchema.methods.reject = function() {
  this.status = 'rejected';
  return this.save();
};

// Method to cancel swap request
swapRequestSchema.methods.cancel = function(userId, reason = '') {
  this.status = 'cancelled';
  this.cancelledBy = userId;
  this.cancellationReason = reason;
  return this.save();
};

// Method to complete swap
swapRequestSchema.methods.complete = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Ensure virtuals are included in JSON output
swapRequestSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('SwapRequest', swapRequestSchema); 