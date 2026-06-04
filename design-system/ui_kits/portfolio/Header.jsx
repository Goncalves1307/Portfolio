// Header.jsx — sticky glass navbar with dark-mode toggle + mobile menu
const { useState, useEffect } = React;

const NAV = ["About", "Skills", "Projects", "Contact"];

function Logo() {
  return (
    <a href="#hero" className="logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>
      </svg>
      <span><span className="lg-accent">Diogo</span>.dev</span>
    </a>
  );
}

function Header({ dark, setDark }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={"hdr" + (scrolled ? " hdr-scrolled" : "")}>
      <div className="container-custom hdr-inner">
        <Logo />
        <nav className="hdr-nav">
          {NAV.map((n) => (
            <a key={n} href={"#" + n.toLowerCase()} className="hdr-link">{n}</a>
          ))}
        </nav>
        <div className="hdr-actions">
          <button className="icon-btn" onClick={() => setDark(!dark)} aria-label="Toggle theme">
            <i data-lucide={dark ? "sun" : "moon"}></i>
          </button>
          <a className="icon-btn show-md" href="https://github.com/Goncalves1307" aria-label="GitHub"><Brand name="github" /></a>
          <a className="icon-btn show-md" href="#" aria-label="LinkedIn"><Brand name="linkedin" /></a>
          <a href="#contact" className="btn btn-primary hdr-cta">Get in touch</a>
          <button className="icon-btn hide-md" onClick={() => setOpen(!open)} aria-label="Menu">
            <i data-lucide={open ? "x" : "menu"}></i>
          </button>
        </div>
      </div>
      {open && (
        <div className="hdr-mobile">
          {NAV.map((n) => (
            <a key={n} href={"#" + n.toLowerCase()} className="hdr-link" onClick={() => setOpen(false)}>{n}</a>
          ))}
        </div>
      )}
    </header>
  );
}

window.Header = Header;
window.Logo = Logo;
