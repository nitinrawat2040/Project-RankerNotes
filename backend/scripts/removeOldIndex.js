import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Semester from '../models/Semester.js';

dotenv.config();

const removeOldIndex = async () => {
    try {
        await mongoose.connect(
            process.env.MONGODB_URI || 'mongodb+srv://rawatdivya0129_db_user:4zZ94EkZ2Wdj3ehR@cluster0.gq8x17t.mongodb.net/?appName=Cluster0'
        );
        console.log('Connected to MongoDB');

        // Get the collection
        const collection = mongoose.connection.db.collection('semesters');

        // List all indexes
        const indexes = await collection.indexes();
        console.log('\nCurrent indexes:');
        indexes.forEach(idx => {
            console.log('  -', JSON.stringify(idx.key), idx.unique ? '(unique)' : '');
        });

        // Try to drop the old index
        try {
            await collection.dropIndex('collegeId_1_number_1');
            console.log('\n✅ Successfully dropped old index: collegeId_1_number_1');
        } catch (err) {
            if (err.code === 27 || err.message.includes('index not found')) {
                console.log('\n⚠️  Old index not found (may have been removed already)');
            } else {
                console.log('\n⚠️  Could not drop index:', err.message);
            }
        }

        // Verify current indexes
        const newIndexes = await collection.indexes();
        console.log('\nIndexes after removal:');
        newIndexes.forEach(idx => {
            console.log('  -', JSON.stringify(idx.key), idx.unique ? '(unique)' : '');
        });

        console.log('\n✅ Index removal completed!');
        console.log('Now run: npm run fix-semesters');

        process.exit(0);
    } catch (error) {
        console.error('Error removing index:', error);
        process.exit(1);
    }
};

removeOldIndex();

