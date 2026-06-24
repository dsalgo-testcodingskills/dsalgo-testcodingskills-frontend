import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Footer.scss';

function Footer() {
  const { pathname } = useLocation();
  if (pathname.includes('/student')) return null;

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <Link to="/">
              <img 
                src="/images/ALGO.png" 
                alt="ALGO Logo" 
                className="footer-logo"
              />
            </Link>
            <p>The Technical Assessment Platform</p>
          </div>

          <div className="footer-links">
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/terms-conditions">Terms & Conditions</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/cancellation-policy">Cancellation/Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            © {new Date().getFullYear()} DSAlgo. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;