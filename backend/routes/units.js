import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Unit from '../models/Unit.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get units for a subject
router.get('/subject/:subjectId', authenticate, async (req, res) => {
  try {
    const units = await Unit.find({ subjectId: req.params.subjectId })
      .sort({ number: 1 });
    res.json(units);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single unit
router.get('/:id', authenticate, async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }
    res.json(unit);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Serve PDF file securely (authenticated access only)
// Frontend will render this using pdfjs-dist with download disabled
router.get('/:id/pdf', authenticate, async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    const pdfPath = path.join(__dirname, '..', 'uploads', unit.pdfPath);
    
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ message: 'PDF file not found' });
    }

    // Set headers to prevent caching and downloading
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="view.pdf"');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Stream the PDF file
    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('PDF serving error:', error);
    res.status(500).json({ message: 'Error serving PDF', error: error.message });
  }
});

export default router;

