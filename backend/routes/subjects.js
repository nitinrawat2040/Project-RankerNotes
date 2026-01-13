import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Subject from '../models/Subject.js';

const router = express.Router();

// Get subjects for a semester
router.get('/semester/:semesterId', authenticate, async (req, res) => {
  try {
    const subjects = await Subject.find({ semesterId: req.params.semesterId })
      .sort({ name: 1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single subject
router.get('/:id', authenticate, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;



