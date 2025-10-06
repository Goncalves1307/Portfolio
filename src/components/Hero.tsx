import { ArrowRight, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const Hero = () => {
  const [showPopUp, setShowPopUp] = useState(false);

  return (
    <section
      className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden"
      id="hero"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] bg-primary-100/30 dark:bg-primary-900/10 rounded-full blur-3xl"></div>
        <div className="absolute top-[20%] -left-[5%] w-[300px] h-[300px] bg-secondary-100/30 dark:bg-secondary-900/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-[10%] left-[30%] w-[400px] h-[400px] bg-accent-100/30 dark:bg-accent-900/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container-custom">
        <div className="flex flex-col md:flex-row items-center">
          {/* Text Content */}
          <motion.div
            className="w-full md:w-1/2 text-center md:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold text-sm mb-6">
              Computer Science Student & Developer
            </span>

            <h1 className="mb-6">
              Diogo's{" "}
              <span className="text-primary-600 dark:text-primary-400">
                Portfolio
              </span>{" "}
            </h1>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto md:mx-0">
              Hello there i'm Diogo, a passionate CS student specializing in
              full-stack development, AI, and creating beautiful user
              experiences that solve real problems.
            </p>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <a href="#contact" className="btn btn-primary">
                Get in touch
                <ArrowRight size={18} className="ml-2" />
              </a>

              <button
                onClick={() => setShowPopUp(true)}
                className="btn btn-ghost border border-gray-300 dark:border-gray-700"
              >
                Download CV
                <Download size={18} className="ml-2" />
              </button>
            </div>
            {showPopUp && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg relative ">
                  <h3 className="text-lg font-semibold mb-4 text-center mt-3">
                    Choose the language of the CV
                  </h3>
                  <div className="flex justify-center gap-4">
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        window.open("/CV-PT.pdf", "_blank");
                        setShowPopUp(false);
                      }}
                    >
                      Português
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        window.open("/cv.pdf", "_blank");
                        setShowPopUp(false);
                      }}
                    >
                      English
                    </button>
                  </div>
                  <button
                    className="absolute top-2 right-4 text-gray-600 dark:text-gray-300"
                    onClick={() => setShowPopUp(false)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Hero Image/Illustration */}
          <motion.div
            className="w-full md:w-1/2 mt-12 md:mt-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              {/* Main profile image */}
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800">
                <img
                  src="/diogo.jpeg"
                  alt="Diogo Soares, Computer Science Student"
                  className="w-full object-cover"
                />
              </div>

              {/* Decorative elements */}
              <div className="absolute top-1/2 -left-16 -translate-y-1/2 w-32 h-32 bg-primary-400 dark:bg-primary-600 rounded-full blur-2xl opacity-20 animate-pulse-slow"></div>
              <div
                className="absolute bottom-1/3 -right-12 w-40 h-40 bg-secondary-400 dark:bg-secondary-600 rounded-full blur-2xl opacity-20 animate-pulse-slow"
                style={{ animationDelay: "1s" }}
              ></div>

              {/* Tech stack floating bubbles */}
              <div className="absolute top-8 -right-8 bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg">
                <img
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
                  alt="React"
                  className="w-8 h-8"
                />
              </div>

              <div className="absolute bottom-16 -left-10 bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg">
                <img
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"
                  alt="Python"
                  className="w-8 h-8"
                />
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg">
                <img
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg"
                  alt="TypeScript"
                  className="w-10 h-10"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="flex justify-center mt-16">
          <a
            href="#about"
            className="animate-bounce flex flex-col items-center text-sm text-gray-500 dark:text-gray-400"
          >
            <span className="mb-2">Scroll Down</span>
            <div className="w-5 h-10 rounded-full border-2 border-gray-300 dark:border-gray-700 flex justify-center">
              <div className="w-1 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mt-2 animate-pulse-slow"></div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
