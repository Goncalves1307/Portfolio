// Single source of truth for identity / contact details.
// Previously these were duplicated and inconsistent across Header/Contact/
// Footer/Projects (e.g. the GitHub handle was "Goncalves745" in the header but
// "Goncalves1307" elsewhere). Consolidated to the repo owner's account.
export const siteConfig = {
  name: "Diogo Soares",
  brandPrefix: "Diogo",
  brandSuffix: ".dev",
  role: "Computer Science Student & Developer",
  email: "diogog.dev@gmail.com",
  location: "Matosinhos, Portugal",
  social: {
    github: "https://github.com/Goncalves1307",
    linkedin: "https://www.linkedin.com/in/diogo-goncalves-448814248",
  },
} as const;
