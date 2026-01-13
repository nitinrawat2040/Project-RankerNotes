# Notes App - Secure PDF Viewer

A web application where students can view study materials (PDFs) with restricted access - no downloads and no screenshots (best-effort protection).

## Features

- 🔐 User authentication (Login/Signup)
- 🏫 College and Semester selection
- 📚 Subject and Unit browsing
- 📄 Secure PDF viewer with:
  - No download option
  - Disabled right-click context menu
  - Disabled text selection
  - Watermark overlay with user email
  - Disabled keyboard shortcuts (Ctrl+S, Ctrl+P)

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- PDF.js for PDF handling

### Frontend
- React 18
- React Router DOM
- Axios for API calls
- PDF.js for PDF rendering
- Vite for build tooling

## Project Structure

```
Notes-App/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── uploads/         # PDF storage
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # Auth context
│   │   └── App.jsx      # Main app component
│   └── vite.config.js   # Vite configuration
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
PORT=5100
MONGODB_URI=mongodb://localhost:27017/notes-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

4. Start MongoDB (if running locally):
```bash
# On Windows (if MongoDB is installed as service, it should start automatically)
# On Mac/Linux:
mongod
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5100`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Database Setup

The app uses MongoDB with the following collections:
- `users` - User accounts
- `colleges` - College information
- `semesters` - Semester data (linked to colleges)
- `subjects` - Subject data (linked to semesters)
- `units` - Unit data with PDF paths (linked to subjects)

### Seed Sample Data

To quickly populate your database with sample data:

```bash
cd backend
npm run seed
```

This will create:
- 1 Guru Gobind Singh Indraprastha University(GGSIPU)
- 4 semesters
- 4 subjects (for semester 1)
- 3 units (for the first subject)

**Note**: After seeding, make sure to:
1. Place actual PDF files in `backend/uploads/` directory
2. Update the `pdfPath` field in Unit documents to match your actual file paths

### Manual Data Entry

You can also add data using MongoDB Compass or MongoDB shell:

```javascript
// Example: Add a college
db.colleges.insertOne({ name: "ABC College" })

// Example: Add a semester
db.semesters.insertOne({ 
  collegeId: ObjectId("..."), 
  number: 1, 
  name: "Semester 1" 
})

// Example: Add a subject
db.subjects.insertOne({ 
  semesterId: ObjectId("..."), 
  name: "Mathematics", 
  code: "MATH101" 
})

// Example: Add a unit
db.units.insertOne({ 
  subjectId: ObjectId("..."), 
  name: "Unit 1: Algebra", 
  number: 1, 
  pdfPath: "math/unit1.pdf"  // Relative to backend/uploads/
})
```

## Uploading PDFs

1. Place your PDF files in the `backend/uploads/` directory
2. The `pdfPath` field in the Unit document should match the file path relative to `backend/uploads/`

### Example: C# Programming (Semester 6, BCA General)

The seed script has created:
- **Subject**: C# Programming (Semester 6)
- **Units**: 4 units ready for PDF upload

**To upload PDFs for C# Programming:**

1. Create the folder structure (if it doesn't exist):
   ```
   backend/uploads/csharp/sem6/
   ```

2. Place your PDF files with these names:
   - `unit1.pdf` → Unit 1: Introduction to .NET
   - `unit2.pdf` → Unit 2: Introduction to C#
   - `unit3.pdf` → Unit 3:  Inheritance, Exception and Multithreading
   - `unit4.pdf` → Unit 4: Database Connectivity

3. The `pdfPath` in the database is already set to: `csharp/sem6/unit1.pdf`, `csharp/sem6/unit2.pdf`, etc.

**General Example:**
- File location: `backend/uploads/math/unit1.pdf`
- pdfPath in database: `math/unit1.pdf`

## Security Features

### PDF Protection (Best Effort)
- ✅ PDFs are served through authenticated API endpoints
- ✅ Right-click context menu disabled
- ✅ Text selection disabled
- ✅ Keyboard shortcuts disabled (Ctrl+S, Ctrl+P)
- ✅ Watermark overlay with user email
- ✅ No direct PDF URL exposure

### Limitations
⚠️ **Important**: Complete protection against screenshots is not possible:
- Users can take photos with another device
- Advanced users may bypass browser restrictions
- Screen recording software can capture content

The implemented protections are deterrents and make casual sharing more difficult.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Colleges
- `GET /api/colleges` - Get all colleges
- `POST /api/colleges/:id/select` - Select college for user

### Semesters
- `GET /api/semesters` - Get semesters for user's college
- `GET /api/semesters/college/:collegeId` - Get semesters for specific college

### Subjects
- `GET /api/subjects/semester/:semesterId` - Get subjects for semester

### Units
- `GET /api/units/subject/:subjectId` - Get units for subject
- `GET /api/units/:id/pdf` - Get PDF file (authenticated)

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm run dev  # Vite dev server with hot reload
```

## Production Build

### Frontend
```bash
cd frontend
npm run build
```
The built files will be in `frontend/dist/`

### Backend
```bash
cd backend
npm start
```

## Future Enhancements

- [ ] Admin panel for managing colleges, semesters, subjects, and units
- [ ] PDF upload interface
- [ ] Search functionality
- [ ] Favorites/Bookmarks
- [ ] Reading progress tracking
- [ ] Better PDF rendering with zoom controls
- [ ] Mobile responsive design improvements

## License

MIT License - feel free to use this project for your needs.

## Support

For issues or questions, please create an issue in the repository.

