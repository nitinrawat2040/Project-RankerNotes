import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CollegeSelect from './pages/CollegeSelect';
import CombinedSelect from './pages/CombinedSelect';
import SemesterSelect from './pages/SemesterSelect';
import SubjectList from './pages/SubjectList';
import UnitList from './pages/UnitList';
import PDFViewer from './pages/PDFViewer';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/colleges"
            element={
              <PrivateRoute>
                <CollegeSelect />
              </PrivateRoute>
            }
          />
          <Route
            path="/select"
            element={
              <PrivateRoute>
                <CombinedSelect />
              </PrivateRoute>
            }
          />
          <Route
            path="/semesters"
            element={
              <PrivateRoute>
                <SemesterSelect />
              </PrivateRoute>
            }
          />
          <Route
            path="/subjects/:semesterId"
            element={
              <PrivateRoute>
                <SubjectList />
              </PrivateRoute>
            }
          />
          <Route
            path="/units/:subjectId"
            element={
              <PrivateRoute>
                <UnitList />
              </PrivateRoute>
            }
          />
          <Route
            path="/view/:unitId"
            element={
              <PrivateRoute>
                <PDFViewer />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

