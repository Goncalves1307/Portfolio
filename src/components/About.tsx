import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Briefcase, GraduationCap, Heart } from "lucide-react";

const About = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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

  return (
    <section className="section bg-gray-50 dark:bg-gray-900" id="about">
      <div className="container-custom">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="max-w-4xl mx-auto"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-full mb-4">
              About Me
            </span>
            <h2 className="mb-4">Get to know me better</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              I'm a dedicated computer science student with a passion for
              solving complex problems through elegant code and intuitive
              design.
            </p>
          </motion.div>

          {/* About Content */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Left Column: Bio */}
            <div>
              <h3 className="text-xl font-semibold mb-4">My Journey</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Hello there! I'm Diogo, a junior developer with an unwavering
                passion for crafting seamless digital experiences. My journey in
                tech has been driven by curiosity and a desire to create
                meaningful solutions through code.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Currently pursuing my Computer Science degree at UMAIA, I'm
                constantly expanding my knowledge through additional UDEMY
                courses. By day, I work as a Technical Specialist at Worten,
                where I've honed my expertise in Smartphones, IT, Small
                Appliances, exceptional customer support and technical
                solutions.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Beyond the screen, you'll find me pursuing physical excellence
                at the gym or indulging in my passion for cars. I firmly believe
                that discipline and continuous improvement whether in technology
                or personal growth are the cornerstones of success.
              </p>
            </div>

            {/* Right Column: Education & Experience */}
            <div className="space-y-6">
              {/* Education */}
              <div className="card p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                      <GraduationCap className="text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">
                      Computer Science Degree
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      University of Maia
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      2022 - Present
                    </p>
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div className="card p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/30 rounded-full flex items-center justify-center">
                      <Briefcase className="text-secondary-600 dark:text-secondary-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">
                      Technical Specialist
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">Worten</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Since 2022
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Interest Tags */}
          <motion.div variants={itemVariants} className="mt-16">
            <div className="flex items-center justify-center mb-6">
              <Heart className="mr-2 text-error-500" size={20} />
              <h3 className="text-xl font-semibold">My Interests</h3>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "Web Development",
                "UI/UX Design",
                "Open Source",
                "Cloud Computing",
                "Mobile Apps",
              ].map((interest, index) => (
                <span
                  key={index}
                  className="px-4 py-2 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 
                            border border-gray-200 dark:border-gray-700 text-sm font-medium shadow-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
