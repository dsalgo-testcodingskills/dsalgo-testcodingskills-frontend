import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Footer.scss';

function Footer() {
  const { pathname } = useLocation();
  if (pathname.includes('/student')) return null;

  return (
    <div className="footer-basic">
      <footer>
        <div>
          <ul className="list-inline">
            <li className="list-inline-item">
              <Link className="link" to="/about">
                About Us
              </Link>
            </li>
            <li className="list-inline-item">
              <Link className="link" to="/contact">
                Contact Us
              </Link>
            </li>
            <li className="list-inline-item">
              <Link className="link" to="/pricing">
                Pricing
              </Link>
            </li>
            <li className="list-inline-item">
              <Link className="link" to="/terms-conditions">
                Terms & Conditions
              </Link>
            </li>
            <li className="list-inline-item">
              <Link className="link" to="/privacy-policy">
                Privacy Policy
              </Link>
            </li>
            <li className="list-inline-item">
              <Link className="link" to="/cancellation-policy">
                Cancellation/Refund Policy{' '}
              </Link>
            </li>
          </ul>
          <p className="copyright">DSAlgo © All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
