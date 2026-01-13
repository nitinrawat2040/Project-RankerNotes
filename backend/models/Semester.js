import mongoose from 'mongoose';

const semesterSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  number: {
    type: Number,
    required: true,
    min: 1
  },
  name: {
    type: String,
    default: function() {
      return `Semester ${this.number}`;
    }
  }
}, {
  timestamps: true
});

// Ensure unique semester number per course
semesterSchema.index({ courseId: 1, number: 1 }, { unique: true });

export default mongoose.model('Semester', semesterSchema);

