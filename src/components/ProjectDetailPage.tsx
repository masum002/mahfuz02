import { motion } from 'motion/react';
import { ArrowLeft, ExternalLink, Github, Calendar, ShieldCheck, Cpu, ChevronRight } from 'lucide-react';
import { Project } from '../types';

interface ProjectDetailPageProps {
  project: Project;
  allProjects: Project[];
  onBack: () => void;
  onNavigateToProject: (id: string) => void;
}

export default function ProjectDetailPage({ 
  project, 
  allProjects, 
  onBack, 
  onNavigateToProject 
}: ProjectDetailPageProps) {
  // Filter other projects to suggest at the bottom
  const otherProjects = allProjects
    .filter(p => p.id !== project.id)
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24"
    >
      {/* Dynamic light accent ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-purple-500/10 via-blue-500/5 to-transparent blur-3xl pointer-events-none z-0" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 pt-10">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-purple-500/35 transition-all text-xs font-mono font-bold group shadow-lg"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            BACK TO PORTFOLIO
          </button>
          
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 font-mono text-[10px] tracking-wider uppercase">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            PROJECT ENVIRONMENT
          </div>
        </div>

        {/* Core Project Presentation Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT PANEL: High Resolution Visual Frame */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative aspect-video w-full bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-[0_0_80px_rgba(0,0,0,0.8)] group">
              <img
                src={project.imageUrl || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"}
                alt={project.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-750 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60" />
            </div>

            {/* Quick Tech Specs / Highlights */}
            <div className="p-6 rounded-2.5xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm space-y-4">
              <h3 className="text-xs font-mono font-bold tracking-widest text-purple-400 uppercase flex items-center gap-2">
                <Cpu size={14} />
                SYSTEM ARCHITECTURE FEATURES
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-900/60">
                  <span className="text-slate-500 block mb-1">DEPLOYMENT TYPE</span>
                  <span className="text-slate-200 font-semibold">Production Cloud Edge</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-900/60">
                  <span className="text-slate-500 block mb-1">ENGINE STATUS</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Operational
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Metadata, Actions, and Dynamic Details */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 text-[10px] font-mono font-bold tracking-wider uppercase bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full shadow-sm">
                  Featured Artifact
                </span>
                {project.liveUrl && (
                  <span className="px-3 py-1 text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full shadow-sm">
                    Live Demo Available
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight text-white leading-tight">
                {project.title}
              </h1>

              <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
            </div>

            {/* Main Details Panel */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-2xl space-y-6">
              <div className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4">
                {project.details ? (
                  project.details
                ) : (
                  project.description || "A high-performance modern web application built with precision, scalability, and outstanding user experience."
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-800/80">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-5 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-sans text-xs font-bold tracking-wide transition-all shadow-lg shadow-purple-600/15 flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={14} />
                    Launch Live Site
                  </a>
                )}

                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-5 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white font-sans text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2"
                  >
                    <Github size={14} />
                    View Source Code
                  </a>
                )}
              </div>

              {/* Time Metadata */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-slate-800/40 pt-4">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  PUBLISHED AT:
                </span>
                <span className="text-slate-400 font-semibold">
                  {project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Suggest Other Projects */}
        {otherProjects.length > 0 && (
          <div className="mt-20 pt-12 border-t border-slate-900">
            <h2 className="text-lg sm:text-xl font-sans font-extrabold text-white mb-6">
              Explore Other Projects
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {otherProjects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => proj.id && onNavigateToProject(proj.id)}
                  className="group rounded-2.5xl overflow-hidden bg-slate-900/40 border border-slate-800 hover:border-purple-500/30 transition-all duration-300 cursor-pointer shadow-lg flex flex-col justify-between"
                >
                  <div className="aspect-video relative overflow-hidden bg-slate-950 border-b border-slate-800">
                    <img
                      src={proj.imageUrl || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"}
                      alt={proj.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="font-sans font-bold text-slate-200 text-sm mb-1.5 group-hover:text-purple-400 transition-colors line-clamp-1">
                        {proj.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {proj.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1 text-[10px] text-purple-400 font-mono mt-4 font-semibold uppercase tracking-wider">
                      <span>View details</span>
                      <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
