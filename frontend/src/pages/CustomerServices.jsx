import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { requestService } from '../api';

const CustomerServices = () => {
    const [selectedService, setSelectedService] = useState(null);
    const [bookingData, setBookingData] = useState({ address: '', date: '', notes: '' });
    const [isBooking, setIsBooking] = useState(false);
    const [message, setMessage] = useState('');

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

    const serviceOptions = [
        { id: 1, name: 'Sensor Cleaning', price: '₹2,500', image: '/services/sensor_cleaning.png', desc: 'Professional deep clean of your camera sensor.' },
        { id: 2, name: 'Firmware Update', price: '₹1,000', image: '/services/firmware_update.png', desc: 'Update to the latest official firmware for peak performance.' },
        { id: 3, name: 'Lens Calibration', price: '₹4,000', image: '/services/lens_calibration.png', desc: 'Precision AF calibration for sharper images.' },
        { id: 4, name: 'Body Repair', price: 'Estimation', image: '/services/body_repair.png', desc: 'Fixing physical damage, shutter issues, or screen repairs.' },
    ];

    const handleBook = async (e) => {
        e.preventDefault();
        setIsBooking(true);
        try {
            const res = await requestService({
                serviceId: selectedService.id,
                serviceName: selectedService.name,
                price: selectedService.price,
                ...bookingData
            });
            if (res.ok) {
                setMessage('Booking requested successfully! A technician will be assigned soon.');
                setTimeout(() => {
                    setSelectedService(null);
                    setMessage('');
                    setBookingData({ address: '', date: '', notes: '' });
                }, 3000);
            }
        } catch (err) {
            console.error('Booking failed', err);
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <DashboardLayout title="Camera Services" sidebarLinks={links} userRole="Customer">
            <div style={{ marginBottom: '30px' }}>
                <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>Maintain your gear with our expert technical services.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                {serviceOptions.map(service => (
                    <div key={service.id} className="glass-morphism" style={{ 
                        overflow: 'hidden', padding: '0', transition: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
                        display: 'flex', flexDirection: 'column', height: '100%' 
                    }}>
                        <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                            <img 
                                src={service.image} 
                                alt={service.name} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.5s transform' }}
                                className="service-card-image"
                            />
                            <div style={{ 
                                position: 'absolute', top: 10, right: 10, padding: '5px 12px', 
                                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', 
                                borderRadius: '20px', color: '#fff', fontSize: '0.8rem', fontWeight: '600'
                            }}>
                                SERVICE
                            </div>
                        </div>
                        <div style={{ padding: '25px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ marginBottom: '10px', color: 'var(--accent)', fontSize: '1.4rem' }}>{service.name}</h3>
                            <p style={{ opacity: 0.7, fontSize: '0.95rem', marginBottom: '25px', lineHeight: '1.6', flexGrow: 1 }}>{service.desc}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                <span style={{ fontWeight: '800', fontSize: '1.3rem' }}>{service.price}</span>
                                <button 
                                    className="premium-button" 
                                    style={{ padding: '12px 25px', fontSize: '0.85rem', letterSpacing: '1px' }}
                                    onClick={() => setSelectedService(service)}
                                >
                                    BOOK NOW
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedService && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="glass-morphism animate-fade-in" style={{ width: '450px', padding: '40px', position: 'relative' }}>
                        <button 
                            onClick={() => setSelectedService(null)}
                            style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
                        >
                            &times;
                        </button>
                        <h2 style={{ marginBottom: '10px' }}>Book {selectedService.name}</h2>
                        <p style={{ color: 'var(--accent)', marginBottom: '30px' }}>Price: {selectedService.price}</p>

                        {message ? (
                            <div style={{ padding: '20px', background: 'rgba(0,255,100,0.1)', color: '#4caf50', borderRadius: '8px', textAlign: 'center' }}>
                                {message}
                            </div>
                        ) : (
                            <form onSubmit={handleBook}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Visit Address</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="glass-morphism"
                                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                        value={bookingData.address}
                                        onChange={e => setBookingData({...bookingData, address: e.target.value})}
                                        placeholder="Enter your location"
                                    />
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Preferred Date</label>
                                    <input 
                                        type="date" 
                                        required 
                                        className="glass-morphism"
                                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                        value={bookingData.date}
                                        onChange={e => setBookingData({...bookingData, date: e.target.value})}
                                    />
                                </div>
                                <div style={{ marginBottom: '30px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Notes for Technician</label>
                                    <textarea 
                                        className="glass-morphism"
                                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', height: '80px' }}
                                        value={bookingData.notes}
                                        onChange={e => setBookingData({...bookingData, notes: e.target.value})}
                                        placeholder="Any specific issues?"
                                    ></textarea>
                                </div>
                                <button type="submit" className="premium-button" style={{ width: '100%', padding: '15px' }} disabled={isBooking}>
                                    {isBooking ? 'REQUESTING...' : 'CONFIRM BOOKING'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <div className="glass-morphism" style={{ marginTop: '40px', padding: '40px', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '15px' }}>Need a custom repair?</h2>
                <p style={{ opacity: 0.6, marginBottom: '25px' }}>Our master technicians are ready to help with any complex issues.</p>
                <button className="premium-button" style={{ padding: '15px 40px' }} onClick={() => window.location.href='/customer/support'}>CONTACT SUPPORT</button>
            </div>
        </DashboardLayout>
    );
};

export default CustomerServices;
