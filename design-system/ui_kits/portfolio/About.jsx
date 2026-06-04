// About.jsx — bio, education + experience cards, interest tags
function About() {
  return (
    <section className="section bg-alt" id="about">
      <div className="container-custom" style={{ maxWidth: 900 }}>
        <Reveal className="section-head">
          <span className="eyebrow p">About Me</span>
          <h2>Get to know me better</h2>
          <p>I'm a dedicated computer science student with a passion for solving complex problems through elegant code and intuitive design.</p>
        </Reveal>

        <div className="about-grid">
          <Reveal>
            <h3 style={{ marginBottom: 16 }}>My Journey</h3>
            <p className="muted-p">Hello there! I'm Diogo, a junior developer with an unwavering passion for crafting seamless digital experiences. My journey in tech has been driven by curiosity and a desire to create meaningful solutions through code.</p>
            <p className="muted-p">Currently pursuing my Computer Science degree at UMAIA, I'm constantly expanding my knowledge through additional UDEMY courses. By day, I work as a Technical Specialist at Worten, where I've honed my expertise in Smartphones, IT, Small Appliances, exceptional customer support and technical solutions.</p>
            <p className="muted-p">Beyond the screen, you'll find me pursuing physical excellence at the gym or indulging in my passion for cars. I firmly believe that discipline and continuous improvement whether in technology or personal growth are the cornerstones of success.</p>
          </Reveal>

          <Reveal className="about-cards">
            <div className="card" style={{ padding: 24 }}>
              <div className="about-row">
                <div className="well p"><i data-lucide="graduation-cap"></i></div>
                <div>
                  <h4>Computer Science Degree</h4>
                  <p className="muted-p" style={{ margin: 0 }}>University of Maia</p>
                  <p className="meta-p">2022 - Present</p>
                </div>
              </div>
            </div>
            <div className="card" style={{ padding: 24 }}>
              <div className="about-row">
                <div className="well s"><i data-lucide="briefcase"></i></div>
                <div>
                  <h4>Technical Specialist</h4>
                  <p className="muted-p" style={{ margin: 0 }}>Worten</p>
                  <p className="meta-p">Since 2022</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal className="interests">
          <div className="interests-head">
            <i data-lucide="heart" style={{ color: "var(--error-500)", width: 20, height: 20 }}></i>
            <h3>My Interests</h3>
          </div>
          <div className="interest-tags">
            {["Web Development", "UI/UX Design", "Open Source", "Cloud Computing", "Mobile Apps"].map((t) => (
              <span key={t} className="interest-tag">{t}</span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

window.About = About;
