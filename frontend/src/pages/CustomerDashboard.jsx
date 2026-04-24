import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { fetchMyOrders, fetchPublicProducts } from '../api';
import placeholderCamera from '../assets/placeholder_camera.png';

const CustomerDashboard = () => {
    const user = (() => {
        try { return JSON.parse(localStorage.getItem('user') || '{}'); }
        catch (e) { return {}; }
    })();
    const userRole = user.role || 'Customer';

    const [recentOrder, setRecentOrder] = useState(null);
    const [products, setProducts] = useState([]);

    const [notifications] = useState([
        { id: 1, text: '📦 Your order #CX-89230 has been shipped!', status: 'new' },
        { id: 2, text: '🔥 Flash Sale: 20% off on Nikon Z series!', status: 'unread' },
        { id: 3, text: '📸 New professional lenses just arrived!', status: 'read' },
    ]);

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

    useEffect(() => {
        fetchMyOrders().then(orders => {
            if (orders && orders.length > 0) {
                // Sort by date descending
                const sorted = [...orders].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
                setRecentOrder(sorted[0]);
            }
        });

        fetchPublicProducts().then(setProducts);
    }, []);

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
        const newMsg = { id: Date.now(), sender: 'user', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        const updated = { ...allChats, admin: [...(allChats.admin || []), newMsg] };
        setAllChats(updated);
        localStorage.setItem('DEMO_CHATS', JSON.stringify(updated));
        setReply('');
    };

    return (
        <DashboardLayout title="Customer Dashboard" sidebarLinks={links} userRole="Customer">
            <div className="animate-fade-in">
                {/* ... existing dashboard content ... */}
                <div style={{ marginBottom: '40px' }}>
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Welcome back, {userRole}</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>Here's what's happening with your photography gear today.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', marginBottom: '40px' }}>
                    {/* ── Recent Order Card ── */}
                    <div className="premium-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, fontSize: '0.9rem', letterSpacing: '2px', opacity: 0.8 }}>ACTIVE TRACKING</h3>
                            <Link to="/customer/orders" style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: '700' }}>VIEW ALL ORDERS →</Link>
                        </div>
                        
                        {recentOrder ? (() => {
                            const statusSteps = {
                                'pending': { percent: 10, label: 'ORDER PLACED', color: '#ffaa00' },
                                'confirmed': { percent: 30, label: 'CONFIRMED', color: '#64b5f6' },
                                'processing': { percent: 50, label: 'PROCESSING', color: '#ce93d8' },
                                'shipped': { percent: 75, label: 'IN TRANSIT', color: 'var(--success)' },
                                'delivered': { percent: 100, label: 'DELIVERED', color: '#4caf50' },
                                'cancelled': { percent: 0, label: 'CANCELLED', color: '#ff4d4d' }
                            };
                            const step = statusSteps[recentOrder.status?.toLowerCase()] || statusSteps.pending;
                            
                            return (
                                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                    <div style={{ 
                                        width: '140px', 
                                        height: '140px', 
                                        background: 'rgba(255,255,255,0.03)', 
                                        borderRadius: '16px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        border: '1px solid var(--glass-border)'
                                    }}>
                                         <span style={{ fontSize: '3.5rem' }}>📷</span>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '0.8rem', color: 'var(--accent)', fontWeight: '700' }}>#{recentOrder._id ? recentOrder._id.toString().slice(-6).toUpperCase() : 'N/A'}</p>
                                        <h4 style={{ margin: '0 0 12px 0', fontSize: '1.3rem' }}>{recentOrder.items?.[0]?.productName || 'Professional Camera Body'}</h4>
                                        
                                        <div style={{ marginBottom: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                                                <span style={{ color: step.color, fontWeight: '700' }}>{step.label}</span>
                                                <span style={{ opacity: 0.6 }}>{step.percent}% Complete</span>
                                            </div>
                                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${step.percent}%`, background: `linear-gradient(90deg, var(--accent), ${step.color})`, boxShadow: '0 0 15px var(--accent-glow)', transition: 'width 1s ease' }}></div>
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.6, fontSize: '0.8rem' }}>
                                            <span>📍 Latest Hub Status</span>
                                            <span>•</span>
                                            <span>{recentOrder.status === 'delivered' ? 'ARRIVED' : 'IN TRANSIT'}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })() : (
                            <div style={{ padding: '40px', textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '20px', opacity: 0.3 }}>🛒</div>
                                <p style={{ color: 'var(--text-dim)', marginBottom: '24px' }}>You haven't placed any orders yet.</p>
                                <Link to="/customer/products" className="premium-button" style={{ textDecoration: 'none' }}>START SHOPPING</Link>
                            </div>
                        )}
                    </div>


                </div>

                {/* ── Products Section (Integrated Catalog) ── */}
                <div style={{ marginTop: '64px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                        <div>
                            <h2 style={{ fontSize: '2rem', margin: '0 0 8px 0' }}>Explore the <span>Collection</span></h2>
                            <p style={{ color: 'var(--text-dim)', margin: 0 }}>Instant access to the world's most advanced imaging gear.</p>
                        </div>
                        <Link to="/store" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem' }}>VISIT FULL STORE →</Link>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                        {products.slice(0, 8).map(product => (
                            <div key={product._id} className="premium-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
                                <div className="product-image-container" style={{ height: '180px', marginBottom: '16px', borderRadius: '12px' }}>
                                    <img 
                                        src={(product.images && product.images[0]) || product.image || product.displayImg} 
                                        alt={product.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => { e.target.src = placeholderCamera; }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p className="technical-text" style={{ fontSize: '0.6rem', marginBottom: '4px' }}>{product.brand || product.category}</p>
                                    <h5 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#fff' }}>{product.name}</h5>
                                    <div style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '1.2rem', marginBottom: '16px' }}>
                                        ₹{Number(product.price).toLocaleString()}
                                    </div>
                                </div>
                                <Link to={`/customer/checkout/${product._id}`} className="premium-button" style={{ textDecoration: 'none', textAlign: 'center', padding: '10px', fontSize: '0.8rem' }}>
                                    ORDER NOW
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Quick Stats / Actions ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px', marginTop: '48px' }}>
                    {[
                        { title: 'Support Chat', desc: 'Expert help available 24/7', icon: '💬', path: '/customer/support' },
                        { title: 'Camera Services', icon: '🔧', desc: 'Book maintenance & repairs', path: '/customer/services' },
                        { title: 'Compare Gear', icon: '⚖️', desc: 'Data-driven comparisons', path: '/customer/compare' },
                    ].map((item, i) => (
                        <Link to={item.path} key={i} className="premium-card" style={{ textDecoration: 'none', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ fontSize: '2rem' }}>{item.icon}</div>
                            <div>
                                <h5 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#fff' }}>{item.title}</h5>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-dim)' }}>{item.desc}</p>
                            </div>
                        </Link>
                    ))}
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
                            <h4 style={{ margin: 0, color: 'var(--accent)', letterSpacing: '1px' }}>💬 SUPPORT CHAT</h4>
                            <button onClick={() => setShowChat(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-dim)' }}>×</button>
                        </div>
                        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {(!allChats.admin || allChats.admin.length === 0) ? (
                                <p style={{ textAlign: 'center', opacity: 0.5, marginTop: '20px' }}>No messages yet. Ask support something!</p>
                            ) : (
                                allChats.admin.map(msg => (
                                    <div key={msg.id} style={{ 
                                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '85%',
                                        padding: '12px 16px',
                                        background: msg.sender === 'user' ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                                        color: msg.sender === 'user' ? '#000' : 'var(--text-main)',
                                        borderRadius: '15px',
                                        fontSize: '0.85rem',
                                        border: msg.sender === 'user' ? 'none' : '1px solid var(--glass-border)'
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
                                placeholder="Type your message..." 
                                style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.9rem' }} 
                            />
                            <button className="premium-button" onClick={sendReply} style={{ padding: '0 20px', fontSize: '0.7rem' }}>SEND</button>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={() => setShowChat(true)}
                        className="hover-scale"
                        style={{ 
                            width: '65px', height: '65px', borderRadius: '50%', background: 'var(--accent)', color: '#000', 
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
};

export default CustomerDashboard;
