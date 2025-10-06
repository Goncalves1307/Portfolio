import { useEffect, useState } from 'react';

const AnimatedCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hidden, setHidden] = useState(true);
  const [clicked, setClicked] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(false);

  useEffect(() => {
    // Show cursor when it moves
    const handleMouseMove = (e: MouseEvent) => {
      setHidden(false);
      setPosition({ x: e.clientX, y: e.clientY });
    };

    // Handle mouse down and up for click effect
    const handleMouseDown = () => setClicked(true);
    const handleMouseUp = () => setClicked(false);

    // Handle hover effects for links and buttons
    const handleLinkHover = () => setHoveredLink(true);
    const handleLinkLeave = () => setHoveredLink(false);

    // Hide cursor when it leaves the window
    const handleMouseLeave = () => setHidden(true);
    
    // Track mouse movement
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Track link and button hovers
    const interactiveElements = document.querySelectorAll('a, button, [role="button"]');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleLinkHover);
      el.addEventListener('mouseleave', handleLinkLeave);
    });

    return () => {
      // Clean up all event listeners
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseLeave);

      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleLinkHover);
        el.removeEventListener('mouseleave', handleLinkLeave);
      });
    };
  }, []);

  // Skip rendering the cursor on mobile devices
  if (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) {
    return null;
  }

  return (
    <div
      className={`animated-cursor ${hidden ? 'opacity-0' : 'opacity-75'} ${
        clicked ? 'scale-75' : hoveredLink ? 'scale-150' : 'scale-100'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transitionDuration: clicked ? '300ms' : '200ms',
      }}
    />
  );
};

export default AnimatedCursor;