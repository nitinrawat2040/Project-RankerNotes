import mongoose from 'mongoose';

const unitSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  number: {
    type: Number,
    required: true,
    min: 1
  },
  pdfUrl: {
    type: String,
    required: true
  },
  s3Key: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Ensure unique unit number per subject
unitSchema.index({ subjectId: 1, number: 1 }, { unique: true });

export default mongoose.model('Unit', unitSchema);



