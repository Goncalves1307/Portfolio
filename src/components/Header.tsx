import { useState, useEffect } from "react";
import { Menu, X, Moon, Sun, Github, Linkedin } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    // Handler for scroll events to change header style
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Add event listener
    window.addEventListener("scroll", handleScroll);

    // Initial check
    handleScroll();

    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 
        ${scrolled ? "glass" : "bg-transparent"}`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#"
            className="text-xl font-bold flex items-center"
            onClick={closeMenu}
          >
            <span className="text-primary-500">Diogo</span>
            <span>.dev</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <ul className="flex space-x-8">
              {["About", "Projects", "Skills", "Contact"].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="font-medium hover:text-primary-500 transition-colors duration-300"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>

            {/* Social Icons */}
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/goncalves1307"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-500 transition-colors duration-300"
              >
                <Github size={20} />
              </a>
              <a
                href="https://www.linkedin.com/in/diogo-goncalves-448814248"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-500 transition-colors duration-300"
              >
                <Linkedin size={20} />
              </a>
              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-4 md:hidden">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={toggleMenu}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
              aria-label="Open menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-light dark:bg-dark z-40 transition-transform duration-300 md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ top: "64px" }}
      >
        <nav className="container-custom py-8">
          <ul className="flex flex-col space-y-6 text-xl">
            {["About", "Projects", "Skills", "Contact"].map((item) => (
              <li key={item}>
                <a
                  href={`#${item.toLowerCase()}`}
                  className="font-medium block py-2 hover:text-primary-500 transition-colors duration-300"
                  onClick={closeMenu}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>

          {/* Social Links in Mobile Menu */}
          <div className="flex space-x-6 mt-8">
            <a
              href="https://github.com/Goncalves745"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-500 transition-colors duration-300"
            >
              <Github size={24} />
            </a>
            <a
              href="https://www.linkedin.com/in/diogo-goncalves-448814248"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-500 transition-colors duration-300"
            >
              <Linkedin size={24} />
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
