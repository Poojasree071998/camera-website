import React from 'react';
import DashboardLayout from '../components/DashboardLayout';

const SystemSettings = () => {
    const logs = [
        { id: 1, action: 'Bulk Product Approval', admin: 'Super Admin', time: '2026-03-05 12:45', ip: '192.168.1.45' },
        { id: 2, action: 'Commission Changed to 12%', admin: 'Super Admin', time: '2026-03-05 11:20', ip: '192.168.1.45' },
        { id: 3, action: 'Vendor #V003 Suspended', admin: 'Sub Admin - Mark', time: '2026-03-05 09:15', ip: '10.0.0.82' },
        { id: 4, action: 'System Settings Updated', admin: 'Super Admin', time: '2026-03-04 18:30', ip: '192.168.1.45' },
    ];

    const links = [
        { label: 'Overview', path: '/admin', icon: '📊' },
        { label: 'Vendors', path: '/admin/vendors', icon: '🏪' },
        { label: 'Products', path: '/admin/products', icon: '📸' },
        { label: 'Orders', path: '/admin/orders', icon: '📜' },
        { label: 'Notifications', path: '/admin/notifications', icon: '🔔' },
        { label: 'Payments', path: '/admin/payments', icon: '💳' },
        { label: 'Chats', path: '/admin/chats', icon: '💬' },
        { label: 'Employees',         path: '/admin/users',         icon: '👤' },
        { label: 'Reports', path: '/admin/reports', icon: '📈' },
        { label: 'Settings', path: '/admin/settings', icon: '⚙️' },
    ];

    return (
        <DashboardLayout title="System Fortress" sidebarLinks={links} userRole="Super Admin">
            <div className="animate-fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>
                <div className="glass-morphism" style={{ padding: '30px' }}>
                    <h3 style={{ marginBottom: '25px' }}>SECURITY CONTROL</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span>Two-Factor Auth</span>
                                <span style={{ color: '#4caf50' }}>ENABLED</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>SSL Certificate</span>
                                <span style={{ color: '#4caf50' }}>ACTIVE</span>
                            </div>
                        </div>

                        <button className="premium-button" style={{ padding: '15px' }}>CHANGE ADMIN PASSWORD</button>
                        <button style={{ padding: '15px', background: 'none', border: '1px solid #ff4d4d', color: '#ff4d4d', borderRadius: '8px', cursor: 'pointer' }}>EMERGENCY LOCKDOWN</button>
                    </div>
                </div>

                <div className="glass-morphism" style={{ padding: '30px' }}>
                    <h3 style={{ marginBottom: '25px' }}>ADMIN ACTIVITY LOGS</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-dim)' }}>
                                    <th style={{ padding: '12px', fontSize: '0.8rem' }}>ACTION</th>
                                    <th style={{ padding: '12px', fontSize: '0.8rem' }}>PERFORMED BY</th>
                                    <th style={{ padding: '12px', fontSize: '0.8rem' }}>TIMESTAMP</th>
                                    <th style={{ padding: '12px', fontSize: '0.8rem' }}>IP ADDRESS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '12px', fontSize: '0.85rem' }}>{log.action}</td>
                                        <td style={{ padding: '12px', fontSize: '0.85rem' }}>{log.admin}</td>
                                        <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>{log.time}</td>
                                        <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>{log.ip}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button className="premium-button" style={{ width: '100%', marginTop: '20px', padding: '12px' }}>
                        VIEW ALL SYSTEM LOGS
                    </button>
                </div>
            </div>
            </div>
        </DashboardLayout>
    );
};

export default SystemSettings;
