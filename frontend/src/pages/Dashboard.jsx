import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleGetStarted = () => {
        navigate('/select');
    };

    return (
        <div className="dashboard">
            <Navbar />
            <div className="dashboard-content">
                <h1>Welcome to Notes App</h1>
                <p>Access study materials for your college and semester</p>
                {!user?.collegeId && (
                    <div className="info-box">
                        <p>Please select your college to get started</p>
                    </div>
                )}
                <button className="primary-button" onClick={handleGetStarted}>
                    {user?.collegeId ? 'View Semesters' : 'Select College'}
                </button>
            </div>
        </div>
    );
};

export default Dashboard;

