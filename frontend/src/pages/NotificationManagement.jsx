import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';

const NotificationManagement = () => {
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'Mega Sale Live!', target: 'All Users', type: 'Promo', status: 'Sent', date: '2026-03-01' },
        { id: 2, title: 'Maintenance Update', target: 'Vendors', type: 'System', status: 'Scheduled', date: '2026-03-10' },
        { id: 3, title: 'New Camera Launch', target: 'Customers', type: 'Product', status: 'Draft', date: '-' },
    ]);

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
        <DashboardLayout title="Notification Center" sidebarLinks={links} userRole="Super Admin">
            <div className="animate-fade-in">

            <div className="glass-morphism" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <h3 style={{ margin: 0 }}>HISTORY</h3>
                    <button 
                        onClick={() => setNotifications([])}
                        className="premium-button" 
                        style={{ padding: '8px 20px', fontSize: '0.75rem', background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)' }}
                    >
                        CLEAR ALL
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '1px' }}>
                                <th style={{ padding: '20px 15px' }}>TITLE</th>
                                <th style={{ padding: '20px 15px', width: '150px' }}>TARGET</th>
                                <th style={{ padding: '20px 15px', width: '120px' }}>TYPE</th>
                                <th style={{ padding: '20px 15px', width: '120px' }}>STATUS</th>
                                <th style={{ padding: '20px 15px', width: '140px' }}>DATE</th>
                                <th style={{ padding: '20px 15px', width: '100px', textAlign: 'right' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notifications.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '50px', textAlign: 'center', opacity: 0.5 }}>No notifications in history.</td></tr>
                            ) : (
                                notifications.map(n => (
                                    <tr key={n.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px' }}>{n.title}</td>
                                        <td style={{ padding: '15px' }}>{n.target}</td>
                                        <td style={{ padding: '15px' }}>{n.type}</td>
                                        <td style={{ padding: '15px' }}>
                                            <span style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', background: n.status === 'Sent' ? 'rgba(76,175,80,0.1)' : 'rgba(212,175,55,0.1)', color: n.status === 'Sent' ? '#4caf50' : '#d4af37' }}>{n.status}</span>
                                        </td>
                                        <td style={{ padding: '15px', color: 'var(--text-dim)' }}>{n.date}</td>
                                        <td style={{ padding: '15px', textAlign: 'right' }}>
                                            <button 
                                                onClick={() => setNotifications(notifications.filter(item => item.id !== n.id))}
                                                style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase' }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            </div>
        </DashboardLayout>
    );
};

export default NotificationManagement;
