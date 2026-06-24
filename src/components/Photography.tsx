import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, MapPin, Sliders, ChevronLeft, ChevronRight, Play, Pause, Compass, Focus } from 'lucide-react';
import { PhotographyItem } from '../types';

interface PhotographyProps {
  photos: PhotographyItem[];
}

export default function Photography({ photos }: PhotographyProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [direction, setDirection] = useState(0); // -1 for prev, 1 for next
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!isPlaying || hovered || !photos || photos.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
    }, 6000); // Cinematic duration
    return () => clearInterval(timer);
  }, [isPlaying, hovered, activeIndex, photos?.length]);

  if (!photos || photos.length === 0) {
    return (
      <section id="photography" className="py-24 relative overflow-hidden bg-slate-950/20 border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex flex-col items-center justify-center text-center py-16 border border-slate-900 rounded-3xl bg-slate-900/10">
            <Camera className="text-slate-600 mb-4 animate-pulse" size={36} />
            <h3 className="text-lg font-sans font-semibold text-slate-300">Visual Journal Empty</h3>
            <p className="text-slate-500 text-xs font-mono mt-1">Please populate camera captures via the administrator console.</p>
          </div>
        </div>
      </section>
    );
  }

  const handlePrev = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const activePhoto = photos[activeIndex];

  // Animated variants for the sliding, emerging foregrond image
  const imageVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : -120,
      scale: 0.85,
      opacity: 0,
      rotateY: dir > 0 ? 8 : -8,
      z: -100
    }),
    center: {
      x: 0,
      scale: 1,
      opacity: 1,
      rotateY: 0,
      z: 0,
      transition: {
        x: { type: 'spring', stiffness: 220, damping: 25 },
        opacity: { duration: 0.4 },
        scale: { type: 'spring', stiffness: 180, damping: 22, delay: 0.1 },
        rotateY: { type: 'spring', stiffness: 150, damping: 20 }
      }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -120 : 120,
      scale: 0.88,
      opacity: 0,
      rotateY: dir > 0 ? -8 : 8,
      z: -100,
      transition: {
        x: { duration: 0.42, ease: 'easeInOut' },
        opacity: { duration: 0.25 },
        scale: { duration: 0.35 },
        rotateY: { duration: 0.35 }
      }
    })
  };

  return (
    <section id="photography" className="py-24 relative overflow-hidden bg-slate-950 border-t border-slate-900">
      {/* Dynamic blurred backdrop layer representing active photo colors for deep atmospheric immersion */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20 transition-all duration-1000 ease-in-out">
        <img
          src={activePhoto.imageUrl}
          alt="Backdrop Light Mesh Selector"
          className="w-full h-full object-cover blur-[140px] scale-150 transition-all duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-slate-950/80" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Title block */}
        <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 px-3.5 py-1 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 font-mono text-xs mb-4"
          >
            <Camera size={14} className="animate-pulse" />
            OPTICAL ARCHIVE
          </motion.div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-sans tracking-tight font-extrabold text-white">
            Cinematic Photography
          </h2>
          <p className="text-slate-400 font-mono text-xs sm:text-sm max-w-lg mt-3 uppercase tracking-wider text-slate-500">
            Capturing frozen fragments of space, mood, and time
          </p>
          <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-4" />
        </div>

        {/* Dynamic emerging photo frame workspace */}
        <div 
          className="relative w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-12 min-h-[440px] sm:min-h-[520px]"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{ perspective: 2000 }}
        >
          {/* Photos viewport representing character emerging frontwards */}
          <div className="w-full lg:w-3/5 h-[280px] sm:h-[380px] md:h-[430px] relative flex items-center justify-center">
            {/* Ambient visual shadow bezel background */}
            <div className="absolute inset-2 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 rounded-3xl blur-2xl opacity-60" />

            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={imageVariants}
                initial="enter"
                animate="center"
                 exit="exit"
                 onClick={() => {
                   if (activePhoto.id) {
                     window.location.hash = `#/photography/${activePhoto.id}`;
                   }
                 }}
                 className="absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/60 p-2 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.85)] flex items-center justify-center transform-gpu cursor-pointer group"
                 style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden">
                  <img
                    src={activePhoto.imageUrl}
                    alt={activePhoto.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover select-none transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Hover detail info popup overlay */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="px-4 py-2 rounded-full bg-purple-600 border border-purple-500 text-white font-sans text-xs font-bold shadow-lg flex items-center gap-1.5 transform scale-95 group-hover:scale-100 transition-all">
                      <Camera size={14} />
                      গল্প ও EXIF বিবরণ দেখুন
                    </span>
                  </div>
                  {/* Glass highlight glare layer */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Cinematic floating text panels & camera dynamic specs card */}
          <div className="w-full lg:w-2/5 flex flex-col justify-between h-auto py-2 z-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 20, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.96 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-6"
              >
                {/* Float glass card */}
                <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md shadow-2xl relative">
                  <div className="absolute -top-3.5 -right-3.5 w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-mono text-xs font-bold shadow-md">
                    0{activeIndex + 1}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-sans tracking-tight font-extrabold text-white mb-3">
                    {activePhoto.title}
                  </h3>
                  
                  <p className="text-slate-350 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                    {activePhoto.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-5 mt-4 text-[11px] font-mono">
                    <div className="space-y-1">
                      <span className="text-slate-500 uppercase tracking-wider block">Location</span>
                      <span className="text-slate-200 font-semibold flex items-center gap-1.5 break-all">
                        <MapPin size={11} className="text-pink-500 shrink-0" />
                        {activePhoto.location || "Unknown"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 uppercase tracking-wider block">EXIF Setup</span>
                      <span className="text-slate-200 font-semibold flex items-center gap-1.5 break-all">
                        <Sliders size={11} className="text-purple-400 shrink-0" />
                        {activePhoto.cameraSettings || "f/2.8 | Auto | ISO"}
                      </span>
                    </div>
                  </div>

                  {/* Link Button to dedicated photo details page */}
                  <div className="mt-6 pt-4 border-t border-slate-800/60">
                    <button
                      onClick={() => {
                        if (activePhoto.id) {
                          window.location.hash = `#/photography/${activePhoto.id}`;
                        }
                      }}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-sans text-xs font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Camera size={14} />
                      গল্প ও EXIF বিবরণ দেখুন
                    </button>
                  </div>
                </div>

                {/* Live Lens status indicator */}
                <div className="flex items-center gap-4 px-4 py-2.5 rounded-2xl border border-slate-800/60 bg-slate-900/30 backdrop-blur-sm self-start text-[10.5px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Focus size={13} className="text-amber-500 animate-pulse" />
                    <span>LENS: OPTICAL PRIME</span>
                  </div>
                  <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                  <div className="flex items-center gap-1.5">
                    <Compass size={13} className="text-blue-400" />
                    <span>STABILIZED ACTIVE</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Viewport Control Navigation Layout Buttons */}
            <div className="flex items-center justify-between mt-8 lg:mt-12 border-t border-slate-800/60 pt-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="p-3 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-purple-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={handleNext}
                  className="p-3 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-purple-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
                  aria-label="Next Slide"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Autoplay controllers and tracking indicators */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3 py-1.5 rounded-xl border border-slate-800/80 bg-slate-905/30 hover:border-purple-500/20 text-[10px] font-mono text-slate-500 hover:text-purple-400 transition-colors flex items-center gap-1.5"
                  title={isPlaying ? "Pause Autoplay" : "Resume Autoplay"}
                >
                  {isPlaying ? <Pause size={10} /> : <Play size={10} />}
                  <span>{isPlaying ? "ACTIVE" : "STANDBY"}</span>
                </button>

                {/* Dynamic mini dots row */}
                <div className="flex gap-1.5">
                  {photos.map((_, idx) => (
                    <button
                      key={`photo-dot-${idx}`}
                      onClick={() => {
                        setDirection(idx > activeIndex ? 1 : -1);
                        setActiveIndex(idx);
                      }}
                      className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                        idx === activeIndex 
                          ? 'w-4 bg-purple-500' 
                          : 'w-1.5 bg-slate-800 hover:bg-slate-600'
                      }`}
                      aria-label={`Go to photo ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Article & Camera Setup Guide Section */}
        <AnimatePresence mode="wait">
          {activePhoto.articleContent && (
            <motion.div
              key={`article-${activeIndex}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
              className="mt-16 w-full max-w-5xl mx-auto bg-slate-900/45 border border-slate-800/80 rounded-3xl p-6 md:p-10 backdrop-blur-md relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500" />
              
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-1/3 space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/60 space-y-3">
                    <h4 className="text-xs font-mono font-bold tracking-widest text-purple-400 uppercase flex items-center gap-2">
                      <Sliders size={12} />
                      TECHNICAL EXIF SPECS
                    </h4>
                    
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between border-b border-slate-900 pb-1.5">
                        <span className="text-slate-500">Aperture:</span>
                        <span className="text-slate-300 font-semibold">{activePhoto.cameraSettings?.split('|')[0]?.trim() || 'f/2.8'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900 pb-1.5">
                        <span className="text-slate-500">Exposure/Speed:</span>
                        <span className="text-slate-300 font-semibold">{activePhoto.cameraSettings?.split('|')[1]?.trim() || 'Auto'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900 pb-1.5">
                        <span className="text-slate-500">ISO Rating:</span>
                        <span className="text-slate-300 font-semibold">{activePhoto.cameraSettings?.split('|')[2]?.trim() || 'ISO 100'}</span>
                      </div>
                      {activePhoto.cameraSettings?.split('|')[3] && (
                        <div className="flex justify-between border-b border-slate-900 pb-1.5">
                          <span className="text-slate-500">Focal Length:</span>
                          <span className="text-slate-300 font-semibold">{activePhoto.cameraSettings?.split('|')[3]?.trim()}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-500">Location Tag:</span>
                        <span className="text-pink-400 font-semibold">{activePhoto.location || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* SEO keywords anchor list of search-optimized tags */}
                  <div className="p-4 rounded-2xl bg-slate-950/20 border border-slate-900/60 space-y-2">
                    <h5 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">SEO Optimized Meta Tags</h5>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">#PhotographySettings</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">#CameraTips</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">#CameraSettingsGuide</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">#{activePhoto.title?.replace(/\s+/g, '')}</span>
                      {activePhoto.location && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">#{activePhoto.location?.split(',')[0]?.trim()?.replace(/\s+/g, '')}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Article content block */}
                <div className="w-full md:w-2/3 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-purple-400 tracking-widest uppercase">
                    <span className="inline-block w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    PHOTO ANALYSIS & STORY
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-sans font-bold text-white tracking-tight leading-snug">
                    {activePhoto.title}: Camera Settings & Analysis
                  </h3>

                  <div className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans whitespace-pre-wrap space-y-3 border-t border-slate-800/60 pt-4">
                    {activePhoto.articleContent}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
