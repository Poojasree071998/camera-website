import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import heroBanner from '../assets/camera1.png';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fillDemo = (role) => {
        const demos = {
            admin: { e: 'admin@lenscraft.com', p: 'Admin@123' },
            vendor: { e: 'vendor@lenscraft.com', p: 'Vendor@123' },
            customer: { e: 'customer@lenscraft.com', p: 'Customer@123' },
            technician: { e: 'technician@lenscraft.com', p: 'Tech@123' }
        };
        setEmail(demos[role].e);
        setPassword(demos[role].p);
    };

    const handleLogin = async (e) => {
        if (e) e.preventDefault();

        // FOOLPROOF FRONTEND FALLBACK (PRIORITY FOR DEMO ROLES)
        const demoUsers = {
            'admin@lenscraft.com': { role: 'admin', pass: 'Admin@123', target: '/admin' },
            'vendor@lenscraft.com': { role: 'vendor', pass: 'Vendor@123', target: '/vendor' },
            'customer@lenscraft.com': { role: 'customer', pass: 'Customer@123', target: '/customer' },
            'technician@lenscraft.com': { role: 'delivery', pass: 'Tech@123', target: '/technician' }
        };

        if (demoUsers[email] && password === demoUsers[email].pass) {
            localStorage.setItem('token', 'demo_token');
            localStorage.setItem('user', JSON.stringify({ email, role: demoUsers[email].role }));
            navigate(demoUsers[email].target);
            return;
        }

        // Check local storage for newly registered users
        const registeredUsers = JSON.parse(localStorage.getItem('demo_users') || '{}');
        if (registeredUsers[email] && password === registeredUsers[email].password) {
            const user = registeredUsers[email];
            localStorage.setItem('token', 'demo_token_reg_' + Date.now());
            localStorage.setItem('user', JSON.stringify(user));

            // ROLE BASED REDIRECTION
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'vendor') navigate('/vendor');
            else if (user.role === 'delivery') navigate('/technician');
            else navigate('/customer');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            const { user, token } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'vendor') navigate('/vendor');
            else if (user.role === 'delivery') navigate('/technician');
            else navigate('/customer');
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="login-page">
            <div className="cinematic-overlay" style={{ backgroundImage: `url(${heroBanner})` }}></div>
            
            <div className="login-card glass-morphism animate-fade-in">
                <div className="login-logo">
                    SK <span>INNOVATION</span>
                </div>
                <p className="login-subtitle">Sign in to your account to continue</p>
                
                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-group">
                        <label>Email Address</label>
                        <div className="input-with-icon" ref={dropdownRef}>
                            <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setShowDropdown(true)}
                                placeholder="name@lenscraft.com"
                                required
                                autoComplete="off"
                            />
                            {showDropdown && (
                                <ul className="demo-dropdown">
                                    <li onClick={() => { fillDemo('admin'); setShowDropdown(false); }}>
                                        <div className="demo-email">admin@lenscraft.com</div>
                                        <div className="demo-dots">•••••••••</div>
                                    </li>
                                    <li onClick={() => { fillDemo('customer'); setShowDropdown(false); }}>
                                        <div className="demo-email">customer@lenscraft.com</div>
                                        <div className="demo-dots">•••••••••</div>
                                    </li>
                                    <li onClick={() => { fillDemo('vendor'); setShowDropdown(false); }}>
                                        <div className="demo-email">vendor@lenscraft.com</div>
                                        <div className="demo-dots">•••••••••</div>
                                    </li>
                                    <li onClick={() => { fillDemo('technician'); setShowDropdown(false); }}>
                                        <div className="demo-email">technician@lenscraft.com</div>
                                        <div className="demo-dots">•••••••••</div>
                                    </li>
                                </ul>
                            )}
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <div className="input-with-icon">
                            <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{ paddingRight: '45px' }}
                            />
                            <button
                                type="button"
                                className="password-toggle-icon"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                )}
                            </button>
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '8px' }}>
                            <span 
                                onClick={() => alert('Password reset link sent to: ' + (email || 'your email'))}
                                style={{ color: 'var(--accent)', fontSize: '0.8rem', cursor: 'pointer', opacity: 0.8 }}
                            >
                                Forgot Password?
                            </span>
                        </div>
                    </div>
                    {error && <p className="error-msg">{error}</p>}
                    <button id="login-form-submit" type="submit" className="premium-button login-submit-btn">
                        Sign In
                    </button>
                </form>

                <div className="divider">NEED AN ACCOUNT?</div>
                <button
                    className="register-secondary-btn"
                    onClick={() => navigate('/register')}
                >
                    Register New Customer
                </button>

            </div>
        </div>
    );
};

export default Login;
