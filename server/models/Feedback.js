const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  swapRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SwapRequest',
    required: true
  },
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: [500, 'Comment cannot exceed 500 characters'],
    trim: true
  },
  skillRated: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
feedbackSchema.index({ toUserId: 1, createdAt: -1 });
feedbackSchema.index({ swapRequestId: 1 });
feedbackSchema.index({ fromUserId: 1, toUserId: 1 });

// Ensure one feedback per swap per user
feedbackSchema.index({ swapRequestId: 1, fromUserId: 1 }, { unique: true });

// Pre-save middleware to update user rating
feedbackSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const User = mongoose.model('User');
      const user = await User.findById(this.toUserId);
      if (user) {
        await user.updateRating(this.rating);
      }
    } catch (error) {
      next(error);
    }
  }
  next();
});

// Method to get average rating for a user
feedbackSchema.statics.getAverageRating = async function(userId) {
  const result = await this.aggregate([
    { $match: { toUserId: userId } },
    { $group: { _id: null, averageRating: { $avg: '$rating' }, totalRatings: { $sum: 1 } } }
  ]);
  
  return result.length > 0 ? {
    averageRating: Math.round(result[0].averageRating * 10) / 10,
    totalRatings: result[0].totalRatings
  } : { averageRating: 0, totalRatings: 0 };
};

module.exports = mongoose.model('Feedback', feedbackSchema); 