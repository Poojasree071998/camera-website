import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { fetchPublicProducts } from '../api';
import placeholderCamera from '../assets/placeholder_camera.png';

const CustomerProducts = () => {
    const [products, setProducts] = useState([]);
    
    // Using the same navigation as CustomerDashboard
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
        fetchPublicProducts().then(live => {
            if (live && live.length > 0) {
                // Ensure price format and image
                const formatted = live.map(p => ({
                    ...p,
                    displayPrice: `₹${Number(p.price).toLocaleString()}`,
                    displayImg: (p.images && p.images[0]) || p.image || placeholderCamera
                }));
                setProducts(formatted);
            }
        }).catch(() => {});
    }, []);

    return (
        <DashboardLayout title="Approved Products" sidebarLinks={links} userRole="Customer">
            <div style={{ marginBottom: '20px' }}>
                <p style={{ color: 'var(--text-dim)' }}>Explore our curated collection of verified products available for purchase.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
                {products.length > 0 ? products.map((prod, idx) => (
                    <div key={idx} className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ position: 'relative', height: '200px', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
                            <img 
                                src={prod.displayImg} 
                                alt={prod.name} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.6s' }} 
                                className="hover-scale"
                                onError={(e) => { e.target.src = placeholderCamera; }}
                            />
                            <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', padding: '5px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700', backdropFilter: 'blur(5px)' }}>
                                {prod.category || 'Professional'}
                            </div>
                        </div>
                        
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: '700', letterSpacing: '1px', marginBottom: '6px', textTransform: 'uppercase' }}>
                                {prod.brand || prod.vendorName}
                            </p>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', lineHeight: '1.3' }}>{prod.name}</h4>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '20px' }}>
                                <p style={{ margin: 0, color: '#fff', fontWeight: '800', fontSize: '1.4rem' }}>{prod.displayPrice}</p>
                                <Link to={`/customer/checkout/${prod._id}`} className="premium-button" style={{ padding: '10px 24px', fontSize: '0.75rem', textDecoration: 'none' }}>
                                    ORDER NOW
                                </Link>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="premium-card" style={{ padding: '60px', textAlign: 'center', gridColumn: '1 / -1' }}>
                        <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>No products are currently available.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CustomerProducts;
