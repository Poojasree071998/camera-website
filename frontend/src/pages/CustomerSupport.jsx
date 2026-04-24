import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';

const links = [
    { label: 'Dashboard', path: '/customer', icon: '📊' },
    { label: 'Products', path: '/customer/products', icon: '📸' },
    { label: 'Services', path: '/customer/services', icon: '🔧' },
    { label: 'My Orders', path: '/customer/orders', icon: '🛒' },
    { label: 'Purchase History', path: '/customer/history', icon: '📜' },
    { label: 'Wishlist', path: '/customer/wishlist', icon: '❤️' },
    { label: 'Compare Cameras', path: '/customer/compare', icon: '⚖️' },
    { label: 'Support Chat', path: '/customer/support', icon: '💬' },
    { label: 'Profile Settings', path: '/customer/profile', icon: '⚙️' },
];

const CustomerSupport = () => {
    const [activeTab, setActiveTab] = useState('admin');
    const [message, setMessage] = useState('');
    const [chats, setChats] = useState(() => {
        const saved = localStorage.getItem('DEMO_CHATS');
        if (saved && saved !== 'null') {
            try {
                const parsed = JSON.parse(saved);
                return { admin: [], vendor: [], complaints: [], ...parsed };
            } catch (e) {
                console.error("Error parsing DEMO_CHATS", e);
            }
        }
        return {
            admin: [{ id: 1, sender: 'support', text: 'Hello! How can we help you today?', time: '10:00 AM' }],
            vendor: [{ id: 1, sender: 'vendor', text: 'Regarding your order #CX-89230, we are checking the status.', time: '09:30 AM' }],
            complaints: []
        };
    });

    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === 'DEMO_CHATS') {
                setChats(JSON.parse(e.newValue));
            }
        };
        window.addEventListener('storage', handleStorage);
        const interval = setInterval(() => {
            const saved = localStorage.getItem('DEMO_CHATS');
            if (saved && saved !== 'null') {
                try {
                    const parsed = JSON.parse(saved);
                    setChats(prev => ({ ...prev, ...parsed }));
                } catch (e) {}
            }
        }, 3000);
        return () => {
            window.removeEventListener('storage', handleStorage);
            clearInterval(interval);
        };
    }, []);

    const sendMessage = () => {
        if (!message) return;
        const newMsg = { id: Date.now(), sender: 'user', text: message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        const updated = { ...chats, [activeTab]: [...chats[activeTab], newMsg] };
        setChats(updated);
        localStorage.setItem('DEMO_CHATS', JSON.stringify(updated));
        setMessage('');
    };

    return (
        <DashboardLayout title="Customer Support" sidebarLinks={links} userRole="Customer">
            <div className="glass-morphism" style={{ 
                minHeight: '600px',
                height: 'calc(100vh - 200px)',
                display: 'flex', 
                flexDirection: 'column', 
                padding: 0, 
                overflow: 'hidden' 
            }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)' }}>
                    {['admin', 'vendor', 'complaints'].map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)}
                            style={{ 
                                flex: 1, 
                                padding: '15px', 
                                background: activeTab === tab ? 'rgba(212,175,55,0.1)' : 'none', 
                                border: 'none', 
                                color: activeTab === tab ? 'var(--accent)' : 'var(--text-main)', 
                                fontWeight: activeTab === tab ? '700' : '400',
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                fontSize: '0.75rem',
                                letterSpacing: '1px'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                
                <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {(!chats[activeTab] || chats[activeTab].length === 0) ? (
                        <p style={{ textAlign: 'center', opacity: 0.5, marginTop: '20px' }}>No messages yet.</p>
                    ) : (
                        chats[activeTab].map(msg => (
                            <div key={msg.id} style={{ 
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '70%',
                                padding: '12px 18px',
                                background: msg.sender === 'user' ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                                color: msg.sender === 'user' ? '#000' : 'var(--text-main)',
                                borderRadius: '15px',
                                fontSize: '0.9rem'
                            }}>
                                <div>{msg.text}</div>
                                <div style={{ fontSize: '0.65rem', opacity: 0.5, marginTop: '5px', textAlign: 'right' }}>{msg.time}</div>
                            </div>
                        ))
                    )}
                </div>

                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '10px' }}>
                    <input 
                        className="modal-input" 
                        placeholder="Type your message..." 
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        style={{ flex: 1, padding: '12px' }}
                    />
                    <button className="premium-button" onClick={sendMessage}>SEND</button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CustomerSupport;
