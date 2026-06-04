export const profile = {
  name: 'Diogo Gonçalves',
  role: 'Computer Science Student & Full-Stack Developer',
  location: 'Matosinhos, Portugal',
  email: 'diogog.dev@gmail.com',
  github: 'https://github.com/Goncalves1307',
  linkedin: 'https://www.linkedin.com/in/diogo-goncalves-448814248',
  bio:
    "Hello there! I'm Diogo, a junior developer with an unwavering passion for " +
    'crafting seamless digital experiences. Currently pursuing my Computer Science ' +
    'degree at UMAIA, I keep expanding my knowledge through extra Udemy courses. By ' +
    'day I work as a Technical Specialist at Worten — smartphones, IT, small ' +
    "appliances and customer support. Beyond the screen you'll find me at the gym " +
    'or indulging my passion for cars.',
} as const;

export const education = {
  degree: 'BSc Computer Science',
  school: 'University of Maia (UMAIA)',
  period: '2022 — Present',
} as const;

export const work = {
  title: 'Technical Specialist',
  company: 'Worten',
  period: 'Since 2022',
} as const;

export type Skill = { name: string; level: number };
export type SkillGroup = { group: string; skills: Skill[] };

export const skillGroups: SkillGroup[] = [
  { group: 'Languages', skills: [
    { name: 'JavaScript', level: 90 }, { name: 'SQL', level: 60 },
    { name: 'TypeScript', level: 40 }, { name: 'Python', level: 40 },
    { name: 'Java', level: 20 },
  ] },
  { group: 'Web', skills: [
    { name: 'HTML & CSS', level: 95 }, { name: 'Responsive', level: 90 },
    { name: 'Tailwind', level: 70 },
  ] },
  { group: 'Frameworks', skills: [
    { name: 'Node.js', level: 85 }, { name: 'Express', level: 80 },
    { name: 'React', level: 70 }, { name: 'Django', level: 30 },
  ] },
  { group: 'Databases', skills: [
    { name: 'PostgreSQL', level: 80 }, { name: 'MySQL', level: 75 },
  ] },
  { group: 'Tools', skills: [
    { name: 'Git & GitHub', level: 90 }, { name: 'Docker', level: 75 },
    { name: 'UI/UX', level: 75 },
  ] },
];

export type Project = {
  id: string;
  name: string;
  kind: string;
  tech: string[];
  description: string;
  repo?: string;
};

export const projects: Project[] = [
  {
    id: 'bookvault',
    name: 'BookVault',
    kind: 'Android App',
    tech: ['Kotlin', 'Android Studio', 'Open Library API'],
    description: 'Book-tracking app: search any title and track your reads.',
    repo: 'https://github.com/Goncalves745/BookVaultAndroid',
  },
  {
    id: 'tower-defense',
    name: 'Tower Defense',
    kind: 'Unity Game',
    tech: ['Unity', 'C#'],
    description: 'Defende a base colocando e melhorando torres contra vagas de inimigos.',
  },
  {
    id: 'schedulo',
    name: 'Schedulo',
    kind: 'Full-Stack',
    tech: ['React', 'Node', 'Express', 'PostgreSQL', 'Prisma', 'Tailwind'],
    description: 'Plataforma SaaS de agendamentos por disponibilidade.',
    repo: 'https://github.com/Goncalves745/Schedulo',
  },
];

export const cvFiles = { pt: '/cv_pt.pdf', en: '/cv_en.pdf' } as const;

export const interests = ['Gym & fitness', 'Cars', 'Coffee ☕', 'Game dev', 'Self-hosting'];

export const experienceTimeline = [
  { when: '2022 — Present', what: 'BSc Computer Science', where: 'UMAIA' },
  { when: 'Since 2022', what: 'Technical Specialist', where: 'Worten' },
  { when: 'Ongoing', what: 'Udemy courses (full-stack)', where: 'self-taught' },
];

export const stackGroups = [
  { group: 'Frontend', items: ['React', 'TypeScript', 'Tailwind', 'HTML', 'CSS'] },
  { group: 'Backend', items: ['Node.js', 'Express', 'Django', 'Prisma'] },
  { group: 'Data', items: ['PostgreSQL', 'MySQL', 'SQL'] },
  { group: 'Tooling', items: ['Git', 'GitHub', 'Docker', 'Vite'] },
];

export const quotes = [
  'Talk is cheap. Show me the code. — Linus Torvalds',
  'First, solve the problem. Then, write the code. — John Johnson',
  'Programs must be written for people to read. — Abelson & Sussman',
  'Make it work, make it right, make it fast. — Kent Beck',
  'Simplicity is the soul of efficiency. — Austin Freeman',
];

export const bannerArt = [
  ' ___  _  ___   ___  ___  ',
  '|   \\| |/ _ \\ / __|/ _ \\ ',
  '| |) | | (_) | (_ | (_) |',
  '|___/|_|\\___/ \\___|\\___/ ',
];

/** Fake filesystem for ls/tree/cat. Files map to renderable command names. */
export const fileSystem: Record<string, string> = {
  'about.txt': 'about',
  'skills.md': 'skills',
  'projects/': 'projects',
  'contact.vcf': 'contact',
  'resume.pdf': 'resume',
  'experience.log': 'experience',
};
