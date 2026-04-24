import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';

const VendorProfile = () => {
    const [isEditing, setIsEditing] = useState(false);

    const [profile] = useState({
        fullName: 'John Doe',
        email: 'vendor@lenscraft.com',
        phone: '+1 234 567 890',
        businessName: 'PhotoGenic Solutions',
        businessAddress: '123 Camera Lane, Suite 404',
        city: 'Metropolis',
        state: 'NY',
        pincode: '10001',
        bankAccount: '123456789012',
        ifsc: 'BKID0001234'
    });

    const completionPercentage = 70; // Mock calculation

    const links = [
        { label: 'Dashboard', path: '/vendor', icon: '🏘️' },
        { label: 'Profile', path: '/vendor/profile', icon: '👤' },
        { label: 'My Products', path: '/vendor/products', icon: '📸' },
        { label: 'Order History', path: '/vendor/orders', icon: '📜' },
        { label: 'Earnings', path: '/vendor/analytics', icon: '💸' },
        { label: 'Withdrawal', path: '/vendor/payments', icon: '🏦' },
    ];

    const handleSave = () => {
        setIsEditing(false);
        alert('Profile updated successfully!');
    };

    return (
        <DashboardLayout title="Seller Profile & Verification" sidebarLinks={links} userRole="Vendor">
            <div style={{ marginBottom: '30px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${completionPercentage}%`, height: '100%', background: 'var(--accent)', transition: '0.5s' }}></div>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>Profile {completionPercentage}% Complete</span>
            </div>



            <div className="glass-morphism" style={{ padding: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', border: '2px dashed #444' }}>
                                👤
                            </div>
                            <div>
                                <h3 style={{ margin: 0 }}>{profile.fullName}</h3>
                                <p style={{ margin: '5px 0 0', color: 'var(--text-dim)' }}>{profile.businessName}</p>
                            </div>
                        </div>
                        {isEditing ? (
                            <button className="premium-button" onClick={handleSave}>SAVE CHANGES</button>
                        ) : (
                            <button style={{ padding: '10px 25px', background: 'none', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: '8px', cursor: 'pointer' }} onClick={() => setIsEditing(true)}>EDIT PROFILE</button>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <h4 style={{ color: 'var(--accent)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>Personal Information</h4>
                            {[
                                { label: 'Full Name', key: 'fullName' },
                                { label: 'Email Address', key: 'email' },
                                { label: 'Phone Number', key: 'phone' }
                            ].map(field => (
                                <div key={field.key}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px' }}>{field.label}</label>
                                    <input
                                        readOnly={!isEditing}
                                        defaultValue={profile[field.key]}
                                        style={{ width: '100%', background: isEditing ? 'rgba(255,255,255,0.05)' : 'none', border: isEditing ? '1px solid #444' : 'none', color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none' }}
                                    />
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <h4 style={{ color: 'var(--accent)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>Business Details</h4>
                            {[
                                { label: 'Business Name', key: 'businessName' },
                                { label: 'Business Address', key: 'businessAddress' },
                                { label: 'City', key: 'city' },
                                { label: 'State', key: 'state' },
                                { label: 'Pincode', key: 'pincode' }
                            ].map(field => (
                                <div key={field.key}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px' }}>{field.label}</label>
                                    <input
                                        readOnly={!isEditing}
                                        defaultValue={profile[field.key]}
                                        style={{ width: '100%', background: isEditing ? 'rgba(255,255,255,0.05)' : 'none', border: isEditing ? '1px solid #444' : 'none', color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none' }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: '40px' }}>
                        <h4 style={{ color: 'var(--accent)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>Bank Account Details</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px' }}>Bank Account Number</label>
                                <input
                                    readOnly={!isEditing}
                                    defaultValue={profile.bankAccount}
                                    style={{ width: '100%', background: isEditing ? 'rgba(255,255,255,0.05)' : 'none', border: isEditing ? '1px solid #444' : 'none', color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px' }}>IFSC Code</label>
                                <input
                                    readOnly={!isEditing}
                                    defaultValue={profile.ifsc}
                                    style={{ width: '100%', background: isEditing ? 'rgba(255,255,255,0.05)' : 'none', border: isEditing ? '1px solid #444' : 'none', color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
        </DashboardLayout>
    );
};

export default VendorProfile;
