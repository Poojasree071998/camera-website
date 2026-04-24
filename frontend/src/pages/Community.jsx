import React from 'react';
import Navbar from '../components/Navbar';
import placeholderCamera from '../assets/placeholder_camera.png';
import './Community.css';

const Community = () => {
    const galleryItems = [
        { id: 1, user: '@lensmaster', img: placeholderCamera, likes: 124, caption: 'Golden hour with the R5.' },
        { id: 2, user: '@vlog_queen', img: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=400', likes: 89, caption: 'New setup for the next video!' },
        { id: 3, user: '@nature_phi', img: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&q=80&w=400', likes: 256, caption: 'Spotted this beauty today.' },
        { id: 4, user: '@street_snap', img: 'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?auto=format&fit=crop&q=80&w=400', likes: 167, caption: 'Tokyo nights.' }
    ];

    const tips = [
        { title: 'Golden Hour Magic', author: '@pro_shot', desc: 'Shoot 30 mins before sunset for natural glow.' },
        { title: 'Manual Focus Tips', author: '@focus_king', desc: 'Use focus peaking for razor-sharp results.' },
        { title: 'ND Filters 101', author: '@shutter_jay', desc: 'Essential for long exposures in daylight.' }
    ];

    return (
        <div className="community-page">
            <Navbar />
            <div className="community-container animate-fade-in">
                <header className="community-header">
                    <h1>Camera <span>Community</span></h1>
                    <p>Share, learn, and grow with fellow enthusiasts</p>
                </header>

                <div className="community-sections">
                    <section className="gallery-section">
                        <h2>Member <span>Gallery</span></h2>
                        <div className="gallery-grid">
                            {galleryItems.map(item => (
                                <div key={item.id} className="gallery-card glass-morphism">
                                    <img src={item.img} alt={item.caption} />
                                    <div className="gallery-info">
                                        <span className="user">{item.user}</span>
                                        <div className="likes">❤️ {item.likes}</div>
                                    </div>
                                    <p className="caption">{item.caption}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <aside className="sidebar-section">
                        <section className="tips-section">
                            <h2>Daily <span>Tips</span></h2>
                            <div className="tips-list">
                                {tips.map((tip, i) => (
                                    <div key={i} className="tip-card glass-morphism">
                                        <h4>{tip.title}</h4>
                                        <p>{tip.desc}</p>
                                        <span className="author">by {tip.author}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="community-join-card glass-morphism">
                            <h3>Join the Discussion</h3>
                            <p>Share your latest shots and get feedback from pros.</p>
                            <button className="premium-button">Post Now</button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default Community;
