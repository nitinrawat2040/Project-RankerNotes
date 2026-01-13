# PDF Upload Guide

## C# Programming - Semester 6 (BCA General)

The subject "C# Programming" has been created for Semester 6 with 4 units ready for PDF upload.

### Folder Structure

Create this folder structure in `backend/uploads/`:

```
backend/uploads/
└── csharp/
    └── sem6/
        ├── unit1.pdf  (Unit 1: Introduction to .NET)
        ├── unit2.pdf  (Unit 2: Introduction to C#)
        ├── unit3.pdf  (Unit 3:  Inheritance, Exception and Multithreading)
        └── unit4.pdf  (Unit 4: Database Connectivity)
```

### Steps to Upload PDFs

1. **Create the folder** (if it doesn't exist):
   ```bash
   mkdir -p backend/uploads/csharp/sem6
   ```

2. **Place your PDF files** in `backend/uploads/csharp/sem6/`:
   - Name them exactly: `unit1.pdf`, `unit2.pdf`, `unit3.pdf`, `unit4.pdf`
   - Or update the database `pdfPath` field to match your file names

3. **Verify the path** in database:
   - The `pdfPath` should be: `csharp/sem6/unit1.pdf` (relative to `backend/uploads/`)

### Testing the Flow

1. Login/Signup
2. Select College → J.C. Bose University of Science and Technology, YMCA Faridabad, Haryana
3. Select Course → BCA(General)
4. Select Semester → Semester 6
5. Select Subject → C# Programming
6. Select Unit → You'll see 4 units
7. Click on any unit → PDF viewer opens (if PDF file exists)

### PDF Viewer Features

- ✅ No download button
- ✅ Right-click disabled
- ✅ Text selection disabled
- ✅ Keyboard shortcuts disabled (Ctrl+S, Ctrl+P)
- ✅ Watermark overlay with user email
- ✅ Page navigation controls

### Note

If PDF files are not found, you'll see an error. Make sure:
- PDF files are in the correct folder
- File names match the `pdfPath` in database
- File permissions allow reading

