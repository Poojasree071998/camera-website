import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Explore.css';

const Explore = () => {
    const navigate = useNavigate();

    const exploreCards = [
        {
            id: 'deals',
            title: 'View Deals',
            desc: 'Find the best discounts on top camera gear.',
            icon: '🏷️',
            path: '/flash-deals',
            color: '#ff4d4d'
        },
        {
            id: 'compare',
            title: 'Compare Products',
            desc: 'Side-by-side specs for smarter decisions.',
            icon: '⚖️',
            path: '/customer/compare',
            color: '#4dadff'
        },
        {
            id: 'new',
            title: 'New Arrivals',
            desc: 'The latest additions to our collection.',
            icon: '🆕',
            path: '/products/all?sort=newest',
            color: '#4dff4d'
        },
        {
            id: 'best',
            title: 'Best Sellers',
            desc: 'Our most popular and trusted gear.',
            icon: '🔥',
            path: '/products/all?sort=bestselling',
            color: '#ffd14d'
        },
        {
            id: 'community',
            title: 'Community',
            desc: 'User reviews, tips, and photo galleries.',
            icon: '👥',
            path: '/community',
            color: '#d14dff'
        },
        {
            id: 'tutorials',
            title: 'Watch Tutorials',
            desc: 'Master your camera with expert guides.',
            icon: '🎥',
            path: '/tutorials',
            color: '#ff4d94'
        }
    ];

    return (
        <div className="explore-page">
            <Navbar />
            <div className="explore-container animate-fade-in">
                <header className="explore-header">
                    <h1>Explore <span>Gear</span></h1>
                    <p>Everything you need to level up your photography journey</p>
                </header>

                <div className="explore-grid">
                    {exploreCards.map((card) => (
                        <div 
                            key={card.id} 
                            className="explore-card glass-morphism"
                            onClick={() => navigate(card.path)}
                        >
                            <div className="card-icon" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
                                {card.icon}
                            </div>
                            <div className="card-content">
                                <h3>{card.title}</h3>
                                <p>{card.desc}</p>
                            </div>
                            <div className="card-arrow">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14m-7-7 7 7-7 7"/>
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Explore;
