import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './ListPage.css';

const CollegeSelect = () => {
    const [colleges, setColleges] = useState([]);
    const [filteredColleges, setFilteredColleges] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

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

    const handleSelectCollege = async (collegeId) => {
        try {
            await axios.post(`/api/colleges/${collegeId}/select`);
            navigate('/semesters');
        } catch (error) {
            setError('Failed to select college');
            console.error(error);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    if (loading) {
        return <div className="loading">Loading colleges...</div>;
    }

    return (
        <div className="list-page">
            <Navbar />
            <div className="list-content">
                <h1>Select Your College</h1>
                {error && <div className="error-message">{error}</div>}

                {/* Search Bar */}
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

                <div className="list-grid">
                    {filteredColleges.map((college) => (
                        <div
                            key={college._id}
                            className="list-item"
                            onClick={() => handleSelectCollege(college._id)}
                        >
                            <h3>{college.name}</h3>
                        </div>
                    ))}
                </div>
                {filteredColleges.length === 0 && searchQuery && (
                    <p className="empty-message">No colleges found matching "{searchQuery}"</p>
                )}
                {filteredColleges.length === 0 && !searchQuery && (
                    <p className="empty-message">No colleges available</p>
                )}
            </div>
        </div>
    );
};

export default CollegeSelect;

