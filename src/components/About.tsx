import { motion } from 'motion/react';
import { User, Terminal, Code2, Globe2 } from 'lucide-react';
import { Profile } from '../types';

interface AboutProps {
  profile: Profile;
}

export default function About({ profile }: AboutProps) {
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
            ABOUT FILE_INFO
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-sans tracking-tight font-extrabold text-white">
            Biological & Professional Background
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
                <div className="pt-4 border-t border-slate-800/50 flex items-center gap-2 text-slate-500 text-[10px]">
                  <Terminal size={12} className="text-purple-500" />
                  <span>Node.js server environment: Operational</span>
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
    </section>
  );
}
