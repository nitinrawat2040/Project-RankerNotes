import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  semesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Subject', subjectSchema);



