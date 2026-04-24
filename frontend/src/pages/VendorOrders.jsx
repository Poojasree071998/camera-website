import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { fetchVendorOrders, updateOrderStatus, placeOrder } from '../api';

const vendorLinks = [
    { label: 'Dashboard',   path: '/vendor',             icon: '📊' },
    { label: 'Products',    path: '/vendor/products',    icon: '📸' },
    { label: 'Inventory', path: '/vendor/inventory', icon: '📦' },
    { label: 'Analytics', path: '/vendor/analytics', icon: '📈' },
    { label: 'Payments',  path: '/vendor/payments',  icon: '💳' },
];

const STATUS_FLOW  = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const STATUS_COLORS = {
    pending:    { bg: 'rgba(255,170,0,0.15)',   color: '#ffaa00' },
    confirmed:  { bg: 'rgba(100,181,246,0.15)', color: '#64b5f6' },
    processing: { bg: 'rgba(206,147,216,0.15)', color: '#ce93d8' },
    shipped:    { bg: 'rgba(77,182,172,0.15)',  color: '#4db6ac' },
    delivered:  { bg: 'rgba(76,175,80,0.15)',   color: '#4caf50' },
    cancelled:  { bg: 'rgba(255,77,77,0.15)',   color: '#ff4d4d' },
};

const fmt     = (n)  => '₹' + Number(n || 0).toLocaleString();
const fmtDate = (d)  => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const shortId = (id) => (id || '').toString().slice(-6).toUpperCase();

/* ── DEMO SEED (shown if no real orders yet) ── */
const DEMO_ORDERS = [
    {
        _id: 'DEMO-001', status: 'pending', paymentStatus: 'paid', createdAt: new Date('2026-03-10').toISOString(),
        customerName: 'Customer', customerEmail: 'hidden', shippingAddress: 'Protected', phone: 'Protected',
        items: [{ productName: 'Sony A7 IV', quantity: 1, price: 187400, vendorEmail: '' }],
        totalAmount: 187400, paymentMethod: 'Credit Card',
    },
    {
        _id: 'DEMO-002', status: 'shipped', paymentStatus: 'paid', createdAt: new Date('2026-03-11').toISOString(),
        customerName: 'Customer', customerEmail: 'hidden', shippingAddress: 'Protected', phone: 'Protected',
        items: [{ productName: 'Canon EOS R5', quantity: 2, price: 219800, vendorEmail: '' }],
        totalAmount: 439600, paymentMethod: 'UPI', tracking: { courier: 'DHL', trackingId: 'DHL12345678', deliveryDate: '2026-03-14' },
    },
    {
        _id: 'DEMO-003', status: 'delivered', paymentStatus: 'paid', createdAt: new Date('2026-03-09').toISOString(),
        customerName: 'Customer', customerEmail: 'hidden', shippingAddress: 'Protected', phone: 'Protected',
        items: [{ productName: 'Nikon D850', quantity: 1, price: 224900, vendorEmail: '' }],
        totalAmount: 224900, paymentMethod: 'Net Banking',
    },
];

/* ── Invoice printer ── */
function printInvoice(order) {
    const html = `
        <html><head><title>Invoice #${shortId(order._id)}</title>
        <style>body{font-family:sans-serif;padding:40px;color:#111}h1{color:#d4af37}table{width:100%;border-collapse:collapse;margin-top:16px}td,th{border:1px solid #ddd;padding:8px 12px;text-align:left}th{background:#f5f5f5}.total{font-size:1.2rem;font-weight:700;color:#4caf50;text-align:right;margin-top:16px}</style></head>
        <body>
            <h1>🎯 LensCraft Invoice</h1>
            <p><strong>Order ID:</strong> #${shortId(order._id)}</p>
            <p><strong>Date:</strong> ${fmtDate(order.createdAt)}</p>
            <p><strong>Customer:</strong> Customer</p>
            <h3>Items</h3>
            <table><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>
            ${(order.items || []).map(i => `<tr><td>${i.productName}</td><td>${i.quantity}</td><td>${fmt(i.price)}</td><td>${fmt(i.price * i.quantity)}</td></tr>`).join('')}
            </tbody></table>
            <p class="total">Grand Total: ${fmt(order.totalAmount)}</p>
            <p><strong>Payment:</strong> ${order.paymentMethod || 'Online'} · ${order.paymentStatus || 'Paid'}</p>
        </body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.print();
}

// ── Main Component ──────────────────────────────────────────────
const VendorOrders = () => {
    const [orders, setOrders]         = useState([]);
    const [loading, setLoading]       = useState(true);
    const [filter, setFilter]         = useState('all');
    const [search, setSearch]         = useState('');
    const [selected, setSelected]     = useState(null);       // order detail modal
    const [newOrderOpen, setNew]      = useState(false);
    const [notifications, setNotifs]  = useState([
        { id: 1, msg: '📦 New order received: DEMO-001', read: false },
        { id: 2, msg: '💳 Payment received for DEMO-002', read: false },
    ]);
    const [showNotifs, setShowNotifs] = useState(false);
    // Shipping state per order
    const [shipping, setShipping]     = useState({});
    // New demo order form
    const [nf, setNf]                 = useState({ product: '', customer: '', qty: 1, price: '', address: '' });

    useEffect(() => {
        fetchVendorOrders()
            .then(data => setOrders(data.length ? data : DEMO_ORDERS))
            .catch(() => setOrders(DEMO_ORDERS))
            .finally(() => setLoading(false));
    }, []);

    /* Filter + search */
    const displayed = orders.filter(o => {
        if (filter !== 'all' && o.status !== filter) return false;
        if (search) {
            const q = search.toLowerCase();
            return (o._id || '').toLowerCase().includes(q) ||
                   (o.items || []).some(i => (i.productName || '').toLowerCase().includes(q));
        }
        return true;
    });

    /* Stats */
    const stat = (st) => orders.filter(o => o.status === st).length;
    const revenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.totalAmount || 0), 0);

    /* Status change */
    const handleStatus = async (orderId, status) => {
        await updateOrderStatus(orderId, status);
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
        if (selected?._id === orderId) setSelected(prev => ({ ...prev, status }));
        if (status === 'cancelled') {
            setNotifs(prev => [{ id: Date.now(), msg: `❌ Order #${shortId(orderId)} cancelled`, read: false }, ...prev]);
        }
    };

    /* Save shipping info */
    const saveShipping = (orderId) => {
        const info = shipping[orderId];
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, tracking: info } : o));
        if (selected?._id === orderId) setSelected(prev => ({ ...prev, tracking: info }));
        alert('✅ Shipping info saved!');
    };

    /* Create new order — persisted to localStorage via placeOrder() */
    const createDemoOrder = async () => {
        if (!nf.product || !nf.customer || !nf.price) return alert('Fill all required fields.');
        const total = Number(nf.price) * Number(nf.qty);
        try {
            const { order } = await placeOrder({
                items: [{
                    productName: nf.product,
                    productId:   'manual-' + Date.now(),
                    vendorEmail: '',
                    vendorName:  'Vendor',
                    price:       Number(nf.price),
                    quantity:    Number(nf.qty),
                }],
                totalAmount:     total,
                shippingAddress: nf.address || 'Not provided',
                paymentStatus:   'paid',
                customerName:    nf.customer,
                paymentMethod:   'Manual Entry',
            });
            // placeOrder stores in ls_orders; now update local UI state too
            setOrders(prev => [order, ...prev]);
            setNotifs(prev => [{ id: Date.now(), msg: `📦 New order placed for ${nf.product}`, read: false }, ...prev]);
            setNf({ product: '', customer: '', qty: 1, price: '', address: '' });
            setNew(false);
        } catch (e) {
            alert('Failed to create order: ' + (e.message || 'Please try again.'));
        }
    };

    const unread = notifications.filter(n => !n.read).length;

    const FILTERS = ['all','pending','confirmed','processing','shipped','delivered','cancelled'];

    return (
        <DashboardLayout title="Order Management" sidebarLinks={vendorLinks} userRole="Vendor">

            {/* ── Top bar ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ margin: 0 }}>Order Management</h2>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>

                    {/* 🔔 Notification bell */}
                    <div style={{ position: 'relative' }}>
                        <button onClick={() => setShowNotifs(p => !p)}
                            style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '9px 14px', cursor: 'pointer', color: 'var(--text-main)', position: 'relative', fontSize: '1.1rem' }}>
                            🔔
                            {unread > 0 && (
                                <span style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', borderRadius: '50%', background: '#ff4d4d' }} />
                            )}
                        </button>
                        {showNotifs && (
                            <div style={{ position: 'absolute', right: 0, top: '48px', width: '300px', background: 'var(--secondary)', border: '1px solid var(--glass-border)', borderRadius: '10px', zIndex: 999, padding: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
                                <div style={{ fontWeight: '700', fontSize: '0.82rem', marginBottom: '10px', opacity: 0.7, letterSpacing: '1px' }}>NOTIFICATIONS</div>
                                {notifications.length === 0 && <p style={{ opacity: 0.5, fontSize: '0.85rem' }}>No notifications</p>}
                                {notifications.map(n => (
                                    <div key={n.id} onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                                        style={{ padding: '10px', borderRadius: '6px', background: n.read ? 'transparent' : 'rgba(212,175,55,0.08)', cursor: 'pointer', marginBottom: '4px', fontSize: '0.83rem' }}>
                                        {n.msg}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ➕ New Order button */}
                    <button className="premium-button" style={{ padding: '10px 20px', fontSize: '0.82rem' }} onClick={() => setNew(true)}>
                        + NEW ORDER
                    </button>
                </div>
            </div>

            {/* ── Stats ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '14px', marginBottom: '26px' }}>
                {[
                    { label: 'Total Orders', value: orders.length,   color: 'var(--accent)' },
                    { label: 'Pending',      value: stat('pending'),  color: '#ffaa00' },
                    { label: 'Shipped',      value: stat('shipped'),  color: '#4db6ac' },
                    { label: 'Delivered',    value: stat('delivered'),color: '#4caf50' },
                    { label: 'Revenue',      value: fmt(revenue),     color: 'var(--accent)' },
                ].map((s, i) => (
                    <div key={i} className="glass-morphism" style={{ padding: '18px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: '700', color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.72rem', opacity: 0.6, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* ── Filter tabs + Search ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '4px', background: 'var(--glass)', borderRadius: '8px', padding: '4px' }}>
                    {FILTERS.map(f => (
                        <button key={f} onClick={() => setFilter(f)} style={{
                            padding: '7px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                            fontWeight: '600', fontSize: '0.75rem', textTransform: 'capitalize', letterSpacing: '0.3px',
                            background: filter === f ? 'var(--accent)' : 'transparent',
                            color: filter === f ? '#000' : 'var(--text-main)',
                            transition: 'all 0.2s',
                        }}>
                            {f === 'all' ? `All (${orders.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${stat(f)})`}
                        </button>
                    ))}
                </div>
                <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="🔍 Search by order ID or product..."
                    style={{ padding: '10px 16px', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', borderRadius: '8px', fontSize: '0.85rem', outline: 'none', width: '300px' }}
                />
            </div>

            {/* ── Loading ── */}
            {loading && <div style={{ textAlign: 'center', padding: '60px', opacity: 0.6 }}>⏳ Loading orders...</div>}

            {/* ── Orders Table ── */}
            {!loading && (
                <div className="glass-morphism" style={{ padding: '24px' }}>
                    {displayed.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '50px', opacity: 0.5 }}>
                            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
                            <p>No orders match your filter.</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)', opacity: 0.7 }}>
                                    {['Order ID','Product','Qty','Total','Payment','Status','Date','Actions'].map(h => (
                                        <th key={h} style={{ padding: '12px 10px', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {displayed.map(order => {
                                    const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                                    const firstItem = (order.items || [])[0] || {};
                                    const totalQty  = (order.items || []).reduce((s, i) => s + (i.quantity || 0), 0);
                                    return (
                                        <tr key={order._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            <td style={{ padding: '13px 10px', color: 'var(--accent)', fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: '700' }}>
                                                #ORD{shortId(order._id)}
                                            </td>
                                            <td style={{ padding: '13px 10px', fontWeight: '600', fontSize: '0.85rem', maxWidth: '140px' }}>
                                                {firstItem.productName || '—'}
                                                {order.items?.length > 1 && <span style={{ opacity: 0.5, fontSize: '0.73rem' }}> +{order.items.length - 1} more</span>}
                                            </td>
                                            <td style={{ padding: '13px 10px', textAlign: 'center' }}>{totalQty}</td>
                                            <td style={{ padding: '13px 10px', fontWeight: '700', color: 'var(--accent)' }}>{fmt(order.totalAmount)}</td>
                                            <td style={{ padding: '13px 10px', fontSize: '0.8rem', opacity: 0.7 }}>
                                                <span>💳 {order.paymentMethod || 'Online'}</span>
                                                <br/>
                                                <span style={{ fontSize: '0.7rem', color: order.paymentStatus === 'paid' ? '#4caf50' : '#ffaa00' }}>
                                                    {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '13px 10px' }}>
                                                {/* Inline status changer */}
                                                <select
                                                    value={order.status}
                                                    onChange={e => handleStatus(order._id, e.target.value)}
                                                    style={{ padding: '4px 8px', borderRadius: '20px', border: `1px solid ${sc.color}`, background: sc.bg, color: sc.color, fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer', outline: 'none' }}
                                                >
                                                    {STATUS_FLOW.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td style={{ padding: '13px 10px', fontSize: '0.78rem', opacity: 0.6 }}>{fmtDate(order.createdAt)}</td>
                                            <td style={{ padding: '13px 10px' }}>
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                    <button onClick={() => setSelected(order)}
                                                        style={{ padding: '5px 10px', background: 'rgba(212,175,55,0.12)', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700' }}>
                                                        VIEW
                                                    </button>
                                                    <button onClick={() => printInvoice(order)}
                                                        style={{ padding: '5px 10px', background: 'rgba(100,181,246,0.1)', border: '1px solid #64b5f6', color: '#64b5f6', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700' }}>
                                                        INVOICE
                                                    </button>
                                                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                                        <button onClick={() => { if(window.confirm('Cancel this order?')) handleStatus(order._id, 'cancelled'); }}
                                                            style={{ padding: '5px 10px', background: 'rgba(255,77,77,0.1)', border: 'none', color: '#ff4d4d', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700' }}>
                                                            CANCEL
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════
                ORDER DETAIL MODAL
            ══════════════════════════════════════════ */}
            {selected && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '40px 20px', backdropFilter: 'blur(4px)' }}>
                    <div className="glass-morphism" style={{ width: '100%', maxWidth: '720px', borderRadius: '18px', padding: '36px', position: 'relative' }}>
                        {/* Close */}
                        <button onClick={() => setSelected(null)}
                            style={{ position: 'absolute', top: '18px', right: '18px', background: 'rgba(255,77,77,0.1)', border: 'none', color: '#ff4d4d', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}>
                            ✕ Close
                        </button>

                        <h3 style={{ marginBottom: '22px' }}>📋 Order Details — #ORD{shortId(selected._id)}</h3>

                        {/* ── Status timeline ── */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '4px' }}>
                            {STATUS_FLOW.map((s, i) => {
                                const idx = STATUS_FLOW.indexOf(selected.status);
                                const done = i <= idx && selected.status !== 'cancelled';
                                const isCur = s === selected.status;
                                return (
                                    <React.Fragment key={s}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: '800', background: done ? 'var(--accent)' : 'var(--glass)', border: `2px solid ${done ? 'var(--accent)' : 'var(--glass-border)'}`, color: done ? '#000' : 'var(--text-main)' }}>
                                                {done && !isCur ? '✓' : i + 1}
                                            </div>
                                            <div style={{ fontSize: '0.62rem', opacity: isCur ? 1 : 0.45, fontWeight: isCur ? '700' : '400', textTransform: 'capitalize' }}>{s}</div>
                                        </div>
                                        {i < STATUS_FLOW.length - 1 && <div style={{ flex: 1, height: '2px', background: done && i < idx ? 'var(--accent)' : 'var(--glass-border)', minWidth: '16px', marginBottom: '18px' }} />}
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            {/* Customer Info */}
                            <div style={{ padding: '18px', background: 'var(--glass)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, marginBottom: '12px' }}>👤 Customer</div>
                                <div style={{ fontWeight: '700', marginBottom: '4px' }}>Customer</div>
                                <div style={{ fontSize: '0.82rem', opacity: 0.7, fontStyle: 'italic' }}>Details accessible only to admin</div>
                            </div>

                            {/* Payment Info */}
                            <div style={{ padding: '18px', background: 'var(--glass)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, marginBottom: '12px' }}>💳 Payment</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ opacity: 0.7 }}>Method</span>
                                    <strong>{selected.paymentMethod || 'Online'}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ opacity: 0.7 }}>Amount</span>
                                    <strong style={{ color: 'var(--accent)' }}>{fmt(selected.totalAmount)}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ opacity: 0.7 }}>Status</span>
                                    <span style={{ color: '#4caf50', fontWeight: '700' }}>✅ {selected.paymentStatus || 'Paid'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Products */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, marginBottom: '12px' }}>📦 Products</div>
                            {(selected.items || []).map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--glass)', borderRadius: '8px', marginBottom: '8px', border: '1px solid var(--glass-border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{ width: '46px', height: '46px', borderRadius: '8px', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📸</div>
                                        <div>
                                            <div style={{ fontWeight: '700', marginBottom: '2px' }}>{item.productName}</div>
                                            <div style={{ fontSize: '0.78rem', opacity: 0.6 }}>Qty: {item.quantity}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: '700', color: 'var(--accent)' }}>{fmt(item.price * item.quantity)}</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{fmt(item.price)} each</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Update Status */}
                        <div style={{ marginBottom: '24px', padding: '18px', background: 'var(--glass)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, marginBottom: '12px' }}>⚙️ Actions</div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {selected.status === 'confirmed' && (
                                    <button onClick={() => handleStatus(selected._id, 'processing')}
                                        style={{ padding: '8px 20px', borderRadius: '20px', border: '1px solid #ce93d8', background: '#ce93d8', color: '#000', cursor: 'pointer', fontWeight: '700', fontSize: '0.78rem' }}>
                                        Mark as Ready for Pickup
                                    </button>
                                )}
                                {['pending','confirmed','processing','shipped','delivered','cancelled'].map(s => {
                                    const sc = STATUS_COLORS[s] || STATUS_COLORS.pending;
                                    return (
                                        <button key={s} onClick={() => handleStatus(selected._id, s)}
                                            style={{
                                                padding: '8px 16px', borderRadius: '20px', border: `1px solid ${sc.color}`,
                                                background: selected.status === s ? sc.color : 'transparent',
                                                color: selected.status === s ? '#000' : sc.color,
                                                cursor: 'pointer', fontWeight: '700', fontSize: '0.78rem', textTransform: 'capitalize', transition: 'all 0.2s',
                                                opacity: selected.status === s ? 1 : 0.6
                                            }}>
                                            {s}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Update Shipping */}
                        <div style={{ marginBottom: '24px', padding: '18px', background: 'var(--glass)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, marginBottom: '12px' }}>🚚 Shipping & Tracking</div>
                            {selected.tracking && (
                                <div style={{ padding: '10px 14px', background: 'rgba(77,182,172,0.1)', border: '1px solid #4db6ac', borderRadius: '8px', marginBottom: '14px', fontSize: '0.83rem', color: '#4db6ac' }}>
                                    📦 <strong>{selected.tracking.courier}</strong> · {selected.tracking.trackingId} · ETA: {selected.tracking.deliveryDate}
                                </div>
                            )}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                {[
                                    { key: 'courier', label: 'Courier Name', placeholder: 'e.g. DHL, BlueDart' },
                                    { key: 'trackingId', label: 'Tracking ID', placeholder: 'e.g. DHL12345678' },
                                    { key: 'deliveryDate', label: 'Expected Delivery', placeholder: '', type: 'date' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label style={{ display: 'block', fontSize: '0.73rem', opacity: 0.6, marginBottom: '5px', fontWeight: '600' }}>{f.label}</label>
                                        <input type={f.type || 'text'} placeholder={f.placeholder}
                                            value={(shipping[selected._id]?.[f.key]) || (selected.tracking?.[f.key]) || ''}
                                            onChange={e => setShipping(prev => ({ ...prev, [selected._id]: { ...(prev[selected._id] || {}), [f.key]: e.target.value } }))}
                                            style={{ width: '100%', padding: '9px', background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff', borderRadius: '6px', fontSize: '0.83rem', outline: 'none' }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => saveShipping(selected._id)} className="premium-button" style={{ marginTop: '14px', padding: '9px 22px', fontSize: '0.8rem' }}>
                                🚚 Save Shipping Info
                            </button>
                        </div>

                        {/* Contact Customer Restricted */}
                        <div style={{ padding: '18px', background: 'var(--glass)', borderRadius: '12px', border: '1px solid var(--glass-border)', marginBottom: '18px' }}>
                            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, marginBottom: '12px' }}>💬 Contact Customer</div>
                            <div style={{ fontSize: '0.82rem', opacity: 0.7 }}>Contact details are restricted for vendors. Please contact admin for assistance if needed.</div>
                        </div>

                        {/* Download Invoice */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => printInvoice(selected)} className="premium-button" style={{ padding: '11px 24px', fontSize: '0.82rem' }}>
                                🖨️ Download Invoice
                            </button>
                            {selected.status !== 'cancelled' && selected.status !== 'delivered' && (
                                <button
                                    onClick={() => { const r = window.prompt('Reason for cancellation?'); if (r) handleStatus(selected._id, 'cancelled'); }}
                                    style={{ padding: '11px 24px', background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', color: '#ff4d4d', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem' }}>
                                    ✕ Cancel Order
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════
                NEW ORDER MODAL
            ══════════════════════════════════════════ */}
            {newOrderOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div className="glass-morphism" style={{ padding: '36px', width: '90%', maxWidth: '460px', borderRadius: '16px', position: 'relative' }}>
                        <button onClick={() => setNew(false)}
                            style={{ position: 'absolute', top: '18px', right: '18px', background: 'rgba(255,77,77,0.1)', border: 'none', color: '#ff4d4d', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}>
                            ✕ Close
                        </button>

                        <h3 style={{ marginBottom: '22px', color: '#fff' }}>➕ Create New Order</h3>
                        {[
                            { key: 'product',  label: 'Product Name *',    placeholder: 'e.g. Sony A7 IV' },
                            { key: 'customer', label: 'Customer Label (for reference)',   placeholder: 'e.g. Retail Customer' },
                            { key: 'qty',      label: 'Quantity',           placeholder: '1', type: 'number' },
                            { key: 'price',    label: 'Unit Price (₹) *',  placeholder: 'e.g. 187400', type: 'number' },
                            { key: 'address',  label: 'Shipping Note (Internal)',  placeholder: 'e.g. For delivery team' },
                        ].map(f => (
                            <div key={f.key} style={{ marginBottom: '14px' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.9, marginBottom: '6px', fontWeight: '600', color: '#fff', letterSpacing: '0.5px' }}>{f.label}</label>
                                <input type={f.type || 'text'} placeholder={f.placeholder} value={nf[f.key]}
                                    onChange={e => setNf(p => ({ ...p, [f.key]: e.target.value }))}
                                    style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
                                />
                            </div>
                        ))}
                        {nf.price && nf.qty && (
                            <div style={{ padding: '10px 14px', background: 'rgba(212,175,55,0.08)', border: '1px solid var(--accent)', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
                                💰 Total: <strong style={{ color: 'var(--accent)' }}>₹{(Number(nf.price) * Number(nf.qty)).toLocaleString()}</strong>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={createDemoOrder} className="premium-button" style={{ flex: 1, padding: '12px' }}>✅ Create Order</button>
                            <button onClick={() => setNew(false)} style={{ flex: 1, padding: '12px', background: 'none', border: '1px solid var(--glass-border)', color: 'var(--text-main)', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default VendorOrders;
