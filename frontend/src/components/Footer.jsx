import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-section brand-section">
          <h2>CAMERA<span>CORE</span></h2>
          <p>The world's most advanced camera marketplace and service platform.</p>
          <div className="social-links">
            <a href="#"><i className="fab fa-facebook-f"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-youtube"></i></a>
          </div>
        </div>

        <div className="footer-section links-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/explore">Explore Gear</Link></li>
            <li><Link to="/customer/services">Services</Link></li>
            <li><Link to="/community">Community</Link></li>
          </ul>
        </div>

        <div className="footer-section contact-section">
          <h3>Contact Us</h3>
          <ul>
            <li><i className="fas fa-envelope"></i> support@cameracore.com</li>
            <li><i className="fas fa-phone"></i> +91 98765 43210</li>
            <li><i className="fas fa-map-marker-alt"></i> Tech Park, Hubli, India</li>
          </ul>
        </div>

        <div className="footer-section legal-section">
          <h3>Information</h3>
          <ul>
            <li><Link to="/terms">Terms & Conditions</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/support">Customer Support</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} CameraCore. All rights reserved.</p>
        <div className="payment-icons">
          <i className="fab fa-cc-visa"></i>
          <i className="fab fa-cc-mastercard"></i>
          <i className="fab fa-cc-apple-pay"></i>
          <i className="fab fa-cc-amazon-pay"></i>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
