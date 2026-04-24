import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCart, fetchNotifications, handleNotificationAction } from '../api';
import avatarAdmin from '../assets/avatar_admin.png';
import avatarVendor from '../assets/avatar_vendor.png';
import avatarCustomer from '../assets/avatar_customer.png';
import avatarDelivery from '../assets/avatar_delivery.png';
import './DashboardLayout.css';

const DashboardLayout = ({ title, sidebarLinks, children, userRole }) => {
    const [showNotifications, setShowNotifications] = React.useState(false);
    const [notifs, setNotifs] = React.useState([]);
    const [activeNotifTab, setActiveNotifTab] = React.useState('all');
    const navigate = useNavigate();
    const location = useLocation();

    function getUserSafe() {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        } catch (e) {
            console.error('Error parsing user from localStorage:', e);
            return {};
        }
    }

    const loadNotifs = React.useCallback(async () => {
        try {
            const user = getUserSafe();
            const role = userRole || user.role;
            const email = user.email;
            const data = await fetchNotifications(role, email);
            setNotifs(data);
        } catch (e) {
            console.error('Error loading notifications:', e);
        }
    }, [userRole]);

    React.useEffect(() => {
        loadNotifs();
        window.addEventListener('notificationsUpdated', loadNotifs);
        return () => window.removeEventListener('notificationsUpdated', loadNotifs);
    }, [loadNotifs]);


    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const user = getUserSafe();

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-logo" style={{ fontSize: '1.2rem', lineHeight: '1.2', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div>SK <span style={{ color: 'var(--accent)' }}>INNOVATION</span></div>
                    <small style={{ 
                        fontSize: '0.65rem', 
                        textTransform: 'uppercase', 
                        letterSpacing: '2px', 
                        color: 'var(--text-dim)',
                        opacity: 0.8,
                        fontWeight: '700'
                    }}>
                        {userRole ? `${userRole} Dashboard` : 'Dashboard'}
                    </small>
                </div>
                <nav className="sidebar-nav">
                    {sidebarLinks && sidebarLinks.map((link, index) => {
                        const isActive = link.onClick ? link.isActive : location.pathname === link.path;
                        return (
                            <Link
                                key={index}
                                to={link.path || '#'}
                                onClick={(e) => {
                                    if (link.onClick) {
                                        e.preventDefault();
                                        link.onClick();
                                    }
                                }}
                                className="sidebar-link"
                                style={isActive ? {
                                    background: 'var(--accent)',
                                    color: '#000',
                                    fontWeight: '700'
                                } : {}}
                            >
                                <span className="icon">{link.icon}</span>
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>
                <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%', padding: '10px', background: 'rgba(255,77,77,0.1)',
                            border: '1px solid rgba(255,77,77,0.3)', color: '#ff4d4d',
                            borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
                            fontSize: '0.85rem', letterSpacing: '1px', transition: 'var(--transition)'
                        }}
                    >
                        🚪 LOGOUT
                    </button>
                </div>
            </aside>

            <main className="dashboard-content">
                <header className="dashboard-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                        <h2 style={{ margin: 0 }}>{title}</h2>
                        {userRole === 'Customer' && (
                            <div className="search-bar" style={{ flex: 0.6, position: 'relative' }}>
                                <input 
                                    type="text" 
                                    placeholder="Search cameras, lenses..." 
                                    style={{ width: '100%', padding: '10px 15px', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: '20px', color: 'var(--text-main)', fontSize: '0.9rem' }}
                                />
                                <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '25px', position: 'relative' }}>
                        <div 
                            onClick={() => setShowNotifications(!showNotifications)}
                            style={{ position: 'relative', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.7, transition: '0.3s' }} 
                            className="hover-scale"
                        >
                            🔔
                            {notifs.some(n => !n.isRead) && (
                                <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#ff4d4d', borderRadius: '50%', border: '2px solid var(--glass-bg)' }}></span>
                            )}
                        </div>

                        {showNotifications && (
                            <div className="notification-dropdown shadow-xl" style={{ isolation: 'isolate' }}>
                                <div className="notification-header">
                                    <span>Notifications</span>
                                    <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
                                        <span style={{ cursor: 'pointer', opacity: 0.6, fontSize: '1.3rem' }} title="Settings">⚙️</span>
                                        <span onClick={() => setShowNotifications(false)} style={{ cursor: 'pointer', opacity: 0.4, fontSize: '1.3rem', padding: '0 5px' }} title="Close">✕</span>
                                    </div>
                                </div>

                                <div className="notification-tabs">
                                    {['View all', 'Mentions', 'Unread (2)'].map(tab => {
                                        const cleanTab = tab.split(' ')[0].toLowerCase();
                                        const isActive = activeNotifTab === cleanTab;
                                        return (
                                            <span 
                                                key={tab}
                                                onClick={() => setActiveNotifTab(cleanTab)}
                                                className={`notification-tab ${isActive ? 'active' : ''}`}
                                            >
                                                {tab}
                                            </span>
                                        );
                                    })}
                                    <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#4f46e5', cursor: 'pointer', fontWeight: '700' }}>Mark all as read</span>
                                </div>

                                <div className="notification-list">
                                    {notifs.length > 0 ? notifs.map((n, i) => {
                                        const isService = n.metadata?.type === 'service_request';
                                        const isTechAssign = n.metadata?.type === 'technician_assignment';
                                        
                                        return (
                                            <div key={n._id || i} className="notification-item" style={{ opacity: n.isRead ? 0.6 : 1 }}>
                                                <div className="notif-avatar">
                                                    {isService ? '🔧' : isTechAssign ? '👨‍🔧' : '🔔'}
                                                </div>
                                                <div className="notif-content">
                                                    <div className="notif-title" style={{ fontSize: '0.9rem' }}>
                                                        {n.message}
                                                    </div>
                                                    
                                                    {isService && (
                                                        <div style={{ marginTop: '8px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                                                                <strong>Customer:</strong> {n.metadata.customerName}
                                                            </div>
                                                            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--accent)' }}>
                                                                {n.metadata.serviceName}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="notif-meta">
                                                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    
                                                    {(isService || isTechAssign) && (
                                                        <div className="notif-actions">
                                                            <button 
                                                                className="notif-btn notif-btn-secondary"
                                                                onClick={() => handleNotificationAction(n._id, 'reject')}
                                                            >
                                                                {isService ? 'Reject' : 'Dismiss'}
                                                            </button>
                                                            <button 
                                                                className="notif-btn notif-btn-primary"
                                                                onClick={() => handleNotificationAction(n._id, isService ? 'accept' : 'accept_job')}
                                                            >
                                                                Accept
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div style={{ padding: '30px', textAlign: 'center', opacity: 0.5, fontSize: '0.9rem' }}>
                                            No notifications found.
                                        </div>
                                    )}
                                </div>
                                
                                <div className="notif-footer">
                                    <div style={{ width: '40px', height: '40px', background: 'rgba(212,175,55,0.1)', padding: '10px', borderRadius: '10px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0, color: 'var(--accent)' }}>📄</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Design_requirements_D2361.pdf</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '500' }}>4.2MB</div>
                                    </div>
                                    <span style={{ fontSize: '1.3rem', cursor: 'pointer', opacity: 0.5, padding: '5px' }} title="Download">⬇️</span>
                                </div>
                            </div>
                        )}

                        {userRole === 'Customer' && (
                            <Link to="/customer/cart" style={{ textDecoration: 'none', position: 'relative', fontSize: '1.2rem', opacity: 0.7 }}>
                                🛒
                                {getCart().length > 0 && (
                                    <span style={{ position: 'absolute', top: '-8px', right: '-10px', background: 'var(--accent)', color: '#000', fontSize: '0.7rem', fontWeight: '800', padding: '2px 6px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                                        {getCart().length}
                                    </span>
                                )}
                            </Link>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{user.name || userRole}</div>
                                <div style={{ fontSize: '0.65rem', opacity: 0.5, textTransform: 'uppercase' }}>{userRole}</div>
                            </div>
                            <div className="avatar" style={{ 
                                backgroundImage: `url(${
                                    userRole === 'admin' || userRole === 'Super Admin' ? avatarAdmin :
                                    userRole === 'vendor' || userRole === 'Vendor' ? avatarVendor :
                                    userRole === 'delivery' || userRole === 'Technician' ? avatarDelivery :
                                    avatarCustomer
                                })`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}></div>
                        </div>
                    </div>
                </header>
                <div className="dashboard-body">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
