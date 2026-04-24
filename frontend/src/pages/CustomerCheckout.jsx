import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { fetchPublicProducts, placeOrder, getUser } from '../api';
import placeholderCamera from '../assets/placeholder_camera.png';

const CustomerCheckout = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingId, setBookingId] = useState('');
    
    const [formData, setFormData] = useState({
        address: '',
        city: '',
        pincode: '',
        landmark: '',
        phone: '',
        date: '',
        timeSlot: 'Morning (9 AM – 12 PM)',
        paymentMethod: 'Cash on Service'
    });

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

    useEffect(() => {
        fetchPublicProducts().then(prods => {
            const found = prods.find(p => String(p._id || p.id) === String(id));
            setProduct(found);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleConfirmOrder = async () => {
        const installation = 800;
        const serviceCharge = 200;
        const total = (product?.price || 0) + installation + serviceCharge;

        const orderData = {
            items: [{
                productId: product._id,
                productName: product.name,
                price: product.price,
                quantity: 1,
                vendorEmail: product.vendorEmail,
                vendorName: product.vendorName
            }],
            shippingAddress: `${formData.address}, ${formData.city} - ${formData.pincode}`,
            phone: formData.phone,
            installationDate: formData.date,
            timeSlot: formData.timeSlot,
            paymentMethod: formData.paymentMethod,
            totalAmount: total,
            status: 'pending'
        };

        try {
            const res = await placeOrder(orderData);
            if (res.ok) {
                setBookingId(res.order._id || 'BK-' + Date.now().toString().slice(-6));
                setStep(7);
            }
        } catch (err) {
            alert('Failed to place order. Please try again.');
        }
    };

    if (loading) return <DashboardLayout title="Checkout" sidebarLinks={links} userRole="Customer"><div>Loading...</div></DashboardLayout>;
    if (!product) return <DashboardLayout title="Checkout" sidebarLinks={links} userRole="Customer"><div>Product found.</div></DashboardLayout>;

    const fmt = (n) => '₹' + Number(n || 0).toLocaleString();

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="glass-morphism animate-fade-in" style={{ padding: '30px' }}>
                        <h2 style={{ marginBottom: '20px' }}>1. Product Details</h2>
                        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                            <img 
                                src={(product.images && product.images[0]) || product.image || placeholderCamera} 
                                alt={product.name} 
                                style={{ width: '250px', height: '250px', objectFit: 'cover', borderRadius: '12px' }}
                                onError={(e) => e.target.src = placeholderCamera}
                            />
                            <div style={{ flex: 1 }}>
                                <span className="brand-tag">{product.brand}</span>
                                <h3 style={{ fontSize: '1.8rem', margin: '10px 0', color: 'var(--text-main)' }}>{product.name}</h3>
                                <div style={{ fontSize: '1.5rem', color: 'var(--accent)', fontWeight: '700', marginBottom: '20px' }}>{fmt(product.price)}</div>
                                
                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '10px', color: 'var(--text-main)' }}>FEATURES</h4>
                                    <ul style={{ paddingLeft: '20px', opacity: 0.8, color: 'var(--text-main)' }}>
                                        {(product.features || ['Night Vision', '4K Ultra HD', 'Motion Detection']).map((f, i) => <li key={i}>{f}</li>)}
                                    </ul>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '40px', marginBottom: '30px', color: 'var(--text-main)' }}>
                                    <div>
                                        <h4 style={{ fontSize: '0.7rem', opacity: 0.5, color: 'var(--text-dim)' }}>WARRANTY</h4>
                                        <div style={{ fontWeight: '600' }}>{product.warranty || '2 Years Brand Warranty'}</div>
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '0.7rem', opacity: 0.5, color: 'var(--text-dim)' }}>AVAILABILITY</h4>
                                        <div style={{ color: product.stock > 0 ? 'var(--success)' : 'var(--error)', fontWeight: '700' }}>
                                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                        </div>
                                    </div>
                                </div>
                                
                                <button className="premium-button" style={{ padding: '12px 30px' }} onClick={nextStep} disabled={product.stock <= 0}>
                                    PROCEED TO BOOKING
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="premium-card animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ marginBottom: '30px', color: 'var(--text-main)' }}>2. Address Details</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }}>Full Address</label>
                                <textarea name="address" value={formData.address} onChange={handleChange} className="modal-input" style={{ height: '80px' }} placeholder="House No, Street, Locality" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }}>City</label>
                                    <input type="text" name="city" value={formData.city} onChange={handleChange} className="modal-input" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }}>Pincode</label>
                                    <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="modal-input" />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }}>Landmark</label>
                                <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} className="modal-input" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }}>Phone Number</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="modal-input" />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                <button className="secondary-btn" style={{ flex: 1, backgroundColor: 'var(--secondary)', color: 'var(--text-main)', border: '2px solid var(--accent)' }} onClick={prevStep}>BACK</button>
                                <button className="premium-button" style={{ flex: 1 }} onClick={nextStep} disabled={!formData.address || !formData.phone}>NEXT</button>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="premium-card animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ marginBottom: '30px', color: 'var(--text-main)' }}>3. Date & Time Slot</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', color: 'var(--text-main)' }}>Choose Installation Date</label>
                                <input 
                                    type="date" 
                                    name="date" 
                                    value={formData.date} 
                                    onChange={handleChange} 
                                    className="modal-input" 
                                    style={{ 
                                        colorScheme: 'light dark',
                                        backgroundColor: 'var(--input-bg)',
                                        color: 'var(--text-main)',
                                        border: '2px solid var(--accent)',
                                        fontWeight: '600'
                                    }}
                                    min={new Date().toISOString().split('T')[0]} 
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '15px', fontSize: '0.9rem', color: 'var(--text-main)' }}>Select Time Slot</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {['Morning (9 AM – 12 PM)', 'Afternoon (12 PM – 4 PM)', 'Evening (4 PM – 8 PM)'].map(slot => (
                                        <div 
                                            key={slot} 
                                            onClick={() => setFormData({ ...formData, timeSlot: slot })}
                                            style={{ 
                                                padding: '15px', borderRadius: '10px', cursor: 'pointer',
                                                border: `1px solid ${formData.timeSlot === slot ? 'var(--accent)' : 'var(--card-border)'}`,
                                                background: formData.timeSlot === slot ? 'rgba(59, 130, 246, 0.1)' : 'var(--secondary)',
                                                color: 'var(--text-main)',
                                                transition: '0.3s'
                                            }}
                                        >
                                            {slot}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                <button className="secondary-btn" style={{ flex: 1, backgroundColor: 'var(--secondary)', color: 'var(--text-main)', border: '2px solid var(--accent)' }} onClick={prevStep}>BACK</button>
                                <button className="premium-button" style={{ flex: 1 }} onClick={nextStep} disabled={!formData.date}>NEXT</button>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                const installation = 800;
                const serviceCharge = 200;
                const total = product.price + installation + serviceCharge;
                return (
                    <div className="premium-card animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ marginBottom: '30px', color: 'var(--text-main)' }}>4. Price Summary</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--card-border)', color: 'var(--text-main)' }}>
                                <span style={{ opacity: 0.7 }}>{product.name} (Camera)</span>
                                <span style={{ fontWeight: '600' }}>{fmt(product.price)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--card-border)', color: 'var(--text-main)' }}>
                                <span style={{ opacity: 0.7 }}>Installation Charges</span>
                                <span style={{ fontWeight: '600' }}>{fmt(installation)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--card-border)', color: 'var(--text-main)' }}>
                                <span style={{ opacity: 0.7 }}>Service Charge</span>
                                <span style={{ fontWeight: '600' }}>{fmt(serviceCharge)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', marginTop: '10px', fontSize: '1.4rem', color: 'var(--text-main)' }}>
                                <span style={{ fontWeight: '700' }}>Total Amount</span>
                                <span style={{ fontWeight: '800', color: 'var(--accent)' }}>{fmt(total)}</span>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                <button className="secondary-btn" style={{ flex: 1, backgroundColor: 'var(--secondary)', color: 'var(--text-main)', border: '2px solid var(--accent)' }} onClick={prevStep}>BACK</button>
                                <button className="premium-button" style={{ flex: 1 }} onClick={nextStep}>CONTINUE</button>
                            </div>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="premium-card animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ marginBottom: '30px', color: 'var(--text-main)' }}>5. Payment Option</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {['Cash on Service', 'UPI', 'Credit / Debit Card', 'Online Payment'].map(method => (
                                <div 
                                    key={method} 
                                    onClick={() => setFormData({ ...formData, paymentMethod: method })}
                                    style={{ 
                                        padding: '18px', borderRadius: '12px', cursor: 'pointer',
                                        border: `1px solid ${formData.paymentMethod === method ? 'var(--accent)' : 'var(--card-border)'}`,
                                        background: formData.paymentMethod === method ? 'rgba(59, 130, 246, 0.1)' : 'var(--secondary)',
                                        display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--text-main)'
                                    }}
                                >
                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {formData.paymentMethod === method && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)' }}></div>}
                                    </div>
                                    <span style={{ fontWeight: '600' }}>{method}</span>
                                </div>
                            ))}
                            
                            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                                <button className="secondary-btn" style={{ flex: 1, backgroundColor: 'var(--secondary)', color: 'var(--text-main)', border: '2px solid var(--accent)' }} onClick={prevStep}>BACK</button>
                                <button className="premium-button" style={{ flex: 1 }} onClick={nextStep}>NEXT</button>
                            </div>
                        </div>
                    </div>
                );
            case 6:
                const instFee = 800;
                const srFee = 200;
                const grandTotal = product.price + instFee + srFee;
                return (
                    <div className="premium-card animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ marginBottom: '25px', textAlign: 'center', color: 'var(--text-main)' }}>Confirm Your Booking</h2>
                        <div style={{ background: 'var(--secondary)', borderRadius: '12px', padding: '25px', marginBottom: '30px', border: '1px solid var(--card-border)', color: 'var(--text-main)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
                                <span style={{ opacity: 0.6 }}>Product:</span>
                                <span style={{ fontWeight: '600' }}>{product.name}</span>
                                <span style={{ opacity: 0.6 }}>Service:</span>
                                <span style={{ fontWeight: '600' }}>Installation</span>
                                <span style={{ opacity: 0.6 }}>Date:</span>
                                <span style={{ fontWeight: '600' }}>{new Date(formData.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</span>
                                <span style={{ opacity: 0.6 }}>Time:</span>
                                <span style={{ fontWeight: '600' }}>{formData.timeSlot.split(' ')[0]} {formData.timeSlot.split(' ')[1]}</span>
                                <span style={{ opacity: 0.6 }}>Address:</span>
                                <span style={{ fontWeight: '600' }}>{formData.address}</span>
                                <span style={{ opacity: 0.6, paddingTop: '10px', borderTop: '1px solid var(--card-border)' }}>Total Price:</span>
                                <span style={{ fontWeight: '800', color: 'var(--accent)', fontSize: '1.2rem', paddingTop: '10px', borderTop: '1px solid var(--card-border)' }}>{fmt(grandTotal)}</span>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button className="secondary-btn" style={{ flex: 1, backgroundColor: 'var(--secondary)', color: 'var(--text-main)', border: '2px solid var(--accent)' }} onClick={prevStep}>BACK</button>
                            <button className="premium-button" style={{ flex: 1 }} onClick={handleConfirmOrder}>CONFIRM ORDER</button>
                        </div>
                    </div>
                );
            case 7:
                return (
                    <div className="glass-morphism animate-fade-in" style={{ padding: '50px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
                        <h2 style={{ marginBottom: '10px', color: '#4caf50' }}>Order Booked Successfully</h2>
                        <p style={{ opacity: 0.7, marginBottom: '30px', lineHeight: '1.6' }}>
                            Your request has been sent to admin.<br />
                            A technician will be assigned soon.
                        </p>
                        
                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', marginBottom: '40px', border: '1px dashed var(--accent)' }}>
                            <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>BOOKING ID:</span>
                            <h3 style={{ margin: '5px 0', letterSpacing: '2px', color: 'var(--accent)' }}>{bookingId}</h3>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button className="premium-button" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#fff' }} onClick={() => navigate('/customer')}>GO TO DASHBOARD</button>
                            <button className="premium-button" style={{ flex: 1 }} onClick={() => navigate('/customer/orders')}>TRACK ORDER</button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <DashboardLayout title="Checkout & Booking" sidebarLinks={links} userRole="Customer">
            {/* Step Progress Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', padding: '0 20px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '15px', left: '40px', right: '40px', height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}>
                    <div style={{ height: '100%', width: `${((step - 1) / 6) * 100}%`, background: 'var(--accent)', transition: '0.5s' }}></div>
                </div>
                {[1, 2, 3, 4, 5, 6].map(s => (
                    <div key={s} style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', background: step >= s ? 'var(--accent)' : 'rgba(255,255,255,0.1)', 
                        color: step >= s ? '#000' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        zIndex: 1, fontWeight: '700', fontSize: '0.8rem', transition: '0.3s'
                    }}>
                        {s}
                    </div>
                ))}
            </div>

            <div style={{ minHeight: '500px' }}>
                {renderStep()}
            </div>
        </DashboardLayout>
    );
};

export default CustomerCheckout;
