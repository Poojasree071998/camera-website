import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { fetchAdminTransactions, settleTransaction, refundTransaction, deleteTransaction } from '../api';

const links = [
    { label: 'Overview',      path: '/admin',               icon: '📊' },
    { label: 'Vendors',       path: '/admin/vendors',       icon: '🏪' },
    { label: 'Products',      path: '/admin/products',      icon: '📸' },
    { label: 'Orders',        path: '/admin/orders',        icon: '📜' },
    { label: 'Notifications', path: '/admin/notifications', icon: '🔔' },
    { label: 'Payments',      path: '/admin/payments',      icon: '💳' },
    { label: 'Chats',         path: '/admin/chats',         icon: '💬' },
    { label: 'Employees',         path: '/admin/users',         icon: '👤' },
    { label: 'Reports',       path: '/admin/reports',       icon: '📈' },
    { label: 'Settings',      path: '/admin/settings',      icon: '⚙️' },
];

const fmt     = (n) => '₹' + Number(n || 0).toLocaleString();
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const PaymentManagement = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            setTransactions(await fetchAdminTransactions());
        } catch (e) {
            setError(e.message || 'Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleRefund = async (id) => {
        if (!window.confirm('Are you sure you want to refund this transaction?')) return;
        try {
            await refundTransaction(id);
            setTransactions(prev => prev.map(t => t._id === id ? { ...t, paymentStatus: 'refunded' } : t));
        } catch (e) {
            alert('Refund failed: ' + (e.message || ''));
        }
    };
    
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this transaction record forever?')) return;
        try {
            await deleteTransaction(id);
            setTransactions(prev => prev.filter(t => t._id !== id));
        } catch (e) {
            alert('Delete failed: ' + (e.message || ''));
        }
    };

    // Stats
    const totalVolume   = transactions.reduce((s, t) => s + (t.grossAmount || 0), 0);
    const totalFees     = transactions.reduce((s, t) => s + (t.platformFee  || 0), 0);
    const pendingPayout = transactions.filter(t => t.paymentStatus !== 'settled').reduce((s, t) => s + (t.netAmount || 0), 0);
    const pendingCount  = transactions.filter(t => t.paymentStatus !== 'settled').length;


    return (
        <DashboardLayout title="Financial Control" sidebarLinks={links} userRole="Super Admin">
            <div className="animate-fade-in">

            {/* ── Stats ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {[
                    { label: 'Total Platform Volume', value: fmt(totalVolume),   color: 'var(--accent)' },
                    { label: 'Platform Revenue (Fees)', value: fmt(totalFees),   color: '#4caf50' },
                    { label: 'Pending Vendor Payouts', value: fmt(pendingPayout), color: '#ffaa00' },
                    { label: 'Total Transactions',     value: transactions.length, color: 'var(--text-main)' },
                ].map((s, i) => (
                    <div key={i} className="glass-morphism" style={{ padding: '15px 20px' }}>
                        <div style={{ fontSize: '0.65rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', fontWeight: '600' }}>{s.label}</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* ── Transactions Table ── */}
            <div className="glass-morphism" style={{ padding: '0px', overflow: 'hidden' }}>
                <div style={{ padding: '25px 30px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ letterSpacing: '1px', fontSize: '1.2rem' }}>ALL TRANSACTIONS</h3>
                    {pendingCount > 0 && (
                        <span style={{ padding: '6px 16px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: '800', background: 'rgba(255,170,0,0.1)', color: '#ffaa00', border: '1px solid rgba(255,170,0,0.3)' }}>
                            ⏳ {pendingCount} PENDING PAYOUTS
                        </span>
                    )}
                </div>

                {loading && <div style={{ textAlign: 'center', padding: '60px', opacity: 0.6 }}>⏳ Synchronizing data...</div>}

                {error && (
                    <div style={{ margin: '20px', color: '#ff4d4d', padding: '15px', background: 'rgba(255,77,77,0.1)', borderRadius: '12px', border: '1px solid rgba(255,77,77,0.2)' }}>
                        ⚠️ {error}
                        <button onClick={load} style={{ marginLeft: '15px', background: 'var(--accent)', border: 'none', color: '#000', padding: '5px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Retry</button>
                    </div>
                )}

                {!loading && transactions.length === 0 && !error && (
                    <div style={{ textAlign: 'center', padding: '80px', opacity: 0.5 }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>💳</div>
                        <h3>No transaction history found</h3>
                        <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>Financial records will appear here as soon as orders are placed.</p>
                    </div>
                )}

                {!loading && transactions.length > 0 && (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-main)', opacity: '0.8', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '1px' }}>
                                    <th style={{ padding: '20px 25px', width: '80px' }}>REG NO</th>
                                    <th style={{ padding: '20px' }}>Product</th>
                                    <th style={{ padding: '20px', width: '130px' }}>Vendor</th>
                                    <th style={{ padding: '20px', width: '100px' }}>Gross</th>
                                    <th style={{ padding: '20px', width: '100px' }}>Net</th>
                                    <th style={{ padding: '20px 20px', width: '110px' }}>Date</th>
                                    <th style={{ padding: '20px 20px', width: '120px' }}>Status</th>
                                    <th style={{ padding: '20px 25px', width: '200px', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((t, index) => {
                                    const settled = t.paymentStatus === 'settled';
                                    return (
                                        <tr key={t._id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.3s' }}>
                                            <td style={{ padding: '15px 25px', color: 'var(--accent)', fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: '700' }}>
                                                {index + 1}
                                            </td>
                                            <td style={{ padding: '15px 20px', fontSize: '0.85rem', fontWeight: '600' }}>{t.productName}</td>
                                            <td style={{ padding: '15px 20px', fontSize: '0.82rem', opacity: 0.7 }}>
                                                {t.vendorName || (t.vendorId?.name) || 'Demo Vendor'}
                                            </td>
                                            <td style={{ padding: '15px 20px', fontWeight: '700', opacity: 0.6, fontSize: '0.85rem' }}>{fmt(t.grossAmount)}</td>
                                            <td style={{ padding: '15px 20px', color: '#4caf50', fontWeight: '900', fontSize: '0.9rem' }}>{fmt(t.netAmount)}</td>
                                            <td style={{ padding: '15px 20px', opacity: 0.6, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{fmtDate(t.createdAt)}</td>
                                            <td style={{ padding: '15px 20px' }}>
                                                <span style={{ 
                                                    fontSize: '0.75rem', fontWeight: '700', 
                                                    color: t.paymentStatus === 'refunded' ? '#ef4444' : (settled ? '#4caf50' : '#ffaa00'), 
                                                }}>
                                                    {t.paymentStatus === 'refunded' ? 'REFUNDED' : (settled ? 'SETTLED' : 'PENDING')}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px 25px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button 
                                                        onClick={() => console.log('Edit', t._id)} 
                                                        style={{ 
                                                            padding: '6px 14px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '800',
                                                            background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)',
                                                            cursor: 'pointer', transition: 'all 0.2s'
                                                        }}
                                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(59,130,246,0.2)'}
                                                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
                                                    >EDIT</button>
                                                    
                                                    <button 
                                                        onClick={() => handleRefund(t._id)} 
                                                        disabled={t.paymentStatus === 'refunded'}
                                                        style={{ 
                                                            padding: '6px 14px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '800',
                                                            background: 'rgba(255,170,0,0.1)', color: '#ffaa00', border: '1px solid rgba(255,170,0,0.3)',
                                                            cursor: t.paymentStatus === 'refunded' ? 'not-allowed' : 'pointer', 
                                                            transition: 'all 0.2s',
                                                            opacity: t.paymentStatus === 'refunded' ? 0.4 : 1
                                                        }}
                                                        onMouseOver={(e) => t.paymentStatus !== 'refunded' && (e.currentTarget.style.background = 'rgba(255,170,0,0.2)')}
                                                        onMouseOut={(e) => t.paymentStatus !== 'refunded' && (e.currentTarget.style.background = 'rgba(255,170,0,0.1)')}
                                                    >REFUND</button>
                                                    
                                                    <button 
                                                        onClick={() => handleDelete(t._id)} 
                                                        style={{ 
                                                            padding: '6px 14px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '800',
                                                            background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.3)',
                                                            cursor: 'pointer', transition: 'all 0.2s'
                                                        }}
                                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,77,77,0.2)'}
                                                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,77,77,0.1)'}
                                                    >DELETE</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            </div>
        </DashboardLayout>
    );
};

export default PaymentManagement;
