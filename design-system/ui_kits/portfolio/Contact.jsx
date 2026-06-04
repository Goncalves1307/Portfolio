// Contact.jsx + Footer.jsx
function Contact() {
  return (
    <section className="section" id="contact">
      <div className="container-custom">
        <Reveal className="section-head">
          <span className="eyebrow e">Get In Touch</span>
          <h2>Let's Work Together</h2>
          <p>Have a project in mind or want to discuss potential opportunities? I'd love to hear from you directly.</p>
        </Reveal>
        <Reveal className="contact-wrap">
          <h3 style={{ marginBottom: 24 }}>Contact Information</h3>
          <div className="contact-row">
            <div className="well p"><i data-lucide="mail"></i></div>
            <div>
              <h4>Email</h4>
              <a href="mailto:diogog.dev@gmail.com" className="contact-link">diogog.dev@gmail.com</a>
            </div>
          </div>
          <div className="contact-row">
            <div className="well s"><i data-lucide="map-pin"></i></div>
            <div>
              <h4>Location</h4>
              <p className="muted-p" style={{ margin: 0 }}>Matosinhos, Portugal</p>
            </div>
          </div>
          <h4 style={{ marginTop: 28, marginBottom: 14 }}>Follow Me</h4>
          <div className="social-row">
            <a href="https://github.com/Goncalves1307" target="_blank" rel="noreferrer" className="social-btn" aria-label="GitHub"><Brand name="github" /></a>
            <a href="#" className="social-btn" aria-label="LinkedIn"><Brand name="linkedin" /></a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container-custom footer-grid">
        <div>
          <a href="#hero" className="logo logo-dark">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            <span><span style={{ color: "var(--primary-400)" }}>Diogo</span>.dev</span>
          </a>
          <p className="footer-bio">A passionate CS student crafting seamless digital experiences. Always learning, always building.</p>
        </div>
        <div>
          <h4 className="footer-h">Quick Links</h4>
          <ul className="footer-links">
            {["About", "Skills", "Projects", "Contact"].map((n) => (
              <li key={n}><a href={"#" + n.toLowerCase()}>{n}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="footer-h">Contact</h4>
          <ul className="footer-links">
            <li className="footer-contact"><i data-lucide="mail"></i> diogog.dev@gmail.com</li>
            <li className="footer-contact"><i data-lucide="map-pin"></i> Matosinhos, Portugal</li>
          </ul>
        </div>
      </div>
      <div className="footer-bar container-custom">
        <span>© {new Date().getFullYear()} Diogo Gonçalves. All rights reserved.</span>
        <span>Built with React &amp; Tailwind CSS</span>
      </div>
    </footer>
  );
}

window.Contact = Contact;
window.Footer = Footer;
