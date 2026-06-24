import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, ExternalLink, Github, Terminal, ChevronLeft, ChevronRight, Play, Pause, Info, X } from 'lucide-react';
import { Project } from '../types';

interface ProjectsProps {
  projects: Project[];
}

export default function Projects({ projects }: ProjectsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isPlaying || isHovered || !projects || projects.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev === projects.length - 1 ? 0 : prev + 1));
    }, 5000); // Smart 5-second interval
    return () => clearInterval(interval);
  }, [isPlaying, isHovered, activeIndex, projects?.length]);

  if (!projects || projects.length === 0) {
    return (
      <section id="projects" className="py-24 relative overflow-hidden bg-slate-950/40">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex flex-col items-center justify-center text-center py-12 border border-slate-800 rounded-3xl bg-slate-900/30">
            <Briefcase className="text-slate-600 mb-3" size={32} />
            <h3 className="text-lg font-sans font-semibold text-slate-300">No Projects Found</h3>
            <p className="text-slate-500 text-xs font-mono mt-1">Please add software artifacts in the secure dashboard.</p>
          </div>
        </div>
      </section>
    );
  }

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? projects.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === projects.length - 1 ? 0 : prev + 1));
  };

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth < 1024;
  const N = projects.length;

  // Render variables for safe array loops
  const getCardTransformProperties = (index: number) => {
    if (N === 1) {
      return {
        x: 0,
        scale: 1,
        opacity: 1,
        zIndex: 30,
        rotateY: 0,
        pointerEvents: 'auto' as const,
      };
    }

    let diff = index - activeIndex;

    // Resolve circular index distance
    let wrappedDiff = diff;
    if (diff < -N / 2) wrappedDiff += N;
    if (diff > N / 2) wrappedDiff -= N;

    // Special cases for exactly even list wrapping
    if (N === 2 && diff !== 0) {
      wrappedDiff = index === activeIndex ? 0 : 1;
    }

    const horizontalOffset = isMobile ? 120 : isTablet ? 200 : 280;

    if (wrappedDiff === 0) {
      return {
        x: 0,
        scale: 1.1,
        opacity: 1,
        zIndex: 30,
        rotateY: 0,
        pointerEvents: 'auto' as const,
      };
    } else if (wrappedDiff === -1 || (wrappedDiff < -1 && N === 2)) {
      return {
        x: -horizontalOffset,
        scale: isMobile ? 0.82 : 0.88,
        opacity: isMobile ? 0.35 : 0.48,
        zIndex: 15,
        rotateY: 12,
        pointerEvents: 'none' as const,
      };
    } else if (wrappedDiff === 1 || (wrappedDiff > 1 && N === 2)) {
      return {
        x: horizontalOffset,
        scale: isMobile ? 0.82 : 0.88,
        opacity: isMobile ? 0.35 : 0.48,
        zIndex: 15,
        rotateY: -12,
        pointerEvents: 'none' as const,
      };
    } else {
      const direction = wrappedDiff > 0 ? 1 : -1;
      return {
        x: direction * (horizontalOffset + 180),
        scale: 0.7,
        opacity: 0,
        zIndex: 5,
        rotateY: 0,
        pointerEvents: 'none' as const,
      };
    }
  };

  return (
    <section id="projects" className="py-24 relative overflow-hidden bg-slate-950/40">
      {/* Decorative backdrop light mesh items */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 font-mono text-xs mb-4"
          >
            <Briefcase size={14} />
            SELECTED WORK
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-sans tracking-tight font-extrabold text-white">
            Featured Projects
          </h2>
          <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-4" />
        </div>

        {/* 3D Stack Slider Center Container */}
        <div 
          className="relative w-full flex items-center justify-center my-10 py-8 select-none"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ perspective: 1200 }}
        >
          {/* Main slider deck height */}
          <div className="relative w-full max-w-4xl h-[450px] sm:h-[490px] flex items-center justify-center">
            {projects.map((proj, i) => {
              const { x, scale, opacity, zIndex, rotateY, pointerEvents } = getCardTransformProperties(i);
              const isActive = i === activeIndex;

              return (
                <motion.div
                  key={proj.id || `${proj.title}-${i}`}
                  animate={{
                    x,
                    scale,
                    opacity,
                    zIndex,
                    rotateY,
                    pointerEvents,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 24,
                  }}
                  onClick={() => {
                    if (!isActive) {
                      setActiveIndex(i);
                    } else {
                      window.location.hash = `#/project/${proj.id || i}`;
                    }
                  }}
                  className={`absolute w-full max-w-[270px] sm:max-w-[340px] md:max-w-[395px] rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl transition-all duration-300 transform-gpu cursor-pointer ${
                    isActive 
                      ? 'border-2 border-purple-500/90 bg-slate-900 shadow-[0_0_50px_-5px_rgba(139,92,246,0.35)] hover:shadow-[0_0_60px_-2px_rgba(139,92,246,0.5)]' 
                      : 'border border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Card Visual Graphic */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-950 border-b border-slate-800">
                    {/* Expand Details Badge */}
                    {isActive && (
                      <div className="absolute top-3 right-3 z-20 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-[10px] font-sans font-bold text-white rounded-full flex items-center gap-1 shadow-lg border border-purple-400/30 transition-all">
                        <Info size={11} />
                        <span>বিস্তারিত দেখুন</span>
                      </div>
                    )}
                    <img
                      src={proj.imageUrl || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"}
                      alt={proj.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500"
                    />
                    
                    {/* Hover Link Overlay only for the active card */}
                    {isActive && (
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.hash = `#/project/${proj.id || i}`;
                          }}
                          className="px-4 py-2 rounded-full bg-purple-600 border border-purple-500 text-white font-sans text-xs font-bold hover:bg-purple-500 hover:scale-105 active:scale-95 transition-all shadow-md flex items-center gap-1.5"
                        >
                          <Info size={14} />
                          বিস্তারিত দেখুন
                        </button>
                        {proj.liveUrl && (
                          <a
                            href={proj.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2.5 rounded-full bg-slate-900 border border-slate-700 text-white hover:bg-purple-600 hover:border-purple-500 hover:scale-110 active:scale-95 transition-all duration-300"
                            title="Live Preview"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2.5 rounded-full bg-slate-900 border border-slate-700 text-white hover:bg-purple-600 hover:border-purple-500 hover:scale-110 active:scale-95 transition-all duration-300"
                            title="GitHub Repository"
                          >
                            <Github size={18} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Content Texts */}
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className={`text-base font-sans font-bold mb-1.5 transition-colors ${
                        isActive ? 'text-purple-400' : 'text-slate-100'
                      }`}>
                        {proj.title}
                      </h3>
                      
                      <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                        {proj.description || "A high-performance modern web application built with precision, scalability, and outstanding user experience."}
                      </p>
                    </div>

                    {/* Bottom layout metadata references */}
                    <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 mt-4">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                        <Briefcase size={11} className="text-purple-500" />
                        <span>Featured App</span>
                      </div>
                      
                      {isActive && (
                        <div className="flex items-center gap-3">
                          {proj.githubUrl && (
                            <a
                              href={proj.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-white transition-colors"
                              title="GitHub Link"
                            >
                              <Github size={15} />
                            </a>
                          )}
                          {proj.liveUrl && (
                            <a
                              href={proj.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider font-semibold"
                            >
                              Launch
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Side Glass Chevron Navigation controls */}
          {N > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-2 sm:left-4 z-40 p-3 rounded-full bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-purple-500/40 hover:scale-110 active:scale-90 transition-all duration-300 cursor-pointer shadow-lg outline-none"
                aria-label="Previous Project"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-2 sm:right-4 z-40 p-3 rounded-full bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-purple-500/40 hover:scale-110 active:scale-90 transition-all duration-300 cursor-pointer shadow-lg outline-none"
                aria-label="Next Project"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {/* Carousel indicators row & play/pause tracker */}
        {N > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
            {/* Play/Pause Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900/40 text-slate-500 hover:text-purple-400 hover:border-purple-500/20 text-xs font-mono font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 scale-95"
              title={isPlaying ? "Pause Autoplay" : "Resume Autoplay"}
            >
              {isPlaying ? <Pause size={10} /> : <Play size={10} />}
              <span>{isPlaying ? 'PAUSE' : 'AUTO'}</span>
            </button>

            {/* Pagination Dots */}
            <div className="flex items-center gap-2.5">
              {projects.map((_, idx) => (
                <button
                  key={`dot-${idx}`}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2 rounded-full cursor-pointer transition-all duration-500 ${
                    idx === activeIndex 
                      ? 'w-6 bg-purple-500' 
                      : 'w-2 bg-slate-800 hover:bg-slate-600'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
