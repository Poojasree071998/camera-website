import DashboardLayout from '../components/DashboardLayout';
import { fetchVendors, createVendor, updateVendor, deleteVendor } from '../api';
import React, { useState, useEffect } from 'react';

const VendorManagement = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [successMsg, setSuccessMsg] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const data = await fetchVendors();
            setVendors(data);
        } catch (e) {
            console.error('VendorManagement: Error loading vendors', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const links = [
        { label: 'Overview', path: '/admin', icon: '📊' },
        { label: 'Vendors', path: '/admin/vendors', icon: '🏪' },
        { label: 'Products', path: '/admin/products', icon: '📸' },
        { label: 'Orders', path: '/admin/orders', icon: '📜' },
        { label: 'Notifications', path: '/admin/notifications', icon: '🔔' },
        { label: 'Payments', path: '/admin/payments', icon: '💳' },
        { label: 'Chats', path: '/admin/chats', icon: '💬' },
        { label: 'Employees',         path: '/admin/users',         icon: '👤' },
        { label: 'Reports', path: '/admin/reports', icon: '📈' },
        { label: 'Settings', path: '/admin/settings', icon: '⚙️' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return '#4caf50';
            case 'Pending': return '#ffaa00';
            case 'Suspended': return '#ff4d4d';
            default: return '#888';
        }
    };

    const [showAddModal, setShowAddModal] = useState(false);
    const [newVendor, setNewVendor] = useState({
        name: '', email: '', phone: '',
        businessName: '', businessAddress: '', city: '', state: '', pincode: '',
        accountNumber: '', ifscCode: '',
        password: '', confirmPassword: ''
    });

    const handleInvite = () => {
        setShowAddModal(true);
    };

    const handleAddVendor = async (e) => {
        e.preventDefault();
        if (newVendor.password !== newVendor.confirmPassword) {
            setSuccessMsg('❌ Passwords do not match!');
            return;
        }
        const vendorToAdd = {
            name: newVendor.businessName || newVendor.name,
            email: newVendor.email,
            password: newVendor.password, // Pass password for user creation
            status: 'Pending',
            revenue: '$0',
            rating: '-',
        };
        try {
            await createVendor(vendorToAdd);
            load();
            setShowAddModal(false);
            setNewVendor({
                name: '', email: '', phone: '',
                businessName: '', businessAddress: '', city: '', state: '', pincode: '',
                accountNumber: '', ifscCode: '',
                password: '', confirmPassword: ''
            });
            setSuccessMsg(`✅ ${vendorToAdd.name} added successfully! Submission pending review.`);
            setTimeout(() => setSuccessMsg(''), 5000);
        } catch (err) {
            setSuccessMsg('❌ Failed to add vendor: ' + (err.message || ''));
        }
    };

    const handleEdit = (vendor) => {
        setEditingVendor({ ...vendor });
        setShowEditModal(true);
    };

    const handleUpdateVendor = async (e) => {
        e.preventDefault();
        try {
            await updateVendor(editingVendor.id, editingVendor);
            load();
            setShowEditModal(false);
            setEditingVendor(null);
            setSuccessMsg(`✅ Vendor "${editingVendor.name}" updated successfully!`);
            setTimeout(() => setSuccessMsg(''), 5000);
        } catch (err) {
            setSuccessMsg('❌ Failed to update vendor: ' + (err.message || ''));
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete vendor "${name}"? This action cannot be undone.`)) {
            try {
                await deleteVendor(id);
                load();
                setSuccessMsg(`🗑️ Vendor "${name}" has been deleted.`);
                setTimeout(() => setSuccessMsg(''), 5000);
            } catch (err) {
                setSuccessMsg('❌ Failed to delete vendor: ' + (err.message || ''));
            }
        }
    };

    return (
        <DashboardLayout title="Vendor Intelligence" sidebarLinks={links} userRole="Super Admin">
            <div className="glass-morphism animate-fade-in" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '25px', borderBottom: '1px solid var(--glass-border)', alignItems: 'center' }}>
                    <h3 style={{ letterSpacing: '1px', fontSize: '1.1rem', fontWeight: '700' }}>PARTNER NETWORK</h3>
                    <button
                        className="premium-button"
                        style={{ padding: '10px 25px', fontSize: '0.8rem' }}
                        onClick={handleInvite}
                    >
                        + ADD VENDOR
                    </button>
                </div>

                {/* Success banner */}
                {successMsg && (
                    <div style={{
                        margin: '20px 25px', padding: '14px 20px', borderRadius: '10px',
                        background: successMsg.startsWith('✅') ? 'rgba(76,175,80,0.15)' : 'rgba(255,77,77,0.15)',
                        border: `1px solid ${successMsg.startsWith('✅') ? '#4caf50' : '#ff4d4d'}`,
                        color: successMsg.startsWith('✅') ? '#4caf50' : '#ff4d4d',
                        fontWeight: '600', fontSize: '0.9rem'
                    }}>
                        {successMsg}
                    </div>
                )}

                <div style={{ overflowX: 'auto', position: 'relative', minHeight: '400px' }}>
                    {loading && (
                        <div style={{ 
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                            background: 'rgba(0,0,0,0.2)', zIndex: 10, display: 'flex', 
                            alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' 
                        }}>
                            <div style={{ color: 'var(--accent)', fontWeight: '700', letterSpacing: '2px' }}>⚡ SYNCHRONIZING PARTNERS...</div>
                        </div>
                    )}
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'auto' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-main)', opacity: '0.8', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '1px' }}>
                                <th style={{ padding: '20px 25px', width: '120px' }}>VENDOR ID</th>
                                <th style={{ padding: '20px 20px' }}>NAME & IDENTITY</th>
                                <th style={{ padding: '20px 20px', width: '150px' }}>RATING</th>
                                <th style={{ padding: '20px 20px', width: '200px' }}>STATUS</th>
                                <th style={{ padding: '20px 25px', width: '160px', textAlign: 'right' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendors.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '80px', opacity: 0.5 }}>🏪 No vendors registered in the network.</td></tr>
                            ) : (
                                vendors.map((vendor) => (
                                    <tr key={vendor.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.3s' }}>
                                        <td style={{ padding: '15px 25px', color: 'var(--accent)', fontWeight: '700', fontSize: '0.78rem' }}>#{vendor.id?.slice(-4).toUpperCase() || 'NEW'}</td>
                                        <td style={{ padding: '15px 20px' }}>
                                            <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.85rem' }}>{vendor.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{vendor.email}</div>
                                        </td>
                                         <td style={{ padding: '15px 20px' }}>
                                             <span style={{ color: '#ffaa00', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}><span>★</span> {vendor.rating || 'N/A'}</span>
                                         </td>
                                        <td style={{ padding: '15px 20px' }}>
                                            <span style={{ 
                                                padding: '4px 12px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 'bold',
                                                background: 'var(--secondary)',
                                                color: getStatusColor(vendor.status),
                                                border: `1px solid ${getStatusColor(vendor.status)}`
                                            }}>{vendor.status.toUpperCase()}</span>
                                        </td>
                                        <td style={{ padding: '15px 25px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button 
                                                    onClick={() => handleEdit(vendor)} 
                                                    style={{ 
                                                        padding: '6px 14px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '800',
                                                        background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)',
                                                        cursor: 'pointer', transition: 'all 0.2s'
                                                    }}
                                                >EDIT</button>
                                                <button 
                                                    onClick={() => handleDelete(vendor.id, vendor.name)} 
                                                    style={{ 
                                                        padding: '6px 14px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '800',
                                                        background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.3)',
                                                        cursor: 'pointer', transition: 'all 0.2s'
                                                    }}
                                                >DELETE</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Add Vendor Modal ── */}
            {showAddModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', padding: '20px' }}>
                    <div className="glass-morphism animate-fade-in" style={{ width: '100%', maxWidth: '850px', maxHeight: '100%', display: 'flex', flexDirection: 'column', padding: '0', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.7)', overflow: 'hidden' }}>
                        <button onClick={() => setShowAddModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.7, zIndex: 10 }}>✕</button>
                        
                        <div style={{ padding: '30px 40px', borderBottom: '1px solid var(--glass-border)' }}>
                            <h3 className="text-gradient" style={{ fontSize: '1.4rem', fontWeight: '700' }}>ADD NEW VENDOR</h3>
                        </div>

                        <div style={{ padding: '30px 40px', overflowY: 'auto', flex: 1 }}>
                            <form onSubmit={handleAddVendor}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
                                    {/* Column 1: Identity */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <h4 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px', color: 'var(--text-main)', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', opacity: 0.9 }}>Business Identity</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase' }}>Business/Shop Name</label>
                                                <input required placeholder="e.g. ProCam Store" className="modal-input" value={newVendor.businessName} onChange={(e) => setNewVendor({ ...newVendor, businessName: e.target.value })} style={{ width: '100%' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase' }}>Contact Person Name</label>
                                                <input required placeholder="Enter full name" className="modal-input" value={newVendor.name} onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })} style={{ width: '100%' }} />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase' }}>Email</label>
                                                    <input required type="email" placeholder="vendor@email.com" className="modal-input" value={newVendor.email} onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })} style={{ width: '100%' }} />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase' }}>Phone</label>
                                                    <input required type="tel" placeholder="+91 XXXXX" className="modal-input" value={newVendor.phone} onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })} style={{ width: '100%' }} />
                                                </div>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase' }}>Password</label>
                                                    <input required type="password" placeholder="••••••••" className="modal-input" value={newVendor.password} onChange={(e) => setNewVendor({ ...newVendor, password: e.target.value })} style={{ width: '100%' }} />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase' }}>Confirm</label>
                                                    <input required type="password" placeholder="••••••••" className="modal-input" value={newVendor.confirmPassword} onChange={(e) => setNewVendor({ ...newVendor, confirmPassword: e.target.value })} style={{ width: '100%' }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 2: Location & Info */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <h4 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px', color: 'var(--text-main)', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', opacity: 0.9 }}>Operational Location</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase' }}>Business Address</label>
                                                <textarea required placeholder="Full office/shop address" className="modal-input" style={{ height: '100px', resize: 'none', width: '100%' }} value={newVendor.businessAddress} onChange={(e) => setNewVendor({ ...newVendor, businessAddress: e.target.value })} />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase' }}>City</label>
                                                    <input placeholder="City" className="modal-input" value={newVendor.city} onChange={(e) => setNewVendor({ ...newVendor, city: e.target.value })} style={{ width: '100%' }} />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase' }}>Pincode</label>
                                                    <input placeholder="6-digit PIN" className="modal-input" value={newVendor.pincode} onChange={(e) => setNewVendor({ ...newVendor, pincode: e.target.value })} style={{ width: '100%' }} />
                                                </div>
                                            </div>
                                            <div style={{ marginTop: '10px', background: 'rgba(212,175,55,0.04)', padding: '20px', borderRadius: '12px', border: '1px dashed rgba(212,175,55,0.2)' }}>
                                                <p style={{ fontSize: '0.7rem', color: 'var(--accent)', margin: 0, lineHeight: '1.6', opacity: 0.8 }}>
                                                    💡 <strong>Note:</strong> Vendors will receive a welcome email with their temporary credentials upon approval.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '40px', display: 'flex', gap: '15px', justifyContent: 'flex-end', borderTop: '1px solid var(--glass-border)', paddingTop: '30px' }}>
                                    <button type="button" onClick={() => setShowAddModal(false)} className="premium-button" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--glass-border)', padding: '12px 25px' }}>CANCEL</button>
                                    <button type="submit" className="premium-button" style={{ background: 'var(--accent)', color: '#000', padding: '12px 35px' }}>ADD VENDOR</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Edit Vendor Modal ── */}
            {showEditModal && editingVendor && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', padding: '20px' }}>
                    <div className="glass-morphism animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '35px', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.7)' }}>
                        <button onClick={() => setShowEditModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                        <h3 className="text-gradient" style={{ marginBottom: '30px', fontSize: '1.3rem', fontWeight: '700' }}>EDIT VENDOR</h3>

                        <form onSubmit={handleUpdateVendor}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase' }}>Vendor Name</label>
                                    <input required className="modal-input" value={editingVendor.name} onChange={(e) => setEditingVendor({ ...editingVendor, name: e.target.value })} style={{ width: '100%' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase' }}>Email Address</label>
                                    <input required type="email" className="modal-input" value={editingVendor.email} onChange={(e) => setEditingVendor({ ...editingVendor, email: e.target.value })} style={{ width: '100%' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase' }}>Rating</label>
                                        <input required className="modal-input" value={editingVendor.rating} onChange={(e) => setEditingVendor({ ...editingVendor, rating: e.target.value })} style={{ width: '100%' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase' }}>Status</label>
                                        <select className="modal-input" value={editingVendor.status} onChange={(e) => setEditingVendor({ ...editingVendor, status: e.target.value })} style={{ width: '100%' }}>
                                            <option value="Active">Active</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Suspended">Suspended</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'flex-end', paddingTop: '10px' }}>
                                    <button type="button" onClick={() => setShowEditModal(false)} className="premium-button" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--glass-border)', padding: '10px 20px' }}>CANCEL</button>
                                    <button type="submit" className="premium-button" style={{ background: 'var(--accent)', color: '#000', padding: '10px 25px' }}>SAVE CHANGES</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default VendorManagement;
