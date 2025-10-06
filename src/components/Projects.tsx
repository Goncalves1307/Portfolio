import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ArrowUpRight, Github } from "lucide-react";
import { projectsData } from "../data/projectsData";

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  // Filter projects based on activeFilter
  const filteredProjects =
    activeFilter === "All"
      ? projectsData
      : projectsData.filter((project) => project.category === activeFilter);

  // Get unique categories
  const categories = [
    "All",
    ...new Set(projectsData.map((project) => project.category)),
  ];

  return (
    <section className="section" id="projects">
      <div className="container-custom">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-sm font-semibold text-secondary-600 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-900/30 rounded-full mb-4">
              My Work
            </span>
            <h2 className="mb-4">Featured Projects</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Here are some of my recent projects that showcase my skills and
              passion for creating innovative solutions through code.
            </p>
          </motion.div>

          {/* Filter Tabs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setActiveFilter(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeFilter === category
                    ? "bg-secondary-100 dark:bg-secondary-900/50 text-secondary-700 dark:text-secondary-300 shadow-md"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>

          {/* Projects Grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredProjects.map((project, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="card group overflow-hidden"
              >
                {/* Project Image */}
                <div className="relative overflow-hidden h-56">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Project Info */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">
                        {project.title}
                      </h3>
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800">
                        {project.category}
                      </span>
                    </div>
                    <div className="flex space-x-3">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                          aria-label={`GitHub repository for ${project.title}`}
                        >
                          <Github size={20} />
                        </a>
                      )}
                      {/* {project.liveUrl && (
                        <a 
                          href={project.liveUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                          aria-label={`Live demo for ${project.title}`}
                        >
                          <ExternalLink size={20} />
                        </a>
                      )} */}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 rounded-md"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* More Projects Button */}
          <motion.div variants={itemVariants} className="text-center mt-12">
            <a
              href="https://github.com/goncalves1307"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost border border-gray-300 dark:border-gray-700"
            >
              View More on GitHub
              <Github size={18} className="ml-2" />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
