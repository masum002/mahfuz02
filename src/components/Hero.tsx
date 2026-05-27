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
    
    try {
      // 1. Initialize jsPDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // 2. Setup colors
      const primaryColor = [124, 58, 237]; // Elegant Purple (7c3aed)
      const textPrimary = [15, 23, 42]; // Slate 900
      const textSecondary = [71, 85, 105]; // Slate 600
      const borderSlate = [226, 232, 240]; // Slate 200

      // 3. Side accent panel
      doc.setFillColor(248, 250, 252); // elegant light off-white (slate-50)
      doc.rect(10, 10, 62, 277, 'F');
      
      // Sidebar top colored identifier line
      doc.setFillColor(124, 58, 237);
      doc.rect(10, 10, 3, 277, 'F');

      // 4. HEADER - Main right-side top quadrant
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
      doc.text(cvNameStr.toUpperCase(), 78, 26);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(cvTitleStr, 78, 32);

      // Section separator line
      doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
      doc.setLineWidth(0.5);
      doc.line(78, 36, 200, 36);

      // 5. LEFT SIDEBAR DETAILS
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
      doc.text("PERSONAL DETAILS", 18, 26);
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.6);
      doc.line(18, 28.5, 38, 28.5);

      let sideY = 36;
      const drawSideHeader = (label: string) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(label.toUpperCase(), 18, sideY);
        sideY += 4;
      };

      const drawSideText = (text: string, width: number = 48) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        const lines = doc.splitTextToSize(text, width);
        doc.text(lines, 18, sideY);
        sideY += (lines.length * 4) + 3;
      };

      if (cvEmailStr) { drawSideHeader("Email Address"); drawSideText(cvEmailStr); }
      if (cvPhoneStr) { drawSideHeader("Phone Number"); drawSideText(cvPhoneStr); }
      if (cvAddressStr) { drawSideHeader("Location"); drawSideText(cvAddressStr); }
      if (profile.cvDob) { drawSideHeader("Date of Birth"); drawSideText(profile.cvDob); }
      if (profile.cvNationality) { drawSideHeader("Nationality"); drawSideText(profile.cvNationality); }
      if (profile.cvGender) { drawSideHeader("Gender"); drawSideText(profile.cvGender); }
      if (profile.cvLanguages) { drawSideHeader("Languages"); drawSideText(profile.cvLanguages); }

      // Skills List
      if (sideY < 270) {
        drawSideHeader("Skills / Expertise");
        const skills = cvSkillsList;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        skills.forEach(skill => {
          if (sideY < 278) {
            doc.setFillColor(124, 58, 237);
            doc.circle(20, sideY - 1, 0.6, 'F');
            doc.text(skill, 23, sideY);
            sideY += 4.5;
          }
        });
      }

      // 6. RIGHT COLUMN MAIN SECTIONS
      let mainY = 46;

      const drawSectionHeader = (title: string) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
        doc.text(title.toUpperCase(), 78, mainY);
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setLineWidth(0.8);
        doc.line(78, mainY + 2.5, 98, mainY + 2.5);
        mainY += 8;
      };

      // OBJECTIVE
      const objectiveText = profile.cvObjective || profile.bio || "Professional Full Stack developer looking to deliver great UI/UX...";
      drawSectionHeader("Professional Objective");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
      const splitObjective = doc.splitTextToSize(objectiveText, 118);
      doc.text(splitObjective, 78, mainY);
      mainY += (splitObjective.length * 4.5) + 8;

      // EXPERIENCE
      drawSectionHeader("Professional History");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const splitExperience = doc.splitTextToSize(cvExperienceStr, 118);
      doc.text(splitExperience, 78, mainY);
      mainY += (splitExperience.length * 4.5) + 8;

      // EDUCATION
      if (mainY > 240) {
        doc.addPage();
        mainY = 20; // reset on page 2 if needed
      }
      drawSectionHeader("Education Background");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const splitEducation = doc.splitTextToSize(cvEducationStr, 118);
      doc.text(splitEducation, 78, mainY);

      // Save PDF document
      const docName = `${cvNameStr.trim().replace(/\s+/g, '_')}_Resume_CV.pdf`;
      doc.save(docName);
    } catch (err) {
      console.error("Vector PDF Generation failed, fallback to raw window print: ", err);
      window.print();
    } finally {
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
          className="flex justify-center items-center"
        >
          <button
            onClick={handleDownloadCV}
            disabled={pdfCompiling}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 text-white rounded-xl font-semibold shadow-xl shadow-purple-600/20 hover:shadow-purple-500/40 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-80 pb-3"
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
        </motion.div>

        {/* Explore More Modern / High-End Interactive Section */}
        <div className="relative mt-20 pb-12 flex flex-col items-center">
          {!exploreComplete ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0.8 }}
              whileHover={{ scale: 1.05, opacity: 1 }}
              animate={{ y: [0, 8, 0] }}
              transition={{ 
                y: { repeat: Infinity, duration: 2.2, ease: "easeInOut" },
                scale: { duration: 0.2 },
                opacity: { duration: 0.2 }
              }}
              className="relative cursor-pointer group flex flex-col items-center justify-center"
              onClick={onExploreSystem}
            >
              {/* Pulsing glow ring */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300 animate-pulse" />
              
              <div className="relative px-8 py-3.5 bg-slate-900/90 border border-purple-500/30 rounded-full flex items-center gap-3 backdrop-blur-md shadow-2xl transition-all duration-300 group-hover:border-purple-400 group-hover:shadow-purple-500/10">
                <span className="text-xs font-mono tracking-[0.2em] text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text font-bold uppercase">
                  Explore More
                </span>
                
                {isExploring ? (
                  <RefreshCw size={14} className="text-purple-400 animate-spin" />
                ) : (
                  <motion.div
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                  >
                    <ChevronDown size={14} className="text-purple-400" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="px-6 py-2 rounded-full bg-purple-500/5 border border-purple-500/20 text-xs font-mono text-purple-400 flex items-center justify-center gap-2 shadow-sm animate-pulse tracking-wide">
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

