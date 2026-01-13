# Quick Reference Card - Adding Subjects & PDFs

## 🚀 Fastest Method: Use addSubject.js Script

### Step 1: Edit the Script
Open `backend/scripts/addSubject.js` and change these values:

```javascript
const semesterNumber = 6;  // Which semester? (1-8)
const subjectName = 'Your Subject Name';
const subjectCode = 'SUBJECT601';  // Optional
const pdfFolder = 'yourfolder';  // Folder name for PDFs

const units = [
    { name: 'Unit 1: Topic 1', description: 'Description' },
    { name: 'Unit 2: Topic 2', description: 'Description' },
    { name: 'Unit 3: Topic 3', description: 'Description' },
    { name: 'Unit 4: Topic 4', description: 'Description' }
];
```

### Step 2: Run the Script
```bash
cd backend
npm run add-subject
```

### Step 3: Create Folder & Upload PDFs
```bash
# Create folder
mkdir -p backend/uploads/yourfolder/sem6

# Place your PDFs there:
# - unit1.pdf
# - unit2.pdf
# - unit3.pdf
# - unit4.pdf
```

**Done!** ✅

---

## 📋 Manual Method: MongoDB

### 1. Find Semester ID
```javascript
db.semesters.findOne({ 
  number: 6,  // Your semester number
  "courseId": ObjectId("YOUR_COURSE_ID")
})
```

### 2. Create Subject
```javascript
db.subjects.insertOne({
  semesterId: ObjectId("SEMESTER_ID_FROM_STEP_1"),
  name: "Your Subject Name",
  code: "SUBJECT601"
})
```

### 3. Create Units
```javascript
db.units.insertMany([
  {
    subjectId: ObjectId("SUBJECT_ID_FROM_STEP_2"),
    name: "Unit 1: Topic 1",
    number: 1,
    pdfPath: "yourfolder/sem6/unit1.pdf",
    description: "Description"
  },
  // ... repeat for unit2, unit3, unit4
])
```

### 4. Upload PDFs
- Create: `backend/uploads/yourfolder/sem6/`
- Place: `unit1.pdf`, `unit2.pdf`, etc.

---

## 📁 PDF Path Rules

**Rule:** `pdfPath` is relative to `backend/uploads/`

| pdfPath in DB | Actual File Location |
|--------------|---------------------|
| `csharp/sem6/unit1.pdf` | `backend/uploads/csharp/sem6/unit1.pdf` |
| `math/sem1/chapter1.pdf` | `backend/uploads/math/sem1/chapter1.pdf` |
| `webdev/sem3/unit2.pdf` | `backend/uploads/webdev/sem3/unit2.pdf` |

**Important:**
- ✅ Use forward slashes `/`
- ✅ File name must match exactly
- ✅ Folder must exist before placing PDFs

---

## ✅ Checklist

- [ ] Edit `addSubject.js` OR use MongoDB
- [ ] Run script OR execute MongoDB commands
- [ ] Create PDF folder: `backend/uploads/yourfolder/semX/`
- [ ] Place PDF files with correct names
- [ ] Verify `pdfPath` matches file location
- [ ] Test in app

---

## 🎯 Example: Adding "Database Management" to Semester 4

**Using addSubject.js:**
```javascript
const semesterNumber = 4;
const subjectName = 'Database Management';
const subjectCode = 'DB401';
const pdfFolder = 'database';

const units = [
    { name: 'Unit 1: SQL Basics', description: 'Introduction to SQL' },
    { name: 'Unit 2: Database Design', description: 'ER diagrams and normalization' },
    { name: 'Unit 3: Advanced Queries', description: 'Joins, subqueries, views' },
    { name: 'Unit 4: Database Administration', description: 'Security and optimization' }
];
```

**Then:**
1. Run: `npm run add-subject`
2. Create: `backend/uploads/database/sem4/`
3. Place: `unit1.pdf`, `unit2.pdf`, `unit3.pdf`, `unit4.pdf`
4. Test!

---

For detailed instructions, see **ADMIN_GUIDE.md** 📖


