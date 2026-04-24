import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { fetchAllOrders } from '../api';

const AdminReports = () => {
    const [orders, setOrders] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchAllOrders().then(data => {
            setOrders(data);
            setLoading(false);
        });
    }, []);

    const sidebarLinks = [
        { path: '/admin', icon: '📊', label: 'Overview' },
        { path: '/admin/vendors', icon: '🏢', label: 'Vendors' },
        { path: '/admin/products', icon: '📸', label: 'Products' },
        { path: '/admin/orders', icon: '🛒', label: 'Orders' },
        { path: '/admin/users', icon: '👤', label: 'Employees' },
        { path: '#', icon: '📈', label: 'Reports', isActive: true },
        { path: '/admin/settings', icon: '⚙️', label: 'Settings' },
    ];

    const stats = [
        { label: 'Total Revenue', value: '₹' + orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0).toLocaleString(), icon: '💰', color: '#10b981' },
        { label: 'Avg Order Value', value: '₹' + (orders.length ? Math.round(orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0) / orders.length) : 0).toLocaleString(), icon: '📊', color: '#3b82f6' },
        { label: 'Pending Payouts', value: '₹45,200', icon: '⏳', color: '#f59e0b' },
        { label: 'Platform Fee (10%)', value: '₹' + Math.round(orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0) * 0.1).toLocaleString(), icon: '🏛️', color: '#8b5cf6' },
    ];

    return (
        <DashboardLayout title="System Reports & Analytics" sidebarLinks={sidebarLinks} userRole="Admin">
            <div className="reports-page animate-fade-in">
                <header style={{ marginBottom: '25px' }}>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem' }}>Comprehensive performance analysis and financial audits.</p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    {stats.map((stat, i) => (
                        <div key={i} className="glass-morphism animate-fade-in" style={{ animationDelay: `${i * 0.1}s`, padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <span style={{ fontSize: '1.4rem' }}>{stat.icon}</span>
                                <span style={{ color: stat.color, fontWeight: '800', fontSize: '0.65rem', background: `${stat.color}15`, padding: '2px 8px', borderRadius: '20px', border: `1px solid ${stat.color}30` }}>+12.5%</span>
                            </div>
                            <h3 style={{ color: 'var(--text-dim)', fontSize: '0.7rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>{stat.label}</h3>
                            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' }}>{stat.value}</div>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                    <div className="glass-morphism" style={{ padding: '30px' }}>
                        <h3 style={{ marginBottom: '20px' }}>Revenue Distribution</h3>
                        <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '15px', padding: '20px 0' }}>
                            {[65, 45, 75, 55, 85, 95, 70].map((h, i) => (
                                <div key={i} style={{ flex: 1, height: `${h}%`, background: 'linear-gradient(to top, var(--accent), transparent)', borderRadius: '8px 8px 0 0', position: 'relative' }}>
                                    <span style={{ position: 'absolute', bottom: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', opacity: 0.5 }}>Day {i+1}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="premium-card">
                        <h3>Top Categories</h3>
                        <div style={{ marginTop: '20px' }}>
                            {[
                                { name: 'Mirrorless', val: 65 },
                                { name: 'Lenses', val: 25 },
                                { name: 'Accessories', val: 10 }
                            ].map((c, i) => (
                                <div key={i} style={{ marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                                        <span>{c.name}</span>
                                        <span>{c.val}%</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                                        <div style={{ width: `${c.val}%`, height: '100%', background: 'var(--accent)', borderRadius: '10px' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="premium-card" style={{ marginTop: '30px' }}>
                    <h3>Recent Transactions</h3>
                    <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '15px 0', color: 'var(--text-dim)' }}>ID</th>
                                <th style={{ padding: '15px 0', color: 'var(--text-dim)' }}>Customer</th>
                                <th style={{ padding: '15px 0', color: 'var(--text-dim)' }}>Amount</th>
                                <th style={{ padding: '15px 0', color: 'var(--text-dim)' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.slice(0, 5).map(order => (
                                <tr key={order._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '15px 0' }}>{order._id}</td>
                                    <td style={{ padding: '15px 0' }}>{order.customerName}</td>
                                    <td style={{ padding: '15px 0', fontWeight: '700' }}>₹{(order.totalAmount || 0).toLocaleString()}</td>
                                    <td style={{ padding: '15px 0' }}>
                                        <span style={{ 
                                            padding: '4px 12px', 
                                            borderRadius: '20px', 
                                            fontSize: '0.75rem', 
                                            background: order.status === 'delivered' ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)',
                                            color: order.status === 'delivered' ? '#10b981' : '#3b82f6'
                                        }}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminReports;
