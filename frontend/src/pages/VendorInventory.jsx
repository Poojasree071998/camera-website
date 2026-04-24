import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';

const vendorLinks = [
    { label: 'Dashboard',   path: '/vendor',             icon: '📊' },
    { label: 'Products',    path: '/vendor/products',    icon: '📸' },
    { label: 'Inventory', path: '/vendor/inventory', icon: '📦' },
    { label: 'Analytics', path: '/vendor/analytics', icon: '📈' },
    { label: 'Payments',  path: '/vendor/payments',  icon: '💳' },
];

const SEED = [];

const LS_KEY = 'vendor_inventory_v1';

const load = () => {
    try {
        const stored = JSON.parse(localStorage.getItem(LS_KEY));
        if (stored && stored.length > 0) return stored;
        
        // If NO inventory yet, try to bootstrap from products
        const productsRaw = localStorage.getItem('ls_products');
        if (productsRaw) {
            const products = JSON.parse(productsRaw);
            if (products && products.length > 0) {
                return products.map(p => ({
                    id: p._id || 'INV-' + Math.random().toString(36).slice(2, 7),
                    name: p.name,
                    sku: p.sku || 'SKU-' + Math.random().toString(36).slice(2, 5).toUpperCase(),
                    stock: p.stock || 0,
                    threshold: 5,
                    warehouse: 'Main Warehouse'
                }));
            }
        }
        return SEED;
    } catch {
        return SEED;
    }
};
const save   = (d) => localStorage.setItem(LS_KEY, JSON.stringify(d));

const BLANK  = { name: '', sku: '', stock: '', threshold: '', warehouse: '' };
const statusOf = (item) =>
    item.stock === 0            ? { label: 'Out of Stock', color: '#ff4d4d' } :
    item.stock <= item.threshold ? { label: 'Low Stock',   color: '#ffaa00' } :
                                   { label: 'In Stock',    color: '#4caf50' };

const Input = ({ label, ...props }) => (
    <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)', opacity: 0.9, marginBottom: '6px', letterSpacing: '0.5px' }}>{label}</label>
        <input {...props} style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} />
    </div>
);

const VendorInventory = () => {
    const [items, setItems] = useState(load);
    const [modal, setModal] = useState(false);   // 'new' | 'restock' | false
    const [editId, setEditId]  = useState(null);
    const [form, setForm]      = useState(BLANK);
    const [restockQty, setRestockQty] = useState('');
    const [restockId, setRestockId]   = useState(null);
    const [toast, setToast] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    React.useEffect(() => {
        const seedIds = ['p4', 'VP002', 'p1', 'VP003', 'VP004', 'VP005'];
        const stored = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
        const filtered = stored.filter(item => !seedIds.includes(item.id));
        if (filtered.length !== stored.length) {
            localStorage.setItem(LS_KEY, JSON.stringify(filtered));
            setItems(filtered);
        }
    }, []);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const openNew = () => { setForm(BLANK); setEditId(null); setModal('form'); };
    const openEdit = (item) => {
        setForm({ name: item.name, sku: item.sku, stock: item.stock, threshold: item.threshold, warehouse: item.warehouse });
        setEditId(item.id);
        setModal('form');
    };

    const saveItem = () => {
        const { name, sku, stock, threshold, warehouse } = form;
        if (!name || !sku || stock === '' || !threshold || !warehouse) return showToast('⚠️ Fill all fields.');
        if (Number(stock) < 0 || Number(threshold) < 0) return showToast('⚠️ Stock and threshold must be ≥ 0.');

        const updated = editId
            ? items.map(i => i.id === editId ? { ...i, name, sku, stock: Number(stock), threshold: Number(threshold), warehouse } : i)
            : [...items, { id: 'VP' + Date.now(), name, sku, stock: Number(stock), threshold: Number(threshold), warehouse }];

        setItems(updated); save(updated);
        setModal(false);
        setShowSuccess(true);
    };

    const deleteItem = (id) => {
        if (!window.confirm('Remove this item from inventory?')) return;
        const updated = items.filter(i => i.id !== id);
        setItems(updated); save(updated);
        showToast('🗑️ Item removed.');
    };

    const openRestock = (id) => { setRestockId(id); setRestockQty(''); setModal('restock'); };
    const applyRestock = () => {
        const qty = Number(restockQty);
        if (!qty || qty <= 0) return showToast('⚠️ Enter a valid quantity.');
        const updated = items.map(i => i.id === restockId ? { ...i, stock: i.stock + qty } : i);
        setItems(updated); save(updated);
        setModal(false);
        showToast(`✅ +${qty} units added to stock.`);
    };

    const close = () => setModal(false);

    return (
        <DashboardLayout title="Inventory" sidebarLinks={vendorLinks} userRole="Vendor">

            {/* ── Toast ── */}
            {toast && (
                <div style={{ position: 'fixed', top: '20px', right: '24px', zIndex: 9999, padding: '13px 22px', borderRadius: '10px', fontWeight: '600', fontSize: '0.88rem', boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                    background: toast.startsWith('✅') || toast.startsWith('✏️') ? '#1a3a1a' : '#2a1a1a',
                    border: `1px solid ${toast.startsWith('✅') || toast.startsWith('✏️') ? '#4caf50' : '#ff9800'}`,
                    color:  toast.startsWith('✅') || toast.startsWith('✏️') ? '#4caf50' : '#ffaa00' }}>
                    {toast}
                </div>
            )}

            {/* ── Stats ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '22px' }}>
                {[
                    { label: 'Total SKUs',   value: items.length,                                                color: 'var(--accent)' },
                    { label: 'In Stock',     value: items.filter(i => i.stock > i.threshold).length,             color: '#4caf50' },
                    { label: 'Low Stock',    value: items.filter(i => i.stock > 0 && i.stock <= i.threshold).length, color: '#ffaa00' },
                    { label: 'Out of Stock', value: items.filter(i => i.stock === 0).length,                     color: '#ff4d4d' },
                ].map((s, i) => (
                    <div key={i} className="glass-morphism" style={{ padding: '18px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: '700', color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.73rem', opacity: 0.55, marginTop: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* ── Table ── */}
            <div className="glass-morphism" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                    <h3 style={{ letterSpacing: '1px' }}>📦 STOCK LEVELS</h3>
                    <button className="premium-button" style={{ padding: '10px 22px', fontSize: '0.82rem' }} onClick={openNew}>
                        + NEW INVENTORY
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)', opacity: 0.7 }}>
                                {['ID','PRODUCT','SKU CODE','STOCK','THRESHOLD','STATUS','WAREHOUSE','ACTIONS'].map(h => (
                                    <th key={h} style={{ padding: '12px 14px', fontSize: '0.71rem', textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 && (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '50px', opacity: 0.5 }}>No inventory items yet. Click <strong>+ NEW INVENTORY</strong> to add one.</td></tr>
                            )}
                            {items.map(item => {
                                const st = statusOf(item);
                                return (
                                    <tr key={item.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                        <td style={{ padding: '13px 14px', color: 'var(--accent)', fontWeight: '700', fontSize: '0.82rem', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{item.id}</td>
                                        <td style={{ padding: '13px 14px', fontWeight: '700', whiteSpace: 'nowrap' }}>{item.name}</td>
                                        <td style={{ padding: '13px 14px', fontFamily: 'monospace', fontSize: '0.78rem', opacity: 0.65, whiteSpace: 'nowrap' }}>{item.sku}</td>
                                        <td style={{ padding: '13px 14px', fontWeight: '800', color: st.color, whiteSpace: 'nowrap' }}>{item.stock} <span style={{ opacity: 0.5, fontWeight: '400', fontSize: '0.78rem' }}>units</span></td>
                                        <td style={{ padding: '13px 14px', opacity: 0.65, whiteSpace: 'nowrap' }}>{item.threshold} units</td>
                                        <td style={{ padding: '13px 14px', whiteSpace: 'nowrap' }}>
                                            <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.73rem', fontWeight: '700', background: st.color + '22', color: st.color }}>
                                                {st.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: '13px 14px', opacity: 0.65, fontSize: '0.83rem', whiteSpace: 'nowrap' }}>{item.warehouse}</td>
                                        <td style={{ padding: '13px 14px', whiteSpace: 'nowrap' }}>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button onClick={() => openRestock(item.id)}
                                                    style={{ padding: '5px 10px', background: 'rgba(76,175,80,0.12)', border: '1px solid #4caf50', color: '#4caf50', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700' }}>
                                                    +RESTOCK
                                                </button>
                                                <button onClick={() => openEdit(item)}
                                                    style={{ padding: '5px 10px', background: 'rgba(212,175,55,0.1)', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700' }}>
                                                    EDIT
                                                </button>
                                                <button onClick={() => deleteItem(item.id)}
                                                    style={{ padding: '5px 10px', background: 'none', border: 'none', color: '#ff4d4d', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700' }}>
                                                    ✕
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ══ ADD / EDIT MODAL ══ */}
            {modal === 'form' && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: '20px' }}>
                    <div className="glass-morphism" style={{ padding: '36px', maxWidth: '460px', width: '100%', borderRadius: '18px', position: 'relative' }}>
                        <button onClick={close} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,77,77,0.1)', border: 'none', color: '#ff4d4d', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}>✕ Close</button>

                        <h3 style={{ marginBottom: '6px', color: 'var(--text-main)' }}>📦 {editId ? 'Edit Item' : 'New Inventory Item'}</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '24px' }}>Fill in the product details to {editId ? 'update the item' : 'add it to inventory'}.</p>

                        <Input label="Product Name *"       placeholder="e.g. Sony A7 IV"        value={form.name}      onChange={e => set('name', e.target.value)} />
                        <Input label="SKU Code *"           placeholder="e.g. SNY-A7IV-001"       value={form.sku}       onChange={e => set('sku', e.target.value)} />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                            <Input label="Stock Quantity *"    placeholder="e.g. 10"  type="number" min="0" value={form.stock}     onChange={e => set('stock', e.target.value)} />
                            <Input label="Low Stock Threshold *" placeholder="e.g. 3" type="number" min="0" value={form.threshold} onChange={e => set('threshold', e.target.value)} />
                        </div>

                        <Input label="Warehouse Location *" placeholder="e.g. Mumbai - A3"       value={form.warehouse} onChange={e => set('warehouse', e.target.value)} />

                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <button onClick={saveItem} className="premium-button" style={{ flex: 1, padding: '13px' }}>
                                {editId ? '✏️ Update Item' : '✅ Add to Inventory'}
                            </button>
                            <button onClick={close} style={{ flex: 1, padding: '13px', background: 'none', border: '1px solid var(--glass-border)', color: 'var(--text-main)', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ RESTOCK MODAL ══ */}
            {modal === 'restock' && (() => {
                const item = items.find(i => i.id === restockId);
                return (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: '20px' }}>
                        <div className="glass-morphism" style={{ padding: '36px', maxWidth: '400px', width: '100%', borderRadius: '18px', position: 'relative' }}>
                            <button onClick={close} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,77,77,0.1)', border: 'none', color: '#ff4d4d', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}>✕ Close</button>

                            <h3 style={{ marginBottom: '6px', color: 'var(--text-main)' }}>🔄 Restock Item</h3>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '20px' }}>{item?.name}</p>

                            <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ opacity: 0.6, fontSize: '0.82rem' }}>Current Stock</span>
                                <span style={{ fontWeight: '700', color: statusOf(item || {}).color }}>{item?.stock} units</span>
                            </div>

                            <Input label="Units to Add *" placeholder="e.g. 20" type="number" min="1" value={restockQty} onChange={e => setRestockQty(e.target.value)} />

                            {restockQty > 0 && (
                                <div style={{ padding: '10px 14px', background: 'rgba(76,175,80,0.08)', border: '1px solid rgba(76,175,80,0.3)', borderRadius: '8px', marginBottom: '16px', fontSize: '0.82rem' }}>
                                    New stock will be: <strong style={{ color: '#4caf50' }}>{(item?.stock || 0) + Number(restockQty)} units</strong>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={applyRestock} className="premium-button" style={{ flex: 1, padding: '13px', background: '#4caf50' }}>
                                    ✅ Apply Restock
                                </button>
                                <button onClick={close} style={{ flex: 1, padding: '13px', background: 'none', border: '1px solid var(--glass-border)', color: 'var(--text-main)', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* ══ SUCCESS MODAL MENU ══ */}
            {showSuccess && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)', padding: '20px' }}>
                    <div className="glass-morphism" style={{ padding: '40px', maxWidth: '380px', width: '100%', borderRadius: '20px', textAlign: 'center', position: 'relative' }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '16px', animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>✅</div>
                        <h3 style={{ marginBottom: '12px', color: 'var(--text-main)', fontSize: '1.4rem' }}>Success!</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '28px', lineHeight: '1.5' }}>
                            Item successfully saved to your inventory.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button onClick={() => setShowSuccess(false)} className="premium-button" style={{ width: '100%', padding: '14px', background: 'var(--accent)', color: '#000', fontWeight: 'bold' }}>
                                Back to Inventory
                            </button>
                            <button onClick={() => { setShowSuccess(false); openNew(); }} style={{ width: '100%', padding: '14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                Add Another Item
                            </button>
                        </div>
                        <style>{`
                            @keyframes popIn {
                                0% { transform: scale(0.5); opacity: 0; }
                                100% { transform: scale(1); opacity: 1; }
                            }
                        `}</style>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default VendorInventory;
