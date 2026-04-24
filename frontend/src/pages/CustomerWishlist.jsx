import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { addToCart } from '../api';
import placeholderCamera from '../assets/placeholder_camera.png';

const CustomerWishlist = () => {
    const [wishlist, setWishlist] = useState([
        { id: 1, name: 'Canon EOS R5', price: 3899, image: placeholderCamera },
        { id: 2, name: 'Sony A7 IV', price: 2499, image: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=500&q=80' },
    ]);
    const [toast, setToast] = useState('');

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

    const fmt = (n) => '₹' + Number(n || 0).toLocaleString();

    const removeFromWishlist = (id) => {
        setWishlist(prev => prev.filter(item => item.id !== id));
    };

    const handleAddToCart = (item) => {
        addToCart(item);
        setToast(`✅ ${item.name} added to cart!`);
        setTimeout(() => setToast(''), 3000);
    };

    return (
        <DashboardLayout title="My Wishlist" sidebarLinks={links} userRole="Customer">
            {toast && (
                <div style={{ position: 'fixed', top: '20px', right: '20px', background: 'var(--success)', color: '#000', padding: '16px 32px', borderRadius: '12px', zIndex: 1000, fontWeight: '700', boxShadow: '0 8px 32px var(--accent-glow)', animation: 'fadeIn 0.3s ease-out' }}>
                    {toast}
                </div>
            )}
            
            <div className="animate-fade-in">
                <div style={{ marginBottom: '40px' }}>
                    <h2 className="text-gradient" style={{ fontSize: '2.5rem', margin: 0 }}>My Wishlist</h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', marginTop: '8px' }}>Your hand-picked collection of professional imaging gear.</p>
                </div>

                {wishlist.length === 0 ? (
                    <div className="premium-card" style={{ padding: '100px 40px', textAlign: 'center' }}>
                         <div style={{ fontSize: '4rem', marginBottom: '24px', opacity: 0.3 }}>❤️</div>
                        <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem', marginBottom: '32px' }}>Your wishlist is currently empty. Start building your dream kit.</p>
                        <Link to="/customer/products" className="premium-button" style={{ textDecoration: 'none', display: 'inline-block' }}>EXPLORE PRODUCTS</Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
                        {wishlist.map(item => (
                            <div key={item.id} className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ height: '220px', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
                                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="hover-scale" />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1.4rem' }}>{item.name}</h4>
                                    <p style={{ margin: '0 0 24px 0', fontWeight: '800', color: 'var(--accent)', fontSize: '1.6rem' }}>{fmt(item.price)}</p>
                                    
                                    <div style={{ display: 'flex', gap: '16px', marginTop: 'auto' }}>
                                        <button 
                                            className="premium-button" 
                                            style={{ flex: 1, padding: '12px', fontSize: '0.8rem' }}
                                            onClick={() => handleAddToCart(item)}
                                        >
                                            ADD TO CART
                                        </button>
                                        <button 
                                            className="danger-btn"
                                            style={{ flex: 1, padding: '12px', fontSize: '0.8rem' }}
                                            onClick={() => removeFromWishlist(item.id)}
                                        >
                                            REMOVE
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CustomerWishlist;
