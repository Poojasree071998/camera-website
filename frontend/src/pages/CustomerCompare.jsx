import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { getCompareList, removeFromCompare, addToCart, getUser } from '../api';
import { useNavigate, Link } from 'react-router-dom';

const CustomerCompare = () => {
    const [cameras, setCameras] = useState([]);
    const navigate = useNavigate();

    const refreshGear = () => {
        setCameras(getCompareList());
    };

    useEffect(() => {
        refreshGear();
        const handleStorage = () => refreshGear();
        window.addEventListener('storage', handleStorage);
        window.addEventListener('compareUpdated', handleStorage);
        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('compareUpdated', handleStorage);
        };
    }, []);

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

    const features = [
        { key: 'image', label: 'Image' },
        { key: 'name', label: 'Model' },
        { key: 'brand', label: 'Brand' },
        { key: 'price', label: 'Price' },
        { key: 'megapixels', label: 'Resolution' },
        { key: 'sensorType', label: 'Sensor Type' },
        { key: 'isoRange', label: 'ISO Range' },
        { key: 'videoRecording', label: 'Video' },
        { key: 'batteryLife', label: 'Battery' },
        { key: 'weight', label: 'Weight' },
    ];

    const fmt = (n) => '₹' + Number(n || 0).toLocaleString();

    const handleBuyNow = (cam) => {
        addToCart(cam);
        navigate('/customer/cart');
    };

    const handleRemove = (id) => {
        removeFromCompare(id);
        refreshGear();
        window.dispatchEvent(new Event('compareUpdated'));
    };

    return (
        <DashboardLayout title="Compare Cameras" sidebarLinks={links} userRole="Customer">
            <div className="glass-morphism" style={{ padding: '30px', borderRadius: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontFamily: 'var(--font-serif)' }}>Camera <span style={{ color: 'var(--accent)' }}>Comparison</span></h2>
                        <p style={{ margin: '5px 0 0', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Side-by-side technical evaluation of selected gear.</p>
                    </div>
                </div>

                {cameras.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.3 }}>⚖️</div>
                        <h3>No cameras selected for comparison</h3>
                        <p style={{ color: 'var(--text-dim)', marginBottom: '30px' }}>Explore our store and add up to 4 cameras to compare specs.</p>
                        <button className="premium-button" onClick={() => navigate('/store')}>GO TO STORE</button>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                                    <th style={{ padding: '20px', textAlign: 'left', textTransform: 'uppercase', fontSize: '0.75rem', opacity: 0.6, width: '150px' }}>Specification</th>
                                    {cameras.map(cam => (
                                        <th key={cam._id || cam.id} style={{ padding: '20px', minWidth: '200px' }}>
                                            <div style={{ position: 'relative' }}>
                                                <button 
                                                    onClick={() => handleRemove(cam._id || cam.id)}
                                                    style={{ position: 'absolute', top: '-10px', right: '0', background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '1rem' }}
                                                    title="Remove"
                                                >✕</button>
                                                <Link 
                                                    to={`/product/${cam._id || cam.id}`} 
                                                    style={{ color: 'var(--accent)', fontWeight: 'bold', textDecoration: 'none' }}
                                                    className="hover-glow"
                                                >
                                                    {cam.name}
                                                </Link>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {features.map(feat => (
                                    <tr key={feat.key} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.3s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                                        <td style={{ padding: '20px', textAlign: 'left', fontWeight: '600', fontSize: '0.85rem', opacity: 0.8, color: 'var(--text-main)' }}>{feat.label}</td>
                                        {cameras.map(cam => (
                                            <td key={(cam._id || cam.id) + feat.key} style={{ padding: '20px', fontSize: '0.9rem' }}>
                                                {feat.key === 'image' ? (
                                                    <Link to={`/product/${cam._id || cam.id}`}>
                                                        <img 
                                                            src={cam.image || 'https://via.placeholder.com/150'} 
                                                            alt={cam.name} 
                                                            style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--glass-border)' }} 
                                                            className="hover-scale"
                                                        />
                                                    </Link>
                                                ) : feat.key === 'price' ? (
                                                    <span style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1.1rem' }}>{fmt(cam.price)}</span>
                                                ) : (
                                                    cam[feat.key] || 'N/A'
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                <tr>
                                    <td style={{ padding: '30px 20px' }}></td>
                                    {cameras.map(cam => (
                                        <td key={(cam._id || cam.id) + 'btn'} style={{ padding: '30px 20px' }}>
                                            <button 
                                                className="premium-button"
                                                onClick={() => handleBuyNow(cam)}
                                                style={{ width: '100%', padding: '12px' }}
                                            >
                                                BUY NOW
                                            </button>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            <div style={{ marginTop: '40px', padding: '40px', background: 'rgba(255,170,0,0.05)', borderRadius: '20px', border: '1px solid rgba(255,170,0,0.1)' }}>
                <h3 style={{ color: 'var(--accent)', marginBottom: '15px' }}>Expert Tip: Choosing the Right Camera</h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', lineHeight: '1.8' }}>
                    Digital cameras are commonly compared using specs such as megapixels, ISO sensitivity, lens type, autofocus system, and battery life because these features affect image quality and performance. If you're shooting low-light portraits, prioritize <strong>ISO Range</strong> and <strong>Sensor Size</strong>. For sports or wildlife, check the <strong>Autofocus points</strong> and <strong>Burst Speed</strong>.
                </p>
            </div>
        </DashboardLayout>
    );
};

export default CustomerCompare;
