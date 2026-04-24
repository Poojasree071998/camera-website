import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraCarousel from './CameraCarousel';
import heroBanner1 from '../assets/hero_banner.png';
import heroBanner2 from '../assets/hero_banner2.png';
import heroBanner3 from '../assets/hero_banner3.png';
import './Hero.css';

const Hero = ({ onOpenFinder }) => {
    const navigate = useNavigate();
    const [currentBg, setCurrentBg] = useState(0);
    const banners = [heroBanner1, heroBanner2, heroBanner3];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBg((prev) => (prev + 1) % banners.length);
        }, 1000);
        return () => clearInterval(timer);
    }, [banners.length]);
    
    return (
        <div className="hero-section" style={{ backgroundImage: `url(${banners[currentBg]})` }}>
            <div className="hero-overlay-main"></div>
            <div className="hero-main-container">
                {/* LEFT SIDE: Content Overlay */}
                <div className="hero-banner-side">
                    <div className="hero-content animate-fade-in">
                        <div className="technical-text" style={{ marginBottom: '10px' }}>// Professional Grade Imaging</div>
                        <h1 className="hero-title">Experience <span>Cinematic</span> Precision</h1>
                        <p className="hero-subtitle">The ultimate ecosystem for visual storytellers, featuring professional gear discovery and full-frame innovation.</p>
                        <div className="hero-btns">
                            <button className="premium-button" onClick={() => navigate('/store')}>Explore Gear</button>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: 3D Image Showcase with Viewfinder */}
                <div className="hero-camera-side">
                    <div className="viewfinder-wrapper">
                        <div className="viewfinder-bracket bracket-tl"></div>
                        <div className="viewfinder-bracket bracket-tr"></div>
                        <div className="viewfinder-bracket bracket-bl"></div>
                        <div className="viewfinder-bracket bracket-br"></div>
                        <CameraCarousel />
                        <div className="technical-text" style={{ position: 'absolute', bottom: '-40px', left: '0', width: '100%', textAlign: 'center' }}>
                            [ AF-C ] FOCUS: AUTO | RAW 14-BIT
                        </div>
                    </div>
                </div>
            </div>

            <div className="hero-stats-footer">
                <div className="stat-item">
                    <h3>500+</h3>
                    <p>Vendors</p>
                </div>
                <div className="stat-item">
                    <h3>10k+</h3>
                    <p>Products</p>
                </div>
                <div className="stat-item">
                    <h3>24/7</h3>
                    <p>Support</p>
                </div>
            </div>
        </div>
    );
};

export default Hero;
