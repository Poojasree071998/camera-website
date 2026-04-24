import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import placeholderCamera from '../assets/placeholder_camera.png';
import './FlashDeals.css';

const FlashDeals = () => {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState({
        hours: 2,
        minutes: 14,
        seconds: 33
    });

    // --- COUNTDOWN LOGIC ---
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let s = prev.seconds - 1;
                let m = prev.minutes;
                let h = prev.hours;

                if (s < 0) {
                    s = 59;
                    m -= 1;
                }
                if (m < 0) {
                    m = 59;
                    h -= 1;
                }
                if (h < 0) {
                    clearInterval(timer);
                    return { hours: 0, minutes: 0, seconds: 0 };
                }
                return { hours: h, minutes: m, seconds: s };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const dailyDeals = [
        { name: "Sony ZV-E10", original: "$899", price: "$674", discount: "25% OFF", stock: 12 },
        { name: "Canon RF 50mm Lens", original: "$199", price: "$139", discount: "30% OFF", stock: 8 },
        { name: "DJI Mic", original: "$329", price: "$263", discount: "20% OFF", stock: 5 }
    ];

    const bundles = [
        {
            title: "Ultimate Creator Bundle",
            items: ["Sony ZV-E10", "Grip Tripod", "Directional Mic", "Camera Bag"],
            price: "$1149",
            savings: "$350",
            image: placeholderCamera
        }
    ];

    return (
        <div className="flash-deals-page">
            <Navbar />

            <div className="deals-container">
                {/* 1. HERO COUNTDOWN SECTION */}
                <section className="deal-hero glass-morphism animate-fade-in">
                    <div className="deal-badge">⚡ FLASH DEAL</div>
                    <div className="deal-hero-content">
                        <div className="deal-hero-product">
                            <img src={placeholderCamera} alt="Sony A7 IV" />
                        </div>
                        <div className="deal-hero-details">
                            <h2>SONY ALPHA A7 IV</h2>
                            <div className="price-tag">
                                <span className="old-price">$2499</span>
                                <span className="new-price">$1999</span>
                            </div>

                            <div className="timer-box">
                                <p>⏳ Deal ends in:</p>
                                <div className="countdown">
                                    <span>{String(timeLeft.hours).padStart(2, '0')}</span>:
                                    <span>{String(timeLeft.minutes).padStart(2, '0')}</span>:
                                    <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
                                </div>
                            </div>

                            <div className="stock-alert">🔥 Only 5 left at this price!</div>
                            <button onClick={() => navigate('/store')} className="premium-button buy-now">BUY NOW</button>
                        </div>
                    </div>
                </section>

                {/* 2. DAILY CAMERA DEALS */}
                <section className="daily-deals-section">
                    <h3 className="section-title">DAILY CAMERA DEALS</h3>
                    <div className="deals-table glass-morphism">
                        <div className="table-header">
                            <span>Product</span>
                            <span>Discount</span>
                            <span>Stock</span>
                            <span>Action</span>
                        </div>
                        {dailyDeals.map((deal, idx) => (
                            <div key={idx} className="table-row">
                                <span className="p-name">{deal.name}</span>
                                <span className="p-discount">{deal.discount}</span>
                                <span className="p-stock">{deal.stock} left</span>
                                <button onClick={() => navigate('/store')} className="view-btn">View Deal</button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. BUNDLE DEAL */}
                <section className="bundles-section">
                    <h3 className="section-title">CREATOR BUNDLES</h3>
                    {bundles.map((bundle, idx) => (
                        <div key={idx} className="bundle-card glass-morphism">
                            <div className="bundle-image">
                                <img src={bundle.image} alt={bundle.title} />
                            </div>
                            <div className="bundle-info">
                                <h4>{bundle.title}</h4>
                                <ul className="bundle-items">
                                    {bundle.items.map((item, i) => (
                                        <li key={i}>+ {item}</li>
                                    ))}
                                </ul>
                                <div className="bundle-price">
                                    <span className="total">{bundle.price}</span>
                                    <span className="save">SAVE {bundle.savings}</span>
                                </div>
                                <button onClick={() => navigate('/store')} className="premium-button">BUY NOW</button>
                            </div>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
};

export default FlashDeals;
