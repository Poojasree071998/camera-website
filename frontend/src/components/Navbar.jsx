import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import JoinModal from './JoinModal';
import './Navbar.css';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

    const user = (() => {
        try { return JSON.parse(localStorage.getItem('user') || '{}'); }
        catch (e) { return {}; }
    })();
    const isVendor = user.role === 'Vendor';
    const isAdmin = user.role === 'Super Admin' || user.role === 'Admin';

    return (
        <>
            <nav className="navbar animate-fade-in">
            <div className="nav-logo">
                <Link to="/">
                    <span className="shutter-icon">◎</span> OPTIC <span>FRAME</span>
                    <small className="technical-text" style={{ fontSize: '0.5rem', display: 'block', letterSpacing: '3px', marginTop: '2px', opacity: 0.5 }}>DIGITAL INNOVATIONS</small>
                </Link>
            </div>
            <div className="nav-links">
                <Link to="/store">Store</Link>
                <Link to="/flash-deals">Flash Deals</Link>
                {(isVendor || isAdmin) && (
                    <Link to={isVendor ? "/vendor/add-product" : "/admin/products?add=true"} style={{ color: 'var(--accent)', fontWeight: '700' }}>
                        + Add Product
                    </Link>
                )}
            </div>
            <div className="nav-actions">
                <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
                    {theme === 'dark' ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                    )}
                </button>
                <Link to="/login" className="login-btn" style={{ textDecoration: 'none' }}>Log In</Link>
                <button
                    type="button"
                    className="premium-button"
                    onClick={(e) => {
                        e.preventDefault();
                        setIsJoinModalOpen(true);
                    }}
                >
                    Join Now
                </button>
            </div>

            </nav>
            <JoinModal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
            />
        </>
    );
};

export default Navbar;
