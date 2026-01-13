import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Semester from '../models/Semester.js';
import User from '../models/User.js';

const router = express.Router();

// Get semesters for a course
router.get('/course/:courseId', authenticate, async (req, res) => {
    try {
        const mongoose = (await import('mongoose')).default;
        const courseId = req.params.courseId;
        console.log('Fetching semesters for courseId:', courseId);

        // Try to find semesters - handle both string and ObjectId
        let semesters = await Semester.find({ courseId: courseId })
            .sort({ number: 1 });

        // If no results, try with ObjectId conversion
        if (semesters.length === 0 && mongoose.Types.ObjectId.isValid(courseId)) {
            semesters = await Semester.find({ courseId: new mongoose.Types.ObjectId(courseId) })
                .sort({ number: 1 });
        }

        console.log('Found semesters:', semesters.length, 'for courseId:', courseId);
        if (semesters.length > 0) {
            console.log('Semester numbers:', semesters.map(s => s.number));
        }
        res.json(semesters);
    } catch (error) {
        console.error('Error fetching semesters:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get semesters for a college (legacy support)
router.get('/college/:collegeId', authenticate, async (req, res) => {
    try {
        const semesters = await Semester.find({ collegeId: req.params.collegeId })
            .sort({ number: 1 });
        res.json(semesters);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get semesters for user's college (legacy support)
router.get('/', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user.collegeId) {
            return res.status(400).json({ message: 'Please select a college first' });
        }

        const semesters = await Semester.find({ collegeId: user.collegeId })
            .sort({ number: 1 });
        res.json(semesters);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single semester
router.get('/:id', authenticate, async (req, res) => {
    try {
        const semester = await Semester.findById(req.params.id);
        if (!semester) {
            return res.status(404).json({ message: 'Semester not found' });
        }
        res.json(semester);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;

