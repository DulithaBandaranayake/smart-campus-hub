import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="copyright">
        &copy; {new Date().getFullYear()} SmartCampus Hub. All rights reserved.
      </div>
      <div className="footer-links">
        <a href="#" className="footer-link">Support & FAQs</a>
        <a href="#" className="footer-link">Campus Map</a>
        <a href="#" className="footer-link">Privacy Policy</a>
        <a href="#" className="footer-link">Terms of Service</a>
      </div>
    </footer>
  );
};

export default Footer;
