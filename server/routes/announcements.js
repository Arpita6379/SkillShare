const express = require('express');
const { body, validationResult } = require('express-validator');
const Announcement = require('../models/Announcement');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/announcements
// @desc    Create a new announcement (admin only)
// @access  Private (Admin)
router.post(
  '/',
  protect,
  admin,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }
      const { title, content } = req.body;
      const announcement = await Announcement.create({
        title,
        content,
        createdBy: req.user.id,
      });
      res.status(201).json({ success: true, announcement });
    } catch (error) {
      console.error('Create announcement error:', error);
      res.status(500).json({ success: false, message: 'Server error while creating announcement' });
    }
  }
);

// @route   GET /api/announcements
// @desc    Get all announcements (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, announcements });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching announcements' });
  }
});

module.exports = router; 