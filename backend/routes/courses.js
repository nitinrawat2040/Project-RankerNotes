import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Course from '../models/Course.js';

const router = express.Router();

// Get courses for a college
router.get('/college/:collegeId', authenticate, async (req, res) => {
  try {
    const courses = await Course.find({ collegeId: req.params.collegeId })
      .sort({ name: 1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single course
router.get('/:id', authenticate, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;



