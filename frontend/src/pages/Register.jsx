import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; // Reusing login styles for consistency

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'customer' // Hidden field
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            alert("Registration Detail Error: Passwords do not match!");
            return;
        }

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
            phone: formData.phone,
            role: 'customer'
        };

        existingUsers[formData.email] = newUser;
        localStorage.setItem('demo_users', JSON.stringify(existingUsers));

        // Automatically log in and redirect to Customer Dashboard
        localStorage.setItem('token', 'demo_token_' + Date.now());
        localStorage.setItem('user', JSON.stringify(newUser));

        alert("Registration Successful! Welcome to SK INNOVATION.");
        navigate('/customer');
    };

    return (
        <div className="login-page">
            <div className="cinematic-bg"></div>
            <div className="login-card glass-morphism animate-fade-in" style={{ maxWidth: '500px' }}>
                <h2 className="login-title" style={{ fontSize: '1.5rem', marginBottom: '15px' }}>
                    <span>JOIN US</span><br />REGISTRATION
                </h2>
                <p className="login-subtitle">Create your customer account</p>

                <form onSubmit={handleRegister} className="login-form">
                    <div className="input-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div className="input-group">
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
                    <div className="input-group">
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 XXXXXXXXXX"
                            required
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="input-group">
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
                        <div className="input-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && <p className="error-msg" style={{ color: '#ff4d4d', fontSize: '0.8rem', marginTop: '10px' }}>{error}</p>}

                    <button type="submit" className="premium-button login-submit-btn" style={{ marginTop: '20px' }}>
                        SUBMIT & JOIN
                    </button>
                </form>

                <div className="divider" style={{ margin: '25px 0' }}>ALREADY HAVE AN ACCOUNT?</div>
                <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.9rem', textAlign: 'center', display: 'block' }}>
                    Back to Login
                </Link>
            </div>
        </div>
    );
};

export default Register;
