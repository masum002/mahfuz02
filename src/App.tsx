import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  Lock, 
  Globe, 
  Terminal, 
  ShieldCheck, 
  ChevronRight, 
  Code2,
  MoreVertical
} from 'lucide-react';
import { 
  fetchProfile, 
  fetchSkills, 
  fetchProjects, 
  fetchContact,
  fetchPhotographyItems
} from './dataService';
import { Profile, Skill, Project, Contact, PhotographyItem } from './types';

// Importing public components block
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Photography from './components/Photography';
import ContactSection from './components/Contact';
import AdminPanel from './components/AdminPanel';

export default function App() {
  // Safe initialization of view based on query parameters (?view=admin, ?portal=secure, ?admin=true, or ?secret=admin)
  const getInitialView = (): 'portfolio' | 'admin' => {
    try {
      const params = new URLSearchParams(window.location.search);
      const isParamAdmin = params.get('view') === 'admin' || 
                           params.get('portal') === 'secure' || 
                           params.get('admin') === 'true' || 
                           params.get('secret') === 'admin';
      return isParamAdmin ? 'admin' : 'portfolio';
    } catch (e) {
      return 'portfolio';
    }
  };

  const [currentView, setCurrentView] = useState<'portfolio' | 'admin'>(getInitialView());
  const [currentTab, setCurrentTab] = useState<'home' | 'about' | 'skills' | 'projects' | 'photography' | 'contact'>('home');
  const [dotMenuOpen, setDotMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core portfolio records state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [photographyList, setPhotographyList] = useState<PhotographyItem[]>([]);
  const [contact, setContact] = useState<Contact | null>(null);

  // Dynamic system explorer running load state
  const [isExploring, setIsExploring] = useState(false);
  const [exploreLoaded, setExploreLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  const handleExploreSystem = () => {
    if (exploreLoaded || isExploring) {
      if (exploreLoaded) {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    setIsExploring(true);
    setLoadProgress(0);
    
    const interval = setInterval(() => {
      setLoadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExploring(false);
            setExploreLoaded(true);
            setTimeout(() => {
              const aboutSection = document.getElementById('about');
              if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
              }
            }, 100);
          }, 300);
          return 100;
        }
        return prev + Math.floor(Math.random() * 12) + 7;
      });
    }, 100);
  };

  // Fetch all core datasets from Firebase Services
  const loadPortfolioData = async () => {
    try {
      const p = await fetchProfile();
      setProfile(p);

      const s = await fetchSkills();
      setSkills(s);

      const pr = await fetchProjects();
      setProjects(pr);

      const ph = await fetchPhotographyItems();
      setPhotographyList(ph);

      const c = await fetchContact();
      setContact(c);
    } catch (err) {
      console.error("Critical error in public state loading:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Force manual scroll restoration to prevent browser from restoring stale scroll positions
    try {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
    } catch (e) {
      console.warn("Could not modify scrollRestoration:", e);
    }
    
    // Always scroll to absolute top on fresh bootstrap load
    window.scrollTo({ top: 0, behavior: 'instant' });

    loadPortfolioData();

    // Scroll effect listener for glassy Nav Header
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ensure top alignment whenever tab or main view switches
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setMobileMenuOpen(false); // Close mobile navigation if open
  }, [currentTab, currentView]);

  const handleNavigateToContact = () => {
    setCurrentView('portfolio');
    setTimeout(() => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // SPLASH LOADING SHIER
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center gap-5 text-slate-400 font-mono text-sm tracking-widest relative overflow-hidden">
        {/* Abstract design elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        
        <div className="flex items-center gap-2 text-white font-sans font-black text-xl z-10">
          <Code2 size={24} className="text-purple-500 animate-pulse" />
          <span>MAHFUJ.IO</span>
        </div>
        <div className="flex items-center gap-2.5 z-10">
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping" />
          <span className="text-slate-500 text-[10px] uppercase">Bootstrapping portfolio environment</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-purple-500/30 selection:text-purple-200">
      
      {/* GLOBAL GLASS HEADER NAVIGATION */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
        scrolled 
          ? 'bg-slate-950/80 backdrop-blur-md border-slate-900 shadow-lg shadow-black/20 py-4' 
          : 'bg-transparent border-transparent py-6'
      }`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          {/* Logo element with premium, custom MAHFUZ styling */}
          <div 
            onClick={() => {
              setCurrentView('portfolio');
              setCurrentTab('home');
            }}
            className="flex items-center gap-2.5 text-white font-sans select-none cursor-pointer group"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-tr from-purple-500 via-pink-500 to-blue-500 opacity-20 group-hover:opacity-60 blur-xs transition duration-300" />
              <span className="relative w-9 h-9 rounded-xl bg-slate-900 border border-purple-500/20 text-purple-400 flex items-center justify-center font-black tracking-tighter text-sm group-hover:text-white group-hover:bg-purple-600 group-hover:border-purple-500 transition-all duration-300 shadow-xl shadow-purple-500/5">
                M
              </span>
            </div>
            <span className="tracking-[0.25em] font-sans font-black text-sm text-slate-100 group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
              MAHFUZ
            </span>
          </div>

          {/* Navigation link menu items (Desktop) - Subpages Routing */}
          {currentView === 'portfolio' ? (
            <nav className="hidden md:flex items-center gap-8 text-xs font-mono text-slate-400 uppercase tracking-widest font-semibold">
              <button 
                onClick={() => setCurrentTab('home')}
                className={`transition-colors relative py-1 hover:text-white cursor-pointer ${currentTab === 'home' ? 'text-purple-400 font-bold' : ''}`}
              >
                Home
                {currentTab === 'home' && (
                  <motion.span layoutId="activeTabUnderline" className="absolute bottom-0 left-0 w-full h-[2px] bg-purple-500" />
                )}
              </button>
              <button 
                onClick={() => setCurrentTab('about')}
                className={`transition-colors relative py-1 hover:text-white cursor-pointer ${currentTab === 'about' ? 'text-purple-400 font-bold' : ''}`}
              >
                About
                {currentTab === 'about' && (
                  <motion.span layoutId="activeTabUnderline" className="absolute bottom-0 left-0 w-full h-[2px] bg-purple-500" />
                )}
              </button>
              <button 
                onClick={() => setCurrentTab('skills')}
                className={`transition-colors relative py-1 hover:text-white cursor-pointer ${currentTab === 'skills' ? 'text-purple-400 font-bold' : ''}`}
              >
                Skills
                {currentTab === 'skills' && (
                  <motion.span layoutId="activeTabUnderline" className="absolute bottom-0 left-0 w-full h-[2px] bg-purple-500" />
                )}
              </button>
              <button 
                onClick={() => setCurrentTab('projects')}
                className={`transition-colors relative py-1 hover:text-white cursor-pointer ${currentTab === 'projects' ? 'text-purple-400 font-bold' : ''}`}
              >
                Architectural Artifacts
                {currentTab === 'projects' && (
                  <motion.span layoutId="activeTabUnderline" className="absolute bottom-0 left-0 w-full h-[2px] bg-purple-500" />
                )}
              </button>
              <button 
                onClick={() => setCurrentTab('photography')}
                className={`transition-colors relative py-1 hover:text-white cursor-pointer ${currentTab === 'photography' ? 'text-purple-400 font-bold' : ''}`}
              >
                Photography Showcase
                {currentTab === 'photography' && (
                  <motion.span layoutId="activeTabUnderline" className="absolute bottom-0 left-0 w-full h-[2px] bg-purple-500" />
                )}
              </button>
            </nav>
          ) : (
            <button 
              onClick={() => {
                setCurrentView('portfolio');
                setCurrentTab('home');
              }}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Globe size={13} />
              Return to Public Site
            </button>
          )}

          {/* Right Header Navigation Panel: Admin indicator if active */}
          <div className="hidden md:flex items-center gap-4">
            {currentView === 'admin' && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/20 bg-green-500/5 text-green-400 font-mono text-xs">
                <ShieldCheck size={14} />
                <span>SECURED SESSION</span>
              </div>
            )}
          </div>

          {/* Mobile hamburger toggle and three-dots row */}
          <div className="flex md:hidden items-center gap-2">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE HEADER DROPDOWN */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-20 left-0 w-full bg-slate-950 border-b border-slate-900 z-40 md:hidden overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-6 space-y-4 flex flex-col font-mono text-xs uppercase tracking-widest text-slate-400">
              {currentView === 'portfolio' ? (
                <>
                  <button 
                    onClick={() => {
                      setCurrentTab('home');
                      setMobileMenuOpen(false);
                    }} 
                    className={`text-left py-2 hover:text-white border-b border-transparent ${currentTab === 'home' ? 'text-purple-400 font-bold border-purple-500/30' : ''}`}
                  >
                    Home Desk
                  </button>
                  <button 
                    onClick={() => {
                      setCurrentTab('about');
                      setMobileMenuOpen(false);
                    }} 
                    className={`text-left py-2 hover:text-white border-b border-transparent ${currentTab === 'about' ? 'text-purple-400 font-bold border-purple-500/30' : ''}`}
                  >
                    About Experience
                  </button>
                  <button 
                    onClick={() => {
                      setCurrentTab('skills');
                      setMobileMenuOpen(false);
                    }} 
                    className={`text-left py-2 hover:text-white border-b border-transparent ${currentTab === 'skills' ? 'text-purple-400 font-bold border-purple-500/30' : ''}`}
                  >
                    Skills Matrix
                  </button>
                  <button 
                    onClick={() => {
                      setCurrentTab('projects');
                      setMobileMenuOpen(false);
                    }} 
                    className={`text-left py-2 hover:text-white border-b border-transparent ${currentTab === 'projects' ? 'text-purple-400 font-bold border-purple-500/30' : ''}`}
                  >
                    Architectural Artifacts
                  </button>
                  <button 
                    onClick={() => {
                      setCurrentTab('photography');
                      setMobileMenuOpen(false);
                    }} 
                    className={`text-left py-2 hover:text-white border-b border-transparent ${currentTab === 'photography' ? 'text-purple-400 font-bold border-purple-500/30' : ''}`}
                  >
                    Photography Showcase
                  </button>
                  <button 
                    onClick={() => {
                      setCurrentTab('contact');
                      setMobileMenuOpen(false);
                    }} 
                    className={`text-left py-2 hover:text-white border-b border-transparent ${currentTab === 'contact' ? 'text-purple-400 font-bold border-purple-500/30' : ''}`}
                  >
                    Contact
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setCurrentView('portfolio');
                      setCurrentTab('home');
                    }}
                    className="w-full py-3.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-center font-semibold flex items-center justify-center gap-2"
                  >
                    <Globe size={13} />
                    WEB PORTFOLIO
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PRIMARY CONTROLS RENDERING */}
      <AnimatePresence mode="wait">
        {currentView === 'portfolio' ? (
          <motion.div
            key={`portfolio-${currentTab}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="pt-20 min-h-[85vh] flex flex-col justify-between"
          >
            <div>
              {currentTab === 'home' && profile && (
                <div className="space-y-16">
                  <Hero 
                    profile={profile} 
                    contact={contact}
                    onNavigateToContact={handleNavigateToContact} 
                    onExploreSystem={handleExploreSystem}
                    isExploring={isExploring}
                    loadProgress={loadProgress}
                    exploreComplete={exploreLoaded}
                  />
                  
                  {/* Dynamic Continuous Running Load Sections */}
                  <AnimatePresence>
                    {exploreLoaded && (
                      <motion.div
                        initial={{ opacity: 0, y: 35 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-24"
                      >
                        <div id="about" className="pt-8">
                          <About profile={profile} />
                        </div>
                        <div id="skills" className="pt-8">
                          <Skills skills={skills} />
                        </div>
                        <div id="projects" className="pt-8 bg-slate-900/10 py-16">
                          <Projects projects={projects} />
                        </div>
                        <div id="photography" className="pt-8">
                          <Photography photos={photographyList} />
                        </div>
                        <div id="contact" className="pt-8">
                          <ContactSection contact={contact || { email: '', phone: '', address: '', github: '', linkedin: '', twitter: '', updatedAt: '' }} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              {currentTab === 'about' && profile && (
                <About profile={profile} />
              )}
              {currentTab === 'skills' && skills.length > 0 && (
                <Skills skills={skills} />
              )}
              {currentTab === 'projects' && (
                <Projects projects={projects} />
              )}
              {currentTab === 'photography' && (
                <Photography photos={photographyList} />
              )}
              {currentTab === 'contact' && contact && (
                <ContactSection contact={contact} />
              )}
            </div>
            
             {/* STYLISH PUBLIC FOOTER - SECURED SYSTEMS ARCHITECT */}
            <footer className="relative py-16 mt-20 border-t border-slate-900/60 bg-gradient-to-b from-slate-950 to-black text-slate-400 font-sans overflow-hidden">
              {/* Soft background glow */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-24 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="max-w-6xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-12 border-b border-slate-900/50">
                  {/* Column 1: Core tech details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5 text-white font-sans font-black select-none">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 via-pink-500 to-blue-500 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-purple-500/10">
                        M
                      </div>
                      <span className="tracking-[0.25em] text-xs uppercase text-slate-100 font-black">
                        MAHFUZ
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-mono">
                      Architecting secure full-stack web platforms, flawless interactive environments, and production-ready server and client solutions.
                    </p>
                  </div>

                  {/* Column 2: Compact navigation options */}
                  <div className="space-y-4 md:pl-12">
                    <h5 className="text-[10px] font-mono uppercase tracking-widest text-slate-550 font-bold">DIRECTORY INDEX</h5>
                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <button onClick={() => { setCurrentTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-purple-400 text-left transition-colors cursor-pointer">⚡ Home Desk</button>
                      <button onClick={() => { setCurrentTab('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-purple-400 text-left transition-colors cursor-pointer">✨ About me</button>
                      <button onClick={() => { setCurrentTab('skills'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-purple-400 text-left transition-colors cursor-pointer">⚡ Skills Matrix</button>
                      <button onClick={() => { setCurrentTab('projects'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-purple-400 text-left transition-colors cursor-pointer">⚙ Projects</button>
                      <button onClick={() => { setCurrentTab('photography'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-purple-400 text-left transition-colors cursor-pointer">📸 Photography</button>
                      <button onClick={() => { setCurrentTab('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-purple-400 text-left transition-colors cursor-pointer">📨 Contact</button>
                    </div>
                  </div>
                </div>

                {/* Footnote copyright branding */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-[10px] text-slate-500 font-semibold font-mono tracking-wide">
                    &copy; 2026 MAHFUZ R MASUM. ALL RIGHTS SECURED.
                  </p>
                  <p className="text-xs font-bold tracking-wide flex items-center gap-1.5 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent select-none">
                    Powered by MAHFUZ
                  </p>
                </div>
              </div>
            </footer>
          </motion.div>
        ) : (
          <motion.div
            key="admin-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pt-20"
          >
            <AdminPanel onDataChange={loadPortfolioData} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
