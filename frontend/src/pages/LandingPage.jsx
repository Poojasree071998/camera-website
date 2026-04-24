import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';

import CompareBar from '../components/CompareBar';
import { fetchPublicProducts, addToCompare } from '../api';
import placeholderCamera from '../assets/placeholder_camera.png';
import './Explore.css'; // Reusing explore styles

const STATIC_FEATURED = [
    {
        name: 'Sony Alpha A7 IV',
        desc: 'Full-frame mirrorless for professional photography & video.',
        price: '₹2,10,000',
        image: '/images/sony_a7_iv.png',
        path: '/product/sony-a7iv'
    },
    {
        name: 'Canon EOS R5',
        desc: '8K RAW video and 45MP stills in a revolutionary body.',
        price: '₹3,20,000',
        image: '/images/canon_eos_r5.png',
        path: '/product/canon-eos-r5'
    },
    {
        name: 'Nikon Z9 Flagship',
        desc: 'The world\'s fastest autofocus in a professional mirrorless.',
        price: '₹4,75,000',
        image: '/images/nikon_z9.png',
        path: '/product/nikon-z9',
        brand: 'Nikon'
    }
];

const LandingPage = () => {

    const [products, setProducts] = useState(STATIC_FEATURED);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPublicProducts()
            .then(liveProducts => {
                if (liveProducts && liveProducts.length > 0) {
                    // Map live products
                    const formattedLive = liveProducts.map(p => ({
                        name: p.name,
                        desc: p.description || 'Premium imaging performance.',
                        price: `₹${Number(p.price).toLocaleString()}`,
                        image: p.image || (p.images && p.images[0]) || placeholderCamera,
                        path: `/product/${p._id}`,
                        brand: p.brand || p.vendorName || 'New Arrival'
                    }));
                    
                    // Merge: Live first, then static (filtered to avoid duplicates)
                    const merged = [...formattedLive];
                    STATIC_FEATURED.forEach(sp => {
                        if (!merged.find(lp => lp.name === sp.name)) {
                            merged.push({
                                ...sp,
                                brand: sp.brand || 'Featured'
                            });
                        }
                    });

                    setProducts(merged.slice(0, 8)); // Show up to 8 premium items
                }
            })
            .catch(err => {
                console.error('LandingPage: Error fetching live products', err);
            });
    }, []);



    return (
        <div className="landing-page">
            <div className="cinematic-bg"></div>
            <Navbar />
            
            <Hero />



            {/* FEATURED COLLECTIONS */}
            <section id="featured" style={{ padding: '60px 6%', minHeight: '10vh' }}>
                <h2 style={{ fontSize: '3rem', marginBottom: '15px', fontFamily: 'var(--font-serif)' }}>
                    Featured <span style={{ color: 'var(--accent)' }}>Collections</span>
                </h2>
                <p style={{ color: 'var(--text-dim)', marginBottom: '60px', fontSize: '1.1rem', letterSpacing: '1px' }}>
                    Hand-picked by our team of visual experts
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                    {products.map((product, i) => (
                        <div key={i} className="glass-morphism" style={{
                            overflow: 'hidden',
                            borderRadius: '16px',
                            transition: 'var(--transition)',
                            cursor: 'pointer'
                        }}
                            onClick={() => navigate(product.path || `/products/all`)}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            {/* Product Image */}
                            <div style={{ height: '220px', overflow: 'hidden' }}>
                                <img
                                    src={product.image || placeholderCamera}
                                    alt={product.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                                    onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
                                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                                    onError={(e) => { e.target.src = placeholderCamera; }}
                                />
                            </div>

                            {/* Product Info */}
                            <div style={{ padding: '25px 30px' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
                                    {product.brand || 'Featured'}
                                </p>
                                <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', fontFamily: 'var(--font-serif)' }}>
                                    {product.name}
                                </h3>
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '20px', height: '45px', overflow: 'hidden' }}>
                                    {product.desc || product.description || 'Premium imaging performance.'}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-main)' }}>
                                        {product.price}
                                    </span>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <button 
                                            className="premium-button" 
                                            style={{ padding: '8px 15px', fontSize: '0.75rem', background: 'none', border: '1px solid var(--glass-border)', color: 'var(--text-main)' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const res = addToCompare(product);
                                                if (res.ok) {
                                                    window.dispatchEvent(new Event('compareUpdated'));
                                                } else {
                                                    alert(res.message);
                                                }
                                            }}
                                        >
                                            ⚖️ COMPARE
                                        </button>
                                        <button className="premium-button" style={{ padding: '8px 20px', fontSize: '0.8rem' }}>
                                            BUY
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            
            <CompareBar />
        </div>
    );
};

export default LandingPage;
