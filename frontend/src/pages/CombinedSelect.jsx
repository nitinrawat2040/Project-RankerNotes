import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './CombinedSelect.css';

const CombinedSelect = () => {
    const [colleges, setColleges] = useState([]);
    const [filteredColleges, setFilteredColleges] = useState([]);
    const [courses, setCourses] = useState([]);
    const [semesters, setSemesters] = useState([]);

    const [selectedCollege, setSelectedCollege] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    // Semesters 1-8
    const semesterNumbers = [1, 2, 3, 4, 5, 6, 7, 8];

    useEffect(() => {
        fetchColleges();
    }, []);

    useEffect(() => {
        // Filter colleges based on search query
        if (searchQuery.trim() === '') {
            setFilteredColleges(colleges);
        } else {
            const filtered = colleges.filter(college =>
                college.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredColleges(filtered);
        }
    }, [searchQuery, colleges]);

    useEffect(() => {
        if (selectedCollege) {
            fetchCourses(selectedCollege);
        } else {
            setCourses([]);
            setSelectedCourse('');
            setSelectedSemester('');
            setSemesters([]);
        }
    }, [selectedCollege]);

    useEffect(() => {
        if (selectedCourse) {
            fetchSemesters(selectedCourse);
        } else {
            setSelectedSemester('');
            setSemesters([]);
        }
    }, [selectedCourse]);

    // Debug: Log when course changes
    useEffect(() => {
        console.log('Selected course changed:', selectedCourse);
    }, [selectedCourse]);

    const fetchColleges = async () => {
        try {
            const response = await axios.get('/api/colleges');
            setColleges(response.data);
            setFilteredColleges(response.data);
        } catch (error) {
            setError('Failed to load colleges');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async (collegeId) => {
        try {
            setError('');
            const response = await axios.get(`/api/courses/college/${collegeId}`);
            console.log('Courses fetched:', response.data);

            // Filter to show ONLY BCA(General) and BCA(Data Science)
            const filteredCourses = response.data.filter(c =>
                c.name === 'BCA(General)' ||
                c.name === 'BCA(Data Science)'
            );

            setCourses(filteredCourses);

            // Auto-select BCA(General) if available
            const bcaGeneralCourse = filteredCourses.find(c =>
                c.name === 'BCA(General)'
            );
            if (bcaGeneralCourse) {
                setSelectedCourse(bcaGeneralCourse._id);
                console.log('Auto-selected BCA(General) course:', bcaGeneralCourse);
            } else if (filteredCourses.length === 0) {
                console.log('BCA courses not found');
                setError('No BCA courses available for this college. Please run the seed script to create BCA courses.');
            }
        } catch (error) {
            console.error('Failed to load courses:', error);
            setError('Failed to load courses. Please check if the backend is running and try again.');
            setCourses([]);
        }
    };

    const fetchSemesters = async (courseId) => {
        try {
            setError('');
            console.log('Fetching semesters for courseId:', courseId);
            const response = await axios.get(`/api/semesters/course/${courseId}`);
            console.log('Semesters fetched for course:', courseId, response.data);
            console.log('Number of semesters:', response.data.length);
            setSemesters(response.data);
            if (response.data.length === 0) {
                setError('No semesters available for this course. Please run the seed script.');
            }
        } catch (error) {
            console.error('Failed to load semesters:', error);
            console.error('Error details:', error.response?.data);
            setError('Failed to load semesters. Please check if the backend is running.');
            setSemesters([]);
        }
    };

    const handleCollegeSelect = (collegeId) => {
        setSelectedCollege(collegeId);
        setSelectedCourse('');
        setSelectedSemester('');
    };

    const handleCourseSelect = (courseId) => {
        setSelectedCourse(courseId);
        setSelectedSemester('');
    };

    const handleSemesterSelect = (semesterNumber) => {
        setSelectedSemester(semesterNumber);
    };

    const handleProceed = () => {
        if (!selectedCollege || !selectedCourse || !selectedSemester) {
            setError('Please select college, course, and semester');
            return;
        }

        // Find the semester ID from the selected semester number
        const semester = semesters.find(s => s.number === parseInt(selectedSemester));
        if (semester) {
            // Save selections to user profile (optional)
            axios.post(`/api/colleges/${selectedCollege}/select`).catch(console.error);
            navigate(`/subjects/${semester._id}`);
        } else {
            setError('Selected semester not found');
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    if (loading) {
        return <div className="loading">Loading colleges...</div>;
    }

    return (
        <div className="combined-select-page">
            <Navbar />
            <div className="combined-content">
                <h1>Select College, Course & Semester</h1>
                {error && <div className="error-message">{error}</div>}

                {/* Step 1: College Selection */}
                <div className="selection-section">
                    <h2>Step 1: Select College</h2>
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search colleges by name..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="search-input"
                        />
                        {searchQuery && (
                            <span className="search-results-count">
                                {filteredColleges.length} {filteredColleges.length === 1 ? 'college' : 'colleges'} found
                            </span>
                        )}
                    </div>
                    <div className="selection-grid">
                        {filteredColleges.map((college) => (
                            <div
                                key={college._id}
                                className={`selection-card ${selectedCollege === college._id ? 'selected' : ''}`}
                                onClick={() => handleCollegeSelect(college._id)}
                            >
                                <h3>{college.name}</h3>
                            </div>
                        ))}
                    </div>
                    {filteredColleges.length === 0 && searchQuery && (
                        <p className="empty-message">No colleges found matching "{searchQuery}"</p>
                    )}
                </div>

                {/* Step 2: Course Selection */}
                {selectedCollege && (
                    <div className="selection-section">
                        <h2>Step 2: Select Course</h2>
                        <div className="dropdown-container">
                            <select
                                value={selectedCourse}
                                onChange={(e) => handleCourseSelect(e.target.value)}
                                className="dropdown-select"
                            >
                                <option value="">-- Select Course --</option>
                                {courses.map((course) => (
                                    <option key={course._id} value={course._id}>
                                        {course.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {courses.length === 0 && selectedCollege && (
                            <p className="info-message">No courses available for this college</p>
                        )}
                    </div>
                )}

                {/* Step 3: Semester Selection */}
                {selectedCourse && (
                    <div className="selection-section">
                        <h2>Step 3: Select Semester</h2>
                        <div className="semester-grid">
                            {semesterNumbers.map((num) => {
                                const semester = semesters.find(s => s.number === num);
                                const isAvailable = semester !== undefined;
                                return (
                                    <div
                                        key={num}
                                        className={`semester-card ${selectedSemester === num.toString() ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
                                        onClick={() => isAvailable && handleSemesterSelect(num.toString())}
                                        title={!isAvailable ? 'Semester not available' : `Select Semester ${num}`}
                                    >
                                        <h3>Semester {num}</h3>
                                        {!isAvailable && <span className="unavailable-badge">Not Available</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Proceed Button */}
                {selectedCollege && selectedCourse && selectedSemester && (
                    <div className="proceed-section">
                        <button className="proceed-button" onClick={handleProceed}>
                            Continue to Subjects →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CombinedSelect;

