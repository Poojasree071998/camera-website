import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { getCart, lsSet, clearCart, placeOrder } from '../api';

const CustomerCart = () => {
    const [cart, setCart] = useState(getCart());
    const [toast, setToast] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('online');

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

    const fmt = (n) => '₹' + Number(n || 0).toLocaleString();

    const updateQty = (id, delta) => {
        const updated = cart.map(item => {
            if ((item._id || item.id) === id) {
                const newQty = Math.max(1, (item.quantity || 1) + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        });
        setCart(updated);
        localStorage.setItem('ls_cart', JSON.stringify(updated));
    };

    const removeItem = (id) => {
        const updated = cart.filter(item => (item._id || item.id) !== id);
        setCart(updated);
        localStorage.setItem('ls_cart', JSON.stringify(updated));
        setToast('🗑️ Item removed from cart');
        setTimeout(() => setToast(''), 3000);
    };

    const subtotal = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        
        try {
            const orderData = {
                items: cart,
                total,
                subtotal,
                tax,
                paymentMethod,
                shippingAddress: '123 Tech Park, Hubli, KA',
                status: paymentMethod === 'cod' ? 'pending' : 'paid'
            };
            
            const res = await placeOrder(orderData);
            if (res.ok) {
                setToast(`🚀 Order placed successfully via ${paymentMethod.toUpperCase()}!`);
                clearCart();
                setCart([]);
            }
        } catch (err) {
            setToast('❌ Failed to place order');
        } finally {
            setTimeout(() => setToast(''), 3000);
        }
    };

    return (
        <DashboardLayout title="Shopping Cart" sidebarLinks={links} userRole="Customer">
            {toast && (
                <div style={{ position: 'fixed', top: '20px', right: '20px', background: 'var(--accent)', color: '#000', padding: '12px 25px', borderRadius: '8px', zIndex: 1000, fontWeight: '700', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                    {toast}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                <div className="glass-morphism" style={{ padding: '30px' }}>
                    <h3 style={{ marginBottom: '25px' }}>YOUR ITEMS ({cart.length})</h3>
                    
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                            <p>Your cart is empty.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {cart.map(item => (
                                <div key={item._id || item.id} style={{ 
                                    display: 'flex', 
                                    gap: '20px', 
                                    padding: '20px', 
                                    background: 'rgba(255,255,255,0.02)', 
                                    borderRadius: '12px',
                                    border: '1px solid var(--glass-border)'
                                }}>
                                    <img src={item.image || 'https://via.placeholder.com/80'} alt={item.name} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 5px 0' }}>{item.name}</h4>
                                        <p style={{ margin: 0, fontWeight: '700', color: 'var(--accent)' }}>{fmt(item.price)}</p>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '15px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                                                <button onClick={() => updateQty(item._id || item.id, -1)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', padding: '5px 12px', cursor: 'pointer', fontSize: '1.2rem' }}>-</button>
                                                <span style={{ width: '30px', textAlign: 'center', fontWeight: '700' }}>{item.quantity || 1}</span>
                                                <button onClick={() => updateQty(item._id || item.id, 1)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', padding: '5px 12px', cursor: 'pointer', fontSize: '1.2rem' }}>+</button>
                                            </div>
                                            <button onClick={() => removeItem(item._id || item.id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>REMOVE</button>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontWeight: '700' }}>
                                        {fmt(item.price * (item.quantity || 1))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div className="glass-morphism" style={{ padding: '30px' }}>
                        <h3 style={{ marginBottom: '25px' }}>PAYMENT METHOD</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
                            <div 
                                onClick={() => setPaymentMethod('online')}
                                style={{ 
                                    padding: '15px', borderRadius: '10px', cursor: 'pointer',
                                    border: `1px solid ${paymentMethod === 'online' ? 'var(--accent)' : 'var(--glass-border)'}`,
                                    background: paymentMethod === 'online' ? 'rgba(225, 175, 50, 0.1)' : 'transparent',
                                    display: 'flex', alignItems: 'center', gap: '12px'
                                }}
                            >
                                <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {paymentMethod === 'online' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)' }}></div>}
                                </div>
                                <span>Online Payment (Card/NetBanking)</span>
                            </div>
                            <div 
                                onClick={() => setPaymentMethod('upi')}
                                style={{ 
                                    padding: '15px', borderRadius: '10px', cursor: 'pointer',
                                    border: `1px solid ${paymentMethod === 'upi' ? 'var(--accent)' : 'var(--glass-border)'}`,
                                    background: paymentMethod === 'upi' ? 'rgba(225, 175, 50, 0.1)' : 'transparent',
                                    display: 'flex', alignItems: 'center', gap: '12px'
                                }}
                            >
                                <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {paymentMethod === 'upi' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)' }}></div>}
                                </div>
                                <span>UPI (Google Pay, PhonePe, etc.)</span>
                            </div>
                            <div 
                                onClick={() => setPaymentMethod('cod')}
                                style={{ 
                                    padding: '15px', borderRadius: '10px', cursor: 'pointer',
                                    border: `1px solid ${paymentMethod === 'cod' ? 'var(--accent)' : 'var(--glass-border)'}`,
                                    background: paymentMethod === 'cod' ? 'rgba(225, 175, 50, 0.1)' : 'transparent',
                                    display: 'flex', alignItems: 'center', gap: '12px'
                                }}
                            >
                                <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {paymentMethod === 'cod' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)' }}></div>}
                                </div>
                                <span>Cash on Delivery (COD)</span>
                            </div>
                        </div>

                        <h3 style={{ marginBottom: '25px' }}>SUMMARY</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.7 }}>
                                <span>Subtotal</span>
                                <span>{fmt(subtotal)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.7 }}>
                                <span>Tax (18% GST)</span>
                                <span>{fmt(tax)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '15px', borderTop: '1px solid var(--glass-border)', fontWeight: '700', fontSize: '1.2rem' }}>
                                <span>Total</span>
                                <span style={{ color: 'var(--accent)' }}>{fmt(total)}</span>
                            </div>
                        </div>
                        <button 
                            className="premium-button" 
                            style={{ width: '100%', marginTop: '30px', padding: '15px' }}
                            onClick={handleCheckout}
                            disabled={cart.length === 0}
                        >
                            {paymentMethod === 'cod' ? 'PLACE ORDER' : 'PAY & PLACE ORDER'}
                        </button>
                    </div>

                    <div className="glass-morphism" style={{ padding: '30px', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: 0 }}>Secure checkout powered by</p>
                        <h4 style={{ margin: '5px 0 0 0', letterSpacing: '2px' }}>🔒 STRIPE | RAZORPAY</h4>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CustomerCart;
