const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadImageBuffer, deleteImage } = require('../utils/cloudinary');

const router = express.Router();

// @route   GET /api/users/search
// @desc    Search users by skill
// @access  Public
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { skill, availability, location, page = 1, limit = 10 } = req.query;
    
    // Build search query
    let query = { isPublic: true, banned: false };
    
    if (skill) {
      query.$or = [
        { skillsOffered: { $regex: skill, $options: 'i' } },
        { skillsWanted: { $regex: skill, $options: 'i' } }
      ];
    }
    
    if (availability) {
      query.availability = { $in: availability.split(',') };
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    // Exclude current user from search results
    if (req.user) {
      query._id = { $ne: req.user.id };
    }
    
    const skip = (page - 1) * limit;
    
    const users = await User.find(query)
      .select('name location profilePhotoURL skillsOffered skillsWanted availability rating totalRatings bio')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ rating: -1, totalRatings: -1 });
    
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
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during search' 
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public (for public profiles) / Private (for own profile)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if user is banned
    if (user.banned) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // If profile is private, only allow access to the owner
    if (!user.isPublic && (!req.user || req.user.id !== user.id)) {
      return res.status(403).json({ 
        success: false, 
        message: 'This profile is private' 
      });
    }
    
    // Return different data based on access level
    const isOwnProfile = req.user && req.user.id === user.id;
    
    const profileData = {
      id: user._id,
      name: user.name,
      location: user.location,
      profilePhotoURL: user.profilePhotoURL,
      skillsOffered: user.skillsOffered,
      skillsWanted: user.skillsWanted,
      availability: user.availability,
      rating: user.rating,
      totalRatings: user.totalRatings,
      bio: user.bio,
      createdAt: user.createdAt
    };
    
    // Include additional data for own profile
    if (isOwnProfile) {
      profileData.email = user.email;
      profileData.role = user.role;
      profileData.isPublic = user.isPublic;
    }
    
    res.json({
      success: true,
      user: profileData
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching user' 
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private (own profile only)
router.put('/:id', protect, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('location').optional().trim().isLength({ max: 100 }).withMessage('Location cannot exceed 100 characters'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('skillsOffered').optional().isArray().withMessage('Skills offered must be an array'),
  body('skillsWanted').optional().isArray().withMessage('Skills wanted must be an array'),
  body('availability').optional().isArray().withMessage('Availability must be an array'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
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
    
    // Check if user is updating their own profile
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only update your own profile' 
      });
    }
    
    const updateData = { ...req.body };
    
    // Remove fields that shouldn't be updated via this route
    delete updateData.email;
    delete updateData.password;
    delete updateData.role;
    delete updateData.banned;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        profilePhotoURL: user.profilePhotoURL,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        availability: user.availability,
        isPublic: user.isPublic,
        rating: user.rating,
        totalRatings: user.totalRatings,
        bio: user.bio,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating profile' 
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user account
// @access  Private (own account only)
router.delete('/:id', protect, async (req, res) => {
  try {
    // Check if user is deleting their own account
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only delete your own account' 
      });
    }
    
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting account' 
    });
  }
});

// @route   POST /api/users/:id/photo
// @desc    Upload or update user profile photo
// @access  Private (own profile only)
router.post('/:id/photo', protect, upload.single('photo'), async (req, res) => {
  try {
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only update your own profile photo' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // If user already has a photo, delete the old one
    if (user.profilePhotoURL && user.profilePhotoURL.includes('cloudinary.com')) {
      const publicId = user.profilePhotoURL.split('/').slice(-1)[0].split('.')[0];
      await deleteImage(`skill_swap/profile_photos/${publicId}`);
    }
    // Upload new photo
    const result = await uploadImageBuffer(req.file.buffer, `${user._id}_${Date.now()}`);
    user.profilePhotoURL = result.secure_url;
    await user.save();
    res.json({ success: true, message: 'Profile photo updated', profilePhotoURL: user.profilePhotoURL });
  } catch (error) {
    console.error('Profile photo upload error:', error);
    res.status(500).json({ success: false, message: 'Error uploading profile photo' });
  }
});

// @route   GET /api/users/suggestions/skills
// @desc    Get skill suggestions based on existing skills
// @access  Public
router.get('/suggestions/skills', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({
        success: true,
        suggestions: []
      });
    }
    
    // Get unique skills from all users
    const skillsOffered = await User.distinct('skillsOffered', {
      skillsOffered: { $regex: query, $options: 'i' }
    });
    
    const skillsWanted = await User.distinct('skillsWanted', {
      skillsWanted: { $regex: query, $options: 'i' }
    });
    
    // Combine and deduplicate
    const allSkills = [...new Set([...skillsOffered, ...skillsWanted])];
    
    // Sort by relevance (exact matches first)
    const suggestions = allSkills
      .sort((a, b) => {
        const aExact = a.toLowerCase().startsWith(query.toLowerCase());
        const bExact = b.toLowerCase().startsWith(query.toLowerCase());
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return a.localeCompare(b);
      })
      .slice(0, 10);
    
    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Skill suggestions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching skill suggestions' 
    });
  }
});

module.exports = router; 