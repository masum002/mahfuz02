import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Terminal, Code2, Globe2, X, Sparkles, Image, CheckCircle } from 'lucide-react';
import { Profile } from '../types';

interface AboutProps {
  profile: Profile;
}

export default function About({ profile }: AboutProps) {
  const [showDetailedAbout, setShowDetailedAbout] = useState(false);

  // Extract the comma separated images if present, otherwise fallback to standard default placeholder
  const imagesList = profile.aboutImages
    ? profile.aboutImages.split(',').map(url => url.trim()).filter(Boolean)
    : [
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600"
      ];

  return (
    <section id="about" className="py-24 relative overflow-hidden bg-slate-950/60">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 font-mono text-xs mb-4"
          >
            <User size={14} />
            ABOUT ME
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-sans tracking-tight font-extrabold text-white">
            My Professional Journey & Vision
          </h2>
          <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Code Window Simulation Graphic */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-25 group-hover:opacity-45 transition duration-1000" />
            
            <div className="relative rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs overflow-hidden shadow-2xl">
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                </div>
                <div className="text-slate-500 text-xs text-center pr-6">developer.json</div>
              </div>
              <div className="p-6 space-y-3 leading-relaxed">
                <div>
                  <span className="text-purple-400">const</span>{' '}
                  <span className="text-blue-400">developer</span> = &#123;
                </div>
                <div className="pl-4">
                  <span className="text-slate-400">name:</span>{' '}
                  <span className="text-green-300">"{profile.name}"</span>,
                </div>
                <div className="pl-4">
                  <span className="text-slate-400">roles:</span> [
                  <span className="text-green-300">"Full-Stack"</span>,{' '}
                  <span className="text-green-300">"DevOps"</span>],
                </div>
                <div className="pl-4">
                  <span className="text-slate-400">focus:</span>{' '}
                  <span className="text-green-300">"Clean Architecture"</span>,
                </div>
                <div className="pl-4">
                  <span className="text-slate-400">philosophy:</span>{' '}
                  <span className="text-orange-300">"Simple over complex"</span>
                </div>
                <div>&#125;;</div>
                <div className="pt-4 border-t border-slate-800/50 flex items-center gap-2 text-slate-400 text-[10px]">
                  <Code2 size={12} className="text-purple-500" />
                  <span>Focusing on robust performance & quality code.</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bio Text and Metric Blocks */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-8"
          >
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 text-lg leading-relaxed first-letter:text-4xl first-letter:font-bold first-letter:text-purple-400 first-letter:mr-1">
                {profile.bio}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowDetailedAbout(true)}
                className="group relative inline-flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-xs font-bold font-sans tracking-wider uppercase transition-all shadow-xl hover:shadow-purple-500/20 active:scale-95"
              >
                <Sparkles size={14} className="animate-pulse" />
                <span>Read More About Me</span>
                <span className="absolute inset-0 rounded-xl border border-white/20 scale-105 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300" />
              </button>
            </div>

            {/* Metric Blocks */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col justify-center transform hover:scale-103 transition-transform duration-300">
                <span className="text-3xl md:text-4xl font-mono font-extrabold text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  5+
                </span>
                <span className="text-xs md:text-sm font-sans text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                  Years Experience
                </span>
                <Code2 size={16} className="text-purple-500/40 mt-3 self-end" />
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col justify-center transform hover:scale-103 transition-transform duration-300">
                <span className="text-3xl md:text-4xl font-mono font-extrabold text-white bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">
                  40+
                </span>
                <span className="text-xs md:text-sm font-sans text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                  Projects Completed
                </span>
                <Globe2 size={16} className="text-pink-500/40 mt-3 self-end" />
              </div>

              <div className="col-span-2 md:col-span-1 p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col justify-center transform hover:scale-103 transition-transform duration-300">
                <span className="text-3xl md:text-4xl font-mono font-extrabold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  99%
                </span>
                <span className="text-xs md:text-sm font-sans text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                  Success Rate
                </span>
                <Terminal size={16} className="text-blue-500/40 mt-3 self-end" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* DETAILED ABOUT ME SUB-PAGE (Full Screen Modal Overlay) */}
      <AnimatePresence>
        {showDetailedAbout && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950 flex flex-col">
            {/* Backdrop Glow design elements */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none select-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-900/10 rounded-full blur-[120px] pointer-events-none select-none" />

            {/* Header toolbar */}
            <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-850 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <User size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-sans font-bold text-white tracking-wide">
                    {profile.name} (Detailed Biography)
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono tracking-wider">PORTFOLIO DECK // ABOUT ME</p>
                </div>
              </div>

              <button
                onClick={() => setShowDetailedAbout(false)}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold"
              >
                <X size={16} />
                <span>Close</span>
              </button>
            </header>

            {/* Main content body container */}
            <main className="flex-grow max-w-5xl w-full mx-auto px-6 py-12 md:py-16 space-y-12">
              {/* Profile Intro Banner Card */}
              <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 overflow-hidden flex flex-col sm:flex-row gap-8 items-center">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border border-slate-700 shadow-xl shrink-0 group">
                  <img
                    src={profile.avatarUrl || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600"}
                    alt={profile.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
                </div>

                <div className="text-center sm:text-left space-y-3">
                  <span className="px-3 py-1 text-[10px] font-mono tracking-widest uppercase bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full inline-block">
                    Lead Full-Stack & Cloud Engineer
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-sans tracking-tight font-black text-white">
                    {profile.name}
                  </h1>
                  <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                    {profile.bio}
                  </p>
                </div>
              </div>

              {/* Two columns: Detail text & Photos Showcase */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                {/* Detail Bio text */}
                <div className="md:col-span-7 space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                    <User size={16} className="text-purple-400" />
                    <h2 className="text-lg font-sans font-bold text-white uppercase tracking-wider">Detailed About Me</h2>
                  </div>

                  <div className="text-slate-300 text-sm leading-relaxed space-y-5 whitespace-pre-line">
                    {profile.aboutDetailText ? (
                      profile.aboutDetailText.split('\n').map((para, index) => (
                        <p key={index} className="text-slate-300">{para}</p>
                      ))
                    ) : (
                      <p className="text-slate-300">
                        Mahfuz R Masum is a professional Lead Full-Stack & Cloud Engineer. He specializes in designing real-time system architectures, robust administrative controls, secure data layers, and cloud native microservice orchestrations.
                      </p>
                    )}
                  </div>

                  {/* Quick summary highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-850 flex gap-3 items-start">
                      <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-white font-sans">Advanced React Frameworks</h4>
                        <p className="text-[11px] text-slate-500 leading-normal mt-0.5">Highly proficient in Vite, Next.js, Framer Motion, Recharts, and Tailwind CSS.</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-850 flex gap-3 items-start">
                      <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-white font-sans">Cloud & Serverless</h4>
                        <p className="text-[11px] text-slate-500 leading-normal mt-0.5">Experienced in Firebase, Docker, Google Cloud Platform, and custom CI/CD pipelines.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Photo Gallery Showcase */}
                <div className="md:col-span-5 space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                    <Image size={16} className="text-purple-400" />
                    <h2 className="text-lg font-sans font-bold text-white uppercase tracking-wider">My Gallery</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {imagesList.map((imgUrl, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.15 }}
                        className="relative aspect-video rounded-2xl overflow-hidden border border-slate-800 shadow-lg group bg-slate-950"
                      >
                        <img
                          src={imgUrl}
                          alt={`Mahfuz Photo ${i + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-slate-950/10 group-hover:bg-transparent transition-colors" />
                        <div className="absolute bottom-3 left-3 px-2 py-1 bg-slate-950/60 backdrop-blur-md rounded-lg border border-slate-800 text-[9px] font-mono text-slate-300">
                          IMAGE_{String(i + 1).padStart(2, '0')}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </main>

            {/* Footer */}
            <footer className="bg-slate-950 border-t border-slate-900 py-8 px-6 text-center">
              <button
                onClick={() => setShowDetailedAbout(false)}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-sans font-bold tracking-wider uppercase rounded-xl transition-all shadow-md inline-flex items-center gap-2"
              >
                <X size={14} />
                Go Back (Close)
              </button>
              <p className="text-[10px] text-slate-600 font-mono mt-4">&copy; 2026 MAHFUZ R MASUM. ALL RIGHTS SECURED.</p>
            </footer>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

