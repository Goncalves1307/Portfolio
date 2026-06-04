// Projects.jsx — filterable grid of project cards
const PROJECTS = [
  { title: "BookVault", category: "Android App", description: "BookVault is a book-tracking app with a user-friendly Android app built in Android Studio. Simply search and track your reads effortlessly!", image: "../../assets/bookvault1.png", tech: ["Kotlin", "Android Studio", "Open Library API"], url: "https://github.com/Goncalves745/BookVaultAndroid" },
  { title: "Tower Defense", category: "Unity Game", description: "A Unity-based project where players defend their base by placing and upgrading towers to stop waves of enemies. Check out the code and details on GitHub.", image: "../../assets/towerdefense.png", tech: ["Unity", "C#"], url: "https://github.com/GonCarRib/Tower-Defense" },
  { title: "Schedulo", category: "Full Stack App", description: "Schedulo is a SaaS-based scheduling platform that lets users book, manage, and organize appointments based on availability. Built with a modern tech stack.", image: "../../assets/schedulo.jpeg", tech: ["React", "Node.js", "Express", "PostgreSQL", "Prisma", "Tailwind CSS"], url: "https://github.com/Goncalves745/Schedulo" },
];

const CATS = ["All", "Android App", "Unity Game", "Full Stack App"];

function ProjectCard({ p }) {
  return (
    <div className="card hoverable proj-card">
      <div className="proj-img"><img src={p.image} alt={p.title} /></div>
      <div className="proj-body">
        <span className="proj-cat">{p.category}</span>
        <h4 className="proj-title">{p.title}</h4>
        <p className="proj-desc">{p.description}</p>
        <div className="proj-tags">
          {p.tech.map((t) => <span key={t} className="tech-tag">{t}</span>)}
        </div>
        <a href={p.url} target="_blank" rel="noreferrer" className="proj-link">
          <Brand name="github" size={16} /> View Code <i data-lucide="arrow-up-right"></i>
        </a>
      </div>
    </div>
  );
}

function Projects() {
  const { useState } = React;
  const [filter, setFilter] = useState("All");
  const shown = filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.category === filter);
  return (
    <section className="section bg-alt" id="projects">
      <div className="container-custom">
        <Reveal className="section-head">
          <span className="eyebrow s">My Work</span>
          <h2>Featured Projects</h2>
          <p>Here are some of my recent projects that showcase my skills and passion for building useful, well-crafted software.</p>
        </Reveal>
        <div className="proj-filters">
          {CATS.map((c) => (
            <button key={c} className={"chip" + (filter === c ? " chip-active" : "")} onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>
        <div className="proj-grid">
          {shown.map((p) => <ProjectCard key={p.title} p={p} />)}
        </div>
        <div className="proj-more">
          <a href="https://github.com/Goncalves1307" target="_blank" rel="noreferrer" className="btn btn-ghost">View More on GitHub<i data-lucide="arrow-right"></i></a>
        </div>
      </div>
    </section>
  );
}

window.Projects = Projects;
