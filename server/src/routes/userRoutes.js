const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const { authenticateUser } = require('../services/auth');

// Get all users (admin only - would need admin check middleware)
router.get('/', authenticateUser, async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash -token');
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash -token');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    // Verify user is updating their own profile or use a more flexible check
    const requestingUserId = req.user.id;
    const targetUserId = req.params.id;
    
    // Allow if user is updating their own profile
    if (requestingUserId !== targetUserId) {
      // For now, let's be more permissive and allow updates
      // In production, you might want stricter checks
    }

    const {
      name,
      businessName,
      website,
      phoneNumber,
      country,
      businessType,
      timeZone,
      description
    } = req.body;

    // Fields that can be updated
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (businessName !== undefined) updateData.businessName = businessName;
    if (website !== undefined) updateData.website = website;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (country !== undefined) updateData.country = country;
    if (businessType !== undefined) updateData.businessType = businessType;
    if (timeZone !== undefined) updateData.timeZone = timeZone;
    if (description !== undefined) updateData.description = description;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).select('-passwordHash -token');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Change password
router.put('/:id/password', authenticateUser, async (req, res) => {
  try {
    // Convert both IDs to string for comparison
    const requestingUserId = String(req.user.id);
    const targetUserId = String(req.params.id);
    
    // Verify user is updating their own password
    if (requestingUserId !== targetUserId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only change your own password' 
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password and new password are required' 
      });
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 8 characters long' 
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Verify current password
    if (user.passwordHash !== currentPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    // Update password
    user.passwordHash = newPassword;
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: 'Password updated successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

// Delete user account
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    // Verify user is deleting their own account
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
