# Quick Start Guide

Follow these steps to get your Notes App running quickly:

## Step 1: Install MongoDB

**Windows:**
- Download MongoDB from https://www.mongodb.com/try/download/community
- Install and start MongoDB service (usually starts automatically)

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

## Step 2: Setup Backend

```bash
cd backend
npm install
```

Create `.env` file:
```bash
PORT=5100
MONGODB_URI=mongodb://localhost:27017/notes-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

Start backend:
```bash
npm run dev
```

Backend should be running on http://localhost:5100

## Step 3: Seed Sample Data

In a new terminal (while backend is running):
```bash
cd backend
npm run seed
```

This creates Guru Gobind Singh Indraprastha University(GGSIPU), semesters, subjects, and units.

## Step 4: Add PDF Files

1. Create folders in `backend/uploads/` as needed
2. Place your PDF files there
3. Update the `pdfPath` in MongoDB to match your file structure

Example:
- File: `backend/uploads/math/unit1.pdf`
- pdfPath in database: `math/unit1.pdf`

## Step 5: Setup Frontend

Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

Frontend should be running on http://localhost:3000

## Step 6: Test the App

1. Open http://localhost:3000 in your browser
2. Sign up with a new account
3. Select a college
4. Select a semester
5. Select a subject
6. Select a unit
7. View the PDF (if PDF file exists)

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running: `mongod` or check Windows services
- Verify connection string in `.env` file

### PDF Not Loading
- Check that PDF file exists at the path specified in database
- Verify `pdfPath` in Unit document matches actual file location
- Check browser console for errors

### Port Already in Use
- Change PORT in backend `.env` file
- Update proxy in `frontend/vite.config.js` if you change backend port

### CORS Errors
- Make sure backend is running
- Check that frontend proxy is configured correctly in `vite.config.js`

## Next Steps

- Add more colleges, semesters, subjects, and units
- Upload PDF files
- Customize the UI
- Add admin features for managing content

