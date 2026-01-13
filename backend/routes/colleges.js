import express from 'express';
import { authenticate } from '../middleware/auth.js';
import College from '../models/College.js';

const router = express.Router();

// Get all colleges
router.get('/', authenticate, async (req, res) => {
  try {
    const colleges = await College.find().sort({ name: 1 });
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single college
router.get('/:id', authenticate, async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }
    res.json(college);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user's college (for selection)
router.post('/:id/select', authenticate, async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    const college = await College.findById(req.params.id);
    
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { collegeId: req.params.id },
      { new: true }
    ).select('-password');

    res.json({
      message: 'College selected successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        collegeId: user.collegeId
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;



