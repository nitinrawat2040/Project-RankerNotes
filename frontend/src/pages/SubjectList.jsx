import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './ListPage.css';

const SubjectList = () => {
    const { semesterId } = useParams();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchSubjects();
    }, [semesterId]);

    const fetchSubjects = async () => {
        try {
            const response = await axios.get(`/api/subjects/semester/${semesterId}`);
            setSubjects(response.data);
        } catch (error) {
            setError('Failed to load subjects');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSubject = (subjectId) => {
        navigate(`/units/${subjectId}`);
    };

    if (loading) {
        return <div className="loading">Loading subjects...</div>;
    }

    return (
        <div className="list-page">
            <Navbar />
            <div className="list-content">
                <h1>Select Subject</h1>
                {error && <div className="error-message">{error}</div>}
                <div className="list-grid">
                    {subjects.map((subject) => (
                        <div
                            key={subject._id}
                            className="list-item"
                            onClick={() => handleSelectSubject(subject._id)}
                        >
                            <h3>{subject.name}</h3>
                            {subject.code && <p className="code">{subject.code}</p>}
                        </div>
                    ))}
                </div>
                {subjects.length === 0 && (
                    <p className="empty-message">No subjects available</p>
                )}
            </div>
        </div>
    );
};

export default SubjectList;

