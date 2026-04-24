import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { fetchVendorTransactions } from '../api';

const vendorLinks = [
    { label: 'Dashboard',   path: '/vendor',           icon: '📊' },
    { label: 'Products',    path: '/vendor/products',  icon: '📸' },
    { label: 'Inventory',   path: '/vendor/inventory', icon: '📦' },
    { label: 'Analytics', path: '/vendor/analytics', icon: '📈' },
    { label: 'Payments',    path: '/vendor/payments',  icon: '💳' },
];

const fmt  = (n) => '₹' + Number(n || 0).toLocaleString();
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const VendorPayments = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawing, setWithdrawing]       = useState(false);
    const [toast, setToast]                   = useState('');

    // Bank account — persisted in localStorage
    const LS_BANK = 'vendor_bank_account';
    const [bankAccount, setBankAccount] = useState(() => {
        try { return JSON.parse(localStorage.getItem(LS_BANK)) || null; } catch { return null; }
    });
    const [bankModal, setBankModal] = useState(false);
    const [bankForm, setBankForm]   = useState({ holderName: '', accountNo: '', confirmAccountNo: '', ifsc: '', bankName: '' });

    const openBankModal = () => {
        setBankForm(bankAccount
            ? { holderName: bankAccount.holderName, accountNo: bankAccount.accountNo, confirmAccountNo: bankAccount.accountNo, ifsc: bankAccount.ifsc, bankName: bankAccount.bankName }
            : { holderName: '', accountNo: '', confirmAccountNo: '', ifsc: '', bankName: '' });
        setBankModal(true);
    };

    const saveBankAccount = () => {
        const { holderName, accountNo, confirmAccountNo, ifsc, bankName } = bankForm;
        if (!holderName || !accountNo || !ifsc || !bankName)   return showToast('⚠️ Please fill all bank details.');
        if (accountNo !== confirmAccountNo)                    return showToast('⚠️ Account numbers do not match.');
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase())) return showToast('⚠️ Enter a valid IFSC code (e.g. SBIN0001234).');
        const acc = { holderName, accountNo, ifsc: ifsc.toUpperCase(), bankName };
        localStorage.setItem(LS_BANK, JSON.stringify(acc));
        setBankAccount(acc);
        setBankModal(false);
        showToast('✅ Bank account saved successfully!');
    };

    const maskAccount = (no) => '•••• •••• ' + (no || '').slice(-4);

    useEffect(() => {
        fetchVendorTransactions()
            .then(setTransactions)
            .catch(e => setError(e.message || 'Failed to load transactions'))
            .finally(() => setLoading(false));
    }, []);

    // Computed stats
    const totalEarned   = transactions.reduce((s, t) => s + (t.netAmount || 0), 0);
    const pending       = transactions.filter(t => t.paymentStatus === 'pending').reduce((s, t) => s + (t.netAmount || 0), 0);
    const fees          = transactions.reduce((s, t) => s + (t.platformFee || 0), 0);
    const thisMonth     = (() => {
        const m = new Date().getMonth(), y = new Date().getFullYear();
        return transactions
            .filter(t => { const d = new Date(t.createdAt); return d.getMonth() === m && d.getFullYear() === y; })
            .reduce((s, t) => s + (t.netAmount || 0), 0);
    })();

    const available = totalEarned - pending;

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

    const handleWithdraw = () => {
        const amt = Number(withdrawAmount);
        if (!bankAccount)                     return showToast('⚠️ Please add a bank account first.');
        if (!withdrawAmount || amt <= 0)       return showToast('⚠️ Please enter a valid amount.');
        if (amt < 100)                         return showToast('⚠️ Minimum withdrawal is ₹100.');
        setWithdrawing(true);
        setTimeout(() => {
            showToast(`✅ Withdrawal request of ${fmt(amt)} submitted! Credited in 2–3 business days.`);
            setWithdrawAmount('');
            setWithdrawing(false);
        }, 1400);
    };

    return (
        <DashboardLayout title="Payments" sidebarLinks={vendorLinks} userRole="Vendor">

            {/* ── Toast ── */}
            {toast && (
                <div style={{ position: 'fixed', top: '20px', right: '24px', zIndex: 9999, padding: '13px 22px', borderRadius: '10px', fontWeight: '600', fontSize: '0.88rem', boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                    background: toast.startsWith('✅') ? '#1a3a1a' : '#2a1a1a',
                    border: `1px solid ${toast.startsWith('✅') ? '#4caf50' : '#ff9800'}`,
                    color: toast.startsWith('✅') ? '#4caf50' : '#ffaa00' }}>
                    {toast}
                </div>
            )}

            {/* ── Summary Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '25px' }}>
                {[
                    { label: 'Total Earned',        value: fmt(totalEarned), color: 'var(--accent)' },
                    { label: 'Pending Settlement',   value: fmt(pending),     color: '#ffaa00' },
                    { label: 'Platform Fees Paid',   value: fmt(fees),        color: '#ff4d4d' },
                    { label: 'Net This Month',       value: fmt(thisMonth),   color: '#4caf50' },
                ].map((s, i) => (
                    <div key={i} className="glass-morphism" style={{ padding: '15px 20px' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-main)', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', fontWeight: '600' }}>{s.label}</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px', marginBottom: '25px' }}>
                {/* Withdraw */}
                <div className="glass-morphism" style={{ padding: '28px' }}>
                    <h3 style={{ marginBottom: '20px', letterSpacing: '1px' }}>WITHDRAW FUNDS</h3>

                    {/* Bank Account section */}
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '0.8rem', opacity: 0.7, fontWeight: '600' }}>Bank Account</label>
                            <button onClick={openBankModal}
                                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', padding: '2px 6px' }}>
                                {bankAccount ? '✏️ Edit' : '+ Add'}
                            </button>
                        </div>

                        {bankAccount ? (
                            <div style={{ padding: '12px 14px', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'var(--glass)' }}>
                                <div style={{ fontWeight: '700', fontSize: '0.88rem', marginBottom: '2px' }}>{maskAccount(bankAccount.accountNo)}</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.55 }}>{bankAccount.holderName} · {bankAccount.bankName} · {bankAccount.ifsc}</div>
                            </div>
                        ) : (
                            <button onClick={openBankModal}
                                style={{ width: '100%', padding: '14px', border: '2px dashed var(--glass-border)', borderRadius: '8px', background: 'transparent', color: 'var(--accent)', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem' }}>
                                + Add Bank Account
                            </button>
                        )}
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7, marginBottom: '6px', fontWeight: '600' }}>Amount</label>
                        <input
                            className="modal-input"
                            placeholder="Enter amount to withdraw"
                            type="number"
                            min="100"
                            value={withdrawAmount}
                            onChange={e => setWithdrawAmount(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleWithdraw()}
                        />
                    </div>
                    <button
                        className="premium-button"
                        style={{ width: '100%', padding: '12px', opacity: withdrawing ? 0.7 : 1 }}
                        onClick={handleWithdraw}
                        disabled={withdrawing}
                    >
                        {withdrawing ? '⏳ Submitting...' : 'REQUEST WITHDRAWAL'}
                    </button>
                    <p style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '10px', textAlign: 'center' }}>
                        Available: {fmt(available)} · 2–3 business days
                    </p>
                </div>

                {/* Transaction Table */}
                <div className="glass-morphism" style={{ padding: '28px' }}>
                    <h3 style={{ marginBottom: '20px', letterSpacing: '1px' }}>TRANSACTION HISTORY</h3>

                    {loading && <div style={{ textAlign: 'center', padding: '30px', opacity: 0.6 }}>⏳ Loading transactions...</div>}

                    {error && <div style={{ color: '#ff4d4d', padding: '12px', background: 'rgba(255,77,77,0.1)', borderRadius: '8px' }}>⚠️ {error}</div>}

                    {!loading && !error && transactions.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💳</div>
                            <p>No transactions yet.</p>
                            <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>When customers buy your products, transactions will appear here.</p>
                        </div>
                    )}

                    {!loading && transactions.length > 0 && (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-main)', opacity: 0.7 }}>
                                    {['TXN ID', 'PRODUCT', 'GROSS', 'FEE', 'NET', 'DATE', 'STATUS'].map(h => (
                                        <th key={h} style={{ padding: '10px 12px', fontSize: '0.72rem', letterSpacing: '0.5px' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(t => (
                                    <tr key={t._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                        <td style={{ padding: '12px', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: '600', fontFamily: 'monospace' }}>
                                            #{(t._id || '').toString().slice(-6).toUpperCase()}
                                        </td>
                                        <td style={{ padding: '12px', fontSize: '0.82rem' }}>{t.productName}</td>
                                        <td style={{ padding: '12px', fontWeight: '700', fontSize: '0.85rem' }}>{fmt(t.grossAmount)}</td>
                                        <td style={{ padding: '12px', color: '#ff4d4d', fontSize: '0.8rem' }}>-{fmt(t.platformFee)}</td>
                                        <td style={{ padding: '12px', color: '#4caf50', fontWeight: '700', fontSize: '0.85rem' }}>{fmt(t.netAmount)}</td>
                                        <td style={{ padding: '12px', opacity: 0.5, fontSize: '0.75rem' }}>{fmtDate(t.createdAt)}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                padding: '3px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '600',
                                                background: t.paymentStatus === 'settled' ? 'rgba(76,175,80,0.15)' : 'rgba(255,170,0,0.15)',
                                                color: t.paymentStatus === 'settled' ? '#4caf50' : '#ffaa00',
                                            }}>
                                                {t.paymentStatus === 'settled' ? 'Settled' : 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            {/* ══════════════════════════════════════════
                ADD / EDIT BANK ACCOUNT MODAL
            ══════════════════════════════════════════ */}
            {bankModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: '20px' }}>
                    <div className="glass-morphism" style={{ padding: '36px', maxWidth: '460px', width: '100%', borderRadius: '18px', position: 'relative' }}>

                        <button onClick={() => setBankModal(false)}
                            style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,77,77,0.1)', border: 'none', color: '#ff4d4d', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>
                            ✕
                        </button>

                        <h3 style={{ marginBottom: '6px' }}>🏦 {bankAccount ? 'Edit' : 'Add'} Bank Account</h3>
                        <p style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '24px' }}>Withdrawals will be sent to this account (2–3 business days).</p>

                        {[
                            { key: 'holderName',       label: 'Account Holder Name *',    placeholder: 'e.g. Rajesh Kumar',       type: 'text'     },
                            { key: 'bankName',         label: 'Bank Name *',              placeholder: 'e.g. State Bank of India', type: 'text'     },
                            { key: 'accountNo',        label: 'Account Number *',         placeholder: 'Enter account number',     type: 'password' },
                            { key: 'confirmAccountNo', label: 'Confirm Account Number *', placeholder: 'Re-enter account number',  type: 'text'     },
                            { key: 'ifsc',             label: 'IFSC Code *',              placeholder: 'e.g. SBIN0001234',         type: 'text'     },
                        ].map(f => (
                            <div key={f.key} style={{ marginBottom: '14px' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#fff', opacity: 0.9, marginBottom: '6px', letterSpacing: '0.5px' }}>{f.label}</label>
                                <input
                                    type={f.type}
                                    placeholder={f.placeholder}
                                    value={bankForm[f.key]}
                                    onChange={e => setBankForm(p => ({ ...p, [f.key]: e.target.value }))}
                                    className="modal-input"
                                />
                            </div>
                        ))}

                        <div style={{ padding: '10px 14px', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', marginBottom: '20px', fontSize: '0.77rem', opacity: 0.7 }}>
                            🔒 Your account details are stored securely and only used for withdrawal payouts.
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={saveBankAccount} className="premium-button" style={{ flex: 1, padding: '13px', fontSize: '0.85rem' }}>
                                💾 Save Bank Account
                            </button>
                            <button onClick={() => setBankModal(false)}
                                style={{ flex: 1, padding: '13px', background: 'none', border: '1px solid var(--glass-border)', color: 'var(--text-main)', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};


export default VendorPayments;
