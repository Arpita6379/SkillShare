const express = require('express');
const { body, validationResult } = require('express-validator');
const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/swaps
// @desc    Create a new swap request
// @access  Private
router.post('/', protect, [
  body('recipientId').isMongoId().withMessage('Valid recipient ID is required'),
  body('requesterSkill').trim().notEmpty().withMessage('Requester skill is required'),
  body('recipientSkill').trim().notEmpty().withMessage('Recipient skill is required'),
  body('message').optional().trim().isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters'),
  body('scheduledDate').optional().isISO8601().withMessage('Scheduled date must be a valid date')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { recipientId, requesterSkill, recipientSkill, message, scheduledDate } = req.body;

    // Check if recipient exists and is not banned
    const recipient = await User.findById(recipientId);
    if (!recipient || recipient.banned) {
      return res.status(404).json({ 
        success: false, 
        message: 'Recipient not found' 
      });
    }

    // Check if recipient profile is public
    if (!recipient.isPublic) {
      return res.status(403).json({ 
        success: false, 
        message: 'Cannot send request to private profile' 
      });
    }

    // Check if user is trying to send request to themselves
    if (recipientId === req.user.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot send swap request to yourself' 
      });
    }

    // Check if requester has the skill they're offering
    const requester = await User.findById(req.user.id);
    if (!requester) {
      throw new Error('Requester not found');
    }
    if (!requester.skillsOffered.includes(requesterSkill)) {
      return res.status(400).json({ 
        success: false, 
        message: 'You must have the skill you are offering in your skills offered list' 
      });
    }

    // Check if recipient has the skill they're offering
    if (!recipient.skillsOffered.includes(recipientSkill)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Recipient does not have the skill you are requesting' 
      });
    }

    // Check if there's already a pending swap request between these users
    const existingSwap = await SwapRequest.findOne({
  $or: [
    { requesterId: req.user.id, recipientId },
    { requesterId: recipientId, recipientId: req.user.id }
  ],
  status: { $in: ['pending', 'accepted'] }
});

    if (existingSwap) {
      return res.status(400).json({ 
        success: false, 
        message: 'There is already an active swap request between you and this user' 
      });
    }

    // Create swap request
    const swapRequest = await SwapRequest.create({
      requesterId: req.user.id,
      recipientId,
      requesterSkill,
      recipientSkill,
      message,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null
    });

    // Populate user details
    await swapRequest.populate([
      { path: 'requesterId', select: 'name profilePhotoURL' },
      { path: 'recipientId', select: 'name profilePhotoURL' }
    ]);

    // Create notification for recipient
    await Notification.create({
      userId: recipientId, // recipient gets notified
      type: 'swap_request',
      message: `${requester.name} sent you a swap request.`,
      swapRequestId: swapRequest._id
    });

    res.status(201).json({
      success: true,
      message: 'Swap request sent successfully',
      swapRequest
    });
  } catch (error) {
    console.error('Create swap error:', error, error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating swap request' 
    });
  }
});

// @route   GET /api/swaps/mine
// @desc    Get user's swap requests
// @access  Private
router.get('/mine', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {
      $or: [
        { requesterId: req.user.id },
        { recipientId: req.user.id }
      ]
    };
    
    if (status) {
      query.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const swapRequests = await SwapRequest.find(query)
      .populate('requesterId', 'name profilePhotoURL')
      .populate('recipientId', 'name profilePhotoURL')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await SwapRequest.countDocuments(query);
    
    // Add additional context for each swap
    const swapsWithContext = swapRequests.map(swap => {
      const swapObj = swap.toObject();
      swapObj.isRequester = swap.requesterId._id.toString() === req.user.id;
      swapObj.otherUser = swapObj.isRequester ? swap.recipientId : swap.requesterId;
      return swapObj;
    });
    
    res.json({
      success: true,
      swaps: swapsWithContext,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalSwaps: total,
        hasNext: skip + swapRequests.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get swaps error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching swaps' 
    });
  }
});

// @route   GET /api/swaps/:id
// @desc    Get specific swap request
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id)
      .populate('requesterId', 'name profilePhotoURL')
      .populate('recipientId', 'name profilePhotoURL');
    
    if (!swapRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Swap request not found' 
      });
    }
    
    // Check if user is involved in this swap
    if (swapRequest.requesterId._id.toString() !== req.user.id && 
        swapRequest.recipientId._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view this swap request' 
      });
    }
    
    const swapObj = swapRequest.toObject();
    swapObj.isRequester = swapRequest.requesterId._id.toString() === req.user.id;
    swapObj.otherUser = swapObj.isRequester ? swapRequest.recipientId : swapRequest.requesterId;
    
    res.json({
      success: true,
      swapRequest: swapObj
    });
  } catch (error) {
    console.error('Get swap error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching swap request' 
    });
  }
});

// @route   PUT /api/swaps/:id/accept
// @desc    Accept a swap request
// @access  Private
router.put('/:id/accept', protect, async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);
    if (!swapRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Swap request not found' 
      });
    }
    // Check if user is the recipient
    if (swapRequest.recipientId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only the recipient can accept swap requests' 
      });
    }
    // Check if swap is still pending
    if (swapRequest.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Swap request is no longer pending' 
      });
    }
    await swapRequest.accept();
    await swapRequest.populate([
      { path: 'requesterId', select: 'name profilePhotoURL' },
      { path: 'recipientId', select: 'name profilePhotoURL' }
    ]);
    // Notify the requester (sender)
    await Notification.create({
      userId: swapRequest.requesterId,
      type: 'swap_accepted',
      message: `${swapRequest.recipientId.name} accepted your swap request!`,
      swapRequestId: swapRequest._id
    });
    res.json({
      success: true,
      message: 'Swap request accepted successfully',
      swapRequest
    });
  } catch (error) {
    console.error('Accept swap error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while accepting swap request' 
    });
  }
});

// @route   PUT /api/swaps/:id/reject
// @desc    Reject a swap request
// @access  Private
router.put('/:id/reject', protect, async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);
    if (!swapRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Swap request not found' 
      });
    }
    // Check if user is the recipient
    if (swapRequest.recipientId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only the recipient can reject swap requests' 
      });
    }
    // Check if swap is still pending
    if (swapRequest.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Swap request is no longer pending' 
      });
    }
    await swapRequest.reject();
    await swapRequest.populate([
      { path: 'requesterId', select: 'name profilePhotoURL' },
      { path: 'recipientId', select: 'name profilePhotoURL' }
    ]);
    // Notify the requester (sender)
    await Notification.create({
      userId: swapRequest.requesterId,
      type: 'swap_rejected',
      message: `${swapRequest.recipientId.name} rejected your swap request.`,
      swapRequestId: swapRequest._id
    });
    res.json({
      success: true,
      message: 'Swap request rejected successfully',
      swapRequest
    });
  } catch (error) {
    console.error('Reject swap error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while rejecting swap request' 
    });
  }
});

// @route   PUT /api/swaps/:id/cancel
// @desc    Cancel a swap request
// @access  Private
router.put('/:id/cancel', protect, [
  body('reason').optional().trim().isLength({ max: 200 }).withMessage('Reason cannot exceed 200 characters')
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
    
    const swapRequest = await SwapRequest.findById(req.params.id);
    
    if (!swapRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Swap request not found' 
      });
    }
    
    // Check if user is involved in this swap
    if (swapRequest.requesterId.toString() !== req.user.id && 
        swapRequest.recipientId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to cancel this swap request' 
      });
    }
    
    // Check if swap can be cancelled
    if (!['pending', 'accepted'].includes(swapRequest.status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Swap request cannot be cancelled' 
      });
    }
    
    await swapRequest.cancel(req.user.id, req.body.reason);
    
    await swapRequest.populate([
      { path: 'requesterId', select: 'name profilePhotoURL' },
      { path: 'recipientId', select: 'name profilePhotoURL' }
    ]);
    
    res.json({
      success: true,
      message: 'Swap request cancelled successfully',
      swapRequest
    });
  } catch (error) {
    console.error('Cancel swap error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while cancelling swap request' 
    });
  }
});

// @route   PUT /api/swaps/:id/complete
// @desc    Mark a swap as completed
// @access  Private
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);
    
    if (!swapRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Swap request not found' 
      });
    }
    
    // Check if user is involved in this swap
    if (swapRequest.requesterId.toString() !== req.user.id && 
        swapRequest.recipientId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to complete this swap' 
      });
    }
    
    // Check if swap is accepted
    if (swapRequest.status !== 'accepted') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only accepted swaps can be marked as completed' 
      });
    }
    
    await swapRequest.complete();
    
    await swapRequest.populate([
      { path: 'requesterId', select: 'name profilePhotoURL' },
      { path: 'recipientId', select: 'name profilePhotoURL' }
    ]);
    
    res.json({
      success: true,
      message: 'Swap marked as completed successfully',
      swapRequest
    });
  } catch (error) {
    console.error('Complete swap error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while completing swap' 
    });
  }
});

module.exports = router; 