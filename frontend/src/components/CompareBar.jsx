import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompareList, removeFromCompare, clearCompare } from '../api';

const CompareBar = () => {
    const [list, setList] = useState([]);
    const navigate = useNavigate();

    const refreshList = () => {
        setList(getCompareList());
    };

    useEffect(() => {
        refreshList();
        // Listen for changes in localStorage from other components
        const handleStorage = () => refreshList();
        window.addEventListener('storage', handleStorage);
        // Custom event for same-window updates
        window.addEventListener('compareUpdated', handleStorage);
        
        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('compareUpdated', handleStorage);
        };
    }, []);

    if (list.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '900px',
            background: 'rgba(15, 15, 15, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
            borderRadius: '20px',
            padding: '15px 25px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 9999,
            boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
            animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
            <style>{`
                @keyframes slideUp {
                    from { transform: translate(-50%, 100%); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
            `}</style>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ marginRight: '10px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--accent)' }}>COMPARE GEAR</h4>
                    <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.6 }}>{list.length} items selected</p>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                    {list.map(item => (
                        <div key={item._id || item.id} style={{ position: 'relative' }}>
                            <img 
                                src={item.image || 'https://via.placeholder.com/60'} 
                                alt={item.name} 
                                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--glass-border)' }} 
                            />
                            <button 
                                onClick={() => {
                                    removeFromCompare(item._id || item.id);
                                    window.dispatchEvent(new Event('compareUpdated'));
                                }}
                                style={{
                                    position: 'absolute', top: '-5px', right: '-5px',
                                    width: '18px', height: '18px', borderRadius: '50%',
                                    background: '#ff4d4d', border: 'none', color: '#fff',
                                    fontSize: '10px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold'
                                }}
                            >✕</button>
                        </div>
                    ))}
                    {list.length < 4 && (
                        <div style={{ 
                            width: '50px', height: '50px', borderRadius: '8px', 
                            border: '2px dashed var(--glass-border)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.2rem', opacity: 0.3
                        }}>+</div>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
                <button 
                    onClick={() => {
                        clearCompare();
                        window.dispatchEvent(new Event('compareUpdated'));
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                    Clear All
                </button>
                <button 
                    className="premium-button"
                    onClick={() => navigate('/customer/compare')}
                    style={{ padding: '10px 25px', fontSize: '0.85rem' }}
                >
                    COMPARE NOW
                </button>
            </div>
        </div>
    );
};

export default CompareBar;
