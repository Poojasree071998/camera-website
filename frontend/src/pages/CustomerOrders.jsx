import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { fetchMyOrders, fetchAdminProducts, placeOrder, getUser, cancelOrder, requestRefund } from '../api';

const POPULAR_CAMERAS = [
    "Canon EOS R6", "Sony A7 IV", "Nikon Z6 II", "Fujifilm X-T5", "Panasonic Lumix S5 II",
    "Canon EOS R5", "Sony A7R V", "Nikon Z9", "Fujifilm X-H2S", "Panasonic Lumix GH6",
    "Canon EOS 90D", "Sony A6400", "Nikon D850", "GoPro Hero 11 Black", "Insta360 X3",
    "Canon EOS R7", "Sony A1", "Nikon Z7 II", "Fujifilm X100V", "Blackmagic Pocket Cinema Camera 6K Pro"
];

const StatusTracker = ({ status }) => {
    const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIdx = steps.indexOf(status?.toLowerCase());
    
    return (
        <div style={{ marginTop: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '10px' }}>
                <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}></div>
                <div style={{ position: 'absolute', top: '15px', left: '0', width: `${(currentIdx / (steps.length - 1)) * 100}%`, height: '2px', background: 'var(--accent)', zIndex: 0, transition: 'width 1s ease' }}></div>
                
                {steps.map((step, idx) => (
                    <div key={step} style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '50%', 
                            background: idx <= currentIdx ? 'var(--accent)' : '#222', 
                            border: '2px solid var(--glass-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            color: idx <= currentIdx ? '#000' : '#444',
                            fontWeight: '900'
                        }}>
                            {idx < currentIdx ? '✓' : idx === currentIdx ? '●' : idx + 1}
                        </div>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '800', color: idx <= currentIdx ? 'var(--accent)' : 'var(--text-dim)', opacity: idx <= currentIdx ? 1 : 0.4 }}>
                            {step}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CustomerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('history');
    const [products, setProducts] = useState([]);
    const [nf, setNf] = useState({
        customerName: '',
        productId: '',
        productName: '',
        sku: '',
        qty: 1,
        price: 0,
        address: '',
        paymentMethod: 'UPI',
        status: 'pending'
    });
    const [submitting, setSubmitting] = useState(false);
    const [trackingOrder, setTrackingOrder] = useState(null);
    const [showTracking, setShowTracking] = useState(false);

    const links = [
        { label: 'Dashboard', path: '/customer', icon: '📊' },
        { label: 'Products', path: '/customer/products', icon: '📸' },
        { label: 'Services', path: '/customer/services', icon: '🔧' },
        { label: 'My Orders',    path: '/customer/orders',  icon: '🛒' },
        { label: 'Purchase History', path: '/customer/history', icon: '📜' },
        { label: 'Wishlist', path: '/customer/wishlist', icon: '❤️' },
        { label: 'Compare Cameras', path: '/customer/compare', icon: '⚖️' },
        { label: 'Support Chat', path: '/customer/support', icon: '💬' },
        { label: 'Profile Settings', path: '/customer/profile', icon: '⚙️' },
    ];

    useEffect(() => {
        let isMounted = true;
        Promise.all([fetchMyOrders(), fetchAdminProducts()]).then(([oData, pData]) => {
            if (!isMounted) return;
            const sortedOrders = (oData || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sortedOrders);
            setProducts(pData || []);
            setLoading(false);
        }).catch(err => {
            console.error("Fetch orders failed", err);
            if (isMounted) setLoading(false);
        });
        
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.name) setNf(prev => ({ ...prev, customerName: user.name }));
        } catch (e) {}
        
        return () => { isMounted = false; };
    }, []);

    const fmt = (n) => '₹' + Number(n || 0).toLocaleString();
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

    const handleProductNameChange = (e) => {
        const val = e.target.value;
        const prod = products.find(p => p.name === val);
        if (prod) {
            setNf(prev => ({
                ...prev,
                productId: prod._id || prod.id,
                productName: prod.name,
                sku: prod.sku || `SKU-${String(prod._id || prod.id).slice(-4).toUpperCase()}`,
                price: prod.price
            }));
        } else {
            setNf(prev => ({ 
                ...prev, 
                productName: val,
                productId: '', // Reset ID for custom product
            }));
        }
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        const pId = nf.productId || ('CUSTOM-' + Date.now());
        if (!nf.customerName || !pId || !nf.address) {
            return alert('Please fill in all required fields.');
        }
        setSubmitting(true);
        try {
            const totalAmount = nf.price * nf.qty;
            const prod = products.find(p => String(p._id || p.id) === String(nf.productId)) || {};
            
            const payload = {
                items: [{
                    product: pId,
                    productId: pId,
                    productName: nf.productName,
                    price: nf.price,
                    quantity: Number(nf.qty),
                    vendorEmail: prod.vendorEmail || '',
                    vendorName: prod.vendorName || 'Vendor'
                }],
                customerName: nf.customerName,
                shippingAddress: nf.address,
                paymentMethod: nf.paymentMethod,
                status: nf.status,
                totalAmount
            };
            
            await placeOrder(payload);
            const updatedOrders = await fetchMyOrders();
            setOrders(updatedOrders || []);
            setActiveTab('history');
            setNf(prev => ({ ...prev, productId: '', productName: '', sku: '', qty: 1, price: 0, address: '', paymentMethod: 'UPI', status: 'pending' }));
            alert('✅ Order placed successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to place order.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        try {
            await cancelOrder(orderId);
            const updated = await fetchMyOrders();
            setOrders(updated || []);
            alert('✅ Order cancelled successfully.');
        } catch (err) {
            alert('Failed to cancel order.');
        }
    };

    const handleTrackOrder = (order) => {
        setTrackingOrder(order);
        setShowTracking(true);
    };

    return (
        <DashboardLayout title="My Orders" sidebarLinks={links} userRole="Customer">
            <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h2 className="text-gradient" style={{ fontSize: '2rem', margin: 0 }}>My Premium Orders</h2>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '4px' }}>Manage and track your high-end photography equipment.</p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '14px', width: 'fit-content', border: '1px solid var(--glass-border)' }}>
                    <button 
                        onClick={() => setActiveTab('history')}
                        style={{ 
                            padding: '12px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '1px',
                            background: activeTab === 'history' ? 'var(--accent)' : 'transparent',
                            color: activeTab === 'history' ? '#000' : 'var(--text-dim)',
                            transition: 'var(--transition)'
                        }}
                    >
                        ORDER HISTORY
                    </button>
                    <button 
                        onClick={() => setActiveTab('new')}
                        style={{ 
                            padding: '12px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '1px',
                            background: activeTab === 'new' ? 'var(--accent)' : 'transparent',
                            color: activeTab === 'new' ? '#000' : 'var(--text-dim)',
                            transition: 'var(--transition)'
                        }}
                    >
                        + NEW ORDER
                    </button>
                </div>

                {activeTab === 'history' ? (
                    <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                        {loading ? (
                            <div style={{ padding: '60px', textAlign: 'center' }}>
                                <p className="animate-pulse">Retrieving your order history...</p>
                            </div>
                        ) : (orders && orders.length === 0) ? (
                            <div style={{ textAlign: 'center', padding: '80px', opacity: 0.5 }}>
                                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📦</div>
                                <p>No orders placed yet. Your future gear awaits.</p>
                                <Link to="/customer/products" className="premium-button" style={{ marginTop: '20px', textDecoration: 'none', display: 'inline-block' }}>EXPLORE CATALOG</Link>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                                            {['ORDER ID', 'PRODUCT DETAILS', 'DATE', 'TOTAL AMOUNT', 'STATUS', 'ACTIONS'].map(h => (
                                                <th key={h} style={{ padding: '20px 24px', fontSize: '0.7rem', letterSpacing: '2px', fontWeight: '800', opacity: 0.6 }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(orders || []).map(order => (
                                            <tr key={order?._id} style={{ borderBottom: '1px solid var(--glass-border)', transition: '0.3s' }} className="hover-bg-glass">
                                                <td style={{ padding: '24px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent)' }}>#{order?._id ? order._id.slice(-6).toUpperCase() : 'N/A'}</td>
                                                <td style={{ padding: '24px' }}>
                                                    {order?.items?.map(item => (
                                                        <div key={item.productId} style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '4px' }}>{item.productName}</div>
                                                    ))}
                                                    <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>SKU: {order?.items?.[0]?.sku || 'GEN-CAM-01'}</div>
                                                </td>
                                                <td style={{ padding: '24px', fontSize: '0.85rem', opacity: 0.8 }}>{fmtDate(order?.createdAt)}</td>
                                                <td style={{ padding: '24px', fontWeight: '800', fontSize: '1.1rem' }}>{fmt(order?.totalAmount)}</td>
                                                <td style={{ padding: '24px' }}>
                                                    <span style={{ 
                                                        padding: '6px 14px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.5px',
                                                        background: order?.status === 'delivered' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.15)',
                                                        color: order?.status === 'delivered' ? '#059669' : '#d97706',
                                                        border: `1px solid ${order?.status === 'delivered' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.4)'}`
                                                    }}>
                                                        {order?.status ? order.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                                                    </span>
                                                </td>
                                                 <td style={{ padding: '24px' }}>
                                                     <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                                         <button onClick={() => handleTrackOrder(order)} className="premium-button" style={{ padding: '8px 16px', fontSize: '0.7rem' }}>TRACK</button>
                                                        {['pending', 'processing', 'confirmed'].includes(order?.status) && (
                                                            <button onClick={() => handleCancelOrder(order?._id)} className="danger-btn" style={{ padding: '8px 16px', fontSize: '0.7rem' }}>CANCEL</button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center' }}>
                        <div className="premium-card" style={{ width: '100%', maxWidth: '750px', padding: '40px' }}>
                            <h3 className="text-gradient" style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Start New Gear Order</h3>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '32px' }}>Secure your next professional imaging tool.</p>

                            <form onSubmit={handlePlaceOrder} style={{ display: 'grid', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.1px' }}>1️⃣ Customer Name</label>
                                    <input required type="text" className="modal-input" value={nf.customerName} onChange={e => setNf({ ...nf, customerName: e.target.value })} placeholder="e.g. Pooja V" />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.1px' }}>2️⃣ Select Product</label>
                                    <input required list="product-list" className="modal-input" value={nf.productName} onChange={handleProductNameChange} placeholder="Type or select a camera..." />
                                    <datalist id="product-list">
                                        {(products || []).map(p => (
                                            <option key={p?._id || p?.id || p?.name} value={p?.name} />
                                        ))}
                                        {POPULAR_CAMERAS.map(cam => (
                                            <option key={cam} value={cam} />
                                        ))}
                                    </datalist>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.1px' }}>3️⃣ Product ID / SKU</label>
                                        <input required type="text" className="modal-input" value={nf.sku} onChange={e => setNf({...nf, sku: e.target.value})} placeholder="SKU code" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.1px' }}>4️⃣ Quantity</label>
                                        <input required type="number" min="1" className="modal-input" value={nf.qty} onChange={e => setNf({ ...nf, qty: e.target.value })} />
                                    </div>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.1px' }}>5️⃣ Unit Price (₹)</label>
                                        <input required type="number" className="modal-input" value={nf.price} onChange={e => setNf({...nf, price: Number(e.target.value)})} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.1px' }}>6️⃣ Total Investment</label>
                                        <div style={{ padding: '12px 15px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--accent)', borderRadius: '8px', color: 'var(--accent)', fontWeight: '900', fontSize: '1.2rem' }}>
                                            {fmt(nf.price * nf.qty)}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.1px' }}>8️⃣ Shipping Address</label>
                                    <textarea required rows="3" className="modal-input" value={nf.address} onChange={e => setNf({ ...nf, address: e.target.value })} placeholder="Enter full delivery address..." />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.1px' }}>9️⃣ Payment Method</label>
                                    <select className="modal-input" value={nf.paymentMethod} onChange={e => setNf({ ...nf, paymentMethod: e.target.value })}>
                                        <option value="UPI">UPI Payment</option>
                                        <option value="Credit Card">Credit Card</option>
                                        <option value="Debit Card">Debit Card</option>
                                        <option value="Cash on Delivery">Cash on Delivery</option>
                                    </select>
                                </div>

                                <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                                    <button type="submit" disabled={submitting} className="premium-btn-v2" style={{ flex: 2, padding: '18px' }}>
                                        {submitting ? 'PROCESSING...' : '✅ CONFIRM & PLACE ORDER'}
                                    </button>
                                    <button type="button" onClick={() => setActiveTab('history')} className="secondary-btn" style={{ flex: 1 }}>CANCEL</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {showTracking && trackingOrder && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="glass-morphism animate-fade-in" style={{ width: '100%', maxWidth: '550px', padding: '40px', position: 'relative' }}>
                        <button onClick={() => setShowTracking(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,77,77,0.1)', border: 'none', color: '#ff4d4d', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                        <h3 className="text-gradient" style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Track Order</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Tracking ID: <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>#{trackingOrder._id.slice(-6).toUpperCase()}</span></p>
                        <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                <div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '4px' }}>CURRENT STATUS</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--accent)', textTransform: 'uppercase' }}>{trackingOrder.status.replace('_', ' ')}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '4px' }}>ESTIMATED ARRIVAL</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{trackingOrder.status === 'delivered' ? 'COMPLETED' : '3-5 Business Days'}</div>
                                </div>
                            </div>
                            <StatusTracker status={trackingOrder.status} />
                        </div>
                        <div style={{ marginTop: '30px' }}>
                            <h4 style={{ fontSize: '0.9rem', marginBottom: '15px', opacity: 0.8 }}>ORDER DETAILS</h4>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📸</div>
                                <div>
                                    <div style={{ fontWeight: '700' }}>{trackingOrder.items?.[0]?.productName}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Qty: {trackingOrder.items?.[0]?.quantity} · Price: {fmt(trackingOrder.totalAmount)}</div>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setShowTracking(false)} className="premium-button" style={{ width: '100%', marginTop: '40px', padding: '15px' }}>CLOSE</button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default CustomerOrders;
