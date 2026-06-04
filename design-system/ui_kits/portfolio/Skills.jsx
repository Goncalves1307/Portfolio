// Skills.jsx — categorized animated progress bars
const SKILLS = [
  { cat: "Programming Languages", icon: "code", items: [["JavaScript",90],["TypeScript",40],["Python",40],["Java",20],["SQL",60]] },
  { cat: "Web Development", icon: "layout", items: [["HTML & CSS",95],["Responsive Design",90],["Tailwind CSS",70]] },
  { cat: "Frameworks & Libraries", icon: "layers", items: [["React",70],["Node.js",85],["Express.js",80],["Django",30]] },
  { cat: "Databases", icon: "database", items: [["PostgreSQL",80],["MySQL",75]] },
  { cat: "Tools & Others", icon: "shield-check", items: [["Git & GitHub",90],["Docker",75],["UI/UX Design",75]] },
];

function SkillBar({ name, level, show }) {
  return (
    <div className="skill">
      <div className="skill-lab"><span>{name}</span><span className="skill-pct">{level}%</span></div>
      <div className="skill-track"><div className="skill-fill" style={{ width: show ? level + "%" : 0 }}></div></div>
    </div>
  );
}

function SkillCard({ cat, icon, items }) {
  const { useState, useRef, useEffect } = React;
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShow(true); ob.disconnect(); } }, { threshold: 0.2 });
    if (el) ob.observe(el);
    return () => ob.disconnect();
  }, []);
  return (
    <div className="card hoverable skill-card" ref={ref} style={{ padding: 24 }}>
      <div className="skill-card-head">
        <div className="well p"><i data-lucide={icon}></i></div>
        <h4>{cat}</h4>
      </div>
      {items.map(([n, l]) => <SkillBar key={n} name={n} level={l} show={show} />)}
    </div>
  );
}

function Skills() {
  return (
    <section className="section" id="skills">
      <div className="container-custom">
        <Reveal className="section-head">
          <span className="eyebrow a">My Skills</span>
          <h2>Technologies &amp; Expertise</h2>
          <p>I've worked with a range of technologies across the full stack, from front-end frameworks to back-end systems and databases.</p>
        </Reveal>
        <div className="skills-grid">
          {SKILLS.map((s) => <SkillCard key={s.cat} {...s} />)}
        </div>
      </div>
    </section>
  );
}

window.Skills = Skills;
