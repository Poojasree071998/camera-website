import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { fetchMyOrders } from '../api';

const CustomerHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const links = [
        { label: 'Dashboard', path: '/customer', icon: '📊' },
        { label: 'My Orders', path: '/customer/orders', icon: '🛒' },
        { label: 'Purchase History', path: '/customer/history', icon: '📜' },
        { label: 'Wishlist', path: '/customer/wishlist', icon: '❤️' },
        { label: 'Compare Cameras', path: '/customer/compare', icon: '⚖️' },
        { label: 'Products', path: '/customer/products', icon: '📸' },
        { label: 'Support Chat', path: '/customer/support', icon: '💬' },
        { label: 'Profile Settings', path: '/customer/profile', icon: '⚙️' },
    ];

    useEffect(() => {
        fetchMyOrders().then(data => {
            const sorted = (data || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sorted);
            setLoading(false);
        }).catch(err => {
            console.error("Fetch history failed", err);
            setLoading(false);
        });
    }, []);

    const fmt = (n) => '₹' + Number(n || 0).toLocaleString();
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

    return (
        <DashboardLayout title="Purchase History" sidebarLinks={links} userRole="Customer">
            <div className="glass-morphism" style={{ padding: '30px' }}>
                <h3 style={{ marginBottom: '25px' }}>PAST ORDERS</h3>
                {loading ? (
                    <p>Loading history...</p>
                ) : (orders && orders.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                        <p>No purchase history yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                         {(orders || []).map(order => {
                             const isDone = order.status === 'delivered' || order.status === 'completed';
                             const isActive = !isDone && order.status !== 'cancelled';
                             
                             return (
                                 <div key={order?._id || Math.random()} style={{ 
                                     display: 'grid', 
                                     gridTemplateColumns: '1.5fr 1fr 1fr 1fr', 
                                     padding: '24px', 
                                     background: isActive ? 'rgba(255, 77, 77, 0.05)' : isDone ? 'rgba(76, 175, 80, 0.05)' : 'rgba(255,255,255,0.02)', 
                                     border: `1px solid ${isActive ? 'rgba(255, 77, 77, 0.2)' : isDone ? 'rgba(76, 175, 80, 0.2)' : 'var(--glass-border)'}`,
                                     borderRadius: '16px',
                                     alignItems: 'center',
                                     gap: '20px'
                                 }}>
                                     <div>
                                         <p style={{ margin: '0 0 5px 0', fontSize: '0.65rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px' }}>Product</p>
                                         <p style={{ margin: 0, fontWeight: '700', fontSize: '1.1rem' }}>{order?.items?.map(i => i.productName).join(', ') || 'N/A'}</p>
                                         <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--accent)' }}>#{order._id ? order._id.toUpperCase().slice(-6) : 'N/A'}</p>
                                     </div>
                                     <div style={{ textAlign: 'center' }}>
                                         <p style={{ margin: '0 0 5px 0', fontSize: '0.65rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px' }}>Date</p>
                                         <p style={{ margin: 0, fontWeight: '600' }}>{fmtDate(order?.createdAt)}</p>
                                     </div>
                                     <div style={{ textAlign: 'center' }}>
                                         <p style={{ margin: '0 0 5px 0', fontSize: '0.65rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px' }}>Status</p>
                                         <span style={{ 
                                             fontSize: '0.7rem', fontWeight: '900', padding: '4px 12px', borderRadius: '20px',
                                             background: isActive ? 'rgba(255, 77, 77, 0.15)' : isDone ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255,255,255,0.1)',
                                             color: isActive ? '#ff4d4d' : isDone ? '#4caf50' : '#fff'
                                         }}>
                                             {order.status ? order.status.toUpperCase() : 'PENDING'}
                                         </span>
                                     </div>
                                     <div style={{ textAlign: 'right' }}>
                                         <p style={{ margin: '0 0 5px 0', fontSize: '0.65rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px' }}>Total Price</p>
                                         <p style={{ margin: 0, fontWeight: '900', color: 'var(--accent)', fontSize: '1.2rem' }}>{fmt(order?.totalAmount)}</p>
                                     </div>
                                 </div>
                             );
                         })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CustomerHistory;
