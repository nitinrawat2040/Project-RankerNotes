import mongoose from 'mongoose';
import dotenv from 'dotenv';
import College from '../models/College.js';
import Course from '../models/Course.js';
import Semester from '../models/Semester.js';
import Subject from '../models/Subject.js';
import Unit from '../models/Unit.js';

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(
            process.env.MONGODB_URI || 'mongodb+srv://rawatdivya0129_db_user:4zZ94EkZ2Wdj3ehR@cluster0.gq8x17t.mongodb.net/?appName=Cluster0'
        );
        console.log('Connected to MongoDB');

        // Create colleges
        const collegeNames = ['J.C. Bose University of Science and Technology, YMCA Faridabad, Haryana', 'Guru Gobind Singh Indraprastha University(GGSIPU)'];
        const colleges = [];

        for (const collegeName of collegeNames) {
            let college = await College.findOne({ name: collegeName });
            if (!college) {
                college = await College.create({ name: collegeName });
                console.log('Created college:', college.name);
            }
            colleges.push(college);
        }

        // Create BCA courses for all colleges
        const courseNames = [
            { name: 'BCA(General)' },
            { name: 'BCA(Data Science)' }
        ];

        for (const college of colleges) {
            for (const courseData of courseNames) {
                let course = await Course.findOne({
                    collegeId: college._id,
                    name: courseData.name
                });
                if (!course) {
                    course = await Course.create({
                        name: courseData.name,
                        collegeId: college._id
                    });
                    console.log(`Created ${courseData.name} course for college: ${college.name}`);
                } else {
                    console.log(`${courseData.name} course already exists for college: ${college.name}`);
                }
            }
        }

        // Create semesters 1-8 for both BCA courses for ALL colleges
        const createSemestersForCourse = async (course, courseName, college) => {
            const semesters = [];
            for (let i = 1; i <= 8; i++) {
                // First, try to find semester by courseId
                let semester = await Semester.findOne({ courseId: course._id, number: i });

                if (!semester) {
                    // If not found, check if there's an old semester with just collegeId (legacy)
                    semester = await Semester.findOne({
                        collegeId: college._id,
                        number: i,
                        courseId: { $exists: false }
                    });

                    if (semester) {
                        // Update old semester to include courseId
                        semester.courseId = course._id;
                        await semester.save();
                        console.log(`Updated Semester ${i} for ${courseName} at ${college.name} with courseId`);
                    } else {
                        // Create new semester
                        try {
                            semester = await Semester.create({
                                collegeId: college._id,
                                courseId: course._id,
                                number: i,
                                name: `Semester ${i}`
                            });
                            console.log(`Created Semester ${i} for ${courseName} at ${college.name}`);
                        } catch (err) {
                            // If duplicate key error, try to find it again
                            if (err.code === 11000) {
                                semester = await Semester.findOne({ courseId: course._id, number: i });
                                if (!semester) {
                                    // Try finding by collegeId and number (might be old structure)
                                    semester = await Semester.findOne({
                                        collegeId: college._id,
                                        number: i
                                    });
                                }
                                if (semester) {
                                    // Update if missing courseId or courseId doesn't match
                                    const semesterCourseId = semester.courseId ? semester.courseId.toString() : null;
                                    const expectedCourseId = course._id.toString();
                                    if (!semesterCourseId || semesterCourseId !== expectedCourseId) {
                                        semester.courseId = course._id;
                                        await semester.save();
                                        console.log(`Updated Semester ${i} for ${courseName} at ${college.name} (courseId: ${expectedCourseId})`);
                                    } else {
                                        console.log(`Semester ${i} for ${courseName} at ${college.name} already exists with correct courseId`);
                                    }
                                } else {
                                    console.log(`⚠️  Could not find or create Semester ${i} for ${courseName} at ${college.name}`);
                                }
                            } else {
                                console.log(`Error creating Semester ${i} for ${courseName} at ${college.name}:`, err.message);
                            }
                        }
                    }
                } else {
                    console.log(`Semester ${i} for ${courseName} at ${college.name} already exists`);
                }

                if (semester) {
                    semesters.push(semester);
                }
            }
            return semesters;
        };

        // Create semesters for all colleges and both courses
        let allSemesters = [];
        for (const college of colleges) {
            // Get BCA(General) course
            const bcaGeneralCourse = await Course.findOne({
                collegeId: college._id,
                name: 'BCA(General)'
            });

            // Get BCA(Data Science) course
            const bcaDSCourse = await Course.findOne({
                collegeId: college._id,
                name: 'BCA(Data Science)'
            });

            if (bcaGeneralCourse) {
                const semesters = await createSemestersForCourse(bcaGeneralCourse, 'BCA(General)', college);
                if (college.name === 'J.C. Bose University of Science and Technology, YMCA Faridabad, Haryana' && semesters.length > 0) {
                    allSemesters = semesters; // Use Echelon's semesters for sample subjects
                }
            }

            if (bcaDSCourse) {
                await createSemestersForCourse(bcaDSCourse, 'BCA(Data Science)', college);
            }
        }

        // If no semesters found for Echelon, try to get them from database
        if (allSemesters.length === 0) {
            const echelonCollege = colleges.find(c => c.name === 'J.C. Bose University of Science and Technology, YMCA Faridabad, Haryana');
            if (echelonCollege) {
                const bcaGeneralCourse = await Course.findOne({
                    collegeId: echelonCollege._id,
                    name: 'BCA(General)'
                });
                if (bcaGeneralCourse) {
                    allSemesters = await Semester.find({ courseId: bcaGeneralCourse._id }).sort({ number: 1 });
                    console.log(`Found ${allSemesters.length} existing semesters for BCA(General) at Echelon`);
                }
            }
        }

        // Use J.C. Bose University of Science and Technology, YMCA Faridabad, Haryana as the primary college for sample subjects
        const college = colleges.find(c => c.name === 'J.C. Bose University of Science and Technology, YMCA Faridabad, Haryana') || colleges[0];
        const semesters = allSemesters;

        // Create subjects for first semester (only if semesters exist)
        const subjects = [];
        if (semesters.length > 0) {
            const subjectNames = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science'];

            for (let i = 0; i < subjectNames.length; i++) {
                let subject = await Subject.findOne({
                    semesterId: semesters[0]._id,
                    name: subjectNames[i]
                });
                if (!subject) {
                    subject = await Subject.create({
                        semesterId: semesters[0]._id,
                        name: subjectNames[i],
                        code: `SUB${i + 1}01`
                    });
                    console.log('Created subject:', subject.name);
                }
                subjects.push(subject);
            }
        } else {
            console.log('⚠️  No semesters found, skipping subject creation');
        }

        // Create units for first subject
        if (subjects.length > 0) {
            const unitNames = ['Unit 1: Introduction', 'Unit 2: Advanced Topics', 'Unit 3: Applications'];
            for (let i = 0; i < unitNames.length; i++) {
                let unit = await Unit.findOne({
                    subjectId: subjects[0]._id,
                    number: i + 1
                });
                if (!unit) {
                    unit = await Unit.create({
                        subjectId: subjects[0]._id,
                        name: unitNames[i],
                        number: i + 1,
                        pdfPath: `sample/unit${i + 1}.pdf`, // Update this path to match your actual PDF files
                        description: `Study material for ${unitNames[i]}`
                    });
                    console.log('Created unit:', unit.name);
                }
            }
        }


        // Create C# Programming subject for Semester 6 of BCA(General)
        const semester6_subject1 = semesters.find(s => s.number === 6);
        if (semester6_subject1) {
            // Check if C# Programming subject already exists
            let csharpSubject = await Subject.findOne({
                semesterId: semester6_subject1._id,
                name: 'C# Programming'
            });

            if (!csharpSubject) {
                csharpSubject = await Subject.create({
                    semesterId: semester6_subject1._id,
                    name: 'C# Programming',
                    code: 'BCG-302-V'
                });
                console.log('Created subject: C# Programming for Semester 6');
            } else {
                console.log('C# Programming subject already exists for Semester 6');
            }

            // Create 4 units for C# Programming
            const csharpUnits = [
                {
                    name: 'Unit 1: Introduction to .NET',
                    description: 'Basics of C# programming language'
                },
                { name: 'Unit 2: Introduction to C#', description: 'Classes, objects, and OOP concepts in C#' },
                {
                    name: 'Unit 3:  Inheritance, Exception and Multithreading',
                    description: 'Delegates, events, LINQ, and advanced topics'
                },
                { name: 'Unit 4: Database Connectivity', description: 'Building applications with C# and .NET' }
            ];

            for (let i = 0; i < csharpUnits.length; i++) {
                let unit = await Unit.findOne({
                    subjectId: csharpSubject._id,
                    number: i + 1
                });
                if (!unit) {
                    unit = await Unit.create({
                        subjectId: csharpSubject._id,
                        name: csharpUnits[i].name,
                        number: i + 1,
                        pdfPath: `C# programming/sem6/unit${i + 1}.pdf`, // Place PDFs in backend/uploads/csharp/sem6/
                        description: csharpUnits[i].description
                    });
                    console.log(`Created unit: ${csharpUnits[i].name} for C# Programming`);
                } else {
                    console.log(`Unit ${i + 1} for C# Programming already exists`);
                }
            }
        } else {
            console.log('⚠️  Semester 6 not found, skipping C# Programming subject creation');
        }

        // Create Big Data-I Programming subject for Semester 6 of BCA(General)
        const semester6_subject2 = semesters.find(s => s.number === 6);

        if (semester6_subject2) {

            // Check if Big Data-I Programming subject already exists
            let webSubject = await Subject.findOne({
                semesterId: semester6_subject2._id,
                name: 'Big Data-I'
            });

            if (!webSubject) {
                webSubject = await Subject.create({
                    semesterId: semester6_subject2._id,
                    name: 'Big Data-I',
                    code: 'BD601'
                });
                console.log('Created subject: Big Data-I for Semester 6');
            } else {
                console.log('Big Data-I already exists');
            }

            const webUnits = [
                { name: 'Unit 1: Introduction to Big Data', description: 'Basics of Big Data and Introduction to Hadoop' },
                { name: 'Unit 2: Data Models', description: 'Introduction to NoSQL database' },
                { name: 'Unit 3: Hadoop Basics', description: 'Introduction to Hadoop basics' },
                { name: 'Unit 4: Map Reduce basics and its Types', description: 'Basics of Map Reduce and its Types' }
            ];

            for (let i = 0; i < webUnits.length; i++) {

                let unit = await Unit.findOne({
                    subjectId: webSubject._id,
                    number: i + 1
                });

                if (!unit) {
                    await Unit.create({
                        subjectId: webSubject._id,
                        name: webUnits[i].name,
                        number: i + 1,
                        pdfPath: `big_data/sem6/unit${i + 1}.pdf`,
                        description: webUnits[i].description
                    });
                    console.log(`Created ${webUnits[i].name}`);
                }
            }

        } else {
            console.log('Semester 6 not found for Big Data-I');
        }


        const semester6_subject3 = semesters.find(s => s.number === 6);
        if (semester6_subject3) {

            // Check if Data Warehousing and Data Mining Programming subject already exists.
            let csharpSubject3 = await Subject.findOne({
                semesterId: semester6_subject3._id,
                name: 'Data Warehousing and Data Mining'
            });

            if (!csharpSubject3) {
                csharpSubject3 = await Subject.create({
                    semesterId: semester6_subject3._id,
                    name: 'Data Warehousing and Data Mining',
                    code: 'DWDM601'
                });
                console.log('Created subject: Data Warehousing and Data Mining for Semester 6');
            } else {
                console.log('Data Warehousing and Data Mining subject already exists for Semester 6');
            }
            // Create 4 units for Data Warehousing and Mining
            const csharpUnits3 = [
                {
                    name: 'Unit 1: Basics Concepts of Data Ware Housing',
                    description: 'Basics of Data Ware Housing'
                },
                {
                    name: 'Unit 2: Multi-Dimensional Data Modelling',
                    description: 'Concept of Data warehouse and OLAP technology and OLAP Servers etc.'
                },
                {
                    name: 'Unit 3: Data Mining',
                    description: 'Data Pre-processing: Cleaning, data integration and transformation, data reduction etc.'
                },
                { name: 'Unit 4: Mining Association Rules in Large Databases', description: 'Mining class comparisons, Mining descriptive statistical measures in large databases etc.' }
            ];

            for (let i = 0; i < csharpUnits3.length; i++) {
                let unit = await Unit.findOne({
                    subjectId: csharpSubject3._id,
                    number: i + 1
                });
                if (!unit) {
                    unit = await Unit.create({
                        subjectId: csharpSubject3._id,
                        name: csharpUnits3[i].name,
                        number: i + 1,
                        pdfPath: `data_warehousing_mining/sem6/unit${i + 1}.pdf`, // Place PDFs in backend/uploads/csharp/sem6/
                        description: csharpUnits3[i].description
                    });
                    console.log(`Created unit: ${csharpUnits3[i].name} for Data Warehousing and Mining`);
                } else {
                    console.log(`Unit ${i + 1} for Data Warehousing and mining already exists`);
                }
            }
        } else {
            console.log('⚠️  Semester 6 not found, skipping data warehousing and mining subject creation');
        }

        // Create High Speed Networks subject for Semester 6 of BCA(General)
        const semester6_subject4 = semesters.find(s => s.number === 6);
        if (semester6_subject4) {
            // Check if High Speed Networks subject already exists
            let csharpSubject4 = await Subject.findOne({
                semesterId: semester6_subject4._id,
                name: 'High Speed Networks'
            });

            if (!csharpSubject4) {
                csharpSubject4 = await Subject.create({
                    semesterId: semester6_subject4._id,
                    name: 'High Speed Networks',
                    code: 'HSN601'
                });
                console.log('Created subject: High Speed Networks for Semester 6');
            } else {
                console.log('High Speed Networks subject already exists for Semester 6');
            }

            // Create 4 units for High Speed Networks
            const csharpUnits4 = [
                {
                    name: 'Unit 1: High Speed Networks'
                },
                {
                    name: 'Unit 2: Congestion and Traffic Management'
                },
                {
                    name: 'Unit 3: TCP and ATM Congestion Control TCP'
                },
                { name: 'Unit 4: Integrated and Differentiated Services' }
            ];

            for (let i = 0; i < csharpUnits4.length; i++) {
                let unit = await Unit.findOne({
                    subjectId: csharpSubject4._id,
                    number: i + 1
                });
                if (!unit) {
                    unit = await Unit.create({
                        subjectId: csharpSubject4._id,
                        name: csharpUnits4[i].name,
                        number: i + 1,
                        pdfPath: `high_speed_networks/sem6/unit${i + 1}.pdf`, // Place PDFs in backend/uploads/csharp/sem6/
                        description: csharpUnits4[i].description
                    });
                    console.log(`Created unit: ${csharpUnits4[i].name} for High Speed Networks`);
                } else {
                    console.log(`Unit ${i + 1} for High Speed Networks already exists`);
                }
            }
        } else {
            console.log('⚠️  Semester 6 not found, skipping High Speed Networks subject creation');
        }

        // Create Machine learning-II subject for Semester 6 of BCA(General)
        const semester6_subject5 = semesters.find(s => s.number === 6);
        if (semester6_subject5) {
            // Check if Machine learning-II subject already exists
            let csharpSubject5 = await Subject.findOne({
                semesterId: semester6_subject5._id,
                name: 'Machine learning-II'
            });

            if (!csharpSubject5) {
                csharpSubject5 = await Subject.create({
                    semesterId: semester6_subject5._id,
                    name: 'Machine learning-II',
                    code: 'ML601'
                });
                console.log('Created subject: Machine learning-II for Semester 6');
            } else {
                console.log('Machine learning-II subject already exists for Semester 6');
            }

            // Create 4 units for Machine learning-II
            const csharpUnits5 = [
                {
                    name: 'Unit 1: Combining Different Models'
                },
                {
                    name: 'Unit 2: Dimensionality Reduction'
                },
                {
                    name: 'Unit 3: Learning With Neural Networks'
                },
                { name: 'Unit 4: Reinforcement Learning' }
            ];

            for (let i = 0; i < csharpUnits5.length; i++) {
                let unit = await Unit.findOne({
                    subjectId: csharpSubject5._id,
                    number: i + 1
                });
                if (!unit) {
                    unit = await Unit.create({
                        subjectId: csharpSubject5._id,
                        name: csharpUnits5[i].name,
                        number: i + 1,
                        pdfPath: `machine_learning_ii/sem6/unit${i + 1}.pdf`, // Place PDFs in backend/uploads/csharp/sem6/
                        description: csharpUnits5[i].description
                    });
                    console.log(`Created unit: ${csharpUnits5[i].name} for Machine learning-II`);
                } else {
                    console.log(`Unit ${i + 1} for Machine learning-II already exists`);
                }
            }
        } else {
            console.log('⚠️  Semester 6 not found, skipping Machine learning-II subject creation');
        }

        console.log('\n✅ Sample data seeded successfully!');
        console.log('\nNote: Make sure to place PDF files in backend/uploads/ directory');
        console.log('Update pdfPath in units to match your actual file structure\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}
seedData();
