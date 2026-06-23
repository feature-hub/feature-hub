// @ts-check

const React = require('react');

/**
 * @param {import('./Footer').FooterProps} props
 */
const Footer = ({config}) => (
  <footer className="nav-footer" id="footer">
    <section className="copyright">{config.copyright}</section>
  </footer>
);

module.exports = Footer;
