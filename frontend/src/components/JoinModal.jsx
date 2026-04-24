import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './JoinModal.css';

const JoinModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'customer'
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = (e) => {
        e.preventDefault();

        // For Demo Persistence: Save user to localStorage
        const existingUsers = JSON.parse(localStorage.getItem('demo_users') || '{}');
        if (existingUsers[formData.email]) {
            setError("Email already registered!");
            return;
        }

        const newUser = {
            email: formData.email,
            password: formData.password,
            name: formData.fullName,
            role: 'customer'
        };

        existingUsers[formData.email] = newUser;
        localStorage.setItem('demo_users', JSON.stringify(existingUsers));

        // Automatically log in and redirect to Customer Dashboard
        localStorage.setItem('token', 'demo_token_' + Date.now());
        localStorage.setItem('user', JSON.stringify(newUser));

        alert("Welcome to the Hub! Your account has been created.");
        onClose();
        navigate('/customer');
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-morphism animate-fade-in" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>

                <div className="modal-header">
                    <h2>JOIN DIGITAL <span>CAMERA</span> CLUB</h2>
                    <p>Unlock exclusive deals & professional reviews</p>
                </div>

                <form onSubmit={handleRegister} className="modal-form">
                    <div className="modal-input-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Your Name"
                            required
                        />
                    </div>

                    <div className="modal-input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="name@example.com"
                            required
                        />
                    </div>

                    <div className="modal-input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <p className="modal-error">{error}</p>}

                    <button type="submit" className="premium-button modal-submit-btn">
                        CREATE ACCOUNT
                    </button>

                    <p className="modal-footer">
                        By joining, you agree to our Terms of Service.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default JoinModal;
