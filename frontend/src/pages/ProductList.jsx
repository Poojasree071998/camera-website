import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CompareBar from '../components/CompareBar';
import { fetchPublicProducts, placeOrder, addToCompare } from '../api';
import placeholderCamera from '../assets/placeholder_camera.png';
import './ProductList.css';

/* Category → slug mapping for display names */
const CATEGORY_LABELS = {
    dslr: 'DSLR Cameras', mirrorless: 'Mirrorless Cameras', video: 'Video Cameras',
    lenses: 'Camera Lenses', storage: 'Memory Cards', power: 'Batteries & Chargers',
    bags: 'Camera Bags', accessories: 'Camera Accessories',
};

/* Static fallback products (always shown + merged with vendor products) */
const STATIC_PRODUCTS = {
    dslr: [
        { _id: 'p1', name: 'Canon EOS 90D', price: 89900, category: 'DSLR Cameras', brand: 'Canon', vendorName: 'LensCraft Official', vendorEmail: '', rating: 4.5, stock: 5, image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=600' },
        { _id: 'p2', name: 'Nikon D850', price: 224900, category: 'DSLR Cameras', brand: 'Nikon', vendorName: 'LensCraft Official', vendorEmail: '', rating: 4.9, stock: 3, image: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&q=80&w=600' },
    ],
    mirrorless: [
        { _id: 'p4', name: 'Sony A7 IV', price: 187400, category: 'Mirrorless Cameras', brand: 'Sony', vendorName: 'LensCraft Official', vendorEmail: '', rating: 4.7, stock: 8, image: placeholderCamera },
        { _id: 'p5', name: 'Fujifilm X-T5', price: 127350, category: 'Mirrorless Cameras', brand: 'Fujifilm', vendorName: 'LensCraft Official', vendorEmail: '', rating: 4.6, stock: 6, image: 'https://images.unsplash.com/photo-1493119508027-2b584f234d6c?auto=format&fit=crop&q=80&w=600' },
    ],
    video: [
        { _id: 'p7', name: 'Blackmagic Pocket 6K', price: 187125, category: 'Video Cameras', brand: 'Blackmagic', vendorName: 'LensCraft Official', vendorEmail: '', rating: 4.8, stock: 4, image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=600' },
    ],
    lenses: [
        { _id: 'p10', name: 'Sony 24-70mm f/2.8 GM', price: 172425, category: 'Camera Lenses', brand: 'Sony', vendorName: 'LensCraft Official', vendorEmail: '', rating: 4.9, stock: 10, image: 'https://images.unsplash.com/photo-1617360091474-6a96e29d8c7c?auto=format&fit=crop&q=80&w=600' },
    ],
    accessories: [
        { _id: 'p19', name: 'DJI RS 3 Pro Gimbal', price: 65175, category: 'Camera Accessories', brand: 'DJI', vendorName: 'LensCraft Official', vendorEmail: '', rating: 4.8, stock: 7, image: 'https://images.unsplash.com/photo-1508921340878-ba53e1f016ec?auto=format&fit=crop&q=80&w=600' },
    ],
};

const categoryOf = (slug) => CATEGORY_LABELS[slug] || slug;

const ProductList = () => {
    const { category } = useParams();
    const catLabel = CATEGORY_LABELS[category] || (category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Products');

    const [products, setProducts] = useState(() => {
        if (category === 'all') {
            return Object.values(STATIC_PRODUCTS).flat();
        }
        return STATIC_PRODUCTS[category] || [];
    });
    const [buyTarget, setBuyTarget] = useState(null);   // product currently being purchased
    const [address, setAddress]     = useState('');
    const [buying, setBuying]       = useState(false);
    const [toast, setToast]         = useState('');

    /* Merge live approved vendor products */
    useEffect(() => {
        fetchPublicProducts()
            .then(live => {
                const vendorProd = live.filter(p => {
                    if (category === 'all') return true;
                    
                    const pCat = (p.category || '').toLowerCase();
                    const sCat = (category || '').toLowerCase();
                    const lCat = (categoryOf(category) || '').toLowerCase();
                    
                    return pCat.includes(sCat) || 
                           sCat.includes(pCat) || 
                           pCat.includes(lCat) || 
                           lCat.includes(pCat);
                });
                if (vendorProd.length > 0) {
                    setProducts(prev => {
                        const ids = new Set(prev.map(p => p._id));
                        return [...prev, ...vendorProd.filter(p => !ids.has(p._id))];
                    });
                }
            })
            .catch(() => {}); // silent – static products are always shown
    }, [category]);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3500);
    };

    const handleBuyNow = async () => {
        if (!address.trim()) return alert('Please enter a shipping address.');
        setBuying(true);
        try {
            await placeOrder({
                items: [{
                    productId:   buyTarget._id,
                    productName: buyTarget.name,
                    vendorEmail: buyTarget.vendorEmail || '',
                    vendorName:  buyTarget.vendorName  || 'LensCraft Official',
                    price:       buyTarget.price,
                    quantity:    1,
                }],
                totalAmount:     buyTarget.price,
                shippingAddress: address,
                paymentStatus:   'paid',
            });
            setBuyTarget(null);
            setAddress('');
            showToast(`✅ Order placed for "${buyTarget.name}"! Check your Customer Dashboard.`);
        } catch (e) {
            alert('Order failed: ' + (e.message || 'Please try again.'));
        } finally {
            setBuying(false);
        }
    };

    return (
        <div className="product-list-page">
            <div className="cinematic-bg"></div>
            <Navbar />

            {/* ── Toast ── */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '20px', right: '24px', zIndex: 9999,
                    background: '#1a3a1a', border: '1px solid #4caf50', color: '#4caf50',
                    padding: '14px 22px', borderRadius: '10px', fontWeight: '600', fontSize: '0.9rem',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.4)', animation: 'fadeIn 0.3s'
                }}>
                    {toast}
                </div>
            )}

            <div className="product-list-header animate-fade-in">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h2>{catLabel} <span>Collection</span></h2>
                    <Link to="/store" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Categories</Link>
                </div>
                
                <div className="list-controls">
                    <select 
                        className="sort-select"
                        onChange={(e) => {
                            const val = e.target.value;
                            setProducts(prev => {
                                let sorted = [...prev];
                                if (val === 'price-low') sorted.sort((a,b) => a.price - b.price);
                                if (val === 'price-high') sorted.sort((a,b) => b.price - a.price);
                                if (val === 'rating') sorted.sort((a,b) => (b.rating || 0) - (a.rating || 0));
                                return sorted;
                            });
                        }}
                        style={{
                            background: 'var(--secondary)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--glass-border)',
                            padding: '10px 15px',
                            borderRadius: '8px',
                            outline: 'none',
                            fontSize: '0.85rem'
                        }}
                    >
                        <option value="default">Sort By: Featured</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Top Rated</option>
                    </select>
                </div>
            </div>

            <div className="product-grid animate-fade-in">
                {products.length > 0 ? products.map(product => (
                    <div key={product._id} className="product-card glass-morphism">
                        <div>
                            <div className="product-image-container">
                                {product.image || product.displayImg
                                    ? <img 
                                        src={product.image || product.displayImg} 
                                        alt={product.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => { e.target.src = placeholderCamera; }}
                                      />
                                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>📸</div>
                                }
                            </div>
                            <div className="product-info">
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '5px' }}>{product.vendorName || product.brand}</p>
                                <h3>{product.name}</h3>
                                <div className="product-price">₹{Number(product.price).toLocaleString()}</div>
                            </div>
                        </div>
                        <div className="product-meta">
                            <div className="product-rating">
                                <span>⭐</span> {product.rating || '4.5'}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    className="premium-button"
                                    style={{ padding: '8px 12px', fontSize: '0.7rem', background: 'none', border: '1px solid var(--glass-border)', color: 'var(--text-main)' }}
                                    onClick={() => {
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
                                <button
                                    className="premium-button add-cart-btn"
                                    onClick={() => { setBuyTarget(product); setAddress(''); }}
                                >
                                    Buy Now
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <p style={{ color: 'var(--text-dim)' }}>Coming soon — vendors are adding products daily!</p>
                )}
            </div>

            {/* ── Buy Now Modal ── */}
            {buyTarget && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    backdropFilter: 'blur(4px)',
                }}>
                    <div className="glass-morphism" style={{ padding: '36px', maxWidth: '440px', width: '90%', borderRadius: '16px' }}>
                        <h3 style={{ marginBottom: '6px' }}>🛒 Confirm Order</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '24px' }}>
                            You're buying <strong style={{ color: 'var(--accent)' }}>{buyTarget.name}</strong>
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', padding: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px' }}>
                            <span style={{ opacity: 0.7 }}>Price</span>
                            <strong style={{ color: 'var(--accent)', fontSize: '1.1rem' }}>₹{Number(buyTarget.price).toLocaleString()}</strong>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', opacity: 0.7, marginBottom: '6px', letterSpacing: '0.5px' }}>
                                SHIPPING ADDRESS *
                            </label>
                            <textarea
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                placeholder="Enter your full delivery address..."
                                rows={3}
                                style={{
                                    width: '100%', padding: '12px', borderRadius: '8px',
                                    background: 'var(--glass)', border: '1px solid var(--glass-border)',
                                    color: 'var(--text-main)', fontSize: '0.9rem', resize: 'none', outline: 'none',
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={handleBuyNow}
                                disabled={buying}
                                className="premium-button"
                                style={{ flex: 1, padding: '13px', background: '#4caf50', color: '#fff', opacity: buying ? 0.7 : 1 }}
                            >
                                {buying ? '⏳ Placing Order...' : '✅ Place Order'}
                            </button>
                            <button
                                onClick={() => setBuyTarget(null)}
                                style={{ flex: 1, padding: '13px', background: 'none', border: '1px solid var(--glass-border)', color: 'var(--text-main)', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                            >
                                Cancel
                            </button>
                        </div>

                        <p style={{ marginTop: '14px', fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', opacity: 0.6 }}>
                            🔒 Payment processed securely · 10% platform fee applied
                        </p>
                    </div>
                </div>
            )}

            <CompareBar />
        </div>
    );
};

export default ProductList;
