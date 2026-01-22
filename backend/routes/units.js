import s3 from '../config/s3.js';
import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Unit from '../models/Unit.js';

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

// Serve PDF via AWS S3 signed URL
router.get('/:id/pdf', authenticate, async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id);

    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    if (!unit.s3Key) {
      return res.status(400).json({ message: 'PDF not configured for this unit' });
    }

    const bucketName = process.env.AWS_BUCKET_NAME;
    const s3Key = unit.s3Key;

    console.log('S3 KEY:', s3Key);
    console.log('BUCKET:', bucketName);
    console.log('REGION:', process.env.AWS_REGION);

    // Verify the object exists in S3 before generating signed URL
    try {
      await s3.headObject({
        Bucket: bucketName,
        Key: s3Key
      }).promise();
      console.log('✅ Object exists in S3');
    } catch (headError) {
      console.error('❌ Object not found in S3:', headError.message);
      if (headError.code === 'NotFound' || headError.statusCode === 404) {
        return res.status(404).json({
          message: 'PDF file not found in S3. Please upload the PDF file.',
          details: `S3 Key: ${s3Key}`
        });
      }
      // If it's a permissions error, still try to generate the URL
      console.warn('⚠️ Could not verify object existence, proceeding anyway:', headError.message);
    }

    // Generate signed URL with proper content type
    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: bucketName,
      Key: s3Key,
      Expires: 60 * 5, // 5 minutes
      ResponseContentType: 'application/pdf'
      // Removed ResponseContentDisposition as it might cause issues with some S3 configurations
    });

    console.log('✅ Signed URL generated successfully');
    res.json({ url: signedUrl });

  } catch (error) {
    console.error('❌ PDF signed URL error:', error);
    res.status(500).json({
      message: 'Error generating PDF URL',
      error: error.message
    });
  }
});

export default router;