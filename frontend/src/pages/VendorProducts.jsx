import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { fetchVendorProducts, deleteProduct } from '../api';

const vendorLinks = [
    { label: 'Dashboard', path: '/vendor', icon: '📊' },
    { label: 'Products', path: '/vendor/products', icon: '📸' },
    { label: 'Orders', path: '/vendor/orders', icon: '📜' },
    { label: 'Inventory', path: '/vendor/inventory', icon: '📦' },
    { label: 'Analytics', path: '/vendor/analytics', icon: '📈' },
    { label: 'Payments',  path: '/vendor/payments',  icon: '💳' },
];

const getStatus = (p) => {
    if (p.stock === 0) return 'Out of Stock';
    if (!p.isApproved) return 'Pending Approval';
    return 'Active';
};

const statusColor = (status) => {
    if (status === 'Active') return { bg: 'rgba(76,175,80,0.15)', color: '#4caf50' };
    if (status === 'Out of Stock') return { bg: 'rgba(255,77,77,0.15)', color: '#ff4d4d' };
    return { bg: 'rgba(255,170,0,0.15)', color: '#ffaa00' };
};

const avgPrice = (products) => {
    if (!products.length) return '$0';
    const avg = products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length;
    return '$' + avg.toLocaleString(undefined, { maximumFractionDigits: 0 });
};

const VendorProducts = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchVendorProducts();
            setProducts(data);
        } catch (e) {
            setError('Could not load products. ' + (e.message || ''));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
        try {
            await deleteProduct(id);
            setProducts(prev => prev.filter(p => p._id !== id));
        } catch (e) {
            alert('Failed to delete product: ' + (e.message || ''));
        }
    };

    const activeCount = products.filter(p => p.isApproved && p.stock > 0).length;
    const outOfStock  = products.filter(p => p.stock === 0).length;

    return (
        <DashboardLayout title="My Products" sidebarLinks={vendorLinks} userRole="Vendor">
            <div className="glass-morphism" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h3 style={{ letterSpacing: '1px' }}>PRODUCT CATALOGUE</h3>
                    <button className="premium-button" style={{ padding: '10px 20px', fontSize: '0.8rem' }} onClick={() => navigate('/vendor/add-product')}>
                        + ADD PRODUCT
                    </button>
                </div>

                {/* Stats bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' }}>
                    {[
                        { label: 'Total Listed', value: products.length, color: 'var(--accent)' },
                        { label: 'Active',       value: activeCount,      color: '#4caf50' },
                        { label: 'Out of Stock', value: outOfStock,       color: '#ff4d4d' },
                        { label: 'Avg Price',    value: avgPrice(products), color: 'var(--text-main)' },
                    ].map((s, i) => (
                        <div key={i} style={{ padding: '10px 15px', background: 'var(--glass)', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-main)', opacity: 0.6, marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Loading state */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
                        <p>Loading your products...</p>
                    </div>
                )}

                {/* Error state */}
                {!loading && error && (
                    <div style={{ padding: '16px', background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', borderRadius: '8px', color: '#ff4d4d', marginBottom: '20px' }}>
                        ⚠️ {error}
                        <button onClick={load} style={{ marginLeft: '16px', background: 'none', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Retry</button>
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && products.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 40px', opacity: 0.6 }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📸</div>
                        <h3 style={{ marginBottom: '8px' }}>No products yet</h3>
                        <p style={{ marginBottom: '24px', fontSize: '0.9rem' }}>Start by adding your first product.</p>
                        <button className="premium-button" style={{ padding: '12px 28px' }} onClick={() => navigate('/vendor/add-product')}>
                            + Add Your First Product
                        </button>
                    </div>
                )}

                {/* Products table */}
                {!loading && products.length > 0 && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-main)', opacity: 0.7 }}>
                                <th style={{ padding: '12px 15px' }}>PRODUCT ID</th>
                                <th style={{ padding: '12px 15px' }}>NAME</th>
                                <th style={{ padding: '12px 15px' }}>CATEGORY</th>
                                <th style={{ padding: '12px 15px' }}>PRICE</th>
                                <th style={{ padding: '12px 15px' }}>STOCK</th>
                                <th style={{ padding: '12px 15px' }}>STATUS</th>
                                <th style={{ padding: '12px 15px' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => {
                                const status = getStatus(p);
                                const sc = statusColor(status);
                                const displayId = p._id ? p._id.toString().slice(-6).toUpperCase() : '—';
                                return (
                                    <tr key={p._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                        <td style={{ padding: '14px 15px', color: 'var(--accent)', fontFamily: 'monospace', fontSize: '0.85rem' }}>#{displayId}</td>
                                        <td style={{ padding: '14px 15px', fontWeight: '600' }}>{p.name}</td>
                                        <td style={{ padding: '14px 15px', color: 'var(--text-main)', opacity: 0.7 }}>{p.category}</td>
                                        <td style={{ padding: '14px 15px', fontWeight: '700' }}>
                                            ₹{Number(p.price).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '14px 15px', color: p.stock === 0 ? '#ff4d4d' : 'var(--text-main)' }}>
                                            {p.stock} units
                                        </td>
                                        <td style={{ padding: '14px 15px' }}>
                                            <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', background: sc.bg, color: sc.color }}>
                                                {status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 15px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    style={{ background: 'none', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '600' }}
                                                >
                                                    EDIT
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p._id, p.name)}
                                                    style={{ background: 'rgba(255,77,77,0.1)', border: 'none', color: '#ff4d4d', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '600' }}
                                                >
                                                    DELETE
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </DashboardLayout>
    );
};

export default VendorProducts;
