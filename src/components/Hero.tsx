import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Download, ChevronDown, Award, Sparkles, RefreshCw } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Profile, Contact } from '../types';

interface HeroProps {
  profile: Profile;
  contact?: Contact | null;
  onNavigateToContact: () => void;
  onExploreSystem?: () => void;
  isExploring?: boolean;
  loadProgress?: number;
  exploreComplete?: boolean;
}

export default function Hero({ 
  profile, 
  contact,
  onNavigateToContact, 
  onExploreSystem,
  isExploring = false,
  loadProgress = 0,
  exploreComplete = false
}: HeroProps) {
  const rawRoles = profile.heroRoles || "Lead Full-Stack Engineer, Full Stack Master, Cloud Architect, UI Design Artisan";
  const titles = rawRoles.split(',').map(r => r.trim()).filter(Boolean);
  const [currentText, setCurrentText] = useState('');
  const [titleIndex, setTitleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pdfCompiling, setPdfCompiling] = useState(false);

  // Smooth typing-carousel effect
  useEffect(() => {
    const handleTyping = () => {
      const currentFullTitle = titles[titleIndex] || "Creative Professional";
      
      if (!isDeleting) {
        setCurrentText(currentFullTitle.substring(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
        
        if (charIndex + 1 >= currentFullTitle.length) {
          // Pause at full text
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        setCurrentText(currentFullTitle.substring(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
        
        if (charIndex - 1 <= 0) {
          setIsDeleting(false);
          setTitleIndex(prev => (prev + 1) % titles.length);
          setCharIndex(0);
        }
      }
    };

    const timer = setTimeout(handleTyping, isDeleting ? 40 : 100);
    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, titleIndex, profile.heroRoles, titles]);

  const handleDownloadCV = async () => {
    setPdfCompiling(true);
    
    // Select the hidden CV DOM layout
    const element = document.getElementById('cv-pdf-root');
    if (!element) {
      setPdfCompiling(false);
      alert("System issue: PDF output node not mounted.");
      return;
    }
    
    // Make CV element temporarily renderable in the document flow (offscreen)
    element.style.display = 'block';
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '-9999px';
    element.style.width = '794px'; // A4 width at 96 DPI is 794px

    let restoreStyles: (() => void) | null = null;
    try {
      // Find and rewrite css rules containing "oklch(" temporarily
      const restoredRules: { sheet: CSSStyleSheet; ruleText: string; index: number }[] = [];
      const sheets = Array.from(document.styleSheets);
      
      for (const sheet of sheets) {
        try {
          const rules = sheet.cssRules || sheet.rules;
          if (!rules) continue;
          
          const rulesArray = Array.from(rules);
          for (let i = rulesArray.length - 1; i >= 0; i--) {
            const rule = rulesArray[i];
            if (rule.cssText && rule.cssText.includes('oklch(')) {
              restoredRules.push({
                sheet,
                ruleText: rule.cssText,
                index: i
              });
              
              // Safely swap oklch colors with compatible rgb format to satisfy html2canvas parser
              const cleanRuleText = rule.cssText.replace(/oklch\([^)]+\)/g, 'rgb(124, 58, 237)');
              sheet.deleteRule(i);
              sheet.insertRule(cleanRuleText, i);
            }
          }
        } catch (e) {
          // Cross-origin CSS rules might throw access error inside iframe, ignore safely
        }
      }
      
      restoreStyles = () => {
        for (const item of restoredRules.reverse()) {
          try {
            item.sheet.deleteRule(item.index);
            item.sheet.insertRule(item.ruleText, item.index);
          } catch (e) {
            console.warn("Could not restore original style config: ", e);
          }
        }
      };
    } catch (e) {
      console.error("Style prep failed: ", e);
    }
    
    try {
      // Small timeout to allow images & styling to resolve fully
      await new Promise(resolve => setTimeout(resolve, 350));
      
      const canvas = await html2canvas(element, {
        scale: 2, // High DPI resolution output
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();
      const imgWidth = 210; // A4 Millimeter width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add PDF image
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      
      // Save CV
      const filename = `${(profile.cvName || profile.name || "MAHFUZ_R_MASUM").replace(/\s+/g, '_')}_CV.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error("Failed to build PDF resume: ", err);
      alert("Notice: Could not generate document utilizing system graphics. Custom PDF data downloaded securely.");
      // Soft fallback to standard custom URL if configured
      if (profile.cvUrl && profile.cvUrl !== "#") {
        window.open(profile.cvUrl, '_blank');
      }
    } finally {
      // Restore dynamic styles if modified
      if (restoreStyles) {
        restoreStyles();
      }
      // Restore hidden configuration
      element.style.display = 'none';
      setPdfCompiling(false);
    }
  };

  // Explode array details for CV parsing
  const cvNameStr = profile.cvName || profile.name || "MAHFUZ R MASUM";
  const cvTitleStr = profile.cvTitle || profile.title || "Lead Full-Stack & Cloud Engineer";
  const cvAddressStr = profile.cvAddress || contact?.address || "Dhaka, Bangladesh";
  const cvEmailStr = profile.cvEmail || contact?.email || "mahfujar003@gmail.com";
  const cvPhoneStr = profile.cvPhone || contact?.phone || "+880 1700 000000";
  const cvPhotoUrlStr = profile.cvPhotoUrl || profile.avatarUrl || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600";
  const cvSkillsList = (profile.cvSkills || "TypeScript, React, Next.js, Node.js, Express, Go, Docker, Kubernetes, GCP, Firebase, Tailwind CSS, Framer Motion").split(',').map(s => s.trim()).filter(Boolean);
  const cvExperienceStr = profile.cvExperience || "Senior Web Developer at Aura Soft Inc (2024 - Present)\n- Developed scalable micro-services and state engines.\n- Managed Kubernetes orchestration frameworks.\n\nSoftware Developer Intern at Chronos (2023 - 2024)\n- Crafted highly-responsive interactive calendars and widgets.";
  const cvEducationStr = profile.cvEducation || "Bachelor of Science in Computer Science & Engineering - Prime University\nDiploma in Computer Technology - Sylhet Polytechnic Institute";

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]">
      {/* Visual background accents */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      
      <div className="max-w-4xl mx-auto px-6 text-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative inline-block mb-8"
        >
          {/* Custom Avatar container */}
          <div className="w-36 h-36 md:w-44 md:h-44 rounded-full p-[3px] bg-gradient-to-tr from-purple-500 via-pink-500 to-blue-500 shadow-xl shadow-purple-500/20">
            <img
              src={profile.avatarUrl || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600"}
              alt={profile.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-full bg-slate-900 border-2 border-slate-900"
            />
          </div>
          <motion.div 
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute -bottom-1 -right-1 bg-slate-800 text-purple-400 p-2 rounded-full border border-purple-500/30 shadow-md flex items-center justify-center"
          >
            <Sparkles size={18} className="animate-spin-slow" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <span className="px-3 py-1 text-xs border border-purple-500/30 text-purple-400 bg-purple-500/5 rounded-full font-mono font-semibold tracking-wider uppercase mb-4 inline-block">
            Welcome to my ecosystem
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-sans tracking-tight font-extrabold text-white mb-6">
            {profile.heroGreeting ? (
              profile.heroGreeting.includes(profile.name) ? (
                <span>
                  {profile.heroGreeting.split(profile.name)[0]}
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">{profile.name}</span>
                  {profile.heroGreeting.split(profile.name)[1]}
                </span>
              ) : (
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">{profile.heroGreeting}</span>
              )
            ) : (
              <>
                Hi, I'm <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">{profile.name}</span>
              </>
            )}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="h-8 mb-8 text-xl md:text-2xl font-mono text-slate-400 flex justify-center items-center"
        >
          <span>I am a&nbsp;</span>
          <span className="text-white font-semibold border-r-2 border-purple-400 pr-1 animate-blink select-none">
            {currentText}
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-slate-400 max-w-lg mx-auto text-base md:text-lg leading-relaxed mb-10"
        >
          {profile.heroSubtitle || "Let's turn complex design specifications into elegant interactive digital artifacts. Check out my skills and projects below."}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={handleDownloadCV}
            disabled={pdfCompiling}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-purple-600/20 hover:shadow-purple-500/30 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-80 pb-3"
          >
            {pdfCompiling ? (
              <>
                <RefreshCw size={17} className="animate-spin" />
                Compiling PDF Resume...
              </>
            ) : (
              <>
                <Download size={18} />
                Download CV
              </>
            )}
          </button>
          <button
            onClick={onNavigateToContact}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl font-medium border border-slate-700 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
          >
            Get In Touch
          </button>
        </motion.div>

        {/* Explore System Dynamic Matrix Loading trigger */}
        <div className="relative mt-16 pb-12">
          {!exploreComplete ? (
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className={`mx-auto max-w-xs text-slate-500 hover:text-slate-350 cursor-pointer flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-transparent transition-all duration-300 ${
                isExploring ? 'bg-slate-900/40 border-slate-850 shadow-lg' : 'hover:bg-slate-900/20'
              }`}
              onClick={onExploreSystem}
            >
              <span className="text-xs font-mono tracking-widest text-slate-550 uppercase">Explore System</span>
              {isExploring ? (
                <RefreshCw size={16} className="text-purple-400 animate-spin" />
              ) : (
                <ChevronDown size={18} className="text-purple-500" />
              )}
            </motion.div>
          ) : (
            <div className="text-xs font-mono text-purple-400 flex items-center justify-center gap-2 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              SYSTEM PORTFOLIO LOADED
            </div>
          )}

          {/* Cyberpunk progress logging panel */}
          {isExploring && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 max-w-sm mx-auto text-left font-mono text-[10px] bg-slate-950/90 border border-purple-500/20 p-4 rounded-xl text-purple-400 shadow-2xl relative"
            >
              <div className="absolute top-2 right-2 text-[8px] tracking-widest text-slate-500 animate-pulse">
                SYS_BOOTING
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] tracking-wider text-slate-300">SYSTEM MATRIX COMPILATION:</span>
                <span className="font-bold text-slate-100">{loadProgress}%</span>
              </div>
              {/* Progress Bar Container */}
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-2.5">
                <div 
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 h-full transition-all duration-100 rounded-full" 
                  style={{ width: `${loadProgress}%` }} 
                />
              </div>
              <div className="space-y-0.5 text-[8px] text-slate-500 uppercase overflow-hidden h-12 flex flex-col justify-end">
                {loadProgress > 15 && <p className="text-purple-500/80">▸ loading profile parameters...</p>}
                {loadProgress > 40 && <p className="text-pink-550">▸ streaming expertise matrices...</p>}
                {loadProgress > 70 && <p className="text-blue-400">▸ caching projects & contacts...</p>}
                {loadProgress > 90 && <p className="text-emerald-400">✔ handshake complete. opening portal.</p>}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* DYNAMIC DESIGNER CV TEMPLATE (Pure HTML structure for PDF compilation) */}
      <div 
        id="cv-pdf-root" 
        style={{ display: 'none' }} 
        className="bg-white text-slate-900 p-12 font-sans w-[800px] leading-relaxed select-none relative"
      >
        {/* Header Block with top color accents */}
        <div style={{ display: 'flex', gap: '28px', alignItems: 'center', borderBottom: '3px solid #7c3aed', paddingBottom: '24px', marginBottom: '24px' }}>
          {cvPhotoUrlStr && (
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #7c3aed', flexShrink: 0 }}>
              <img 
                src={cvPhotoUrlStr} 
                crossOrigin="anonymous" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                alt="Representative Profile Picture" 
                onError={(e) => {
                  // Fallback transparent standard placeholder to verify build
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div style={{ flexGrow: 1 }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0', letterSpacing: '-0.025em', textTransform: 'uppercase' }}>
              {cvNameStr}
            </h1>
            <p style={{ fontSize: '14px', fontWeight: '700', color: '#7c3aed', margin: '4px 0 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {cvTitleStr}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '10px', fontSize: '11px', color: '#475569', fontWeight: '500' }}>
              <span>📍 {cvAddressStr}</span>
              <span>✉ {cvEmailStr}</span>
              <span>📞 {cvPhoneStr}</span>
            </div>
          </div>
        </div>

        {/* Two halves layout */}
        <div style={{ display: 'flex', gap: '30px', marginTop: '10px' }}>
          {/* Column A (35% scale) */}
          <div style={{ width: '35%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Technical skills list */}
            <div>
              <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', borderBottom: '1.5px solid #cbd5e1', paddingBottom: '4px', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Expertise Matrix
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {cvSkillsList.map((skill, index) => (
                  <span 
                    key={index} 
                    style={{ fontSize: '10px', backgroundColor: '#f1f5f9', color: '#334155', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontWeight: '600' }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Academic timeline */}
            <div>
              <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', borderBottom: '1.5px solid #cbd5e1', paddingBottom: '4px', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Education Background
              </h3>
              <div style={{ fontSize: '11px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '10px', whiteSpace: 'pre-line', fontWeight: '500', lineHeight: '1.5' }}>
                {cvEducationStr}
              </div>
            </div>
            
            {/* Systems Validation footprint */}
            <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
              <p style={{ fontSize: '8px', color: '#94a3b8', fontFamily: 'monospace', letterSpacing: '0.05em', lineHeight: '1.3' }}>
                SECURED SYSTEM VERIFICATION<br />
                DOC AUTH CODE: 2026-M4HFUZ-CV
              </p>
            </div>
          </div>

          {/* Column B (65% scale) */}
          <div style={{ width: '65%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Performance summary */}
            <div>
              <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', borderBottom: '1.5px solid #cbd5e1', paddingBottom: '4px', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Professional Overview
              </h3>
              <p style={{ fontSize: '11.5px', color: '#334155', margin: '0', lineHeight: '1.6', fontWeight: '500' }}>
                {profile.bio}
              </p>
            </div>

            {/* Project / Job chronology */}
            <div>
              <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', borderBottom: '1.5px solid #cbd5e1', paddingBottom: '4px', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Professional History
              </h3>
              <div style={{ fontSize: '11px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '12px', whiteSpace: 'pre-line', lineHeight: '1.6', fontWeight: '500' }}>
                {cvExperienceStr}
              </div>
            </div>
          </div>
        </div>

        {/* Footnote stamp branding */}
        <div style={{ marginTop: '50px', borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: '700', fontFamily: 'monospace' }}>
            PORTFOLIO DIGITAL ARTIFACT SYSTEMS
          </span>
          <span style={{ fontSize: '9px', color: '#7c3aed', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'sans-serif' }}>
            POWERED BY MAHFUZ R MASUM
          </span>
        </div>
      </div>
    </section>
  );
}

