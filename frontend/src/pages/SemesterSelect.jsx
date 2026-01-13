import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './ListPage.css';

const SemesterSelect = () => {
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (!user?.collegeId) {
            navigate('/colleges');
            return;
        }
        fetchSemesters();
    }, [user, navigate]);

    const fetchSemesters = async () => {
        try {
            const response = await axios.get('/api/semesters');
            setSemesters(response.data);
        } catch (error) {
            setError('Failed to load semesters');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSemester = (semesterId) => {
        navigate(`/subjects/${semesterId}`);
    };

    if (loading) {
        return <div className="loading">Loading semesters...</div>;
    }

    return (
        <div className="list-page">
            <Navbar />
            <div className="list-content">
                <h1>Select Semester</h1>
                {error && <div className="error-message">{error}</div>}
                <div className="list-grid">
                    {semesters.map((semester) => (
                        <div
                            key={semester._id}
                            className="list-item"
                            onClick={() => handleSelectSemester(semester._id)}
                        >
                            <h3>{semester.name || `Semester ${semester.number}`}</h3>
                        </div>
                    ))}
                </div>
                {semesters.length === 0 && (
                    <p className="empty-message">No semesters available</p>
                )}
            </div>
        </div>
    );
};

export default SemesterSelect;

