import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';

const UserManagement = () => {
    const [employees, setEmployees] = useState([
        { id: 'E1001', name: 'James Wilson', email: 'james@email.com', joined: '2026-01-15', orders: 12, spent: '$3,400', status: 'Active', role: 'customer' },
        { id: 'E1002', name: 'Maria Garcia', email: 'maria@email.com', joined: '2026-02-10', orders: 5, spent: '$1,200', status: 'Active', role: 'customer' },
        { id: 'E1003', name: 'Robert Fox', email: 'fox@email.com', joined: '2026-02-28', orders: 1, spent: '$450', status: 'Flagged', role: 'customer' },
        { id: 'E1004', name: 'Lisa Ray', email: 'lisa@email.com', joined: '2026-03-02', orders: 0, spent: '$0', status: 'Blocked', role: 'customer' },
    ]);

    const loadEmployees = () => {
        const demoUsers = JSON.parse(localStorage.getItem('demo_users') || '{}');
        const registeredList = Object.values(demoUsers)
            .map((u, index) => ({
                id: u.id || (u.role === 'delivery' ? `T${3000 + index}` : u.role === 'vendor' ? `V${4000 + index}` : `E${2000 + index}`),
                name: u.name,
                email: u.email,
                role: u.role || 'customer',
                joined: u.joinedDate || new Date().toISOString().split('T')[0],
                orders: u.orders || 0,
                spent: u.spent || '$0',
                status: u.status || 'Active'
            }));

        setEmployees(prev => {
            const staticEmails = ['james@email.com', 'maria@email.com', 'fox@email.com', 'lisa@email.com'];
            const currentEmails = prev.map(e => e.email);
            const uniqueRegistered = registeredList.filter(u =>
                !staticEmails.includes(u.email) && !currentEmails.includes(u.email)
            );
            return [...prev, ...uniqueRegistered];
        });
    };

    useEffect(() => {
        loadEmployees();
        const handleStorageChange = (e) => {
            if (e.key === 'demo_users') loadEmployees();
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

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

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'customer', status: 'Active'
    });

    const handleSearch = () => alert(`Searching for: ${searchQuery}`);
    const handleHistory = (emp) => alert(`History for ${emp.name}:\nLast Login: 2026-03-04\nTotal Orders: ${emp.orders}`);
    const handleEdit = (emp) => {
        setEditingEmployee({ ...emp });
        setShowEditModal(true);
    };
    const handleUpdateEmployee = (e) => {
        e.preventDefault();
        setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? { ...editingEmployee } : emp));
        
        // Sync with demo_users
        const existingDemoUsers = JSON.parse(localStorage.getItem('demo_users') || '{}');
        if (existingDemoUsers[editingEmployee.email]) {
            existingDemoUsers[editingEmployee.email] = {
                ...existingDemoUsers[editingEmployee.email],
                name: editingEmployee.name,
                role: editingEmployee.role === 'customer' ? 'customer' : (editingEmployee.role === 'employee' ? 'delivery' : 'vendor'),
                status: editingEmployee.status
            };
            localStorage.setItem('demo_users', JSON.stringify(existingDemoUsers));
        }

        setShowEditModal(false);
        setEditingEmployee(null);
        alert(`Employee ${editingEmployee.name} updated successfully!`);
    };
    const handleBan = (id) => {
        setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: 'Blocked' } : e));
        alert('Account has been blocked.');
    };

    const handleAddEmployee = (e) => {
        e.preventDefault();
        if (newEmployee.password !== newEmployee.confirmPassword) return alert("Passwords do not match!");
        
        const emailExists = employees.some(emp => emp.email.toLowerCase() === newEmployee.email.toLowerCase());
        if (emailExists) return alert("Error: Email already exists!");

        const joinedDate = new Date().toISOString().split('T')[0];
        const newId = `E${2000 + employees.length}`;
        const employeeToAdd = {
            id: newId, name: newEmployee.name, email: newEmployee.email, role: newEmployee.role,
            joined: joinedDate, orders: 0, spent: '$0', status: newEmployee.status
        };

        const existingDemoUsers = JSON.parse(localStorage.getItem('demo_users') || '{}');
        const roleMapping = { 'customer': 'customer', 'employee': 'delivery', 'vendor': 'vendor' };
        existingDemoUsers[newEmployee.email] = {
            id: newId, name: newEmployee.name, email: newEmployee.email, password: newEmployee.password,
            role: roleMapping[newEmployee.role] || 'customer', joinedDate, status: newEmployee.status, 
            orders: 0, spent: '$0'
        };
        localStorage.setItem('demo_users', JSON.stringify(existingDemoUsers));

        setEmployees(prev => [employeeToAdd, ...prev]);
        setShowAddModal(false);
        setNewEmployee({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'customer', status: 'Active' });
        alert(`Employee ${newEmployee.name} onboarded successfully!`);
    };

    return (
        <>
            <DashboardLayout title="Employee Management" sidebarLinks={links} userRole="Super Admin">
            <div className="glass-morphism animate-fade-in" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '30px 25px', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', gap: '15px', flex: 1 }}>
                        <input
                            type="text"
                            placeholder="Search employees by name, email, or ID..."
                            className="modal-input"
                            style={{ maxWidth: '400px', margin: 0 }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="premium-button" style={{ padding: '10px 30px' }}>SEARCH</button>
                    </div>
                    <button className="premium-button" onClick={() => setShowAddModal(true)} style={{ background: 'var(--accent)', color: '#000' }}>+ ADD EMPLOYEE</button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'auto' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-main)', opacity: '0.8', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '1px' }}>
                                <th style={{ padding: '20px 25px', width: '80px' }}>ID</th>
                                <th style={{ padding: '20px' }}>Name / Email</th>
                                <th style={{ padding: '20px', width: '80px' }}>Orders</th>
                                <th style={{ padding: '20px', width: '100px' }}>Spent</th>
                                <th style={{ padding: '20px', width: '140px', whiteSpace: 'nowrap' }}>Date Joined</th>
                                <th style={{ padding: '20px', width: '110px' }}>Role</th>
                                <th style={{ padding: '20px', width: '110px' }}>Status</th>
                                <th style={{ padding: '20px 25px', width: '120px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees
                                .filter(emp => 
                                    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    emp.id.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map((emp) => (
                                <tr key={emp.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '18px 25px', color: 'var(--accent)', fontWeight: '700' }}>{emp.id}</td>
                                    <td style={{ padding: '18px' }}>
                                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{emp.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{emp.email}</div>
                                    </td>
                                    <td style={{ padding: '18px', fontWeight: '500' }}>{emp.orders}</td>
                                    <td style={{ padding: '18px', fontWeight: '700', color: 'var(--text-main)' }}>{emp.spent}</td>
                                    <td style={{ padding: '18px', color: 'var(--text-dim)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                        {emp.joined}
                                    </td>
                                    <td style={{ padding: '18px' }}>
                                        <span style={{
                                            fontSize: '0.7rem', padding: '5px 10px', borderRadius: '6px',
                                            background: emp.role.toUpperCase() === 'CUSTOMER' ? 'rgba(79,70,229,0.1)' : 'rgba(168,85,247,0.1)',
                                            color: emp.role.toUpperCase() === 'CUSTOMER' ? '#818cf8' : '#c084fc',
                                            fontWeight: '700', letterSpacing: '0.5px'
                                        }}>{emp.role.toUpperCase()}</span>
                                    </td>
                                    <td style={{ padding: '18px' }}>
                                        <span style={{
                                            fontSize: '0.7rem', padding: '5px 10px', borderRadius: '6px',
                                            background: emp.status === 'Active' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
                                            color: emp.status === 'Active' ? '#4ade80' : '#facc15',
                                            fontWeight: '700'
                                        }}>{emp.status}</span>
                                    </td>
                                    <td style={{ padding: '18px 25px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                            <button 
                                                style={{ padding: '8px 18px', background: 'rgba(212,175,55,0.1)', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800', transition: 'all 0.2s', letterSpacing: '0.5px' }} 
                                                onClick={() => handleEdit(emp)}
                                            >
                                                EDIT
                                            </button>
                                            <button 
                                                style={{ padding: '8px 18px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800', transition: 'all 0.2s', letterSpacing: '0.5px' }} 
                                                onClick={() => handleBan(emp.id)}
                                            >
                                                DELETE
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            </DashboardLayout>
            {showAddModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', padding: '20px' }}>
                    <div className="glass-morphism animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '30px', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.7)', zIndex: 10001 }}>
                        <button onClick={() => setShowAddModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                        <h3 className="text-gradient" style={{ marginBottom: '20px' }}>Add New Employee</h3>
                        <form onSubmit={handleAddEmployee} style={{ display: 'grid', gap: '15px' }}>
                            <div style={{ display: 'flex', gap: '20px', padding: '12px 20px', background: 'var(--secondary)', borderRadius: '10px', border: '1px solid var(--glass-border)', justifyContent: 'space-between' }}>
                                {['customer', 'employee', 'vendor'].map(r => (
                                    <label key={r} style={{ cursor: 'pointer', textTransform: 'capitalize', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: '500' }}>
                                        <input type="radio" name="role" checked={newEmployee.role === r} onChange={() => setNewEmployee({...newEmployee, role: r})} style={{ accentColor: 'var(--accent)' }} /> {r}
                                    </label>
                                ))}
                            </div>
                            <input required placeholder="Full Name" className="modal-input" value={newEmployee.name} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} />
                            <input required type="email" placeholder="Email" className="modal-input" value={newEmployee.email} onChange={e => setNewEmployee({...newEmployee, email: e.target.value})} />
                            <input required type="password" placeholder="Password" className="modal-input" value={newEmployee.password} onChange={e => setNewEmployee({...newEmployee, password: e.target.value})} />
                            <input required type="password" placeholder="Confirm Password" className="modal-input" value={newEmployee.confirmPassword} onChange={e => setNewEmployee({...newEmployee, confirmPassword: e.target.value})} />
                            <button type="submit" className="premium-button" style={{ padding: '15px' }}>SAVE EMPLOYEE</button>
                        </form>
                    </div>
                </div>
            )}

            {showEditModal && editingEmployee && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', padding: '20px' }}>
                    <div className="glass-morphism animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '30px', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.7)', zIndex: 10001 }}>
                        <button onClick={() => setShowEditModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                        <h3 className="text-gradient" style={{ marginBottom: '20px' }}>Edit Employee</h3>
                        <form onSubmit={handleUpdateEmployee} style={{ display: 'grid', gap: '15px' }}>
                            <div style={{ display: 'flex', gap: '20px', padding: '12px 20px', background: 'var(--secondary)', borderRadius: '10px', border: '1px solid var(--glass-border)', justifyContent: 'space-between' }}>
                                {['customer', 'employee', 'vendor'].map(r => (
                                    <label key={r} style={{ cursor: 'pointer', textTransform: 'capitalize', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: '500' }}>
                                        <input type="radio" name="role" checked={editingEmployee.role === r} onChange={() => setEditingEmployee({...editingEmployee, role: r})} style={{ accentColor: 'var(--accent)' }} /> {r}
                                    </label>
                                ))}
                            </div>
                            <input required placeholder="Full Name" className="modal-input" value={editingEmployee.name} onChange={e => setEditingEmployee({...editingEmployee, name: e.target.value})} />
                            <input required type="email" placeholder="Email" className="modal-input" value={editingEmployee.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                            
                            <select className="modal-input" value={editingEmployee.status} onChange={e => setEditingEmployee({...editingEmployee, status: e.target.value})}>
                                <option value="Active">Active</option>
                                <option value="Flagged">Flagged</option>
                                <option value="Blocked">Blocked</option>
                            </select>

                            <button type="submit" className="premium-button" style={{ padding: '15px' }}>UPDATE EMPLOYEE</button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserManagement;
