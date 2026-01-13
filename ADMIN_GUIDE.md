# Complete Admin Guide - Adding Subjects & Uploading PDFs

This guide explains how to add subjects to any semester and upload PDF files for students to view.

## 📋 Table of Contents

1. [Understanding the Database Structure](#database-structure)
2. [Method 1: Using the Seed Script (Recommended)](#method-1-seed-script)
3. [Method 2: Using MongoDB Directly](#method-2-mongodb)
4. [Method 3: Using API Endpoints](#method-3-api)
5. [Uploading PDF Files](#uploading-pdfs)
6. [Complete Example: Adding a New Subject](#complete-example)

---

## 🗄️ Database Structure

Your app uses this hierarchy:
```
College
  └── Course (e.g., BCA(General), BCA(Data Science))
      └── Semester (1-8)
          └── Subject (e.g., C# Programming, Mathematics)
              └── Unit (1, 2, 3, 4...)
                  └── PDF File (stored in backend/uploads/)
```

### Important Fields:

**Subject:**
- `semesterId` - Links to which semester
- `name` - Subject name (e.g., "C# Programming")
- `code` - Optional subject code (e.g., "CSHARP601")

**Unit:**
- `subjectId` - Links to which subject
- `name` - Unit name (e.g., "Unit 1: Introduction to C#")
- `number` - Unit number (1, 2, 3, 4...)
- `pdfPath` - **CRITICAL**: Path to PDF file relative to `backend/uploads/`
- `description` - Optional description

---

## 📝 Method 1: Using Seed Script (Recommended)

### Step 1: Edit the Seed Script

Open `backend/scripts/seedData.js` and find the section where subjects are created.

### Step 2: Add Your Subject

Add your subject creation code. Here's the template:

```javascript
// Find the semester you want (e.g., Semester 6)
const semester6_subject1 = semesters.find(s => s.number === 6);

if (semester6_subject1) {
    // Create your subject
    let yourSubject = await Subject.findOne({
        semesterId: semester6_subject1._id,
        name: 'Your Subject Name'
    });

    if (!yourSubject) {
        yourSubject = await Subject.create({
            semesterId: semester6_subject1._id,
            name: 'Your Subject Name',
            code: 'SUBJECT601'  // Optional code
        });
        console.log('Created subject: Your Subject Name');
    }

    // Create units for your subject
    const units = [
        { name: 'Unit 1: Topic 1', description: 'Description here' },
        { name: 'Unit 2: Topic 2', description: 'Description here' },
        { name: 'Unit 3: Topic 3', description: 'Description here' },
        { name: 'Unit 4: Topic 4', description: 'Description here' }
    ];

    for (let i = 0; i < units.length; i++) {
        let unit = await Unit.findOne({
            subjectId: yourSubject._id,
            number: i + 1
        });
        
        if (!unit) {
            unit = await Unit.create({
                subjectId: yourSubject._id,
                name: units[i].name,
                number: i + 1,
                pdfPath: `yourfolder/sem6/unit${i + 1}.pdf`,  // IMPORTANT: Set your PDF path
                description: units[i].description
            });
            console.log(`Created unit: ${units[i].name}`);
        }
    }
}
```

### Step 3: Run the Seed Script

```bash
cd backend
npm run seed
```

---

## 🗄️ Method 2: Using MongoDB Directly

### Step 1: Connect to MongoDB

Use MongoDB Compass or MongoDB Shell to connect to your database.

### Step 2: Find the Semester ID

```javascript
// Find Semester 6 for BCA(General) at J.C. Bose University of Science and Technology, YMCA Faridabad, Haryana
db.semesters.find({
  number: 6
}).pretty()

// Note the _id of the semester you want
```

### Step 3: Create the Subject

```javascript
db.subjects.insertOne({
  semesterId: ObjectId("PASTE_SEMESTER_ID_HERE"),
  name: "Your Subject Name",
  code: "SUBJECT601"
})
```

**Note the `_id` of the created subject!**

### Step 4: Create Units

```javascript
// Replace SUBJECT_ID with the _id from Step 3
db.units.insertMany([
  {
    subjectId: ObjectId("SUBJECT_ID"),
    name: "Unit 1: Topic 1",
    number: 1,
    pdfPath: "yourfolder/sem6/unit1.pdf",
    description: "Description here"
  },
  {
    subjectId: ObjectId("SUBJECT_ID"),
    name: "Unit 2: Topic 2",
    number: 2,
    pdfPath: "yourfolder/sem6/unit2.pdf",
    description: "Description here"
  },
  {
    subjectId: ObjectId("SUBJECT_ID"),
    name: "Unit 3: Topic 3",
    number: 3,
    pdfPath: "yourfolder/sem6/unit3.pdf",
    description: "Description here"
  },
  {
    subjectId: ObjectId("SUBJECT_ID"),
    name: "Unit 4: Topic 4",
    number: 4,
    pdfPath: "yourfolder/sem6/unit4.pdf",
    description: "Description here"
  }
])
```

---

## 🔌 Method 3: Using API Endpoints (Programmatic)

### Step 1: Get Semester ID

First, you need to find the semester ID. You can do this by:
1. Logging into the app
2. Selecting the semester
3. Checking the URL: `/subjects/:semesterId`
4. Or querying the API: `GET /api/semesters/course/:courseId`

### Step 2: Create Subject (You'll need to add this endpoint)

Currently, there's no API endpoint to create subjects. You would need to add one in `backend/routes/subjects.js`:

```javascript
// POST /api/subjects
router.post('/', authenticate, async (req, res) => {
  try {
    const { semesterId, name, code } = req.body;
    const subject = await Subject.create({ semesterId, name, code });
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Error creating subject', error: error.message });
  }
});
```

### Step 3: Create Units (You'll need to add this endpoint)

Similarly, add to `backend/routes/units.js`:

```javascript
// POST /api/units
router.post('/', authenticate, async (req, res) => {
  try {
    const { subjectId, name, number, pdfPath, description } = req.body;
    const unit = await Unit.create({ subjectId, name, number, pdfPath, description });
    res.status(201).json(unit);
  } catch (error) {
    res.status(500).json({ message: 'Error creating unit', error: error.message });
  }
});
```

---

## 📤 Uploading PDF Files

### Step 1: Understand the PDF Path Structure

The `pdfPath` in the database is **relative to `backend/uploads/`**.

**Example:**
- Database `pdfPath`: `csharp/sem6/unit1.pdf`
- Actual file location: `backend/uploads/csharp/sem6/unit1.pdf`

### Step 2: Create Folder Structure

Create folders matching your `pdfPath`:

```bash
# Windows (PowerShell)
New-Item -ItemType Directory -Path "backend\uploads\yourfolder\sem6" -Force

# Windows (Command Prompt)
mkdir backend\uploads\yourfolder\sem6

# Mac/Linux
mkdir -p backend/uploads/yourfolder/sem6
```

### Step 3: Place PDF Files

1. Copy your PDF files to the created folder
2. Name them exactly as specified in `pdfPath`:
   - If `pdfPath` is `csharp/sem6/unit1.pdf`, name the file `unit1.pdf`
   - If `pdfPath` is `math/sem1/chapter1.pdf`, name the file `chapter1.pdf`

### Step 4: Verify File Structure

Your structure should look like:
```
backend/uploads/
└── yourfolder/
    └── sem6/
        ├── unit1.pdf
        ├── unit2.pdf
        ├── unit3.pdf
        └── unit4.pdf
```

### Step 5: Test

1. Restart your backend server (if needed)
2. Navigate through the app to the unit
3. Click on the unit - PDF should load

---

## 📚 Complete Example: Adding "Web Development" to Semester 3

### Example 1: Using Seed Script

Add this to `backend/scripts/seedData.js`:

```javascript
// Add after the C# Programming section

// Create Web Development subject for Semester 3
const semester3 = semesters.find(s => s.number === 3);
if (semester3) {
    let webDevSubject = await Subject.findOne({
        semesterId: semester3._id,
        name: 'Web Development'
    });

    if (!webDevSubject) {
        webDevSubject = await Subject.create({
            semesterId: semester3._id,
            name: 'Web Development',
            code: 'WEB301'
        });
        console.log('Created subject: Web Development for Semester 3');
    }

    // Create 4 units
    const webDevUnits = [
        { name: 'Unit 1: HTML & CSS Basics', description: 'Introduction to HTML and CSS' },
        { name: 'Unit 2: JavaScript Fundamentals', description: 'JavaScript basics and DOM manipulation' },
        { name: 'Unit 3: React.js', description: 'Building UI with React' },
        { name: 'Unit 4: Backend Integration', description: 'Connecting frontend to backend APIs' }
    ];

    for (let i = 0; i < webDevUnits.length; i++) {
        let unit = await Unit.findOne({
            subjectId: webDevSubject._id,
            number: i + 1
        });
        
        if (!unit) {
            unit = await Unit.create({
                subjectId: webDevSubject._id,
                name: webDevUnits[i].name,
                number: i + 1,
                pdfPath: `webdev/sem3/unit${i + 1}.pdf`,  // PDF path
                description: webDevUnits[i].description
            });
            console.log(`Created unit: ${webDevUnits[i].name}`);
        }
    }
}
```

Then:
1. Create folder: `backend/uploads/webdev/sem3/`
2. Place PDFs: `unit1.pdf`, `unit2.pdf`, `unit3.pdf`, `unit4.pdf`
3. Run: `npm run seed`

### Example 2: Using MongoDB

```javascript
// 1. Find Semester 3 ID
db.semesters.findOne({ number: 3, "courseId": ObjectId("YOUR_BCA_GENERAL_COURSE_ID") })

// 2. Create Subject (use the semester _id from step 1)
db.subjects.insertOne({
  semesterId: ObjectId("SEMESTER_3_ID"),
  name: "Web Development",
  code: "WEB301"
})

// 3. Create Units (use the subject _id from step 2)
db.units.insertMany([
  {
    subjectId: ObjectId("SUBJECT_ID"),
    name: "Unit 1: HTML & CSS Basics",
    number: 1,
    pdfPath: "webdev/sem3/unit1.pdf",
    description: "Introduction to HTML and CSS"
  },
  {
    subjectId: ObjectId("SUBJECT_ID"),
    name: "Unit 2: JavaScript Fundamentals",
    number: 2,
    pdfPath: "webdev/sem3/unit2.pdf",
    description: "JavaScript basics and DOM manipulation"
  },
  {
    subjectId: ObjectId("SUBJECT_ID"),
    name: "Unit 3: React.js",
    number: 3,
    pdfPath: "webdev/sem3/unit3.pdf",
    description: "Building UI with React"
  },
  {
    subjectId: ObjectId("SUBJECT_ID"),
    name: "Unit 4: Backend Integration",
    number: 4,
    pdfPath: "webdev/sem3/unit4.pdf",
    description: "Connecting frontend to backend APIs"
  }
])

// 4. Create folder and place PDFs
// backend/uploads/webdev/sem3/unit1.pdf, unit2.pdf, etc.
```

---

## 🎯 Quick Reference: PDF Path Rules

### Rule 1: Relative Path
- `pdfPath` is **always relative** to `backend/uploads/`
- Never include `backend/uploads/` in the path

### Rule 2: Use Forward Slashes
- Use `/` not `\` even on Windows
- Example: `csharp/sem6/unit1.pdf` ✅
- Example: `csharp\sem6\unit1.pdf` ❌

### Rule 3: Match File Names
- If `pdfPath` is `folder/subfolder/file.pdf`
- File must be at: `backend/uploads/folder/subfolder/file.pdf`
- File name must match exactly (case-sensitive on Linux/Mac)

### Rule 4: Folder Structure
- Create folders to match your `pdfPath`
- If `pdfPath` is `math/sem1/chapter1.pdf`
- Create: `backend/uploads/math/sem1/`
- Place: `chapter1.pdf` in that folder

---

## 🔍 Finding IDs (For Manual Entry)

### Find College ID:
```javascript
db.colleges.find({ name: "J.C. Bose University of Science and Technology, YMCA Faridabad, Haryana" })
```

### Find Course ID:
```javascript
db.courses.find({ 
  collegeId: ObjectId("COLLEGE_ID"),
  name: "BCA(General)"
})
```

### Find Semester ID:
```javascript
db.semesters.find({
  courseId: ObjectId("COURSE_ID"),
  number: 6  // Semester number
})
```

### Find Subject ID:
```javascript
db.subjects.find({
  semesterId: ObjectId("SEMESTER_ID"),
  name: "C# Programming"
})
```

---

## ✅ Checklist: Adding a New Subject

- [ ] Decide which semester (1-8)
- [ ] Decide subject name and code
- [ ] Decide unit names and count
- [ ] Choose PDF folder structure
- [ ] Add subject creation code to seed script OR use MongoDB
- [ ] Add unit creation code to seed script OR use MongoDB
- [ ] Run seed script OR execute MongoDB commands
- [ ] Create PDF folder structure: `backend/uploads/yourfolder/semX/`
- [ ] Place PDF files with correct names
- [ ] Verify `pdfPath` in database matches file location
- [ ] Test in the app: College → Course → Semester → Subject → Unit → View PDF

---

## 🚨 Common Issues & Solutions

### Issue 1: PDF Not Loading
**Solution:**
- Check `pdfPath` in database matches actual file location
- Verify file exists at: `backend/uploads/[pdfPath]`
- Check file permissions
- Check backend server logs for errors

### Issue 2: Subject Not Showing
**Solution:**
- Verify `semesterId` is correct
- Check subject was created successfully
- Refresh the page
- Check browser console for API errors

### Issue 3: Units Not Showing
**Solution:**
- Verify `subjectId` is correct
- Check units were created successfully
- Ensure `number` field is set (1, 2, 3, 4...)
- Check API response in browser DevTools

### Issue 4: Wrong Semester
**Solution:**
- Double-check `semesterId` when creating subject
- Verify semester number matches what you want
- Use MongoDB to find correct semester ID first

---

## 📝 Template: Quick Add Script

Save this as `backend/scripts/addSubject.js`:

```javascript
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import College from '../models/College.js';
import Course from '../models/Course.js';
import Semester from '../models/Semester.js';
import Subject from '../models/Subject.js';
import Unit from '../models/Unit.js';

dotenv.config();

const addSubject = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notes-app');
        console.log('Connected to MongoDB');

        // CONFIGURE THESE VALUES:
        const collegeName = 'J.C. Bose University of Science and Technology, YMCA Faridabad, Haryana';
        const courseName = 'BCA(General)';
        const semesterNumber = 6;  // Change this
        const subjectName = 'Your Subject Name';  // Change this
        const subjectCode = 'SUBJECT601';  // Change this
        const pdfFolder = 'yourfolder';  // Change this (e.g., 'csharp', 'webdev')

        // Get college
        const college = await College.findOne({ name: collegeName });
        if (!college) {
            console.error('College not found!');
            process.exit(1);
        }

        // Get course
        const course = await Course.findOne({ 
            collegeId: college._id, 
            name: courseName 
        });
        if (!course) {
            console.error('Course not found!');
            process.exit(1);
        }

        // Get semester
        const semester = await Semester.findOne({ 
            courseId: course._id, 
            number: semesterNumber 
        });
        if (!semester) {
            console.error(`Semester ${semesterNumber} not found!`);
            process.exit(1);
        }

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
            console.log(`✅ Created subject: ${subjectName}`);
        } else {
            console.log(`Subject "${subjectName}" already exists`);
        }

        // CONFIGURE YOUR UNITS HERE:
        const units = [
            { name: 'Unit 1: Topic 1', description: 'Description' },
            { name: 'Unit 2: Topic 2', description: 'Description' },
            { name: 'Unit 3: Topic 3', description: 'Description' },
            { name: 'Unit 4: Topic 4', description: 'Description' }
        ];

        // Create units
        for (let i = 0; i < units.length; i++) {
            let unit = await Unit.findOne({
                subjectId: subject._id,
                number: i + 1
            });

            if (!unit) {
                unit = await Unit.create({
                    subjectId: subject._id,
                    name: units[i].name,
                    number: i + 1,
                    pdfPath: `${pdfFolder}/sem${semesterNumber}/unit${i + 1}.pdf`,
                    description: units[i].description
                });
                console.log(`✅ Created unit: ${units[i].name}`);
            } else {
                console.log(`Unit ${i + 1} already exists`);
            }
        }

        console.log('\n✅ Subject and units created successfully!');
        console.log(`\n📁 Next step: Create folder and place PDFs:`);
        console.log(`   backend/uploads/${pdfFolder}/sem${semesterNumber}/`);
        console.log(`   Files: unit1.pdf, unit2.pdf, unit3.pdf, unit4.pdf\n`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

addSubject();
```

**Usage:**
1. Edit the configuration values at the top
2. Run: `node backend/scripts/addSubject.js`

---

## 🎓 Summary

**To add a subject:**
1. Choose semester (1-8)
2. Create subject in database (seed script or MongoDB)
3. Create units in database
4. Set `pdfPath` for each unit
5. Create folder structure matching `pdfPath`
6. Place PDF files with correct names
7. Test in the app

**Remember:**
- `pdfPath` is relative to `backend/uploads/`
- File names must match `pdfPath`
- Folder structure must exist
- Test after adding!

Now you can add subjects and upload PDFs independently! 🚀

