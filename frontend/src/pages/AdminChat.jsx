import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';

const AdminChat = () => {
    const [allChats, setAllChats] = useState(() => {
        const saved = localStorage.getItem('DEMO_CHATS');
        if (saved && saved !== 'null') {
            try {
                const parsed = JSON.parse(saved);
                return { admin: [], vendor: [], complaints: [], ...parsed };
            } catch (e) {
                console.error("Error parsing DEMO_CHATS", e);
            }
        }
        return { admin: [], vendor: [], complaints: [] };
    });
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            const saved = localStorage.getItem('DEMO_CHATS');
            if (saved && saved !== 'null') {
                try {
                    const parsed = JSON.parse(saved);
                    setAllChats(prev => ({ ...prev, ...parsed }));
                } catch (e) {}
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const sendReply = () => {
        if (!replyText) return;
        const newMsg = { id: Date.now(), sender: 'support', text: replyText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        const updated = { ...allChats, admin: [...(allChats.admin || []), newMsg] };
        setAllChats(updated);
        localStorage.setItem('DEMO_CHATS', JSON.stringify(updated));
        setReplyText('');
    };

    const links = [
        { label: 'Overview', path: '/admin', icon: '📊' },
        { label: 'Vendors', path: '/admin/vendors', icon: '🏪' },
        { label: 'Products', path: '/admin/products', icon: '📸' },
        { label: 'Orders', path: '/admin/orders', icon: '📜' },
        { label: 'Notifications', path: '/admin/notifications', icon: '🔔' },
        { label: 'Payments', path: '/admin/payments', icon: '💳' },
        { label: 'Chats',         path: '/admin/chats',         icon: '💬' },
        { label: 'Employees',     path: '/admin/users',         icon: '👤' },
        { label: 'Reports',       path: '/admin/reports',       icon: '📈' },
        { label: 'Settings', path: '/admin/settings', icon: '⚙️' },
    ];

    return (
        <DashboardLayout title="Universal Messenger" sidebarLinks={links} userRole="Super Admin">
            <div className="animate-fade-in" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'minmax(300px, 1fr) 2.5fr', 
                gap: '1px', 
                background: 'var(--glass-border)', 
                borderRadius: '15px', 
                overflow: 'hidden', 
                minHeight: '600px',
                height: 'calc(100vh - 200px)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
            }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ marginBottom: '20px' }}>ACTIVE SESSIONS</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ padding: '15px', background: 'rgba(212,175,55,0.1)', borderRadius: '10px', cursor: 'pointer', border: '1px solid var(--accent)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <strong>Customer Support</strong>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Active</span>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--accent)', marginBottom: '5px' }}>CUSTOMER QUERY</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Recent messages from support tab</div>
                        </div>
                    </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <h3 style={{ margin: 0 }}>John Doe</h3>
                            <span style={{ fontSize: '0.8rem', color: '#ffaa00' }}>Customer Support Ticket #4412</span>
                        </div>
                        <button style={{ background: 'none', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' }}>CLOSE TICKET</button>
                    </div>

                    <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {(!allChats.admin || allChats.admin.length === 0) ? (
                            <p style={{ textAlign: 'center', opacity: 0.5 }}>No messages in support yet.</p>
                        ) : (
                            allChats.admin.map(msg => (
                                <div key={msg.id} style={{ 
                                    alignSelf: msg.sender === 'user' ? 'flex-start' : 'flex-end', 
                                    maxWidth: '70%', 
                                    background: msg.sender === 'user' ? 'rgba(255,255,255,0.05)' : 'var(--accent)', 
                                    color: msg.sender === 'user' ? '#fff' : '#ffffff',
                                    padding: '15px', 
                                    borderRadius: msg.sender === 'user' ? '15px 15px 15px 0' : '15px 15px 0 15px',
                                    fontWeight: msg.sender === 'user' ? '400' : '600'
                                }}>
                                    <div>{msg.text}</div>
                                    <div style={{ fontSize: '0.65rem', opacity: 0.5, marginTop: '5px', textAlign: 'right' }}>{msg.time}</div>
                                </div>
                            ))
                        )}
                    </div>

                    <div style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', display: 'flex', gap: '15px', alignItems: 'stretch' }}>
                        <input 
                            className="modal-input"
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendReply()}
                            placeholder="Type your response..." 
                            style={{ flex: 1, padding: '0 20px', height: '54px', fontSize: '0.95rem' }} 
                        />
                        <button className="premium-button" onClick={sendReply} style={{ padding: '0 40px', minWidth: '140px', height: '54px', borderRadius: '12px' }}>SEND</button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminChat;
