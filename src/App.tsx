import { useState, useEffect, FormEvent } from 'react';
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
  MoreVertical,
  MessageSquare,
  Send
} from 'lucide-react';
import { 
  fetchProfile, 
  fetchSkills, 
  fetchProjects, 
  fetchContact,
  fetchPhotographyItems
} from './dataService';
import { Profile, Skill, Project, Contact, PhotographyItem } from './types';
import { onSnapshot, doc, collection } from 'firebase/firestore';
import { db, isConfigured } from './firebase';
import { 
  DEFAULT_PROFILE, 
  DEFAULT_SKILLS, 
  DEFAULT_PROJECTS, 
  DEFAULT_CONTACT, 
  DEFAULT_PHOTOGRAPHY 
} from './defaultData';

// Importing public components block
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Photography from './components/Photography';
import ContactSection from './components/Contact';
import AdminPanel from './components/AdminPanel';
import ProjectDetailPage from './components/ProjectDetailPage';
import PhotographyDetailPage from './components/PhotographyDetailPage';

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

  const [currentView, setCurrentView] = useState<'portfolio' | 'admin' | 'project-detail' | 'photography-detail'>(getInitialView());
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
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

  // Send Message Modal state
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [isMessageSentSuccess, setIsMessageSentSuccess] = useState(false);

  // Dynamic system explorer running load state
  const [isExploring, setIsExploring] = useState(false);
  const [exploreLoaded, setExploreLoaded] = useState(true);
  const [loadProgress, setLoadProgress] = useState(100);

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
      try {
        const p = await fetchProfile();
        setProfile(p ? { ...DEFAULT_PROFILE, ...p } : DEFAULT_PROFILE);
      } catch (err) {
        console.error("Error loading profile:", err);
        setProfile(DEFAULT_PROFILE);
      }

      try {
        const s = await fetchSkills();
        setSkills(s && s.length > 0 ? s : DEFAULT_SKILLS);
      } catch (err) {
        console.error("Error loading skills:", err);
        setSkills(DEFAULT_SKILLS);
      }

      try {
        const pr = await fetchProjects();
        setProjects(pr && pr.length > 0 ? pr : DEFAULT_PROJECTS);
      } catch (err) {
        console.error("Error loading projects:", err);
        setProjects(DEFAULT_PROJECTS);
      }

      try {
        const ph = await fetchPhotographyItems();
        setPhotographyList(ph && ph.length > 0 ? ph : DEFAULT_PHOTOGRAPHY);
      } catch (err) {
        console.error("Error loading photography items:", err);
        setPhotographyList(DEFAULT_PHOTOGRAPHY);
      }

      try {
        const c = await fetchContact();
        setContact(c ? { ...DEFAULT_CONTACT, ...c } : DEFAULT_CONTACT);
      } catch (err) {
        console.error("Error loading contact:", err);
        setContact(DEFAULT_CONTACT);
      }
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

    let unsubscribeProfile: (() => void) | null = null;
    let unsubscribeSkills: (() => void) | null = null;
    let unsubscribeProjects: (() => void) | null = null;
    let unsubscribePhotography: (() => void) | null = null;
    let unsubscribeContact: (() => void) | null = null;

    const initData = async () => {
      // 1. Securely fetch initial data first (from Firestore or beautiful local defaults if empty/timeout/offline)
      await loadPortfolioData();

      // 2. Establish active real-time listeners for live updates if Firebase is configured
      if (isConfigured) {
        console.log("👉 Establishing active real-time Firebase connection...");
        
        try {
          unsubscribeProfile = onSnapshot(doc(db, 'profile', 'main'), (docSnap) => {
            if (docSnap.exists()) {
              setProfile({ ...DEFAULT_PROFILE, ...docSnap.data() as Profile });
            }
          }, (error) => {
            console.warn("Real-time profile listener status:", error);
          });
        } catch (e) {
          console.warn("Could not bind profile listener:", e);
        }

        try {
          unsubscribeSkills = onSnapshot(collection(db, 'skills'), (snapshot) => {
            const list: Skill[] = [];
            snapshot.forEach((doc) => {
              list.push({ id: doc.id, ...doc.data() } as Skill);
            });
            if (list.length > 0) {
              setSkills(list);
            }
          }, (error) => {
            console.warn("Real-time skills listener status:", error);
          });
        } catch (e) {
          console.warn("Could not bind skills listener:", e);
        }

        try {
          unsubscribeProjects = onSnapshot(collection(db, 'projects'), (snapshot) => {
            const list: Project[] = [];
            snapshot.forEach((doc) => {
              list.push({ id: doc.id, ...doc.data() } as Project);
            });
            if (list.length > 0) {
              setProjects(list);
            }
          }, (error) => {
            console.warn("Real-time projects listener status:", error);
          });
        } catch (e) {
          console.warn("Could not bind projects listener:", e);
        }

        try {
          unsubscribePhotography = onSnapshot(collection(db, 'photography'), (snapshot) => {
            const list: PhotographyItem[] = [];
            snapshot.forEach((doc) => {
              list.push({ id: doc.id, ...doc.data() } as PhotographyItem);
            });
            if (list.length > 0) {
              setPhotographyList(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
            }
          }, (error) => {
            console.warn("Real-time photography listener status:", error);
          });
        } catch (e) {
          console.warn("Could not bind photography listener:", e);
        }

        try {
          unsubscribeContact = onSnapshot(doc(db, 'contacts', 'main'), (docSnap) => {
            if (docSnap.exists()) {
              setContact({ ...DEFAULT_CONTACT, ...docSnap.data() as Contact });
            }
          }, (error) => {
            console.warn("Real-time contact listener status:", error);
          });
        } catch (e) {
          console.warn("Could not bind contact listener:", e);
        }
      }
    };

    initData();

    // Scroll effect listener for glassy Nav Header
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeSkills) unsubscribeSkills();
      if (unsubscribeProjects) unsubscribeProjects();
      if (unsubscribePhotography) unsubscribePhotography();
      if (unsubscribeContact) unsubscribeContact();
    };
  }, []);

  // Ensure top alignment whenever tab or main view switches
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setMobileMenuOpen(false); // Close mobile navigation if open
  }, [currentTab, currentView]);

  // Dynamic SEO Page Title Manager
  useEffect(() => {
    let title = "Mahfuz R Masum | Lead Full-Stack & Cloud Engineer | Professional Portfolio";

    if (currentView === 'project-detail' && activeProjectId) {
      const matchedProject = projects.find((p, idx) => p.id === activeProjectId || String(idx) === activeProjectId);
      if (matchedProject) {
        title = `${matchedProject.title} | Projects - Mahfuz R Masum`;
      } else {
        title = "Project Details | Mahfuz R Masum";
      }
    } else if (currentView === 'photography-detail' && activePhotoId) {
      const matchedPhoto = photographyList.find((p, idx) => p.id === activePhotoId || String(idx) === activePhotoId);
      if (matchedPhoto) {
        title = `${matchedPhoto.title} | Photography Exhibition - Mahfuz R Masum`;
      } else {
        title = "Photography Capture | Mahfuz R Masum";
      }
    } else if (currentView === 'admin') {
      title = "Admin Panel | Portfolio Control Center - Mahfuz R Masum";
    } else if (currentView === 'portfolio') {
      const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
      if (currentTab !== 'home') {
        title = `${capitalize(currentTab)} | Mahfuz R Masum - Lead Full-Stack & Cloud Engineer`;
      }
    }

    document.title = title;
  }, [currentView, currentTab, activeProjectId, activePhotoId, projects, photographyList]);

  // High speed multi-page URL hash listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/project/')) {
        const id = hash.replace('#/project/', '');
        setActiveProjectId(id);
        setActivePhotoId(null);
        setCurrentView('project-detail');
      } else if (hash.startsWith('#/photography/')) {
        const id = hash.replace('#/photography/', '');
        setActivePhotoId(id);
        setActiveProjectId(null);
        setCurrentView('photography-detail');
      } else if (hash === '#/admin' || hash === '#admin') {
        setCurrentView('admin');
        setActiveProjectId(null);
        setActivePhotoId(null);
      } else {
        setActiveProjectId(null);
        setActivePhotoId(null);
        
        // Use URLSearchParams or defaults
        const params = new URLSearchParams(window.location.search);
        const isParamAdmin = params.get('view') === 'admin' || 
                             params.get('portal') === 'secure' || 
                             params.get('admin') === 'true' || 
                             params.get('secret') === 'admin';
        setCurrentView(isParamAdmin ? 'admin' : 'portfolio');

        const sectionId = hash.replace('#/', '').replace('#', '');
        if (['home', 'about', 'skills', 'projects', 'photography', 'contact'].includes(sectionId)) {
          setCurrentTab(sectionId as any);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigateToContact = () => {
    setCurrentView('portfolio');
    setTimeout(() => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    // Auto generate dynamic local date to include in subject as requested
    const currentDateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Automatically formatted subject containing the date as requested
    const subject = `[Portfolio Message] - ${currentDateStr}`;
    
    // Auto generate professional email body format
    const bodyText = `Name: ${senderName || 'Anonymous'}\nEmail: ${senderEmail || 'Not Provided'}\nDate: ${currentDateStr}\n\nMessage:\n${messageText}\n\n---\nSent automatically from MAHFUZ Portfoliologue.`;

    // Direct email mailto execution
    const mailtoUrl = `mailto:mahfujar003@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
    
    // Launch default email composer
    window.location.href = mailtoUrl;

    // Success animation and automatic state reset
    setIsMessageSentSuccess(true);
    setTimeout(() => {
      setIsMessageModalOpen(false);
      setIsMessageSentSuccess(false);
      setMessageText('');
      setSenderName('');
      setSenderEmail('');
    }, 4000);
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
          ? 'bg-slate-950/85 backdrop-blur-md border-slate-900/80 shadow-lg shadow-black/45 py-3.5' 
          : 'bg-transparent border-transparent py-5'
      }`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          {/* Logo element with premium, custom MAHFUZ styling - SEO Optimized anchor role */}
          <div 
            onClick={() => {
              setCurrentView('portfolio');
              setCurrentTab('home');
            }}
            aria-label="Mahfuz R Masum Portfolio Logo Home"
            className="flex items-center gap-2.5 text-white font-sans select-none cursor-pointer group"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-500 opacity-20 group-hover:opacity-75 blur-xs transition duration-300 animate-pulse" />
              <span className="relative w-9 h-9 rounded-xl bg-slate-900 border border-purple-500/30 text-purple-400 flex items-center justify-center font-black tracking-tighter text-sm group-hover:text-white group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-pink-500 group-hover:border-transparent transition-all duration-300 shadow-xl shadow-purple-500/5">
                M
              </span>
            </div>
            <div className="flex flex-col">
              <span className="tracking-[0.25em] font-sans font-black text-sm text-slate-100 group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                MAHFUZ
              </span>
              <span className="text-[7.5px] font-mono tracking-widest text-slate-500 group-hover:text-purple-400/80 transition-colors uppercase">
                Full-Stack Engineer
              </span>
            </div>
          </div>

          {/* Navigation link menu items (Desktop) - Subpages Routing - Semantic SEO Optimized List */}
          {currentView !== 'admin' ? (
            <nav aria-label="Primary Portfolio Directory Index" className="hidden md:flex items-center gap-8">
              <ul className="flex items-center gap-7 text-xs font-mono text-slate-450 uppercase tracking-widest font-semibold">
                <li>
                  <button 
                    onClick={() => { window.location.hash = '#home'; }}
                    title="Go to Home section"
                    aria-label="Home Navigation Tab"
                    className={`transition-all relative py-1 hover:text-white cursor-pointer ${currentView === 'portfolio' && currentTab === 'home' ? 'text-purple-400 font-bold scale-105' : ''}`}
                  >
                    Home
                    {currentView === 'portfolio' && currentTab === 'home' && (
                      <motion.span layoutId="activeTabUnderline" className="absolute bottom-[-2px] left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 to-pink-500" />
                    )}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { window.location.hash = '#about'; }}
                    title="Read about Mahfuz's story and vision"
                    aria-label="About Navigation Tab"
                    className={`transition-all relative py-1 hover:text-white cursor-pointer ${currentView === 'portfolio' && currentTab === 'about' ? 'text-purple-400 font-bold scale-105' : ''}`}
                  >
                    About
                    {currentView === 'portfolio' && currentTab === 'about' && (
                      <motion.span layoutId="activeTabUnderline" className="absolute bottom-[-2px] left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 to-pink-500" />
                    )}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { window.location.hash = '#skills'; }}
                    title="View technical skills and expertise stack"
                    aria-label="Skills Navigation Tab"
                    className={`transition-all relative py-1 hover:text-white cursor-pointer ${currentView === 'portfolio' && currentTab === 'skills' ? 'text-purple-400 font-bold scale-105' : ''}`}
                  >
                    Skills
                    {currentView === 'portfolio' && currentTab === 'skills' && (
                      <motion.span layoutId="activeTabUnderline" className="absolute bottom-[-2px] left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 to-pink-500" />
                    )}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { window.location.hash = '#projects'; }}
                    title="Browse development projects and details"
                    aria-label="Projects Navigation Tab"
                    className={`transition-all relative py-1 hover:text-white cursor-pointer ${currentView === 'portfolio' && currentTab === 'projects' ? 'text-purple-400 font-bold scale-105' : ''}`}
                  >
                    Projects
                    {currentView === 'portfolio' && currentTab === 'projects' && (
                      <motion.span layoutId="activeTabUnderline" className="absolute bottom-[-2px] left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 to-pink-500" />
                    )}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { window.location.hash = '#photography'; }}
                    title="View photography exhibition and SEO camera settings guide"
                    aria-label="Photography Exhibition Navigation Tab"
                    className={`transition-all relative py-1 hover:text-white cursor-pointer ${currentView === 'portfolio' && currentTab === 'photography' ? 'text-purple-400 font-bold scale-105' : ''}`}
                  >
                    Photography
                    {currentView === 'portfolio' && currentTab === 'photography' && (
                      <motion.span layoutId="activeTabUnderline" className="absolute bottom-[-2px] left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 to-pink-500" />
                    )}
                  </button>
                </li>
              </ul>
            </nav>
          ) : (
            <button 
              onClick={() => {
                window.location.hash = '#home';
              }}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer"
            >
              <Globe size={13} />
              Return to Public Site
            </button>
          )}

          {/* Right Header Navigation Panel: Actions Row & Message Button */}
          <div className="hidden md:flex items-center gap-4">
            {currentView !== 'admin' && (
              <button
                onClick={() => setIsMessageModalOpen(true)}
                title="Send a message directly to my email address with auto-generated date"
                aria-label="Send direct message"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 text-purple-400 hover:text-white border border-purple-500/20 hover:border-transparent text-xs font-mono font-bold uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-purple-500/20 cursor-pointer animate-pulse-subtle"
              >
                <MessageSquare size={12} />
                <span>Message Me</span>
              </button>
            )}

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
              className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800/80 rounded-xl cursor-pointer"
              aria-label="Toggle Navigation Menu"
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
              {currentView !== 'admin' ? (
                <>
                  <button 
                    onClick={() => {
                      window.location.hash = '#home';
                      setMobileMenuOpen(false);
                    }} 
                    className={`text-left py-2 hover:text-white border-b border-transparent ${currentView === 'portfolio' && currentTab === 'home' ? 'text-purple-400 font-bold border-purple-500/30' : ''}`}
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => {
                      window.location.hash = '#about';
                      setMobileMenuOpen(false);
                    }} 
                    className={`text-left py-2 hover:text-white border-b border-transparent ${currentView === 'portfolio' && currentTab === 'about' ? 'text-purple-400 font-bold border-purple-500/30' : ''}`}
                  >
                    About me
                  </button>
                  <button 
                    onClick={() => {
                      window.location.hash = '#skills';
                      setMobileMenuOpen(false);
                    }} 
                    className={`text-left py-2 hover:text-white border-b border-transparent ${currentView === 'portfolio' && currentTab === 'skills' ? 'text-purple-400 font-bold border-purple-500/30' : ''}`}
                  >
                    Skills & Expertise
                  </button>
                  <button 
                    onClick={() => {
                      window.location.hash = '#projects';
                      setMobileMenuOpen(false);
                    }} 
                    className={`text-left py-2 hover:text-white border-b border-transparent ${currentView === 'portfolio' && currentTab === 'projects' ? 'text-purple-400 font-bold border-purple-500/30' : ''}`}
                  >
                    Projects
                  </button>
                  <button 
                    onClick={() => {
                      window.location.hash = '#photography';
                      setMobileMenuOpen(false);
                    }} 
                    className={`text-left py-2 hover:text-white border-b border-transparent ${currentView === 'portfolio' && currentTab === 'photography' ? 'text-purple-400 font-bold border-purple-500/30' : ''}`}
                  >
                    Photography
                  </button>
                  <button 
                    onClick={() => {
                      window.location.hash = '#contact';
                      setMobileMenuOpen(false);
                    }} 
                    className={`text-left py-2 hover:text-white border-b border-transparent ${currentView === 'portfolio' && currentTab === 'contact' ? 'text-purple-400 font-bold border-purple-500/30' : ''}`}
                  >
                    Contact
                  </button>
                  
                  <button 
                    onClick={() => {
                      setIsMessageModalOpen(true);
                      setMobileMenuOpen(false);
                    }} 
                    className="w-full mt-3 py-3 px-4 bg-purple-500/10 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 text-purple-400 hover:text-white border border-purple-500/20 hover:border-transparent rounded-xl text-center font-bold font-mono uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer"
                  >
                    <MessageSquare size={13} className="animate-pulse" />
                    <span>Send Message</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.location.hash = '#home';
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
                      <button onClick={() => { setCurrentTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-purple-400 text-left transition-colors cursor-pointer">🏠 Home</button>
                      <button onClick={() => { setCurrentTab('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-purple-400 text-left transition-colors cursor-pointer">✨ About me</button>
                      <button onClick={() => { setCurrentTab('skills'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-purple-400 text-left transition-colors cursor-pointer">📊 Skills</button>
                      <button onClick={() => { setCurrentTab('projects'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-purple-400 text-left transition-colors cursor-pointer">💼 Projects</button>
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
        ) : currentView === 'project-detail' ? (
          <motion.div
            key="project-detail-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className="pt-20 min-h-[85vh]"
          >
            {(() => {
              const matchedProject = projects.find((p, idx) => p.id === activeProjectId || String(idx) === activeProjectId);
              if (matchedProject) {
                return (
                  <ProjectDetailPage
                    project={matchedProject}
                    allProjects={projects}
                    onBack={() => {
                      window.location.hash = '#projects';
                    }}
                    onNavigateToProject={(id) => {
                      window.location.hash = `#/project/${id}`;
                    }}
                  />
                );
              } else {
                return (
                  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 font-sans">
                    <h2 className="text-xl font-bold text-slate-300">Project Not Found</h2>
                    <p className="text-sm text-slate-550 mt-2">The project link might be outdated or invalid.</p>
                    <button 
                      onClick={() => { window.location.hash = '#home'; }}
                      className="mt-6 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-md"
                    >
                      Back to Home
                    </button>
                  </div>
                );
              }
            })()}
          </motion.div>
        ) : currentView === 'photography-detail' ? (
          <motion.div
            key="photography-detail-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className="pt-20 min-h-[85vh]"
          >
            {(() => {
              const matchedPhoto = photographyList.find((p, idx) => p.id === activePhotoId || String(idx) === activePhotoId);
              if (matchedPhoto) {
                return (
                  <PhotographyDetailPage
                    photo={matchedPhoto}
                    allPhotos={photographyList}
                    onBack={() => {
                      window.location.hash = '#photography';
                    }}
                    onNavigateToPhoto={(id) => {
                      window.location.hash = `#/photography/${id}`;
                    }}
                  />
                );
              } else {
                return (
                  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 font-sans">
                    <h2 className="text-xl font-bold text-slate-300">Photo Capture Not Found</h2>
                    <p className="text-sm text-slate-550 mt-2">The photography link might be outdated or invalid.</p>
                    <button 
                      onClick={() => { window.location.hash = '#home'; }}
                      className="mt-6 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-md"
                    >
                      Back to Home
                    </button>
                  </div>
                );
              }
            })()}
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

      {/* DIRECT EMAIL MESSAGE DIALOG MODAL */}
      <AnimatePresence>
        {isMessageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isMessageSentSuccess) setIsMessageModalOpen(false);
              }}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
            />

            {/* Modal card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800/90 rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(147,51,234,0.15)] z-10"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500" />
              
              {!isMessageSentSuccess ? (
                <form onSubmit={handleSendMessage} className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-purple-400 uppercase">
                        <span className="inline-block w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        DIRECT PORTFOLIO CHANNEL
                      </div>
                      <h3 className="text-xl font-sans font-black text-white tracking-tight">
                        Send Message
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMessageModalOpen(false)}
                      className="p-1.5 rounded-lg border border-slate-800/80 hover:bg-slate-850 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    You can send a message directly to my personal email (<span className="text-purple-400">mahfujar003@gmail.com</span>) using the form below. Today's date will be automatically set in the subject line.
                  </p>

                  <div className="space-y-4">
                    {/* Name input */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Your Name <span className="text-slate-600 font-normal">(Optional)</span></label>
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="Enter your name..."
                        className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all leading-relaxed"
                      />
                    </div>

                    {/* Email input */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Your Email <span className="text-slate-600 font-normal">(Optional)</span></label>
                      <input
                        type="email"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder="Enter your email address..."
                        className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all leading-relaxed"
                      />
                    </div>

                    {/* Message textarea */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-purple-400 block font-bold">Your Message *</label>
                      <textarea
                        required
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        rows={5}
                        placeholder="Write your message or feedback here..."
                        className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsMessageModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-850 text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!messageText.trim()}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-md hover:shadow-purple-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-600 disabled:shadow-none"
                    >
                      <Send size={12} />
                      <span>Send Message</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-8 text-center space-y-6 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce shadow-lg shadow-emerald-500/5">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-sans font-black text-white">Message Prepared!</h3>
                    <p className="text-sm text-slate-300">Opening your email client...</p>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 w-full text-left space-y-2.5 text-xs font-mono">
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <span className="text-slate-500">To Address:</span>
                      <span className="text-purple-400 font-semibold">mahfujar003@gmail.com</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <span className="text-slate-500">Auto Subject:</span>
                      <span className="text-pink-400 font-semibold truncate max-w-[240px]">
                        [Portfolio Message] - {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[10px] leading-relaxed pt-1 text-center">
                      Complete the transmission by pressing the "Send" button in your email client.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMessageModalOpen(false);
                      setIsMessageSentSuccess(false);
                    }}
                    className="w-full py-2.5 rounded-xl border border-slate-800 hover:bg-slate-850 text-xs font-bold font-mono text-slate-400 hover:text-white transition-all cursor-pointer"
                  >
                    CLOSE WINDOW
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
