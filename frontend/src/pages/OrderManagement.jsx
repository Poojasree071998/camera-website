import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { fetchAllOrders, updateOrderStatus, fetchTechnicians, assignTechnician, fetchAllServiceRequests, updateServiceStatus, addNotification } from '../api';

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

/* ── Demo fallback data is now managed in api.js ── */

const STATUS_COLORS = {
    pending:    { bg: 'rgba(255,170,0,0.15)',   color: '#ffaa00' },
    assigned:   { bg: 'rgba(129,140,248,0.15)', color: '#818cf8' },
    confirmed:  { bg: 'rgba(100,181,246,0.15)', color: '#64b5f6' },
    processing: { bg: 'rgba(206,147,216,0.15)', color: '#ce93d8' },
    shipped:    { bg: 'rgba(77,182,172,0.15)',  color: '#4db6ac' },
    delivered:  { bg: 'rgba(76,175,80,0.15)',   color: '#4caf50' },
    cancelled:  { bg: 'rgba(255,77,77,0.15)',   color: '#ff4d4d' },
};

const fmt     = (n) => '₹' + Number(n || 0).toLocaleString();
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const shortId = (id) => (id || '').toString().slice(-6).toUpperCase();
const ALL_STATUSES = ['all', 'pending', 'assigned', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const OrderManagement = () => {
    const [orders, setOrders]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter]   = useState('all');
    const [searchType, setSearchType] = useState('all');
    const [search, setSearch]   = useState('');
    const [selected, setSelected] = useState(null);
    const [partners, setPartners] = useState([]);
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'services'
    const [services, setServices] = useState([]);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        fetchTechnicians().then(setPartners);
    }, []);

    useEffect(() => {
        fetchAllOrders()
            .then(data => setOrders(data))
            .catch(() => setOrders([]))
            .finally(() => setLoading(false));
            
        fetchAllServiceRequests().then(setServices);
    }, []);

    const displayed = orders.filter(o => {
        if (filter !== 'all' && o.status !== filter) return false;
        if (search) {
            const q = search.toLowerCase();
            const cName = o.customer?.name || o.customerName || '';
            const custMatch = cName.toLowerCase().includes(q);
            
            const vMatch = (o.vendorName || '').toLowerCase().includes(q) || 
                           (o.items || []).some(i => (i.vendor?.name || i.vendorName || '').toLowerCase().includes(q));

            if (searchType === 'customer') {
                return custMatch;
            } else if (searchType === 'vendor') {
                return vMatch;
            } else {
                return (o._id || '').toLowerCase().includes(q) ||
                       custMatch || vMatch ||
                       (o.items || []).some(i => (i.product?.name || i.productName || '').toLowerCase().includes(q));
            }
        }
        return true;
    });

    const count = (st) => orders.filter(o => o.status === st).length;
    const revenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.totalAmount || 0), 0);

    const handleStatus = async (orderId, status) => {
        await updateOrderStatus(orderId, status);
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
        if (selected?._id === orderId) setSelected(p => ({ ...p, status }));
    };

    const handleAssign = async (orderId, partner) => {
        console.log(`Assigning Order ${orderId} to ${partner.email}`);
        try {
            const res = await assignTechnician(orderId, partner.email, partner.name);
            console.log('Assignment response:', res);
            if (res.ok) {
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'assigned', deliveryPartnerName: partner.name } : o));
                setMsg({ type: 'success', text: `Order assigned to ${partner.name}` });
                setSelected(null); // Close modal
                setTimeout(() => setMsg(null), 3000);
            } else {
                setMsg({ type: 'error', text: res.message || 'Failed to assign technician' });
            }
        } catch (error) {
            console.error('Assignment Error:', error);
            setMsg({ type: 'error', text: 'Failed to assign technician' });
        }
    };

    const handleServiceAssign = async (serviceId, partner) => {
        console.log(`Assigning Service ${serviceId} to ${partner.email}`);
        try {
            const res = await updateServiceStatus(serviceId, 'assigned', { techEmail: partner.email, techName: partner.name });
            console.log('Service Assignment response:', res);
            if (res.ok) {
                addNotification('Technician', `New Service Assigned: ${selected.serviceName}`, partner.email);
                setServices(prev => prev.map(s => s._id === serviceId ? { ...s, status: 'assigned', techName: partner.name, techEmail: partner.email } : s));
                setMsg({ type: 'success', text: `Service assigned to ${partner.name}` });
                setSelected(null); // Close modal
                setTimeout(() => setMsg(null), 3000);
            } else {
                setMsg({ type: 'error', text: res.message || 'Failed to assign technician' });
            }
        } catch (error) {
            console.error('Service Assignment Error:', error);
            setMsg({ type: 'error', text: 'Failed to assign technician' });
        }
    };

    return (
        <DashboardLayout title="Order Management" sidebarLinks={links} userRole="Super Admin">
            <div className="animate-fade-in" style={{ position: 'relative' }}>
                {msg && (
                    <div style={{
                        position: 'fixed', top: '20px', right: '20px', padding: '15px 25px', borderRadius: '10px',
                        background: msg.type === 'success' ? 'var(--success)' : '#ff4d4d', color: '#fff',
                        zIndex: 100000, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', fontWeight: 'bold'
                    }} className="animate-fade-in">
                        {msg.type === 'success' ? '✅' : '❌'} {msg.text}
                    </div>
                )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                {[
                    { label: 'All Orders',   value: orders.length,         color: '#818cf8' },
                    { label: 'Pending',      value: count('pending'),     color: '#ffaa00' },
                    { label: 'Shipped',      value: count('shipped'),     color: '#4db6ac' },
                    { label: 'Delivered',    value: count('delivered'),   color: '#4caf50' },
                    { label: 'Revenue',      value: fmt(revenue),         color: 'var(--accent)' },
                ].map((s, i) => (
                    <div key={i} className="glass-morphism" style={{ padding: '15px 10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="glass-morphism" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '25px', borderBottom: '1px solid var(--glass-border)', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <button 
                            onClick={() => setActiveTab('orders')}
                            style={{ background: activeTab === 'orders' ? 'var(--accent)' : 'var(--glass)', color: activeTab === 'orders' ? '#000' : 'var(--text-main)', padding: '10px 25px', borderRadius: '8px', border: activeTab === 'orders' ? 'none' : '1px solid var(--glass-border)', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s' }}
                        >
                            📦 Product Orders
                        </button>
                        <button 
                            onClick={() => setActiveTab('services')}
                            style={{ background: activeTab === 'services' ? 'var(--accent)' : 'var(--glass)', color: activeTab === 'services' ? '#000' : 'var(--text-main)', padding: '10px 25px', borderRadius: '8px', border: activeTab === 'services' ? 'none' : '1px solid var(--glass-border)', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s' }}
                        >
                            🔧 Service Requests {services.filter(s => s.status === 'pending').length > 0 && <span style={{ background: '#ff4d4d', color: '#fff', padding: '2px 6px', borderRadius: '50%', fontSize: '0.7rem', marginLeft: '5px' }}>{services.filter(s => s.status === 'pending').length}</span>}
                        </button>
                    </div>

                    {activeTab === 'orders' && (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', gap: '4px', background: 'var(--glass)', borderRadius: '8px', padding: '4px', flexWrap: 'wrap' }}>
                                {ALL_STATUSES.slice(0, 5).map(f => (
                                    <button key={f} onClick={() => setFilter(f)} style={{
                                        padding: '7px 13px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                        fontWeight: '600', fontSize: '0.73rem', textTransform: 'capitalize',
                                        background: filter === f ? 'var(--accent)' : 'transparent',
                                        color: filter === f ? '#000' : 'var(--text-main)', transition: 'all 0.2s',
                                    }}>
                                        {f === 'all' ? `All` : f}
                                    </button>
                                ))}
                            </div>
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search orders..."
                                style={{ padding: '9px 14px', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', borderRadius: '8px', fontSize: '0.85rem', outline: 'none', width: '200px' }}
                            />
                        </div>
                    )}
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'auto' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-main)', opacity: '0.8', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '1px' }}>
                                <th style={{ padding: '20px 25px', width: '80px' }}>ID</th>
                                <th style={{ padding: '20px 20px' }}>{activeTab === 'orders' ? 'Product' : 'Service Type'}</th>
                                <th style={{ padding: '20px 20px', width: '160px' }}>Vendor</th>
                                <th style={{ padding: '20px 20px', width: '120px' }}>Amount</th>
                                <th style={{ padding: '20px 20px', width: '110px' }}>Payment</th>
                                <th style={{ padding: '20px 20px', width: '140px' }}>Status</th>
                                <th style={{ padding: '20px 20px', width: '140px' }}>Date</th>
                                <th style={{ padding: '20px 25px', width: '140px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeTab === 'orders' ? (
                                displayed.length === 0 ? (
                                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '50px', opacity: 0.5 }}>📭 No orders found.</td></tr>
                                ) : (
                                    displayed.map(order => {
                                        const isActiveWork = ['assigned', 'confirmed', 'processing', 'shipped', 'in-progress', 'on-the-way'].includes(order.status);
                                        const isCompleted = ['delivered', 'completed'].includes(order.status);
                                        return (
                                            <tr key={order._id} style={{ borderBottom: '1px solid var(--glass-border)', background: isActiveWork ? 'rgba(255,77,77,0.01)' : isCompleted ? 'rgba(76,175,80,0.01)' : 'transparent' }}>
                                                <td style={{ padding: '15px 25px', color: 'var(--accent)', fontWeight: '700', fontSize: '0.78rem' }}>#{order._id.slice(-4).toUpperCase()}</td>
                                                <td style={{ padding: '15px 20px' }}>
                                                    <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.85rem' }}>{order.items?.[0]?.productName || 'Demo Item'}</div>
                                                    {order.items?.length > 1 && <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>+{order.items.length - 1} more</div>}
                                                </td>
                                                <td style={{ padding: '15px 20px', fontSize: '0.82rem', opacity: 0.8 }}>
                                                    {order.items?.[0]?.vendorName || 'Demo Vendor'}
                                                </td>
                                                <td style={{ padding: '15px 20px', fontWeight: '700', color: 'var(--text-main)', fontSize: '0.85rem' }}>{fmt(order.totalAmount)}</td>
                                                <td style={{ padding: '15px 20px' }}>
                                                    <span style={{ fontSize: '0.72rem', fontWeight: '700', color: order.paymentStatus === 'paid' ? '#4caf50' : '#ffaa00' }}>
                                                        {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '15px 20px' }}>
                                                    <select value={order.status} onChange={e => handleStatus(order._id, e.target.value)}
                                                        style={{ 
                                                            padding: '5px 10px', borderRadius: '20px', 
                                                            border: `1px solid ${isActiveWork ? '#ff4d4d' : isCompleted ? '#4caf50' : 'var(--glass-border)'}`, 
                                                            background: 'var(--secondary)', 
                                                            color: isActiveWork ? '#ff4d4d' : isCompleted ? '#4caf50' : 'var(--text-main)', 
                                                            fontWeight: '700', fontSize: '0.7rem', cursor: 'pointer', outline: 'none' 
                                                        }}>
                                                        {['pending','assigned','confirmed','processing','shipped','delivered','cancelled'].map(s => (
                                                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td style={{ padding: '15px 20px', color: 'var(--text-dim)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{fmtDate(order.createdAt)}</td>
                                                <td style={{ padding: '15px 25px', textAlign: 'right' }}>
                                                    <button 
                                                        onClick={() => setSelected(order)} 
                                                        className="premium-button" 
                                                        style={{ 
                                                            padding: '6px 14px', fontSize: '0.65rem',
                                                            opacity: order.status === 'assigned' ? 0.6 : 1,
                                                            background: order.status === 'assigned' ? 'var(--secondary)' : 'var(--accent)',
                                                            color: order.status === 'assigned' ? 'var(--text-main)' : '#000'
                                                        }}
                                                    >
                                                        {order.status === 'assigned' ? 'REASSIGN' : 'ASSIGN TECH'}
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )
                            ) : (
                                services.length === 0 ? (
                                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '50px', opacity: 0.5 }}>📭 No service requests.</td></tr>
                                ) : (
                                    services.map(service => {
                                        const isActive = ['assigned', 'confirmed', 'in-progress'].includes(service.status);
                                        const isDone = service.status === 'completed';
                                        return (
                                            <tr key={service._id} style={{ borderBottom: '1px solid var(--glass-border)', background: isActive ? 'rgba(255,77,77,0.01)' : isDone ? 'rgba(76,175,80,0.01)' : 'transparent' }}>
                                                <td style={{ padding: '15px 25px', color: 'var(--accent)', fontWeight: '700', fontSize: '0.78rem' }}>#{service._id.slice(-4).toUpperCase()}</td>
                                                <td style={{ padding: '15px 20px', fontWeight: '600', fontSize: '0.85rem' }}>{service.serviceName}</td>
                                                <td style={{ padding: '15px 20px', fontSize: '0.82rem', opacity: 0.8 }}>Platform</td>
                                                <td style={{ padding: '15px 20px', fontWeight: '700', color: 'var(--text-main)' }}>-</td>
                                                <td style={{ padding: '15px 20px' }}>
                                                    <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#4caf50' }}>✅ Paid</span>
                                                </td>
                                                <td style={{ padding: '15px 20px' }}>
                                                    <span style={{ 
                                                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 'bold',
                                                        background: 'var(--secondary)',
                                                        color: isActive ? '#ff4d4d' : isDone ? '#4caf50' : 'var(--text-main)',
                                                        border: `1px solid ${isActive ? '#ff4d4d' : isDone ? '#4caf50' : 'var(--glass-border)'}`
                                                    }}>{service.status.toUpperCase()}</span>
                                                </td>
                                                <td style={{ padding: '15px 20px', color: 'var(--text-dim)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{fmtDate(service.createdAt)}</td>
                                                 <td style={{ padding: '15px 25px', textAlign: 'right' }}>
                                                    <button 
                                                        onClick={() => setSelected({ ...service, isService: true })} 
                                                        className="premium-button" 
                                                        style={{ 
                                                            padding: '6px 14px', fontSize: '0.65rem',
                                                            opacity: service.status === 'assigned' ? 0.6 : 1,
                                                            background: service.status === 'assigned' ? 'var(--secondary)' : 'var(--accent)',
                                                            color: service.status === 'assigned' ? 'var(--text-main)' : '#000'
                                                        }}
                                                    >
                                                        {service.status === 'assigned' ? 'REASSIGN' : 'ASSIGN TECH'}
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Detail/Assignment Modal ── */}
            {selected && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', padding: '20px' }}>
                    <div className="glass-morphism animate-fade-in" style={{ width: '100%', maxWidth: '550px', padding: '30px', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.7)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                        
                        <h3 className="text-gradient" style={{ marginBottom: '25px' }}>
                            {selected.isService ? '🔧 Assign Technician' : '📦 Assign Delivery'}
                        </h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                            <div style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '5px' }}>CUSTOMER</div>
                                <div style={{ fontWeight: '700' }}>{selected.customerName}</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{selected.customerEmail || 'N/A'}</div>
                            </div>
                            <div style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '5px' }}>{selected.isService ? 'SERVICE' : 'AMOUNT'}</div>
                                <div style={{ fontWeight: '700', color: 'var(--accent)' }}>{selected.isService ? selected.serviceName : fmt(selected.totalAmount)}</div>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '15px' }}>Available Personnel</div>
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {partners.length > 0 ? partners.map(p => (
                                    <button 
                                        key={p.email} 
                                        onClick={() => selected.isService ? handleServiceAssign(selected._id, p) : handleAssign(selected._id, p)}
                                        style={{ 
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '12px 18px', borderRadius: '10px', background: 'var(--secondary)', 
                                            border: '1px solid var(--glass-border)', color: 'var(--text-main)', 
                                            cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
                                        }}
                                        onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                                        onMouseOut={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                                    >
                                        <div>
                                            <div style={{ fontWeight: '700' }}>{p.name}</div>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{p.role.toUpperCase()}</div>
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: '800' }}>ASSIGN →</div>
                                    </button>
                                )) : <div style={{ textAlign: 'center', padding: '20px', opacity: 0.5 }}>No employees available</div>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </DashboardLayout>
    );
};

export default OrderManagement;
