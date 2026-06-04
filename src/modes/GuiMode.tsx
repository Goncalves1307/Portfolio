import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Projects from '../components/Projects';
import Skills from '../components/Skills';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import AnimatedCursor from '../components/AnimatedCursor';
import { ThemeProvider } from '../context/ThemeContext';
import { Power } from 'lucide-react';

type GuiModeProps = { onReboot: () => void };

export default function GuiMode({ onReboot }: GuiModeProps) {
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
      <button
        onClick={onReboot}
        aria-label="Reboot to boot menu"
        className="fixed bottom-4 right-4 z-[60] flex items-center gap-2 rounded-full bg-gray-900/80 text-white px-4 py-2 text-sm font-mono shadow-lg backdrop-blur hover:bg-gray-900"
      >
        <Power size={16} /> reboot
      </button>
    </ThemeProvider>
  );
}
