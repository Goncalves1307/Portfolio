import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Code,
  Layers,
  Layout,
  Database,
  LineChart,
  ShieldCheck,
} from "lucide-react";
import { skillsData } from "../data/skillsData";

const Skills = () => {
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

  const progressVariants = {
    hidden: { width: 0 },
    visible: (custom: number) => ({
      width: `${custom}%`,
      transition: { duration: 1, ease: "easeOut" },
    }),
  };

  // Map category to icon
  const categoryIcons = {
    "Programming Languages": (
      <Code className="text-primary-600 dark:text-primary-400" />
    ),
    "Web Development": (
      <Layout className="text-secondary-600 dark:text-secondary-400" />
    ),
    "Frameworks & Libraries": (
      <Layers className="text-accent-600 dark:text-accent-400" />
    ),
    Databases: <Database className="text-success-600 dark:text-success-400" />,
    "Data Science & AI": (
      <LineChart className="text-warning-600 dark:text-warning-400" />
    ),
    "Tools & Others": (
      <ShieldCheck className="text-error-600 dark:text-error-400" />
    ),
  };

  // Group skills by category
  const skillsByCategory = skillsData.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skillsData>);

  return (
    <section className="section bg-gray-50 dark:bg-gray-900" id="skills">
      <div className="container-custom">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-sm font-semibold text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/30 rounded-full mb-4">
              My Skills
            </span>
            <h2 className="mb-4">Technologies & Expertise</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              I'm constantly learning and expanding my skillset, but here are
              the technologies and tools I'm currently proficient with.
            </p>
          </motion.div>

          {/* Skills Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(skillsByCategory).map(
              ([category, skills], categoryIndex) => (
                <motion.div
                  key={categoryIndex}
                  variants={itemVariants}
                  className="card p-6"
                >
                  {/* Category Header */}
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-3">
                      {categoryIcons[category as keyof typeof categoryIcons]}
                    </div>
                    <h3 className="text-xl font-semibold">{category}</h3>
                  </div>

                  {/* Skills List */}
                  <div className="space-y-6">
                    {skills.map((skill, skillIndex) => (
                      <div key={skillIndex}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{skill.name}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {skill.level}%
                          </span>
                        </div>
                        <div className="skill-bar">
                          <motion.div
                            className="skill-progress"
                            custom={skill.level}
                            variants={progressVariants}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            )}
          </div>

          {/* Learning Next Section */}
          {/* <motion.div 
            variants={itemVariants} 
            className="mt-16 card p-6"
          >
            <h3 className="text-xl font-semibold text-center mb-6">Currently Learning</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {['Next.js', 'GraphQL', 'Rust', 'TensorFlow', 'DevOps', 'Flutter'].map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full"
                >
                  <div className="w-3 h-3 rounded-full bg-primary-500 mr-2"></div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div> */}
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
