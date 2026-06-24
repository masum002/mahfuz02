import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Layers, CheckCircle2, Award } from 'lucide-react';
import { Skill } from '../types';

interface SkillsProps {
  skills: Skill[];
}

export default function Skills({ skills }: SkillsProps) {
  // Available filter tags
  const categories = useMemo(() => {
    const list = new Set(skills.map(s => s.category));
    return ["All", ...Array.from(list)];
  }, [skills]);

  const [activeCategory, setActiveCategory] = useState("All");

  const filteredSkills = useMemo(() => {
    if (activeCategory === "All") return skills;
    return skills.filter(s => s.category === activeCategory);
  }, [skills, activeCategory]);

  return (
    <section id="skills" className="py-24 relative overflow-hidden bg-slate-900/40">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/20 bg-pink-500/5 text-pink-400 font-mono text-xs mb-4"
          >
            <Layers size={14} />
            EXPERTISE
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-sans tracking-tight font-extrabold text-white">
            Professional Skillset
          </h2>
          <div className="w-12 h-1 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full mt-4" />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs font-mono tracking-wider rounded-xl border transition-all duration-300 uppercase ${
                activeCategory === cat
                  ? "bg-purple-600 border-purple-500/40 text-white shadow-md shadow-purple-600/10"
                  : "bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid of skills */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto"
        >
          {filteredSkills.map((skill) => (
            <motion.div
              layout
              key={skill.id || skill.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-md flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                    <CheckCircle2 size={15} />
                  </span>
                  <span className="text-sm font-sans font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                    {skill.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-800 uppercase text-[9px] tracking-wide">
                    {skill.category}
                  </span>
                  <span className="text-purple-400 font-bold">{skill.percentage}%</span>
                </div>
              </div>

              {/* Progress bar container */}
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/65">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.percentage}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Dynamic bottom badge */}
        <div className="mt-16 flex justify-center text-center">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 border border-slate-800 px-4 py-2 rounded-xl bg-slate-950/20">
            <Award size={14} className="text-pink-500" />
            <span>Dedicated to continuous learning & modern practices</span>
          </div>
        </div>
      </div>
    </section>
  );
}
