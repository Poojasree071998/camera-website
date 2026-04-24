import React from 'react';
import './CameraCarousel.css';
import camera1 from '../assets/camera1.png';
import camera2 from '../assets/camera2.png';
import camera3 from '../assets/camera3.png';

const CameraCarousel = () => {
  return (
    <div className="carousel-stage">
      <div className="carousel-glow"></div>
      <div className="carousel-rotator">
        <div className="carousel-item">
          <img src={camera1} alt="DSLR Camera" />
        </div>
        <div className="carousel-item">
          <img src={camera2} alt="Mirrorless Camera" />
        </div>
        <div className="carousel-item">
          <img src={camera3} alt="Cine Camera" />
        </div>
      </div>
    </div>
  );
};

export default CameraCarousel;
