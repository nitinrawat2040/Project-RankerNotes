import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import collegeRoutes from './routes/colleges.js';
import courseRoutes from './routes/courses.js';
import semesterRoutes from './routes/semesters.js';
import subjectRoutes from './routes/subjects.js';
import unitRoutes from './routes/units.js';
import path from 'path';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5100;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/units', unitRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Start server first, then connect to MongoDB
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://rawatdivya0129_db_user:4zZ94EkZ2Wdj3ehR@cluster0.gq8x17t.mongodb.net/?appName=Cluster0';
    mongoose
        .connect(mongoUri)
        .then(() => {
            console.log('Connected to MongoDB');
        })
        .catch((error) => {
            console.error('MongoDB connection error:', error.message);
            console.error('⚠️  Server is running but MongoDB is not connected. API calls will fail.');
            console.error('💡 Make sure MongoDB is running or check your MONGODB_URI in .env file');
        });
});

export default app;

