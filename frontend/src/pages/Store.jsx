import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Store.css';

const categories = [
    { title: 'DSLR Cameras', image: '/products/canon_90d.png', desc: 'Powerful full-frame and APS-C DSLR cameras for precision.', path: '/products/dslr' },
    { title: 'Mirrorless Cameras', image: '/products/sony_a7iv.png', desc: 'Compact power with cutting-edge digital imaging technology.', path: '/products/mirrorless' },
    { title: 'Video Cameras', image: '/products/blackmagic_6k.png', desc: 'Professional cinema and camcorder solutions for creators.', path: '/products/video' },
    { title: 'Camera Lenses', image: '/products/sony_lens.png', desc: 'From wide-angle to telephoto, find your perfect perspective.', path: '/products/lenses' },
    { title: 'Memory Cards', image: '/products/sandisk_sd.png', desc: 'High-speed storage solutions for 4K and 8K workflows.', path: '/products/storage' },
    { title: 'Batteries & Chargers', image: '/products/battery.png', desc: 'Never lose power with our range of professional power solutions.', path: '/products/power' },
    { title: 'Camera Bags', image: '/products/peak_design.png', desc: 'Premium protection for your valuable gear on the move.', path: '/products/bags' },
    { title: 'Camera Accessories', image: '/products/dji_rs3.png', desc: 'Microphones, tripods, and lighting for the perfect shot.', path: '/products/accessories' },
];

const Store = () => {
    return (
        <div className="store-page">
            <div className="cinematic-bg"></div>
            <Navbar />

            <div className="store-header animate-fade-in">
                <h1>Our <span>Signature</span> Collection</h1>
                <p>Discovery professional-grade equipment curated for the modern visual storyteller.</p>
            </div>

            <div className="category-grid animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {categories.map((cat, index) => (
                    <Link to={cat.path} key={index} className="category-card glass-morphism">
                        <div className="card-glare"></div>
                        <div className="category-image-container">
                            <img src={cat.image} alt={cat.title} />
                        </div>
                        <h3>{cat.title}</h3>
                        <p>{cat.desc}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Store;
