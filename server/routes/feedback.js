const express = require('express');
const { body, validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');
const SwapRequest = require('../models/SwapRequest');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/feedback
// @desc    Create feedback for a completed swap
// @access  Private
router.post('/', protect, [
  body('swapRequestId').isMongoId().withMessage('Valid swap request ID is required'),
  body('toUserId').isMongoId().withMessage('Valid user ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),
  body('skillRated').trim().notEmpty().withMessage('Skill rated is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation Errors:', errors.array());
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { swapRequestId, toUserId, rating, comment, skillRated } = req.body;

    // Check if swap request exists and is completed
    const swapRequest = await SwapRequest.findById(swapRequestId);
    if (!swapRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Swap request not found' 
      });
    }

    if (swapRequest.status !== 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Feedback can only be given for completed swaps' 
      });
    }

    // Check if user is involved in this swap
    if (swapRequest.requesterId.toString() !== req.user.id && 
        swapRequest.recipientId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to give feedback for this swap' 
      });
    }

    // Check if user is rating the other person (not themselves)
    if (toUserId === req.user.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot rate yourself' 
      });
    }

    // Check if the user being rated is actually involved in the swap
    if (swapRequest.requesterId.toString() !== toUserId && 
        swapRequest.recipientId.toString() !== toUserId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User being rated must be involved in the swap' 
      });
    }

    // Check if feedback already exists for this swap from this user
    const existingFeedback = await Feedback.findOne({
      swapRequestId,
      fromUserId: req.user.id
    });

    if (existingFeedback) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already given feedback for this swap' 
      });
    }

    // Create feedback
    const feedback = await Feedback.create({
      swapRequestId,
      fromUserId: req.user.id,
      toUserId,
      rating,
      comment,
      skillRated
    });

    // Populate user details
    await feedback.populate([
      { path: 'fromUserId', select: 'name profilePhotoURL' },
      { path: 'toUserId', select: 'name profilePhotoURL' }
    ]);

    // Create notification for the recipient (toUserId)
    const Notification = require('../models/Notification');
    const senderName = feedback.fromUserId.name || 'A user';
    await Notification.create({
      userId: toUserId,
      type: 'feedback',
      message: `You received a new rating from ${senderName}.`,
      swapRequestId: swapRequestId,
      read: false
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating feedback' 
    });
  }
});

// @route   GET /api/feedback/user/:userId
// @desc    Get feedback for a specific user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const feedback = await Feedback.find({ toUserId: req.params.userId })
      .populate('fromUserId', 'name profilePhotoURL')
      .populate('toUserId', 'name profilePhotoURL')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Feedback.countDocuments({ toUserId: req.params.userId });

    res.json({
      success: true,
      feedback,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalFeedback: total,
        hasNext: skip + feedback.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching feedback' 
    });
  }
});

// @route   GET /api/feedback/swap/:swapId
// @desc    Get feedback for a specific swap
// @access  Private
router.get('/swap/:swapId', protect, async (req, res) => {
  try {
    // Check if user is involved in this swap
    const swapRequest = await SwapRequest.findById(req.params.swapId);
    if (!swapRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Swap request not found' 
      });
    }

    if (swapRequest.requesterId.toString() !== req.user.id && 
        swapRequest.recipientId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view feedback for this swap' 
      });
    }

    const feedback = await Feedback.find({ swapRequestId: req.params.swapId })
      .populate('fromUserId', 'name profilePhotoURL')
      .populate('toUserId', 'name profilePhotoURL')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      feedback
    });
  } catch (error) {
    console.error('Get swap feedback error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching swap feedback' 
    });
  }
});

// @route   GET /api/feedback/my-received
// @desc    Get feedback received by current user
// @access  Private
router.get('/my-received', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const feedback = await Feedback.find({ toUserId: req.user.id })
      .populate('fromUserId', 'name profilePhotoURL')
      .populate('toUserId', 'name profilePhotoURL')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Feedback.countDocuments({ toUserId: req.user.id });

    res.json({
      success: true,
      feedback,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalFeedback: total,
        hasNext: skip + feedback.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get my feedback error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching your feedback' 
    });
  }
});

// @route   GET /api/feedback/my-given
// @desc    Get feedback given by current user
// @access  Private
router.get('/my-given', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const feedback = await Feedback.find({ fromUserId: req.user.id })
      .populate('fromUserId', 'name profilePhotoURL')
      .populate('toUserId', 'name profilePhotoURL')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Feedback.countDocuments({ fromUserId: req.user.id });

    res.json({
      success: true,
      feedback,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalFeedback: total,
        hasNext: skip + feedback.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get my given feedback error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching your given feedback' 
    });
  }
});

// @route   PUT /api/feedback/:id
// @desc    Update feedback (only within 24 hours)
// @access  Private
router.put('/:id', protect, [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ 
        success: false, 
        message: 'Feedback not found' 
      });
    }

    // Check if user owns this feedback
    if (feedback.fromUserId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this feedback' 
      });
    }

    // Check if feedback is within 24 hours
    const hoursSinceCreation = (Date.now() - feedback.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
      return res.status(400).json({ 
        success: false, 
        message: 'Feedback can only be updated within 24 hours of creation' 
      });
    }

    // Update feedback
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'fromUserId', select: 'name profilePhotoURL' },
      { path: 'toUserId', select: 'name profilePhotoURL' }
    ]);

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      feedback: updatedFeedback
    });
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating feedback' 
    });
  }
});

// @route   DELETE /api/feedback/:id
// @desc    Delete feedback (only within 24 hours)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ 
        success: false, 
        message: 'Feedback not found' 
      });
    }

    // Check if user owns this feedback
    if (feedback.fromUserId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this feedback' 
      });
    }

    // Check if feedback is within 24 hours
    const hoursSinceCreation = (Date.now() - feedback.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
      return res.status(400).json({ 
        success: false, 
        message: 'Feedback can only be deleted within 24 hours of creation' 
      });
    }

    await Feedback.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting feedback' 
    });
  }
});

module.exports = router; 