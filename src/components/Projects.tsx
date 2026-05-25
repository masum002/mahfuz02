import { motion } from 'motion/react';
import { Briefcase, ExternalLink, Github, Terminal } from 'lucide-react';
import { Project } from '../types';

interface ProjectsProps {
  projects: Project[];
}

export default function Projects({ projects }: ProjectsProps) {
  return (
    <section id="projects" className="py-24 relative overflow-hidden bg-slate-950/40">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 font-mono text-xs mb-4"
          >
            <Briefcase size={14} />
            DEPLOYED PRODUCTIONS
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-sans tracking-tight font-extrabold text-white">
            Architectural Artifacts
          </h2>
          <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-4" />
        </div>

        {/* Dynamic Project Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {projects.map((proj, i) => (
            <motion.div
              key={proj.id || proj.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/30 overflow-hidden flex flex-col justify-between shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/5"
            >
              {/* Image Preview Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-950 border-b border-slate-800">
                <img
                  src={proj.imageUrl || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"}
                  alt={proj.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  {proj.liveUrl && (
                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-full bg-slate-900 border border-slate-700 text-white hover:bg-purple-600 hover:border-purple-500 transition-all duration-300"
                      title="Live Preview"
                    >
                      <ExternalLink size={18} />
                    </a>
                  )}
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-full bg-slate-900 border border-slate-700 text-white hover:bg-purple-600 hover:border-purple-500 transition-all duration-300"
                      title="GitHub Repository"
                    >
                      <Github size={18} />
                    </a>
                  )}
                </div>
              </div>

              {/* Title, description info */}
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-sans font-bold text-slate-100 mb-2.5 group-hover:text-purple-400 transition-colors">
                    {proj.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {proj.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 mt-auto">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                    <Terminal size={12} className="text-purple-500" />
                    <span>production_v1.0</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white transition-colors"
                        title="GitHub Link"
                      >
                        <Github size={16} />
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a
                        href={proj.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-purple-400 transition-colors flex items-center gap-1 font-mono text-xs uppercase tracking-wider font-semibold"
                      >
                        Launch
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
