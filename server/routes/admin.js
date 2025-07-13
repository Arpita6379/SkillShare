const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const SwapRequest = require('../models/SwapRequest');
const Feedback = require('../models/Feedback');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Apply admin middleware to all routes
router.use(protect, admin);

// @route   GET /api/admin/users
// @desc    Get all users (admin only)
// @access  Private (Admin)
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, banned } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (banned !== undefined) {
      query.banned = banned === 'true';
    }
    
    const skip = (page - 1) * limit;
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: skip + users.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching users' 
    });
  }
});

// @route   PUT /api/admin/users/:id/ban
// @desc    Ban a user
// @access  Private (Admin)
router.put('/users/:id/ban', [
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
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Prevent banning other admins
    if (user.role === 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Cannot ban other administrators' 
      });
    }
    
    user.banned = true;
    await user.save();
    
    res.json({
      success: true,
      message: 'User banned successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        banned: user.banned
      }
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while banning user' 
    });
  }
});

// @route   PUT /api/admin/users/:id/unban
// @desc    Unban a user
// @access  Private (Admin)
router.put('/users/:id/unban', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    user.banned = false;
    await user.save();
    
    res.json({
      success: true,
      message: 'User unbanned successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        banned: user.banned
      }
    });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while unbanning user' 
    });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Change user role
// @access  Private (Admin)
router.put('/users/:id/role', [
  body('role').isIn(['user', 'admin']).withMessage('Role must be either user or admin')
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
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    user.role = req.body.role;
    await user.save();
    
    res.json({
      success: true,
      message: 'User role updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating user role' 
    });
  }
});

// @route   PUT /api/admin/users/:id/skills
// @desc    Admin edit or clear user skillsOffered, skillsWanted, or bio
// @access  Private (Admin)
router.put('/users/:id/skills', [
  body('skillsOffered').optional().isArray().withMessage('skillsOffered must be an array'),
  body('skillsWanted').optional().isArray().withMessage('skillsWanted must be an array'),
  body('bio').optional().isString().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters')
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
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (req.body.skillsOffered !== undefined) user.skillsOffered = req.body.skillsOffered;
    if (req.body.skillsWanted !== undefined) user.skillsWanted = req.body.skillsWanted;
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    await user.save();
    res.json({
      success: true,
      message: 'User skills/bio updated successfully',
      user: {
        id: user._id,
        name: user.name,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Admin edit skills error:', error);
    res.status(500).json({ success: false, message: 'Server error while editing user skills' });
  }
});

// @route   GET /api/admin/swaps
// @desc    Get all swap requests (admin only)
// @access  Private (Admin)
router.get('/swaps', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const swaps = await SwapRequest.find(query)
      .populate('requesterId', 'name email')
      .populate('recipientId', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await SwapRequest.countDocuments(query);
    
    res.json({
      success: true,
      swaps,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalSwaps: total,
        hasNext: skip + swaps.length < total,
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

// @route   DELETE /api/admin/swaps/:id
// @desc    Delete a swap request (admin only)
// @access  Private (Admin)
router.delete('/swaps/:id', async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);
    
    if (!swapRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Swap request not found' 
      });
    }
    
    await SwapRequest.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Swap request deleted successfully'
    });
  } catch (error) {
    console.error('Delete swap error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting swap request' 
    });
  }
});

// @route   GET /api/admin/feedback
// @desc    Get all feedback (admin only)
// @access  Private (Admin)
router.get('/feedback', async (req, res) => {
  try {
    const { page = 1, limit = 20, rating } = req.query;
    
    let query = {};
    if (rating) {
      query.rating = parseInt(rating);
    }
    
    const skip = (page - 1) * limit;
    
    const feedback = await Feedback.find(query)
      .populate('fromUserId', 'name email')
      .populate('toUserId', 'name email')
      .populate('swapRequestId', 'requesterSkill recipientSkill')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Feedback.countDocuments(query);
    
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

// @route   DELETE /api/admin/feedback/:id
// @desc    Delete feedback (admin only)
// @access  Private (Admin)
router.delete('/feedback/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ 
        success: false, 
        message: 'Feedback not found' 
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

// @route   GET /api/admin/reports/activity
// @desc    Get activity reports
// @access  Private (Admin)
router.get('/reports/activity', async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));
    
    // User statistics
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({ createdAt: { $gte: daysAgo } });
    const bannedUsers = await User.countDocuments({ banned: true });
    
    // Swap statistics
    const totalSwaps = await SwapRequest.countDocuments();
    const recentSwaps = await SwapRequest.countDocuments({ createdAt: { $gte: daysAgo } });
    const pendingSwaps = await SwapRequest.countDocuments({ status: 'pending' });
    const completedSwaps = await SwapRequest.countDocuments({ status: 'completed' });
    
    // Feedback statistics
    const totalFeedback = await Feedback.countDocuments();
    const recentFeedback = await Feedback.countDocuments({ createdAt: { $gte: daysAgo } });
    
    // Average rating
    const avgRatingResult = await Feedback.aggregate([
      { $group: { _id: null, averageRating: { $avg: '$rating' } } }
    ]);
    const averageRating = avgRatingResult.length > 0 ? Math.round(avgRatingResult[0].averageRating * 10) / 10 : 0;
    
    // Top skills
    const topSkillsOffered = await User.aggregate([
      { $unwind: '$skillsOffered' },
      { $group: { _id: '$skillsOffered', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    const topSkillsWanted = await User.aggregate([
      { $unwind: '$skillsWanted' },
      { $group: { _id: '$skillsWanted', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      success: true,
      report: {
        period: `${period} days`,
        users: {
          total: totalUsers,
          new: newUsers,
          banned: bannedUsers
        },
        swaps: {
          total: totalSwaps,
          recent: recentSwaps,
          pending: pendingSwaps,
          completed: completedSwaps
        },
        feedback: {
          total: totalFeedback,
          recent: recentFeedback,
          averageRating
        },
        topSkills: {
          offered: topSkillsOffered,
          wanted: topSkillsWanted
        }
      }
    });
  } catch (error) {
    console.error('Get activity report error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while generating activity report' 
    });
  }
});

// @route   GET /api/admin/reports/users
// @desc    Get user statistics report
// @access  Private (Admin)
router.get('/reports/users', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));
    
    // User registration trend
    const registrationTrend = await User.aggregate([
      { $match: { createdAt: { $gte: daysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Users by location
    const usersByLocation = await User.aggregate([
      { $match: { location: { $exists: true, $ne: '' } } },
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Users by availability
    const usersByAvailability = await User.aggregate([
      { $unwind: '$availability' },
      { $group: { _id: '$availability', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      report: {
        period: `${period} days`,
        registrationTrend,
        usersByLocation,
        usersByAvailability
      }
    });
  } catch (error) {
    console.error('Get user report error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while generating user report' 
    });
  }
});

module.exports = router; 