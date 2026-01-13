import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './ListPage.css';

const UnitList = () => {
    const { subjectId } = useParams();
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchUnits();
    }, [subjectId]);

    const fetchUnits = async () => {
        try {
            const response = await axios.get(`/api/units/subject/${subjectId}`);
            setUnits(response.data);
        } catch (error) {
            setError('Failed to load units');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewUnit = (unitId) => {
        navigate(`/view/${unitId}`);
    };

    if (loading) {
        return <div className="loading">Loading units...</div>;
    }

    return (
        <div className="list-page">
            <Navbar />
            <div className="list-content">
                <h1>Select Unit</h1>
                {error && <div className="error-message">{error}</div>}
                <div className="list-grid">
                    {units.map((unit) => (
                        <div
                            key={unit._id}
                            className="list-item"
                            onClick={() => handleViewUnit(unit._id)}
                        >
                            <h3>{unit.name}</h3>
                            {unit.description && <p>{unit.description}</p>}
                        </div>
                    ))}
                </div>
                {units.length === 0 && (
                    <p className="empty-message">No units available</p>
                )}
            </div>
        </div>
    );
};

export default UnitList;

