import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchVendorOrders, fetchVendorProducts, fetchVendorTransactions } from '../api';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';

const vendorLinks = [
    { label: 'Dashboard', path: '/vendor', icon: '📊' },
    { label: 'Products', path: '/vendor/products', icon: '📸' },
    { label: 'Inventory', path: '/vendor/inventory', icon: '📦' },
    { label: 'Analytics', path: '/vendor/analytics', icon: '📈' },
    { label: 'Payments',  path: '/vendor/payments',  icon: '💳' },
];



const statusColor = { Shipped: '#00bcd4', Processing: '#ffaa00', Delivered: '#4caf50', Cancelled: '#ff4d4d' };

const VendorDashboard = () => {
    const [showChat, setShowChat] = useState(false);
    const [allChats, setAllChats] = useState(() => {
        const saved = localStorage.getItem('DEMO_CHATS');
        if (saved && saved !== 'null') {
            try {
                const parsed = JSON.parse(saved);
                return { admin: [], vendor: [], complaints: [], ...parsed };
            } catch (e) {
                console.error("Error parsing DEMO_CHATS", e);
            }
        }
        return { admin: [], vendor: [], complaints: [] };
    });
    const [reply, setReply] = useState('');
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [transactions, setTransactions] = useState([]);

    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const [ordersData, productsData, txnsData] = await Promise.all([
                fetchVendorOrders(),
                fetchVendorProducts(),
                fetchVendorTransactions()
            ]);
        } catch (e) {
            console.error('VendorDashboard: Error loading data', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const saved = localStorage.getItem('DEMO_CHATS');
            if (saved && saved !== 'null') {
                try {
                    const parsed = JSON.parse(saved);
                    setAllChats(prev => ({ ...prev, ...parsed }));
                } catch (e) {}
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const sendReply = () => {
        if (!reply) return;
        const newMsg = { id: Date.now(), sender: 'vendor', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        const updated = { ...allChats, vendor: [...(allChats.vendor || []), newMsg] };
        setAllChats(updated);
        localStorage.setItem('DEMO_CHATS', JSON.stringify(updated));
        setReply('');
    };

    return (
    <DashboardLayout title="Seller Hub" sidebarLinks={vendorLinks} userRole="Vendor">
        {/* KPI Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <StatCard label="Total Revenue" value={transactions.reduce((acc, t) => acc + (t.netAmount || 0), 0).toLocaleString()} prefix="₹" color="#d4af37" />
            <StatCard label="Total Orders" value={orders.length} />
            <StatCard label="Active Products" value={products.filter(p => p.isApproved).length} />
            <StatCard label="Live Inventory" value={products.filter(p => p.stock > 0).length} color="#d4af37" />
        </div>



        {/* Split Layout: Orders & Inventory */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Orders Card */}
            <div className="glass-morphism" style={{ overflow: 'hidden', padding: '0px' }}>
                <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.5rem' }}>📜</span>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>Orders</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
                    <thead>
                        <tr style={{ background: 'var(--accent)', color: '#000' }}>
                            <th style={{ padding: '15px 20px', fontWeight: '800', width: '50%', fontSize: '0.75rem', letterSpacing: '1px' }}>PRODUCT</th>
                            <th style={{ padding: '15px 20px', fontWeight: '800', width: '25%', fontSize: '0.75rem', letterSpacing: '1px' }}>ID</th>
                            <th style={{ padding: '15px 20px', fontWeight: '800', width: '25%', fontSize: '0.75rem', letterSpacing: '1px' }}>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.slice(0, 5).map((o, i) => {
                            const firstItem = o.items?.[0] || {};
                            return (
                                <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '12px 20px', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                                            <div style={{ width: '45px', height: '45px', flexShrink: 0, background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                                                <img 
                                                    src={firstItem.image || '/placeholder-camera.png'} 
                                                    alt="" 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/45?text=CAM'; }}
                                                />
                                            </div>
                                            <span style={{ fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-main)' }}>
                                                {firstItem.productName || 'Unnamed Item'}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 20px', verticalAlign: 'middle', color: 'var(--text-dim)', fontWeight: '500' }}>#{o._id?.slice(-6) || o.id}</td>
                                    <td style={{ padding: '12px 20px', verticalAlign: 'middle' }}>
                                        <span style={{
                                            background: o.status === 'delivered' ? '#4caf50' : o.status === 'processing' ? '#64B5F6' : '#ffaa00',
                                            color: '#ffffff',
                                            padding: '6px 16px',
                                            borderRadius: '20px',
                                            fontSize: '0.85rem',
                                            fontWeight: '500'
                                        }}>
                                            {o.status?.toUpperCase() || 'PENDING'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                        {orders.length === 0 && (
                            <tr><td colSpan="3" style={{ padding: '30px', textAlign: 'center', opacity: 0.5 }}>No recent orders.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Inventory Card */}
            <div className="glass-morphism" style={{ overflow: 'hidden', padding: '0px' }}>
                <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.5rem' }}>📦</span>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>Inventory</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
                    <thead>
                        <tr style={{ background: 'var(--accent)', color: '#000' }}>
                            <th style={{ padding: '15px 20px', fontWeight: '800', width: '50%', fontSize: '0.75rem', letterSpacing: '1px' }}>PRODUCT</th>
                            <th style={{ padding: '15px 20px', fontWeight: '800', width: '20%', fontSize: '0.75rem', letterSpacing: '1px' }}>STOCK</th>
                            <th style={{ padding: '15px 20px', fontWeight: '800', width: '30%', fontSize: '0.75rem', letterSpacing: '1px' }}>UPDATED</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.slice(0, 5).map((item, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '12px 20px', verticalAlign: 'middle' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                                        <div style={{ width: '45px', height: '45px', flexShrink: 0, background: 'var(--secondary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                                            <img 
                                                src={item.image || '/placeholder-camera.png'} 
                                                alt="" 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/45?text=CAM'; }}
                                            />
                                        </div>
                                        <span style={{ fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-main)' }}>
                                            {item.name}
                                        </span>
                                    </div>
                                </td>
                                <td style={{ padding: '12px 20px', verticalAlign: 'middle', color: 'var(--text-dim)', fontWeight: '600' }}>{item.stock}</td>
                                <td style={{ padding: '12px 20px', verticalAlign: 'middle', color: 'var(--text-dim)', fontSize: '0.9rem' }}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                        ))}
                        {products.length === 0 && (
                            <tr><td colSpan="3" style={{ padding: '30px', textAlign: 'center', opacity: 0.5 }}>No products found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>


    {/* Floating Chat Widget */}
    <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000 }}>
        {showChat ? (
            <div className="glass-morphism animate-fade-in" style={{ 
                width: '350px', height: '480px', display: 'flex', flexDirection: 'column', 
                overflow: 'hidden', padding: 0, boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                border: '1px solid var(--glass-border)'
            }}>
                <div style={{ padding: '20px', background: 'rgba(212,175,55,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
                    <h4 style={{ margin: 0, color: 'var(--accent)', letterSpacing: '1px' }}>💬 CUSTOMER CHAT</h4>
                    <button onClick={() => setShowChat(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-dim)' }}>×</button>
                </div>
                <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {(!allChats.vendor || allChats.vendor.length === 0) ? (
                            <p style={{ textAlign: 'center', opacity: 0.5, marginTop: '20px' }}>No messages yet.</p>
                        ) : (
                            allChats.vendor.map(msg => (
                                <div key={msg.id} style={{ 
                                    alignSelf: msg.sender === 'user' ? 'flex-start' : 'flex-end',
                                    maxWidth: '85%',
                                    padding: '12px 16px',
                                    background: msg.sender === 'user' ? 'rgba(255,255,255,0.05)' : 'var(--accent)',
                                    color: msg.sender === 'user' ? 'var(--text-main)' : 'var(--primary)',
                                    borderRadius: '15px',
                                    fontSize: '0.85rem',
                                    border: msg.sender === 'user' ? '1px solid var(--glass-border)' : 'none'
                                }}>
                                    <div>{msg.text}</div>
                                    <div style={{ fontSize: '0.6rem', opacity: 0.5, marginTop: '5px', textAlign: 'right' }}>{msg.time}</div>
                                </div>
                            ))
                        )}
                    </div>
                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', display: 'flex', gap: '10px', borderTop: '1px solid var(--glass-border)' }}>
                    <input 
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendReply()}
                        placeholder="Type a response..." 
                        style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: 'var(--input-bg)', color: 'var(--text-main)', fontSize: '0.9rem' }} 
                    />
                    <button className="premium-button" onClick={sendReply} style={{ padding: '0 20px', fontSize: '0.7rem' }}>SEND</button>
                </div>
            </div>
        ) : (
            <button 
                onClick={() => setShowChat(true)}
                className="hover-scale"
                style={{ 
                    width: '65px', height: '65px', borderRadius: '50%', background: 'var(--accent)', color: 'var(--primary)', 
                    border: 'none', fontSize: '2rem', cursor: 'pointer', boxShadow: '0 10px 30px var(--accent-glow)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s'
                }}
            >
                💬
            </button>
        )}
    </div>
</DashboardLayout>
);
}

export default VendorDashboard;
