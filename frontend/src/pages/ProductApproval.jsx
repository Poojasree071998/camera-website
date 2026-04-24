import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { fetchAdminProducts, approveProduct, deleteProduct, fetchVendors, createProduct, updateProduct } from '../api';

const links = [
    { label: 'Overview',          path: '/admin',               icon: '📊' },
    { label: 'Vendors',           path: '/admin/vendors',       icon: '🏪' },
    { label: 'Products',          path: '/admin/products',      icon: '📸' },
    { label: 'Orders',            path: '/admin/orders',        icon: '📜' },
    { label: 'Notifications',     path: '/admin/notifications', icon: '🔔' },
    { label: 'Payments',          path: '/admin/payments',      icon: '💳' },
    { label: 'Chats',             path: '/admin/chats',         icon: '💬' },
    { label: 'Employees',         path: '/admin/users',         icon: '👤' },
    { label: 'Reports',           path: '/admin/reports',       icon: '📈' },
    { label: 'Settings',          path: '/admin/settings',      icon: '⚙️' },
];

const ProductApproval = () => {
    const [searchParams]                = useSearchParams();
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState('');
    const [tab, setTab]                 = useState('pending'); // 'pending' | 'all'
    const [vendors, setVendors]         = useState([]);
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [showEditProductModal, setShowEditProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [newProduct, setNewProduct]   = useState({
        name: '', category: '', brand: '', price: '', stock: '', image: '', description: '',
        vendorEmail: '', vendorName: ''
    });

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const [productData, vendorData] = await Promise.all([
                fetchAdminProducts(),
                fetchVendors()
            ]);
            setAllProducts(productData);
            setVendors(vendorData);
        } catch (e) {
            setError('Could not load products or vendors. ' + (e.message || ''));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    useEffect(() => {
        if (searchParams.get('add') === 'true') {
            setShowAddProductModal(true);
        }
    }, [searchParams]);

    // Auto-cleanup for demo products requested by user
    useEffect(() => {
        try {
            const products = JSON.parse(localStorage.getItem('ls_products') || '[]');
            const namesToRemove = ['CAMERA', 'LENSES', 'ALPA', 'SONY ALPHA 12', 'ALPA 9', 'FULL FRAME'];
            const cleaned = products.filter(p => !namesToRemove.includes(p.name?.toUpperCase()));
            if (cleaned.length !== products.length) {
                localStorage.setItem('ls_products', JSON.stringify(cleaned));
                setAllProducts(cleaned);
            }
        } catch (e) {
            console.error('Cleanup failed', e);
        }
    }, []);

    const pending  = allProducts.filter(p => !p.isApproved);
    const approved = allProducts.filter(p =>  p.isApproved);
    const displayed = tab === 'pending' ? pending : allProducts;

    const handleApprove = async (id) => {
        try {
            await approveProduct(id);
            setAllProducts(prev => prev.map(p => p._id === id ? { ...p, isApproved: true } : p));
        } catch (e) {
            alert('Failed to approve: ' + (e.message || ''));
        }
    };

    const handleReject = async (id) => {
        const reason = window.prompt('Reason for rejection:');
        if (!reason) return;
        try {
            await deleteProduct(id);
            setAllProducts(prev => prev.filter(p => p._id !== id));
            alert(`Product rejected. Reason: ${reason}`);
        } catch (e) {
            alert('Failed to reject: ' + (e.message || ''));
        }
    };

    const handleBulkApprove = async () => {
        if (pending.length === 0) return;
        if (!window.confirm(`Approve all ${pending.length} pending products?`)) return;
        try {
            await Promise.all(pending.map(p => approveProduct(p._id)));
            setAllProducts(prev => prev.map(p => ({ ...p, isApproved: true })));
        } catch (e) {
            alert('Bulk approve failed: ' + (e.message || ''));
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!newProduct.vendorEmail) {
            alert('Please select a vendor!');
            return;
        }
        try {
            const selectedVendor = vendors.find(v => v.email === newProduct.vendorEmail);
            const payload = {
                ...newProduct,
                vendorName: selectedVendor.name,
                isApproved: true, // Admin added products are auto-approved
                images: newProduct.image ? [newProduct.image] : []
            };
            await createProduct(payload);
            setShowAddProductModal(false);
            setNewProduct({ name: '', category: '', brand: '', price: '', stock: '', image: '', description: '', vendorEmail: '', vendorName: '' });
            load();
            alert('Product added successfully!');
        } catch (e) {
            alert('Failed to add product: ' + (e.message || ''));
        }
    };

    const handleEditClick = (product) => {
        setEditingProduct({
            ...product,
            image: product.image || (product.images && product.images[0]) || ''
        });
        setShowEditProductModal(true);
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        try {
            const selectedVendor = vendors.find(v => v.email === editingProduct.vendorEmail);
            const payload = {
                ...editingProduct,
                vendorName: selectedVendor ? selectedVendor.name : editingProduct.vendorName,
                images: editingProduct.image ? [editingProduct.image] : editingProduct.images
            };
            await updateProduct(editingProduct._id, payload);
            setShowEditProductModal(false);
            setEditingProduct(null);
            load();
            alert('Product updated successfully!');
        } catch (e) {
            alert('Failed to update product: ' + (e.message || ''));
        }
    };

    return (
        <DashboardLayout title="Product Management" sidebarLinks={links} userRole="Super Admin">
            <div className="animate-fade-in">

            {/* ── Header & Stats ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <p style={{ margin: '0', opacity: 0.55, fontSize: '0.85rem' }}>
                        Review, approve, and manage all vendor-submitted products.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {/* Stats pills */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ padding: '4px 12px', borderRadius: '16px', fontSize: '0.7rem', fontWeight: '800', background: 'rgba(212,175,55,0.1)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
                            📦 {allProducts.length} TOTAL
                        </span>
                        <span style={{ padding: '4px 12px', borderRadius: '16px', fontSize: '0.7rem', fontWeight: '800', background: 'rgba(255,170,0,0.08)', color: '#ffaa00', border: '1px solid #ffaa00' }}>
                            ⏳ {pending.length} PENDING
                        </span>
                        <span style={{ padding: '4px 12px', borderRadius: '16px', fontSize: '0.7rem', fontWeight: '800', background: 'rgba(76,175,80,0.08)', color: '#4caf50', border: '1px solid #4caf50' }}>
                            ✅ {approved.length} APPROVED
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: 'var(--glass)', borderRadius: '8px', padding: '4px', width: 'fit-content' }}>
                {[
                    { key: 'pending', label: `⏳ Pending (${pending.length})` },
                    { key: 'all',     label: `📋 All Products (${allProducts.length})` },
                ].map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        style={{
                            padding: '9px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                            fontWeight: '700', fontSize: '0.82rem', letterSpacing: '0.3px',
                            background: tab === t.key ? 'var(--accent)' : 'transparent',
                            color: tab === t.key ? '#000' : 'var(--text-main)',
                            transition: 'all 0.2s',
                        }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── Loading ── */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '60px', opacity: 0.6 }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⏳</div>
                    <p>Loading products...</p>
                </div>
            )}

            {/* ── Error ── */}
            {!loading && error && (
                <div style={{ padding: '16px', background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', borderRadius: '8px', color: '#ff4d4d', marginBottom: '20px' }}>
                    ⚠️ {error}
                    <button onClick={load} style={{ marginLeft: '16px', background: 'none', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Retry</button>
                </div>
            )}

            {/* ── PENDING TAB: Card grid ── */}
            {!loading && !error && tab === 'pending' && (
                <>
                    {pending.length === 0 ? (
                        <div className="glass-morphism" style={{ padding: '60px', textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '14px' }}>✅</div>
                            <h3>No pending approvals</h3>
                            <p style={{ color: 'var(--text-dim)', marginTop: '8px' }}>Great! You're all caught up.</p>
                            <button
                                onClick={() => setTab('all')}
                                style={{ marginTop: '20px', padding: '10px 24px', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}
                            >
                                View All Products →
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                                    {pending.map(product => (
                                        <ProductCard
                                            key={product._id}
                                            product={product}
                                            onApprove={handleApprove}
                                            onReject={handleReject}
                                            onEdit={handleEditClick}
                                            showActions
                                        />
                                    ))}
                        </div>
                    )}

                    {pending.length > 0 && (
                        <div style={{ marginTop: '40px', textAlign: 'center' }}>
                            <button
                                className="premium-button"
                                style={{ padding: '15px 40px' }}
                                onClick={handleBulkApprove}
                            >
                                ⚡ BULK APPROVE ALL ({pending.length})
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* ── ALL PRODUCTS TAB: Table ── */}
            {!loading && !error && tab === 'all' && (
                <>
                    {allProducts.length === 0 ? (
                        <div className="glass-morphism" style={{ padding: '60px', textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '14px' }}>📸</div>
                            <h3>No products yet</h3>
                            <p style={{ color: 'var(--text-dim)', marginTop: '8px' }}>Vendors haven't submitted any products.</p>
                        </div>
                    ) : (
                        <div className="glass-morphism" style={{ padding: '24px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--glass-border)', opacity: 0.7 }}>
                                        <th style={{ padding: '12px 14px', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Product Name</th>
                                        <th style={{ padding: '12px 14px', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Category</th>
                                        <th style={{ padding: '12px 14px', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Brand</th>
                                        <th style={{ padding: '12px 14px', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Price</th>
                                        <th style={{ padding: '12px 14px', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', width: '100px' }}>Stock</th>
                                        <th style={{ padding: '12px 14px', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Vendor</th>
                                        <th style={{ padding: '12px 14px', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Status</th>
                                        <th style={{ padding: '12px 14px', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allProducts.map(p => {
                                        const approved = p.isApproved;
                                        return (
                                            <tr key={p._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                <td style={{ padding: '14px', fontWeight: '600' }}>{p.name}</td>
                                                <td style={{ padding: '14px', opacity: 0.7 }}>{p.category || '—'}</td>
                                                <td style={{ padding: '14px', opacity: 0.7 }}>{p.brand || '—'}</td>
                                                <td style={{ padding: '14px', fontWeight: '700', color: 'var(--accent)' }}>
                                                    ₹{Number(p.price || 0).toLocaleString()}
                                                </td>
                                                <td style={{ padding: '14px', color: p.stock === 0 ? '#ff4d4d' : 'var(--text-main)' }}>
                                                    {p.stock ?? '—'}
                                                </td>
                                                <td style={{ padding: '14px', opacity: 0.7, fontSize: '0.85rem' }}>
                                                    {p.vendorName || p.vendor?.name || 'Demo Vendor'}
                                                </td>
                                                <td style={{ padding: '14px' }}>
                                                    <span style={{
                                                        padding: '3px 10px', borderRadius: '20px', fontSize: '0.73rem', fontWeight: '700',
                                                        background: approved ? 'rgba(76,175,80,0.15)' : 'rgba(255,170,0,0.15)',
                                                        color: approved ? '#4caf50' : '#ffaa00',
                                                    }}>
                                                        {approved ? '✅ Approved' : '⏳ Pending'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px' }}>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        {!approved && (
                                                            <button
                                                                onClick={() => handleApprove(p._id)}
                                                                style={{ background: 'rgba(76,175,80,0.12)', border: '1px solid #4caf50', color: '#4caf50', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700' }}
                                                            >
                                                                APPROVE
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleEditClick(p)}
                                                            style={{ background: 'none', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700' }}
                                                        >
                                                            EDIT
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(p._id)}
                                                            style={{ background: 'rgba(255,77,77,0.1)', border: 'none', color: '#ff4d4d', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700' }}
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
                        </div>
                    )}
                </>
            )}
            {showAddProductModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.85)', zIndex: 3000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
                        padding: '40px', background: 'var(--card-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '16px', position: 'relative'
                    }}>
                        <button onClick={() => setShowAddProductModal(false)} style={{
                            position: 'absolute', top: '20px', right: '20px',
                            background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontSize: '1.2rem'
                        }}>✕</button>
                        <h3 style={{ marginBottom: '30px', color: 'var(--accent)' }}>ADD NEW PRODUCT</h3>
                        
                        <form onSubmit={handleAddProduct}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-main)', opacity: 0.7, marginBottom: '8px', fontWeight: '600' }}>Assigned Vendor *</label>
                                    <select 
                                        required 
                                        className="modal-input" 
                                        value={newProduct.vendorEmail}
                                        onChange={(e) => setNewProduct({ ...newProduct, vendorEmail: e.target.value })}
                                        style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', cursor: 'pointer' }}
                                    >
                                        <option value="">Select a vendor</option>
                                        {vendors.map(v => (
                                            <option key={v.id} value={v.email}>{v.name} ({v.email})</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-main)', opacity: 0.7, marginBottom: '8px', fontWeight: '600' }}>Product Name</label>
                                        <input required className="modal-input" placeholder="e.g. Sony Alpha A7 III" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-main)', opacity: 0.7, marginBottom: '8px', fontWeight: '600' }}>Category</label>
                                        <input required className="modal-input" placeholder="e.g. Mirrorless Cameras" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-main)', opacity: 0.7, marginBottom: '8px', fontWeight: '600' }}>Brand</label>
                                        <input required className="modal-input" placeholder="e.g. Sony" value={newProduct.brand} onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-main)', opacity: 0.7, marginBottom: '8px', fontWeight: '600' }}>Image URL</label>
                                        <input required className="modal-input" placeholder="https://..." value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-main)', opacity: 0.7, marginBottom: '8px', fontWeight: '600' }}>Price (₹)</label>
                                        <input required type="number" className="modal-input" placeholder="185000" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-main)', opacity: 0.7, marginBottom: '8px', fontWeight: '600' }}>Stock</label>
                                        <input required type="number" className="modal-input" placeholder="5" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-main)', opacity: 0.7, marginBottom: '8px', fontWeight: '600' }}>Description</label>
                                    <textarea className="modal-input" style={{ height: '80px', resize: 'none' }} placeholder="Product details..." value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ marginTop: '40px', borderTop: '1px solid var(--glass-border)', paddingTop: '30px', textAlign: 'right' }}>
                                <button type="button" onClick={() => setShowAddProductModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', marginRight: '20px', cursor: 'pointer', opacity: 0.7 }}>Cancel</button>
                                <button type="submit" className="premium-button" style={{ padding: '12px 40px' }}>PUBLISH PRODUCT</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEditProductModal && editingProduct && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.85)', zIndex: 3000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
                        padding: '40px', background: 'var(--card-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '16px', position: 'relative'
                    }}>
                        <button onClick={() => { setShowEditProductModal(false); setEditingProduct(null); }} style={{
                            position: 'absolute', top: '20px', right: '20px',
                            background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontSize: '1.2rem'
                        }}>✕</button>
                        <h3 style={{ marginBottom: '30px', color: 'var(--accent)' }}>EDIT PRODUCT</h3>
                        
                        <form onSubmit={handleUpdateProduct}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-main)', opacity: 0.7, marginBottom: '8px', fontWeight: '600' }}>Assigned Vendor *</label>
                                    <select 
                                        required 
                                        className="modal-input" 
                                        value={editingProduct.vendorEmail}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, vendorEmail: e.target.value })}
                                        style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', cursor: 'pointer' }}
                                    >
                                        <option value="">Select a vendor</option>
                                        {vendors.map(v => (
                                            <option key={v.id} value={v.email}>{v.name} ({v.email})</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-main)', opacity: 0.7, marginBottom: '8px', fontWeight: '600' }}>Product Name</label>
                                        <input required className="modal-input" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-main)', opacity: 0.7, marginBottom: '8px', fontWeight: '600' }}>Category</label>
                                        <input required className="modal-input" value={editingProduct.category} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-main)', opacity: 0.7, marginBottom: '8px', fontWeight: '600' }}>Brand</label>
                                        <input required className="modal-input" value={editingProduct.brand} onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-main)', opacity: 0.7, marginBottom: '8px', fontWeight: '600' }}>Image URL</label>
                                        <input required className="modal-input" value={editingProduct.image} onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-main)', opacity: 0.7, marginBottom: '8px', fontWeight: '600' }}>Price (₹)</label>
                                        <input required type="number" className="modal-input" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-main)', opacity: 0.7, marginBottom: '8px', fontWeight: '600' }}>Stock</label>
                                        <input required type="number" className="modal-input" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-main)', opacity: 0.7, marginBottom: '8px', fontWeight: '600' }}>Description</label>
                                    <textarea className="modal-input" style={{ height: '80px', resize: 'none' }} value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ marginTop: '40px', borderTop: '1px solid var(--glass-border)', paddingTop: '30px', textAlign: 'right' }}>
                                <button type="button" onClick={() => { setShowEditProductModal(false); setEditingProduct(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-main)', marginRight: '20px', cursor: 'pointer', opacity: 0.7 }}>Cancel</button>
                                <button type="submit" className="premium-button" style={{ padding: '12px 40px' }}>UPDATE PRODUCT</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            </div>
        </DashboardLayout>
    );
};

// ── Product Card (for pending tab) ────────────────────────────
const ProductCard = ({ product: p, onApprove, onReject, onEdit }) => (
    <div className="glass-morphism" style={{ padding: '24px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.6rem', background: 'rgba(255,170,0,0.1)', color: '#ffaa00', padding: '4px 8px', borderRadius: '4px', fontWeight: '700', border: '1px solid #ffaa00' }}>
            PENDING
        </div>

        <div style={{ width: '100%', height: '160px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', overflow: 'hidden' }}>
            {p.images && p.images[0]
                ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                : '📸'
            }
        </div>

        <h4 style={{ margin: '0 0 4px 0', paddingRight: '70px', fontSize: '0.95rem' }}>{p.name}</h4>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: '0 0 4px' }}>
            by {p.vendorName || p.vendor?.name || 'Demo Vendor'}
        </p>
        {p.description && (
            <p style={{ fontSize: '0.78rem', opacity: 0.6, margin: '0 0 14px', lineHeight: 1.4 }}>
                {p.description.slice(0, 70)}...
            </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.88rem' }}>
            <span style={{ opacity: 0.75 }}>{p.category}</span>
            <strong style={{ color: 'var(--accent)' }}>₹{Number(p.price || 0).toLocaleString()}</strong>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
            <button
                className="premium-button"
                style={{ flex: 1, padding: '10px', fontSize: '0.75rem' }}
                onClick={() => onApprove(p._id)}
            >
                ✅ APPROVE
            </button>
            <button
                style={{ flex: 1, padding: '10px', fontSize: '0.75rem', background: 'none', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                onClick={() => onEdit(p)}
            >
                ✎ EDIT
            </button>
            <button
                style={{ flex: 1, padding: '10px', fontSize: '0.75rem', background: 'none', border: '1px solid #ff4d4d', color: '#ff4d4d', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                onClick={() => onReject(p._id)}
            >
                ✕ REJECT
            </button>
        </div>
    </div>
);

export default ProductApproval;
