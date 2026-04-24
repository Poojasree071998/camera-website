import React from 'react';
import Navbar from '../components/Navbar';
import placeholderCamera from '../assets/placeholder_camera.png';
import './Tutorials.css';

const Tutorials = () => {
    const categories = ['Beginner', 'In-place', 'Night Photography', 'Post Processing'];
    
    const videos = [
        { id: 1, title: 'How to use DSLR', level: 'Beginner', duration: '12:45', thumb: placeholderCamera },
        { id: 2, title: 'Beginner camera settings', level: 'Beginner', duration: '08:20', thumb: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=400' },
        { id: 3, title: 'Night photography tips', level: 'In-place', duration: '15:10', thumb: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&q=80&w=400' },
        { id: 4, title: 'Golden Hour Portraits', level: 'Advanced', duration: '10:30', thumb: 'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?auto=format&fit=crop&q=80&w=400' },
        { id: 5, title: 'Editing in Lightroom', level: 'Post-Proc', duration: '22:15', thumb: 'https://images.unsplash.com/photo-1500643752441-28b9a1969988?auto=format&fit=crop&q=80&w=400' },
        { id: 6, title: 'Lenses Explained', level: 'Hardware', duration: '14:50', thumb: 'https://images.unsplash.com/photo-1495120611572-1cc9e476cd20?auto=format&fit=crop&q=80&w=400' }
    ];

    return (
        <div className="tutorials-page">
            <Navbar />
            <div className="tutorials-container animate-fade-in">
                <header className="tutorials-header">
                    <h1>Camera <span>Tutorials</span></h1>
                    <p>Master your gear with professional learning guides</p>
                </header>

                <div className="tutorials-filter glass-morphism">
                    {categories.map(cat => (
                        <button key={cat} className="filter-chip">{cat}</button>
                    ))}
                </div>

                <div className="tutorials-grid">
                    {videos.map(video => (
                        <div key={video.id} className="video-card glass-morphism">
                            <div className="video-thumb">
                                <img src={video.thumb} alt={video.title} />
                                <div className="play-icon">▶</div>
                                <span className="duration">{video.duration}</span>
                            </div>
                            <div className="video-info">
                                <span className="level-badge">{video.level}</span>
                                <h3>{video.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Tutorials;
