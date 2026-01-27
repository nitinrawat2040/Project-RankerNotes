import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';

import College from '../models/College.js';
import Course from '../models/Course.js';
import Semester from '../models/Semester.js';
import Subject from '../models/Subject.js';
import Unit from '../models/Unit.js';

dotenv.config();

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();


const addSubject = async () => {
    try {
        await mongoose.connect(
            process.env.MONGODB_URI || 'mongodb+srv://rawatdivya0129_db_user:4zZ94EkZ2Wdj3ehR@cluster0.gq8x17t.mongodb.net/?appName=Cluster0'
        );
        console.log('Connected to MongoDB');

        // ============================================
        // CONFIGURE THESE VALUES FOR YOUR SUBJECT:
        // ============================================
        const collegeName = 'J.C. Bose University of Science and Technology, YMCA Faridabad, Haryana';
        const courseName = 'BCA(General)';
        const semesterNumber = 2;  // Semester 6
        const subjectName = 'Data Structures';  // Subject name
        const subjectCode = 'BCG-104-V1';  // Subject code for Semester 4
        const pdfFolder = `datastructure`

        // ============================================
        // CONFIGURE YOUR UNITS HERE:
        // ============================================



        const units = [
            { name: 'Unit 1: Introduction and Overview' },
            { name: 'Unit 2: Linked Lists' },
            { name: 'Unit 3: Stacks' },
            { name: 'Unit 4: Graphs' }
        ];

        // const units = [
        //     { name: 'Unit 1: ' },
        //     { name: 'Unit 2: ' },
        //     { name: 'Unit 3: ' },
        //     { name: 'Unit 4: ' }
        // ];

        // Get college
        const college = await College.findOne({ name: collegeName });
        if (!college) {
            console.error(` College "${collegeName}" not found!`);
            console.log('Available colleges:');
            const allColleges = await College.find({});
            allColleges.forEach(c => console.log(`  - ${c.name}`));
            process.exit(1);
        }

        // Get course
        const course = await Course.findOne({
            collegeId: college._id,
            name: courseName
        });
        if (!course) {
            console.error(` Course "${courseName}" not found for ${collegeName}!`);
            console.log('Available courses:');
            const allCourses = await Course.find({ collegeId: college._id });
            allCourses.forEach(c => console.log(`  - ${c.name}`));
            process.exit(1);
        }

        // Get semester
        const semester = await Semester.findOne({
            courseId: course._id,
            number: semesterNumber
        });
        if (!semester) {
            console.error(` Semester ${semesterNumber} not found for ${courseName}!`);
            console.log('Available semesters:');
            const allSemesters = await Semester.find({ courseId: course._id }).sort({ number: 1 });
            allSemesters.forEach(s => console.log(`  - ${s.name || `Semester ${s.number}`}`));
            process.exit(1);
        }

        console.log(`\n Adding subject to:`);
        console.log(`   College: ${collegeName}`);
        console.log(`   Course: ${courseName}`);
        console.log(`   Semester: ${semesterNumber}`);
        console.log(`   Subject: ${subjectName}\n`);

        // Create subject
        let subject = await Subject.findOne({
            semesterId: semester._id,
            name: subjectName
        });

        if (!subject) {
            subject = await Subject.create({
                semesterId: semester._id,
                name: subjectName,
                code: subjectCode
            });
            console.log(` Created subject: ${subjectName}`);
        } else {
            console.log(` Subject "${subjectName}" already exists, using existing one`);
        }

        // Create / update units
        console.log(`\n Creating ${units.length} units...\n`);

        for (let i = 0; i < units.length; i++) {
            const unitNumber = i + 1;

            const localPdfPath = path.join(
                'uploads',
                pdfFolder,
                `sem${semesterNumber}`,
                `unit${unitNumber}.pdf`
            );

            if (!fs.existsSync(localPdfPath)) {
                console.error(` PDF not found: ${localPdfPath}`);
                process.exit(1);
            }

            const fileBuffer = fs.readFileSync(localPdfPath);

            const uploadResult = await s3.upload({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `notes/${subjectCode}/sem${semesterNumber}/unit${i + 1}.pdf`,
                Body: fileBuffer,
                ContentType: 'application/pdf',
            }).promise();

            console.log(` Uploaded to S3: ${uploadResult.Location}`);

            let unit = await Unit.findOne({
                subjectId: subject._id,
                number: unitNumber,
            });

            if (!unit) {
                await Unit.create({
                    subjectId: subject._id,
                    name: units[i].name,
                    number: unitNumber,
                    pdfUrl: uploadResult.Location,
                    s3Key: uploadResult.Key,
                    description: units[i].description,
                });
                console.log(` Created Unit ${unitNumber}: ${units[i].name}`);
            } else {
                unit.name = units[i].name;
                unit.description = units[i].description;
                unit.pdfUrl = uploadResult.Location;
                unit.s3Key = uploadResult.Key;
                await unit.save();
                console.log(` Updated Unit ${unitNumber}: ${units[i].name}`);
            }
        }

        console.log('\n Subject and units created successfully!');
        console.log(`\n Next steps:`);
        console.log(`   1. Create folder: backend/uploads/${pdfFolder}/sem${semesterNumber}/`);
        console.log(`   2. Place PDF files with these names:`);
        for (let i = 0; i < units.length; i++) {
            console.log(`      - unit${i + 1}.pdf → ${units[i].name}`);
        }
        console.log(`\n   3. Test in app: College → Course → Semester ${semesterNumber} → ${subjectName} → Units\n`);

        process.exit(0);
    } catch (error) {
        console.error(' Error:', error);
        process.exit(1);
    }
};

addSubject();

