import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';

const CustomerProfile = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [saved, setSaved] = useState(false);

    const links = [
        { label: 'Dashboard', path: '/customer', icon: '📊' },
        { label: 'Products', path: '/customer/products', icon: '📸' },
        { label: 'Services', path: '/customer/services', icon: '🔧' },
        { label: 'My Orders', path: '/customer/orders', icon: '🛒' },
        { label: 'Purchase History', path: '/customer/history', icon: '📜' },
        { label: 'Wishlist', path: '/customer/wishlist', icon: '❤️' },
        { label: 'Compare Cameras', path: '/customer/compare', icon: '⚖️' },
        { label: 'Support Chat', path: '/customer/support', icon: '💬' },
        { label: 'Profile Settings', path: '/customer/profile', icon: '⚙️' },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        localStorage.setItem('user', JSON.stringify(user));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <DashboardLayout title="Profile Settings" sidebarLinks={links} userRole="Customer">
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                <div className="glass-morphism" style={{ padding: '30px' }}>
                    <h3 style={{ marginBottom: '25px' }}>PERSONAL INFORMATION</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', opacity: 0.6 }}>Full Name</label>
                            <input className="modal-input" name="name" value={user.name || ''} onChange={handleChange} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', opacity: 0.6 }}>Email Address</label>
                            <input className="modal-input" name="email" value={user.email || ''} onChange={handleChange} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', opacity: 0.6 }}>Phone Number</label>
                            <input className="modal-input" name="phone" value={user.phone || '+91 98765 43210'} onChange={handleChange} />
                        </div>
                    </div>

                    <h3 style={{ margin: '40px 0 25px 0' }}>SHIPPING ADDRESS</h3>
                    <div>
                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', opacity: 0.6 }}>Full Address</label>
                        <textarea 
                            className="modal-input" 
                            name="address" 
                            style={{ height: '100px', resize: 'none' }} 
                            value={user.address || '402, Skyline Apartments, Worli, Mumbai, Maharashtra 400018'} 
                            onChange={handleChange}
                        />
                    </div>

                    <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '15px', alignItems: 'center' }}>
                        {saved && <span style={{ color: '#4caf50', fontSize: '0.85rem' }}>✅ Changes saved successfully!</span>}
                        <button className="premium-button" onClick={handleSave}>SAVE CHANGES</button>
                    </div>
                </div>

                <div className="glass-morphism" style={{ padding: '30px' }}>
                    <h3 style={{ marginBottom: '25px' }}>SECURITY</h3>
                    <div style={{ marginBottom: '20px' }}>
                        <p style={{ fontSize: '0.85rem' }}>Update your account password.</p>
                        <button style={{ background: 'none', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>CHANGE PASSWORD</button>
                    </div>

                    <h3 style={{ margin: '40px 0 25px 0' }}>PAYMENT METHODS</h3>
                    <div style={{ padding: '15px', border: '1px solid var(--glass-border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                             <p style={{ margin: 0, fontWeight: '700' }}>•••• •••• •••• 1234</p>
                             <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.5 }}>VISA · Expires 12/26</p>
                        </div>
                        <span style={{ color: 'var(--accent)', fontSize: '0.8rem', cursor: 'pointer' }}>Edit</span>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CustomerProfile;
