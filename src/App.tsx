import { useState, useEffect } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Projects from "./components/Projects";
import Skills from "./components/Skills";
import Blog from "./components/Blog";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import AnimatedCursor from "./components/AnimatedCursor";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate page loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-light dark:bg-dark">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AnimatedCursor />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Hero />
          <About />
          <Projects />
          <Skills />
          <Contact />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
