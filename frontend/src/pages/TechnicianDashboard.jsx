import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { 
    fetchTechnicianTasks, 
    updateOrderStatus, 
    getUser, 
    fetchAllServiceRequests, 
    updateServiceStatus,
    fetchNotifications,
    addNotification,
    updateTechnicianAvailability,
    fetchTechnicians
} from '../api';

const shortId = (id) => (id || '').toString().slice(-6).toUpperCase();

const TechnicianDashboard = () => {
    const [tasks, setTasks] = useState([]);

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null); // For detailed view
    const [availability, setAvailability] = useState('Available');
    const [showProofModal, setShowProofModal] = useState(null);
    const [proofNote, setProofNote] = useState('');

    const links = [
        { label: 'Dashboard', path: '#', icon: '📊', tab: 'overview' },
        { label: 'Assigned Jobs', path: '#', icon: '📩', tab: 'tasks' },
        { label: 'Job History', path: '#', icon: '📜', tab: 'history' },
        { label: 'Availability Status', path: '#', icon: '🕒', tab: 'availability' },
        { label: 'Profile', path: '#', icon: '👤', tab: 'profile' },
        { label: 'Notifications', path: '#', icon: '🔔', tab: 'notifications', badge: notifications.filter(n => !n.isRead).length },
    ];

    const [serviceRequests, setServiceRequests] = useState([]);

    const loadData = () => {
        setLoading(true);
        const user = getUser();
        Promise.all([
            fetchTechnicianTasks(),
            fetchAllServiceRequests(),
            fetchNotifications('Technician', user.email)
        ]).then(([tData, sData, nData]) => {
            setNotifications(nData);
            
            // Filter pending service requests for the 'requests' tab
            setServiceRequests(sData.filter(s => s.status === 'pending'));

            // Combine orders and assigned services into tasks
            const assignedServices = sData.filter(s => s.status !== 'pending' && s.techEmail === user.email).map(s => ({
                _id: s._id,
                customerName: s.customerName,
                customerPhone: s.customerPhone || 'Not provided',
                address: s.address,
                items: [{ productName: s.serviceName, vendorName: 'Service Dept' }],
                shippingAddress: s.address,
                status: s.status,
                issue: s.notes || s.serviceName,
                createdAt: s.createdAt,
                isService: true
            }));
            setTasks([...tData, ...assignedServices]);
        }).catch(e => {
            console.error('TechnicianDashboard: Error loading data', e);
        }).finally(() => {
            setLoading(false);
        });
    };

    const handleUpdateStatus = async (taskId, newStatus) => {
        const task = tasks.find(t => t._id === taskId);
        if (task.isService) {
            await updateServiceStatus(taskId, newStatus);
        } else {
            // Standard order fallback
            await updateOrderStatus(taskId, newStatus);
        }
        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    };

    const handleAcceptRequest = async (reqId) => {
        const user = getUser();
        const res = await updateServiceStatus(reqId, 'assigned', { techEmail: user.email, techName: user.name || 'Technician' });
        if (res.ok) {
            const req = serviceRequests.find(r => r._id === reqId);
            const newTask = {
                _id: req._id,
                customerName: req.customerName,
                items: [{ productName: req.serviceName, vendorName: 'Service Dept' }],
                shippingAddress: req.address,
                status: 'accepted',
                issue: req.notes || req.serviceName,
                createdAt: new Date().toISOString(),
                isService: true
            };
            setTasks(prev => [newTask, ...prev]);
            setServiceRequests(prev => prev.filter(r => r._id !== reqId));
            addNotification('Admin', `${user.name} accepted service request #SRV${shortId(reqId)}`);
            setActiveTab('tasks');
            loadData();
        }
    };

    useEffect(() => {
        loadData();
        const user = getUser();
        fetchTechnicians().then(techs => {
            const me = techs.find(t => t.email === user.email);
            if (me) setAvailability(me.availability || 'Available');
        });
        // Listen for new notifications
        window.addEventListener('notificationsUpdated', loadData);
        return () => window.removeEventListener('notificationsUpdated', loadData);
    }, []);

    const activeTasks = tasks.filter(t => ['assigned', 'confirmed', 'in-progress', 'accepted', 'shipped', 'processing'].includes(t.status));
    const completedTasks = tasks.filter(t => t.status === 'delivered' || t.status === 'completed' || t.status === 'Completed');

    const renderOverview = () => (
        <div className="animate-fade-in">
            <div className="glass-morphism" style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        🔧 Assigned Tasks Preview
                    </h3>
                    <button onClick={() => setActiveTab('tasks')} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>
                        View All Tasks
                    </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    {activeTasks.slice(0, 3).map(task => (
                        <div key={task._id} style={{ padding: '20px', background: 'var(--secondary)', borderRadius: '15px', border: '1px solid var(--glass-border)', transition: '0.3s' }} className="hover-scale">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>{task.items?.[0]?.productName}</span>
                                <span style={{ fontSize: '0.65rem', padding: '3px 10px', borderRadius: '12px', background: 'var(--accent)', color: 'var(--primary)', fontWeight: 'bold' }}>{task.status.toUpperCase()}</span>
                            </div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '5px' }}><strong>Customer:</strong> {task.customerName}</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{task.issue || 'General Maintenance'}</div>
                        </div>
                    ))}
                    {activeTasks.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', opacity: 0.4 }}>
                            No active assignments found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderRequests = () => (
        <div className="glass-morphism animate-fade-in" style={{ padding: '30px' }}>
            <h3 style={{ marginBottom: '25px' }}>Service Requests</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', opacity: 0.6, fontSize: '0.8rem' }}>
                            <th style={{ padding: '15px' }}>REQ ID</th>
                            <th style={{ padding: '15px' }}>CUSTOMER</th>
                            <th style={{ padding: '15px' }}>PRODUCT</th>
                            <th style={{ padding: '15px' }}>ISSUE</th>
                            <th style={{ padding: '15px' }}>DATE</th>
                            <th style={{ padding: '15px' }}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {serviceRequests.map(req => (
                            <tr key={req._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <td style={{ padding: '15px', color: 'var(--accent)', fontWeight: 'bold' }}>{shortId(req._id)}</td>
                                <td style={{ padding: '15px' }}>{req.customerName}</td>
                                <td style={{ padding: '15px' }}>{req.serviceName}</td>
                                <td style={{ padding: '15px', fontSize: '0.85rem', opacity: 0.8 }}>{req.notes || 'No notes'}</td>
                                <td style={{ padding: '15px' }}>{new Date(req.createdAt).toLocaleDateString()}</td>
                                <td style={{ padding: '15px' }}>
                                    <button onClick={() => handleAcceptRequest(req._id)} className="premium-button" style={{ padding: '6px 12px', fontSize: '0.7rem' }}>ACCEPT</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderTasks = () => (
        <div className="animate-fade-in">
            <h3 style={{ marginBottom: '20px' }}>Active Assignments</h3>
            {activeTasks.length === 0 ? <p className="glass-morphism" style={{ padding: '30px', opacity: 0.5 }}>No active tasks. Check service requests to start working.</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                    {activeTasks.map(task => (
                        <div key={task._id} className="glass-morphism" style={{ padding: '25px', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold', background: 'var(--accent)', color: 'var(--primary)', textTransform: 'uppercase' }}>
                                    {task.status}
                                </span>
                            </div>
                            <h4 style={{ margin: '0 0 15px 0', color: 'var(--accent)' }}>Task #{shortId(task._id)}</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '0.7rem', opacity: 0.5, display: 'block' }}>Customer</label>
                                    <div style={{ fontWeight: '600' }}>{task.customerName}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', opacity: 0.5, display: 'block' }}>Product</label>
                                    <div style={{ fontWeight: '600' }}>{task.items?.[0]?.productName || 'Camera'}</div>
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ fontSize: '0.7rem', opacity: 0.5, display: 'block' }}>Issue</label>
                                    <div style={{ fontSize: '0.9rem' }}>{task.issue || 'General Maintenance'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => setSelectedJob(task)} className="premium-button" style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #444' }}>VIEW DETAILS</button>
                                {task.status === 'assigned' && (
                                    <button onClick={() => handleUpdateStatus(task._id, 'confirmed')} className="premium-button" style={{ flex: 1, padding: '10px' }}>ACCEPT JOB</button>
                                )}
                                {task.status === 'confirmed' && (
                                    <button onClick={() => handleUpdateStatus(task._id, 'on-the-way')} className="premium-button" style={{ flex: 1, padding: '10px', background: '#2196f3' }}>ON THE WAY</button>
                                )}
                                {task.status === 'on-the-way' && (
                                    <button onClick={() => handleUpdateStatus(task._id, 'in-progress')} className="premium-button" style={{ flex: 1, padding: '10px' }}>START WORK</button>
                                )}
                                {task.status === 'in-progress' && (
                                    <button onClick={() => setShowProofModal(task._id)} className="premium-button" style={{ flex: 1, padding: '10px', background: 'var(--success)' }}>COMPLETE JOB</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderHistory = () => (
        <div className="glass-morphism animate-fade-in" style={{ padding: '30px' }}>
            <h3 style={{ marginBottom: '25px' }}>Service History</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', opacity: 0.6, fontSize: '0.8rem' }}>
                            <th style={{ padding: '15px', textAlign: 'left' }}>DATE</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>CASE ID</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>PRODUCT</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>PROBLEM FIXED</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {completedTasks.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', opacity: 0.5 }}>No completed services recorded.</td></tr>
                        ) : (
                            completedTasks.map(task => (
                                <tr key={task._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '15px' }}>{new Date(task.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{shortId(task._id)}</td>
                                    <td style={{ padding: '15px' }}>{task.items?.[0]?.productName}</td>
                                    <td style={{ padding: '15px', fontSize: '0.85rem' }}>{task.issue || 'Repaired and Tested'}</td>
                                    <td style={{ padding: '15px' }}><span style={{ color: 'var(--success)' }}>Delivered</span></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );


    const renderReports = () => (
        <div className="animate-fade-in">
            <h3 style={{ marginBottom: '25px' }}>Performance Analytics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div className="glass-morphism" style={{ padding: '30px' }}>
                    <h4 style={{ marginBottom: '20px' }}>Service Stats</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                                <span>Efficiency</span>
                                <span>{completedTasks.length > 5 ? '94%' : '80%'}</span>
                            </div>
                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                                <div style={{ width: completedTasks.length > 5 ? '94%' : '80%', height: '100%', background: 'var(--accent)', borderRadius: '3px' }}></div>
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                                <span>Customer Satisfaction</span>
                                <span>5.0/5.0</span>
                            </div>
                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                                <div style={{ width: '100%', height: '100%', background: '#4caf50', borderRadius: '3px' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="glass-morphism" style={{ padding: '30px' }}>
                    <h4 style={{ marginBottom: '20px' }}>Activity Summary</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                        <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{completedTasks.length}</div>
                            <div style={{ fontSize: '0.6rem', opacity: 0.5 }}>COMPLETED</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>5.0</div>
                            <div style={{ fontSize: '0.6rem', opacity: 0.5 }}>RATING</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAvailability = () => (
        <div className="glass-morphism animate-fade-in" style={{ padding: '40px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '30px' }}>Update Availability Status</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                {[
                    { label: 'Available', icon: '✅', color: '#4caf50' },
                    { label: 'Busy', icon: '⏳', color: '#ff9800' },
                    { label: 'On Leave', icon: '🚪', color: '#f44336' }
                ].map(opt => (
                    <button
                        key={opt.label}
                        onClick={async () => {
                            setAvailability(opt.label);
                            await updateTechnicianAvailability(getUser().email, opt.label);
                        }}
                        style={{
                            padding: '30px',
                            width: '180px',
                            background: availability === opt.label ? opt.color : 'rgba(255,255,255,0.05)',
                            border: '1px solid ' + (availability === opt.label ? '#fff' : 'rgba(255,255,255,0.1)'),
                            borderRadius: '15px',
                            color: availability === opt.label ? '#000' : '#fff',
                            cursor: 'pointer',
                            transition: '0.3s'
                        }}
                        className="hover-scale"
                    >
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{opt.icon}</div>
                        <div style={{ fontWeight: 'bold' }}>{opt.label.toUpperCase()}</div>
                    </button>
                ))}
            </div>
            <p style={{ marginTop: '30px', opacity: 0.5, fontSize: '0.9rem' }}>
                {availability === 'Available' ? 'You are currently visible and will receive new job assignments.' : 'You will not receive new assignments while Busy or On Leave.'}
            </p>
        </div>
    );

    const renderProfile = () => {
        const user = getUser();
        return (
            <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="glass-morphism" style={{ padding: '40px' }}>
                    <div style={{ display: 'flex', gap: '30px', alignItems: 'center', marginBottom: '40px' }}>
                        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>👨‍🔧</div>
                        <div>
                            <h2 style={{ margin: '0 0 5px 0' }}>{user.name}</h2>
                            <div style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Senior Technician</div>
                            <div style={{ fontSize: '0.9rem', opacity: 0.6 }}>ID: TECH-{shortId(user.email)}</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                        <div>
                            <label style={{ fontSize: '0.7rem', opacity: 0.5, display: 'block', marginBottom: '5px' }}>Email Address</label>
                            <input disabled value={user.email} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.7rem', opacity: 0.5, display: 'block', marginBottom: '5px' }}>Phone Number</label>
                            <input defaultValue="+91 98XXX XXXXX" style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontSize: '0.7rem', opacity: 0.5, display: 'block', marginBottom: '5px' }}>Skills & Expertise</label>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {['CCTV Installation', 'Fire Alarms', 'Network Routing', 'Sensor Repair'].map(s => (
                                    <span key={s} style={{ padding: '6px 12px', background: 'rgba(255,170,0,0.1)', color: '#ffaa00', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid rgba(255,170,0,0.3)' }}>{s}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ marginTop: '40px', display: 'flex', gap: '15px' }}>
                        <button className="premium-button" style={{ padding: '12px 30px' }}>Update Profile</button>
                        <button style={{ background: 'none', border: '1px solid #444', color: '#fff', padding: '12px 30px', borderRadius: '8px' }}>Change Password</button>
                    </div>
                </div>
            </div>
        );
    };

    const sidebarLinks = links.map(l => ({
        ...l,
        onClick: () => setActiveTab(l.tab),
        isActive: activeTab === l.tab,
        path: '#' 
    }));

    return (
        <DashboardLayout 
            title="Employee Portal" 
            sidebarLinks={sidebarLinks}
            userRole="Employee"
        >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '15px', marginBottom: '25px' }}>
                <div className="glass-morphism" style={{ padding: '12px 18px', borderLeft: '3px solid var(--accent)' }}>
                    <div style={{ fontSize: '0.65rem', opacity: 0.6, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned Tasks</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent)' }}>{tasks.length}</div>
                </div>
                <div className="glass-morphism" style={{ padding: '12px 18px', borderLeft: '3px solid #ffaa00' }}>
                    <div style={{ fontSize: '0.65rem', opacity: 0.6, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Projects</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#ffaa00' }}>{activeTasks.length}</div>
                </div>
                <div className="glass-morphism" style={{ padding: '12px 18px', borderLeft: '3px solid #4caf50' }}>
                    <div style={{ fontSize: '0.65rem', opacity: 0.6, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Completed Jobs</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#4caf50' }}>{completedTasks.length}</div>
                </div>
                <div className="glass-morphism" style={{ padding: '12px 18px', borderLeft: '3px solid #64b5f6' }}>
                    <div style={{ fontSize: '0.65rem', opacity: 0.6, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Performance</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#64b5f6' }}>100%</div>
                </div>
            </div>

            {loading ? <p>Loading systems...</p> : (
                <div style={{ marginTop: '10px' }}>
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'tasks' && renderTasks()}
                    {activeTab === 'history' && renderHistory()}
                    {activeTab === 'availability' && renderAvailability()}
                    {activeTab === 'profile' && renderProfile()}
                    {activeTab === 'notifications' && (
                        <div className="animate-fade-in">
                            <h3 style={{ marginBottom: '25px' }}>System Notifications</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {notifications.length === 0 ? (
                                    <div className="glass-morphism" style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>No notifications.</div>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n._id} className="glass-morphism" style={{ padding: '18px 25px', borderLeft: n.isRead ? 'none' : '4px solid var(--accent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: n.isRead ? 0.7 : 1 }}>
                                            <div>
                                                <div style={{ fontSize: '0.95rem', marginBottom: '4px' }}>{n.message}</div>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{new Date(n.createdAt).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Detailed Job Modal */}
            {selectedJob && (
                <div 
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }} 
                    onClick={() => setSelectedJob(null)}
                >
                    <div 
                        className="glass-morphism animate-scale-up" 
                        style={{ 
                            maxWidth: '600px', 
                            width: '100%', 
                            padding: '40px', 
                            position: 'relative', 
                            background: 'var(--primary)', 
                            border: '1px solid var(--accent)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
                        }} 
                        onClick={e => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setSelectedJob(null)}
                            style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', opacity: 0.5 }}
                        >✕</button>
                        
                        <h3 style={{ margin: '0 0 10px 0', color: 'var(--accent)', fontSize: '1.6rem' }}>TASK DETAILS</h3>
                        <div style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '25px', letterSpacing: '1px' }}>#{selectedJob._id.toUpperCase()}</div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '35px' }}>
                            <div className="glass-morphism" style={{ padding: '15px', background: 'rgba(255,255,255,0.03)' }}>
                                <label style={{ fontSize: '0.65rem', opacity: 0.5, display: 'block', textTransform: 'uppercase', marginBottom: '5px' }}>Customer Name</label>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{selectedJob.customerName}</div>
                            </div>
                            <div className="glass-morphism" style={{ padding: '15px', background: 'rgba(255,255,255,0.03)' }}>
                                <label style={{ fontSize: '0.65rem', opacity: 0.5, display: 'block', textTransform: 'uppercase', marginBottom: '5px' }}>Contact Phone</label>
                                <a href={`tel:${selectedJob.customerPhone}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 'bold' }}>📞 {selectedJob.customerPhone}</a>
                            </div>
                            <div className="glass-morphism" style={{ gridColumn: 'span 2', padding: '15px', background: 'rgba(255,255,255,0.03)' }}>
                                <label style={{ fontSize: '0.65rem', opacity: 0.5, display: 'block', textTransform: 'uppercase', marginBottom: '5px' }}>Service Address</label>
                                <div style={{ fontSize: '1rem', lineHeight: '1.4' }}>{selectedJob.address || selectedJob.shippingAddress || 'Address details missing.'}</div>
                            </div>
                            <div className="glass-morphism" style={{ padding: '15px', background: 'rgba(255,255,255,0.03)' }}>
                                <label style={{ fontSize: '0.65rem', opacity: 0.5, display: 'block', textTransform: 'uppercase', marginBottom: '5px' }}>Product/Service</label>
                                <div style={{ fontWeight: '600' }}>{selectedJob.items?.[0]?.productName}</div>
                            </div>
                            <div className="glass-morphism" style={{ padding: '15px', background: 'rgba(255,170,0,0.1)' }}>
                                <label style={{ fontSize: '0.65rem', color: '#ffaa00', display: 'block', textTransform: 'uppercase', marginBottom: '5px' }}>Current Status</label>
                                <div style={{ fontWeight: '800', color: '#ffaa00' }}>{selectedJob.status.toUpperCase()}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedJob.address || selectedJob.shippingAddress)}`} 
                                target="_blank" 
                                className="premium-button" 
                                style={{ flex: 1, padding: '15px', textAlign: 'center', textDecoration: 'none', background: '#34a853', fontWeight: 'bold' }}
                            >
                                📍 OPEN IN MAPS
                            </a>
                            <button onClick={() => setSelectedJob(null)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #444', color: '#fff', padding: '15px 30px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>DISMISS</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Proof of Work Modal */}
            {showProofModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(10px)' }}>
                    <div className="glass-morphism animate-scale-up" style={{ maxWidth: '500px', width: '100%', padding: '40px', border: '1px solid var(--success)' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: 'var(--success)' }}>COMPLETE JOB</h3>
                        <p style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '25px' }}>Submit final proof to mark this task as finished.</p>
                        
                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ fontSize: '0.65rem', opacity: 0.5, display: 'block', textTransform: 'uppercase', marginBottom: '8px' }}>Completion Notes</label>
                            <textarea 
                                placeholder="What was done? (e.g., Installation complete, verified connectivity...)" 
                                value={proofNote}
                                onChange={e => setProofNote(e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: '15px', 
                                    background: 'rgba(255,255,255,0.03)', 
                                    border: '1px solid rgba(255,255,255,0.1)', 
                                    color: '#fff', 
                                    borderRadius: '10px', 
                                    height: '120px',
                                    outline: 'none',
                                    fontSize: '0.9rem'
                                }}
                            ></textarea>
                        </div>

                        <div style={{ marginBottom: '30px', padding: '30px', border: '2px dashed rgba(76, 175, 80, 0.3)', borderRadius: '15px', textAlign: 'center', background: 'rgba(76, 175, 80, 0.05)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📸</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.7, fontWeight: 'bold' }}>PHOTO PROOF REQUIRED</div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.4, marginTop: '5px' }}>Tap to upload or take a photo</div>
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button 
                                onClick={async () => {
                                    if (!proofNote.trim()) return alert('Please enter completion notes.');
                                    await handleUpdateStatus(showProofModal, 'delivered');
                                    setShowProofModal(null);
                                    setProofNote('');
                                    alert('Job completed successfully!');
                                }} 
                                className="premium-button" 
                                style={{ flex: 1, padding: '15px', background: 'var(--success)', color: '#fff' }}
                            >
                                SUBMIT & CLOSURE
                            </button>
                            <button onClick={() => setShowProofModal(null)} style={{ background: 'transparent', border: '1px solid #444', color: '#fff', padding: '15px 30px', borderRadius: '8px', cursor: 'pointer' }}>CANCEL</button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default TechnicianDashboard;
