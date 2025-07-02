import React from "react";

const Footer = () => {
  return (
    <footer>
      <div className="footernavigation">
        <div className="footercol">
          <h2>Developer</h2>
          <ul className="listremove">
            <li>Documentation</li>
            <li>Billing</li>
            <li>Supported Currencies</li>
          </ul>
        </div>
        <div className="footercol">
          <h2>Resources</h2>
          <ul className="listremove">
            <li>Pricing</li>
            <li>FAQ</li>
            <li>Blog</li>
          </ul>
        </div>
        <div className="footercol">
          <h2>Company</h2>
          <ul className="listremove">
            <li>About Us</li>
            <li>Pricing</li>
            <li>Career</li>
            <li>Contact us</li>
          </ul>
        </div>
        <div className="footercol">
          <h2>Legal</h2>
          <ul className="listremove">
            <li>Restricted Jurisdictions</li>
            <li>User Agreement</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
      </div>
      
      <div className="socialmedia">
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
          <i className="bi bi-twitter" />
        </a>
        <a href="https://web.telegram.org" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
          <i className="bi bi-telegram" />
        </a>
        <a href="https://discord.com" target="_blank" rel="noopener noreferrer" aria-label="Discord">
          <i className="bi bi-discord" />
        </a>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
          <i className="bi bi-facebook" />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <i className="bi bi-instagram" />
        </a>
        <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
          <i className="bi bi-linkedin" />
        </a>
      </div>
      
      <div className="footerlogo">
        <img src="/images/logoimg.webp" alt="QuantumPay Logo" className="logoimg" />
        <p>QuantumPay</p>
      </div>
      
      <p>© 2013-2023 QuantumPay, Inc. All Rights Reserved.</p>
      <p>support@quantumpay.com</p>
    </footer>
  );
};

export default Footer;
