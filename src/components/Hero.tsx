import { useState, useEffect, useMemo } from 'react';
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
  const titles = useMemo(() => {
    const rawRoles = profile.heroRoles || "Lead Full-Stack Engineer, Full Stack Master, Cloud Architect, UI Design Artisan";
    return rawRoles.split(',').map(r => r.trim()).filter(Boolean);
  }, [profile.heroRoles]);

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
  }, [charIndex, isDeleting, titleIndex, titles]);

  const getBase64ImageFromUrl = async (imgUrl: string): Promise<string | null> => {
    try {
      if (!imgUrl) return null;
      if (imgUrl.startsWith('data:')) return imgUrl;
      return new Promise((resolve) => {
        const img = new Image();
        img.setAttribute('crossOrigin', 'anonymous');
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              const dataURL = canvas.toDataURL('image/jpeg', 0.95);
              resolve(dataURL);
            } else {
              resolve(null);
            }
          } catch (e) {
            console.error("Canvas conversion failed:", e);
            resolve(null);
          }
        };
        img.onerror = () => {
          console.error("Image loading failed:", imgUrl);
          resolve(null);
        };
        img.src = imgUrl;
      });
    } catch (err) {
      console.error("Base64 loader failed:", err);
      return null;
    }
  };

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

      // Pre-fetch both CV photograph and signature image safely
      const photoBase64 = cvPhotoUrlStr ? await getBase64ImageFromUrl(cvPhotoUrlStr) : null;
      const signatureBase64 = cvSignatureUrlStr ? await getBase64ImageFromUrl(cvSignatureUrlStr) : null;

      // 3. Side accent panel
      doc.setFillColor(248, 250, 252); // elegant light off-white (slate-50)
      doc.rect(10, 10, 62, 277, 'F');
      
      // Sidebar top colored identifier line
      doc.setFillColor(124, 58, 237);
      doc.rect(10, 10, 3, 277, 'F');

      // 4. PHOTOGRAPH OR PORTRAIT AVATAR drawing
      let sideY = 17.5;
      if (photoBase64) {
        // Draw elegant picture border
        doc.setFillColor(255, 255, 255);
        doc.rect(18.5, 15, 45, 45, 'F'); // border card
        doc.setDrawColor(124, 58, 237); // Purple accent border
        doc.setLineWidth(0.6);
        doc.rect(18.5, 15, 45, 45, 'D');
        
        doc.addImage(photoBase64, 'JPEG', 19.5, 16, 43, 43);
        sideY = 67;
      } else {
        // Stylish placeholder avatar matching premium UI
        doc.setFillColor(237, 233, 254); // background light purple (violet-100)
        doc.rect(18.5, 15, 45, 45, 'F');
        doc.setDrawColor(124, 58, 237);
        doc.setLineWidth(0.6);
        doc.rect(18.5, 15, 45, 45, 'D');
        
        doc.setFillColor(124, 58, 237);
        doc.circle(41, 31, 6, 'F'); // head
        doc.ellipse(41, 48, 14, 8, 'F'); // shoulders
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(124, 58, 237);
        doc.text("PHOTO", 41, 40, { align: 'center' });
        sideY = 67;
      }

      // 5. HEADER - Main right-side top quadrant
      doc.setFont("helvetica", "bold");
      doc.setFontSize(23);
      doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
      doc.text(cvNameStr.toUpperCase(), 78, 25);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(cvTitleStr, 78, 31);

      // Section separator line
      doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
      doc.setLineWidth(0.5);
      doc.line(78, 35, 200, 35);

      // 6. LEFT SIDEBAR DETAILS
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
      doc.text("PERSONAL DETAILS", 18, sideY);
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.6);
      doc.line(18, sideY + 2.5, 40, sideY + 2.5);

      sideY += 9;
      const drawSideHeader = (label: string) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(label.toUpperCase(), 18, sideY);
        sideY += 4;
      };

      const drawSideText = (text: string, width: number = 48) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
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

      // Skills List in Sidebar
      if (sideY < 265) {
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

      // 7. RIGHT COLUMN MAIN SECTIONS
      let mainY = 44;

      const drawSectionHeader = (title: string) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
        doc.text(title.toUpperCase(), 78, mainY);
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setLineWidth(0.8);
        doc.line(78, mainY + 2.5, 98, mainY + 2.5);
        mainY += 8;
      };

      // OBJECTIVE
      const objectiveText = profile.cvObjective || profile.bio || "Professional Full Stack developer looking to deliver state-of-the-art responsive web services...";
      drawSectionHeader("Professional Objective");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
      const splitObjective = doc.splitTextToSize(objectiveText, 118);
      doc.text(splitObjective, 78, mainY);
      mainY += (splitObjective.length * 4.5) + 8;

      // EXPERIENCE (Career Timeline Parser)
      drawSectionHeader("Professional History");
      const jobRoles = cvExperienceStr.split('\n\n').map(job => job.trim()).filter(Boolean);
      jobRoles.forEach((job) => {
        if (mainY > 245) {
          doc.addPage();
          mainY = 24;
        }

        const lines = job.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length === 0) return;

        const headerLine = lines[0];
        
        // Draw timeline node elements
        doc.setDrawColor(124, 58, 237);
        doc.setLineWidth(0.4);
        doc.line(81, mainY - 1, 81, mainY + 11);
        doc.setFillColor(124, 58, 237);
        doc.circle(81, mainY - 1, 1.2, 'F');

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
        doc.text(headerLine, 85, mainY);
        mainY += 4.5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);

        for (let i = 1; i < lines.length; i++) {
          if (mainY > 265) {
            doc.addPage();
            mainY = 24;
          }
          const point = lines[i];
          doc.setFillColor(124, 58, 237);
          doc.circle(86, mainY - 0.9, 0.4, 'F');
          
          const splitPoint = doc.splitTextToSize(point.replace(/^-\s*/, ''), 105);
          doc.text(splitPoint, 89, mainY);
          mainY += (splitPoint.length * 4) + 1;
        }
        mainY += 4;
      });

      // EDUCATION BACKGROUND WITH QUANTIFIED CGPA/RESULTS
      mainY += 3;
      if (mainY > 245) {
        doc.addPage();
        mainY = 24;
      }
      drawSectionHeader("Education Background");
      const educationLines = cvEducationStr.split('\n').map(l => l.trim()).filter(Boolean);
      educationLines.forEach((item) => {
        if (mainY > 245) {
          doc.addPage();
          mainY = 24;
        }

        let degree = item;
        let institute = "";
        let year = "";
        let result = "";

        // Parse structured layouts such as "Degree | School | Year | Result"
        const parts = item.split(/[|\-–]/).map(p => p.trim());
        if (parts.length >= 2) {
          degree = parts[0];
          institute = parts[1];
          if (parts.length >= 3) {
            year = parts[2];
          }
          if (parts.length >= 4) {
            result = parts[3];
          }
        } else {
          const commaParts = item.split(',').map(p => p.trim());
          if (commaParts.length >= 2) {
            degree = commaParts[0];
            institute = commaParts[1];
            if (commaParts.length >= 3) {
              year = commaParts[2];
            }
          }
        }

        // Draw structural education point node
        doc.setFillColor(124, 58, 237);
        doc.circle(81, mainY - 1, 1, 'F');
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
        doc.text(degree, 85, mainY);
        mainY += 4.5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
        
        let subtitle = institute;
        if (year) subtitle += ` | ${year}`;
        if (result) subtitle += ` | ${result}`;
        
        const splitSubtitle = doc.splitTextToSize(subtitle, 110);
        doc.text(splitSubtitle, 85, mainY);
        mainY += (splitSubtitle.length * 4) + 4.5;
      });

      // 8. SIGNATURE STAMP at bottom of the last page
      if (signatureBase64) {
        const totalPages = (doc as any).internal.getNumberOfPages();
        doc.setPage(totalPages);
        
        const lastPageY = 255;
        doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
        doc.setLineWidth(0.4);
        doc.line(140, lastPageY, 195, lastPageY);
        
        doc.addImage(signatureBase64, 'PNG', 145, lastPageY - 11, 45, 10);
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
        doc.text("Authorized Signature", 140, lastPageY + 4);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
        doc.text(cvNameStr.toUpperCase(), 140, lastPageY + 8);
      }

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
  const cvSignatureUrlStr = profile.cvSignatureUrl || "";
  const cvSkillsList = (profile.cvSkills || "TypeScript, React, Next.js, Node.js, Express, Go, Docker, Kubernetes, GCP, Firebase, Tailwind CSS, Framer Motion").split(',').map(s => s.trim()).filter(Boolean);
  const cvExperienceStr = profile.cvExperience || "Senior Web Developer at Aura Soft Inc (2024 - Present)\n- Developed scalable micro-services and state engines.\n- Managed Kubernetes orchestration frameworks.\n\nSoftware Developer Intern at Chronos (2023 - 2024)\n- Crafted highly-responsive interactive calendars and widgets.";
  const cvEducationStr = profile.cvEducation || "B.Sc. in Computer Science & Engineering | Prime University | 2022 - 2026 | CGPA: 3.82\nDiploma in Computer Technology | Sylhet Polytechnic Institute | 2018 - 2021 | GPA: 3.92";

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
            WELCOME TO MY PORTFOLIO
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-sans tracking-tight font-extrabold text-white mb-6">
            {profile.heroGreeting ? (
              profile.heroGreeting.includes(profile.name) ? (
                <span>
                  {profile.heroGreeting.split(profile.name)[0]}
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.5)] font-black hover:scale-105 inline-block transition-transform duration-300 select-all">{profile.name}</span>
                  {profile.heroGreeting.split(profile.name)[1]}
                </span>
              ) : (
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.5)] font-black">{profile.heroGreeting}</span>
              )
            ) : (
              <>
                Hi, I'm <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.5)] font-black hover:scale-105 inline-block transition-transform duration-300 select-all">{profile.name}</span>
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

        {/* Pure Professional Human Portfolio Scroll Down Indicator */}
        <div className="relative mt-24 pb-12 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <button
              onClick={() => {
                const aboutSection = document.getElementById('about');
                if (aboutSection) {
                  aboutSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="group cursor-pointer flex flex-col items-center gap-2"
              aria-label="Scroll down to explore details"
            >
              <span className="text-xs font-mono tracking-[0.25em] text-slate-500 group-hover:text-purple-400 transition-colors duration-300 uppercase font-medium">
                Scroll to explore
              </span>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <ChevronDown size={18} className="text-slate-500 group-hover:text-purple-400 transition-colors duration-300" />
              </motion.div>
            </button>
          </motion.div>
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
                Skills & Expertise
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

