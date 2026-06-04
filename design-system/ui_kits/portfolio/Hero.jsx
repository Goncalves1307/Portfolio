// Hero.jsx — name, tagline, CTAs, profile photo with floating tech bubbles
const { useState: useHeroState } = React;

function Hero() {
  const [popup, setPopup] = useHeroState(false);
  return (
    <section className="hero" id="hero">
      <div className="hero-bg">
        <div className="blob" style={{ width: 500, height: 500, top: "-12%", right: "-10%", background: "var(--primary-200)", opacity: .3 }}></div>
        <div className="blob" style={{ width: 300, height: 300, top: "18%", left: "-6%", background: "var(--secondary-400)", opacity: .25 }}></div>
        <div className="blob" style={{ width: 400, height: 400, bottom: "-12%", left: "30%", background: "var(--accent-500)", opacity: .2 }}></div>
      </div>
      <div className="container-custom hero-grid">
        <div className="hero-text reveal in">
          <span className="eyebrow p">Computer Science Student &amp; Developer</span>
          <h1>Diogo's <span className="lg-accent">Portfolio</span></h1>
          <p className="hero-lead">Hello there i'm Diogo, a passionate CS student specializing in full-stack development, AI, and creating beautiful user experiences that solve real problems.</p>
          <div className="hero-cta">
            <a href="#contact" className="btn btn-primary">Get in touch<i data-lucide="arrow-right"></i></a>
            <button className="btn btn-ghost" onClick={() => setPopup(true)}>Download CV<i data-lucide="download"></i></button>
          </div>
        </div>
        <div className="hero-media reveal in">
          <div className="hero-photo">
            <img src="../../assets/diogo.jpeg" alt="Diogo, Computer Science Student" />
          </div>
          <div className="bubble" style={{ top: 24, right: -22 }}><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" alt="React" /></div>
          <div className="bubble" style={{ bottom: 60, left: -26 }}><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" alt="Python" /></div>
          <div className="bubble bubble-lg" style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" alt="TypeScript" /></div>
        </div>
      </div>
      <a href="#about" className="scroll-ind">
        <span>Scroll Down</span>
        <span className="mouse"><span className="wheel"></span></span>
      </a>
      {popup && (
        <div className="modal-scrim" onClick={() => setPopup(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ textAlign: "center", marginBottom: 18 }}>Choose the language of the CV</h3>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setPopup(false)}>Português</button>
              <button className="btn btn-secondary" onClick={() => setPopup(false)}>English</button>
            </div>
            <button className="modal-close" onClick={() => setPopup(false)}>✕</button>
          </div>
        </div>
      )}
    </section>
  );
}

window.Hero = Hero;
