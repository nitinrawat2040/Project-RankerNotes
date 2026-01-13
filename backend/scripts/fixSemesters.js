import mongoose from 'mongoose';
import dotenv from 'dotenv';
import College from '../models/College.js';
import Course from '../models/Course.js';
import Semester from '../models/Semester.js';

dotenv.config();

const fixSemesters = async () => {
    try {
        await mongoose.connect(
            process.env.MONGODB_URI || 'mongodb+srv://rawatdivya0129_db_user:4zZ94EkZ2Wdj3ehR@cluster0.gq8x17t.mongodb.net/?appName=Cluster0'
        );
        console.log('Connected to MongoDB');

        // Get all colleges
        const colleges = await College.find({});

        for (const college of colleges) {
            console.log(`\nProcessing college: ${college.name}`);

            // Get BCA(General) course
            const bcaGeneral = await Course.findOne({
                collegeId: college._id,
                name: 'BCA(General)'
            });

            // Get BCA(Data Science) course
            const bcaDS = await Course.findOne({
                collegeId: college._id,
                name: 'BCA(Data Science)'
            });

            if (bcaGeneral) {
                console.log(`\nBCA(General) courseId: ${bcaGeneral._id}`);
                // Find all semesters for this course
                const generalSemesters = await Semester.find({ courseId: bcaGeneral._id });
                console.log(`Found ${generalSemesters.length} semesters for BCA(General)`);

                // Ensure all 8 semesters exist
                for (let i = 1; i <= 8; i++) {
                    let semester = await Semester.findOne({
                        courseId: bcaGeneral._id,
                        number: i
                    });

                    if (!semester) {
                        // Try to find by collegeId and number
                        semester = await Semester.findOne({
                            collegeId: college._id,
                            number: i,
                            courseId: { $ne: bcaGeneral._id }
                        });

                        if (semester) {
                            // Update to correct courseId
                            semester.courseId = bcaGeneral._id;
                            await semester.save();
                            console.log(`✅ Fixed Semester ${i} for BCA(General)`);
                        } else {
                            // Create new
                            semester = await Semester.create({
                                collegeId: college._id,
                                courseId: bcaGeneral._id,
                                number: i,
                                name: `Semester ${i}`
                            });
                            console.log(`✅ Created Semester ${i} for BCA(General)`);
                        }
                    } else {
                        console.log(`✓ Semester ${i} for BCA(General) exists`);
                    }
                }
            }

            if (bcaDS) {
                console.log(`\nBCA(Data Science) courseId: ${bcaDS._id}`);
                // Find all semesters for this course
                const dsSemesters = await Semester.find({ courseId: bcaDS._id });
                console.log(`Found ${dsSemesters.length} semesters for BCA(Data Science)`);

                // Ensure all 8 semesters exist
                for (let i = 1; i <= 8; i++) {
                    let semester = await Semester.findOne({
                        courseId: bcaDS._id,
                        number: i
                    });

                    if (!semester) {
                        // Try to find by collegeId and number (might be assigned to General)
                        const existingSemester = await Semester.findOne({
                            collegeId: college._id,
                            number: i
                        });

                        if (existingSemester) {
                            // Check if it's assigned to General
                            if (existingSemester.courseId && existingSemester.courseId.toString() === bcaGeneral?._id.toString()) {
                                // This semester is for General - we can't reuse it due to old index
                                // We need separate semesters for each course, but the old index prevents this
                                // So we'll create a new one with a workaround
                                try {
                                    // Try creating with explicit name to avoid default function issue
                                    semester = await Semester.create({
                                        collegeId: college._id,
                                        courseId: bcaDS._id,
                                        number: i,
                                        name: `Semester ${i}`
                                    });
                                    console.log(`✅ Created Semester ${i} for BCA(Data Science)`);
                                } catch (err) {
                                    if (err.code === 11000) {
                                        // Old index conflict - this is expected
                                        // The semester exists but with wrong courseId or old index prevents creation
                                        console.log(`⚠️  Cannot create Semester ${i} for BCA(Data Science) - old index conflict. Semester exists for General.`);
                                        // Try to find if there's one we can update
                                        const allSemesters = await Semester.find({ collegeId: college._id, number: i });
                                        if (allSemesters.length > 0) {
                                            // There's a conflict - we can't have two semesters with same collegeId+number
                                            // This is a database schema issue that needs the old index removed
                                            console.log(`   Note: Old index prevents separate semesters. Consider removing old index.`);
                                        }
                                    } else {
                                        console.log(`   Error: ${err.message}`);
                                    }
                                }
                            } else {
                                // Update to correct courseId
                                existingSemester.courseId = bcaDS._id;
                                await existingSemester.save();
                                semester = existingSemester;
                                console.log(`✅ Fixed Semester ${i} for BCA(Data Science)`);
                            }
                        } else {
                            // Create new
                            try {
                                semester = await Semester.create({
                                    collegeId: college._id,
                                    courseId: bcaDS._id,
                                    number: i,
                                    name: `Semester ${i}`
                                });
                                console.log(`✅ Created Semester ${i} for BCA(Data Science)`);
                            } catch (err) {
                                if (err.code === 11000) {
                                    console.log(`⚠️  Duplicate key error for Semester ${i} - old index conflict`);
                                } else {
                                    console.log(`   Error creating Semester ${i}: ${err.message}`);
                                }
                            }
                        }
                    } else {
                        console.log(`✓ Semester ${i} for BCA(Data Science) exists`);
                    }
                }
            }
        }

        console.log('\n✅ Semester fix completed!');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing semesters:', error);
        process.exit(1);
    }
};

fixSemesters();

