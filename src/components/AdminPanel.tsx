import React, { useState, useEffect } from 'react';
import { 
  signInWithPopup,
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  auth, 
  googleProvider,
  isConfigured
} from '../firebase';
import { 
  fetchProfile, 
  saveProfile, 
  fetchSkills, 
  addSkill, 
  updateSkill, 
  deleteSkill, 
  fetchProjects, 
  addProject, 
  updateProject, 
  deleteProject, 
  fetchContact, 
  saveContact, 
  fetchPhotographyItems,
  addPhotographyItem,
  updatePhotographyItem,
  deletePhotographyItem,
  seedDatabase
} from '../dataService';
import { Profile, Skill, Project, Contact, PhotographyItem } from '../types';
import { 
  User, 
  Layers, 
  Briefcase, 
  Mail, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit2, 
  Lock, 
  Check, 
  AlertTriangle, 
  Upload, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  Camera,
  Github
} from 'lucide-react';

interface AdminPanelProps {
  onDataChange: () => void;
}

export default function AdminPanel({ onDataChange }: AdminPanelProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'skills' | 'projects' | 'photography' | 'contact'>('profile');

  // Unified status banner messages
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // States for DB data structures inside dashboard
  const [profileForm, setProfileForm] = useState<Profile>({
    name: '',
    title: '',
    bio: '',
    cvUrl: '',
    avatarUrl: '',
    updatedAt: '',
    heroGreeting: '',
    heroSubtitle: '',
    heroRoles: '',
    cvName: '',
    cvAddress: '',
    cvPhotoUrl: '',
    cvEmail: '',
    cvPhone: '',
    cvTitle: '',
    cvEducation: '',
    cvExperience: '',
    cvSkills: '',
    cvDob: '',
    cvNationality: '',
    cvGender: '',
    cvLanguages: '',
    cvObjective: '',
    cvSignatureUrl: '',
    aboutDetailText: '',
    aboutImages: ''
  });
  const [skillsList, setSkillsList] = useState<Skill[]>([]);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [photographyList, setPhotographyList] = useState<PhotographyItem[]>([]);
  const [contactForm, setContactForm] = useState<Contact>({ email: '', phone: '', address: '', github: '', linkedin: '', twitter: '', updatedAt: '' });

  // CRUD working states
  const [skillForm, setSkillForm] = useState<{ id?: string; name: string; category: string; percentage: number }>({ name: '', category: 'Frontend', percentage: 80 });
  const [isEditingSkill, setIsEditingSkill] = useState(false);

  const [projectForm, setProjectForm] = useState<{ id?: string; title: string; description: string; imageUrl: string; liveUrl: string; githubUrl: string; details: string }>({ title: '', description: '', imageUrl: '', liveUrl: '', githubUrl: '', details: '' });
  const [isEditingProject, setIsEditingProject] = useState(false);

  const [photoForm, setPhotoForm] = useState<{ id?: string; title: string; description: string; imageUrl: string; cameraSettings: string; location: string; articleContent: string }>({ title: '', description: '', imageUrl: '', cameraSettings: '', location: '', articleContent: '' });
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);

  // Whitelisted Emails defined inside specification & bootstrapped user runtime email
  const ALLOWED_EMAILS = ['mahfujar003@gmail.com'];

  // Auth Status Monitor
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const email = currentUser.email?.trim().toLowerCase();
        // Strict Email Lock Verification
        if (email && ALLOWED_EMAILS.includes(email)) {
          setUser(currentUser);
          setAuthError(null);
          // Pre-load all metrics
          loadAllMetricsData();
        } else {
          // Unauthorized email -> immediately sign out
          setAuthError(`Access Refused: "${currentUser.email}" is not authorized as an admin email. Only ${ALLOWED_EMAILS[0]} has access to the Admin Panel.`);
          setUser(null);
          await signOut(auth);
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleAuth = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      if (!isConfigured) {
        throw new Error("Firebase is not configured. Please check your firebase-applet-config.json file.");
      }
      await signInWithPopup(auth, googleProvider);
      showStatus("Successfully logged in with Google.", "success");
    } catch (err: any) {
      console.error("Google Auth Failure Error:", err);
      let errorMsg = err.message || "An error occurred during Google sign-in.";
      if (err.code === 'auth/popup-closed-by-user') {
        errorMsg = "Login popup was closed. Please try again.";
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMsg = "Login request was cancelled.";
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMsg = "This domain is not authorized for authentication in the Firebase console. Please add this domain to Authorized Domains in the Firebase Console.";
      }
      setAuthError(errorMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      showStatus("Successfully logged out.", "success");
    } catch (err) {
      console.error("Logout failure:", err);
      setUser(null);
    }
  };

  const loadAllMetricsData = async () => {
    if (!isConfigured) return;

    try {
      // 1. Fetch profile with fallbackToDefault=false to see if it exists
      const p = await fetchProfile(false);
      setProfileForm(p);
    } catch (err: any) {
      if (err instanceof Error && err.message === "PROFILE_NOT_FOUND") {
        // Genuinely empty Firestore DB -> seed it with defaults!
        console.log("No profile document found. Seeding the database with defaults...");
        try {
          await seedDatabase();
          const seededProfile = await fetchProfile(false);
          setProfileForm(seededProfile);
        } catch (seedErr) {
          console.error("Failed to seed database:", seedErr);
          showStatus("Database seeding failed on startup.", "danger");
        }
      } else {
        console.error("Error fetching profile dataset from Firestore:", err);
        showStatus("⚠️ Error: Connection timeout or Firestore read failure. Custom data was NOT loaded to prevent accidental overwrite. Please reload the page or check your connection.", "danger");
        return; // Abort loading further metrics to prevent overwriting with defaults
      }
    }

    // 2. Fetch other datasets with fallbackToDefault=false
    try {
      const s = await fetchSkills(false);
      setSkillsList(s);
    } catch (err) {
      console.error("Error fetching skills dataset:", err);
    }

    try {
      const pr = await fetchProjects(false);
      setProjectsList(pr);
    } catch (err) {
      console.error("Error fetching projects dataset:", err);
    }

    try {
      const ph = await fetchPhotographyItems(false);
      setPhotographyList(ph);
    } catch (err) {
      console.error("Error fetching photography dataset:", err);
    }

    try {
      const c = await fetchContact(false);
      setContactForm(c);
    } catch (err: any) {
      if (err instanceof Error && err.message === "CONTACT_NOT_FOUND") {
        // Safe to ignore or wait for seed
      } else {
        console.error("Error fetching contact dataset:", err);
      }
    }
  };

  const showStatus = (text: string, type: 'success' | 'danger') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // HANDLERS: PROFILE
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to change the profile info? Pressing 'OK' will save the changes to Firebase.")) return;
    setIsSaving(true);
    try {
      await saveProfile(profileForm);
      showStatus("Profile details saved to Firebase successfully.", "success");
      onDataChange();
    } catch (err: any) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : String(err);
      showStatus(`Failed to store profile in Firestore: ${errMsg}`, "danger");
    } finally {
      setIsSaving(false);
    }
  };
  // HANDLERS: SKILLS
  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillForm.name || !skillForm.category) return;
    if (!confirm("Are you sure you want to save this skill info? Pressing 'OK' will save it to Firebase.")) return;
    setIsSaving(true);
    try {
      if (isEditingSkill && skillForm.id) {
        await updateSkill(skillForm.id, {
          name: skillForm.name,
          category: skillForm.category,
          percentage: Number(skillForm.percentage),
          createdAt: new Date().toISOString()
        });
        showStatus("Skill updated in database successfully.", "success");
      } else {
        await addSkill({
          name: skillForm.name,
          category: skillForm.category,
          percentage: Number(skillForm.percentage),
          createdAt: new Date().toISOString()
        });
        showStatus("New skill appended to portfolio successfully.", "success");
      }
      setSkillForm({ name: '', category: 'Frontend', percentage: 80 });
      setIsEditingSkill(false);
      await loadAllMetricsData();
      onDataChange();
    } catch (err: any) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : String(err);
      showStatus(`Failed to store skill in Firestore: ${errMsg}`, "danger");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSkill = (skill: Skill) => {
    setSkillForm({
      id: skill.id,
      name: skill.name,
      category: skill.category,
      percentage: skill.percentage
    });
    setIsEditingSkill(true);
  };

  const handleDeleteSkill = async (id: string) => {
    if (!confirm("Are you sure you want to delete this skill? Pressing 'OK' will permanently delete it from Firebase.")) return;
    try {
      await deleteSkill(id);
      showStatus("Skill removed from portfolio schema.", "success");
      await loadAllMetricsData();
      onDataChange();
    } catch (err) {
      showStatus("Exception deleting skill record.", "danger");
    }
  };

  // HANDLERS: PROJECTS
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.description) return;
    if (!confirm("Are you sure you want to save this project info? Pressing 'OK' will save it to Firebase.")) return;
    setIsSaving(true);
    try {
      if (isEditingProject && projectForm.id) {
        await updateProject(projectForm.id, {
          title: projectForm.title,
          description: projectForm.description,
          imageUrl: projectForm.imageUrl,
          liveUrl: projectForm.liveUrl,
          githubUrl: projectForm.githubUrl,
          details: projectForm.details || '',
          createdAt: new Date().toISOString()
        });
        showStatus("Project details updated successfully.", "success");
      } else {
        await addProject({
          title: projectForm.title,
          description: projectForm.description,
          imageUrl: projectForm.imageUrl,
          liveUrl: projectForm.liveUrl,
          githubUrl: projectForm.githubUrl,
          details: projectForm.details || '',
          createdAt: new Date().toISOString()
        });
        showStatus("Project added to production deck successfully.", "success");
      }
      setProjectForm({ title: '', description: '', imageUrl: '', liveUrl: '', githubUrl: '', details: '' });
      setIsEditingProject(false);
      await loadAllMetricsData();
      onDataChange();
    } catch (err: any) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : String(err);
      showStatus(`Failed to store project in Firestore: ${errMsg}`, "danger");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditProject = (p: Project) => {
    setProjectForm({
      id: p.id,
      title: p.title,
      description: p.description,
      imageUrl: p.imageUrl,
      liveUrl: p.liveUrl,
      githubUrl: p.githubUrl,
      details: p.details || ''
    });
    setIsEditingProject(true);
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project? Pressing 'OK' will permanently delete it from Firebase.")) return;
    try {
      await deleteProject(id);
      showStatus("Project deleted.", "success");
      await loadAllMetricsData();
      onDataChange();
    } catch (err) {
      showStatus("Could not purge document record.", "danger");
    }
  };

  // HANDLERS: PHOTOGRAPHY
  const handlePhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoForm.title || !photoForm.imageUrl) {
      showStatus("Title and Photograph Image are required.", "danger");
      return;
    }
    if (!confirm("Are you sure you want to save this photography info? Pressing 'OK' will save it to Firebase.")) return;
    setIsSaving(true);
    try {
      if (isEditingPhoto && photoForm.id) {
        await updatePhotographyItem(photoForm.id, {
          title: photoForm.title,
          description: photoForm.description,
          imageUrl: photoForm.imageUrl,
          cameraSettings: photoForm.cameraSettings,
          location: photoForm.location,
          articleContent: photoForm.articleContent || '',
          createdAt: new Date().toISOString()
        });
        showStatus("Photograph details updated successfully.", "success");
      } else {
        await addPhotographyItem({
          title: photoForm.title,
          description: photoForm.description,
          imageUrl: photoForm.imageUrl,
          cameraSettings: photoForm.cameraSettings,
          location: photoForm.location,
          articleContent: photoForm.articleContent || '',
          createdAt: new Date().toISOString()
        });
        showStatus("Photograph added to the live gallery database.", "success");
      }
      setPhotoForm({ title: '', description: '', imageUrl: '', cameraSettings: '', location: '', articleContent: '' });
      setIsEditingPhoto(false);
      await loadAllMetricsData();
      onDataChange();
    } catch (err: any) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : String(err);
      showStatus(`Failed to store photograph in Firestore: ${errMsg}`, "danger");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditPhoto = (p: PhotographyItem) => {
    setPhotoForm({
      id: p.id,
      title: p.title,
      description: p.description,
      imageUrl: p.imageUrl,
      cameraSettings: p.cameraSettings || 'f/2.8 | 1/125s | ISO 200',
      location: p.location || '',
      articleContent: p.articleContent || ''
    });
    setIsEditingPhoto(true);
  };

  const handleDeletePhoto = async (id: string) => {
    if (!confirm("Are you sure you want to delete this photograph? Pressing 'OK' will permanently delete it from Firebase.")) return;
    try {
      await deletePhotographyItem(id);
      showStatus("Photograph deleted from storage.", "success");
      await loadAllMetricsData();
      onDataChange();
    } catch (err) {
      showStatus("Exception purging photograpic records.", "danger");
    }
  };

  // HANDLERS: CONTACT
  const handleContactSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to change the contact info? Pressing 'OK' will save the changes to Firebase.")) return;
    setIsSaving(true);
    try {
      await saveContact(contactForm);
      showStatus("Contact references saved to Firestore.", "success");
      onDataChange();
    } catch (err: any) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : String(err);
      showStatus(`Failed to store contact references in Firestore: ${errMsg}`, "danger");
    } finally {
      setIsSaving(false);
    }
  };


  // LOADING SCREEN
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center gap-4 text-slate-400 font-mono text-sm">
        <span className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-600 rounded-full animate-spin" />
        <span>Secured Session Handshake: Authenticating...</span>
      </div>
    );
  }

  // SIGN IN PANEL (UNAUTHENTICATED)
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl" />
        
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 z-10 shadow-2xl space-y-8 relative">
          <div className="text-center">
            <div className="w-14 h-14 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <Lock size={24} />
            </div>
            <h1 className="text-2xl font-sans font-extrabold text-white">Administrator Access Gate</h1>
            <p className="text-slate-400 text-xs font-mono mt-2 uppercase tracking-widest text-purple-400">Secure Google Sign-In</p>
          </div>

          {authError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-xs leading-relaxed z-10 font-sans">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800/85 space-y-3 text-center">
              <p className="text-xs text-slate-300 font-sans">
                The admin panel can only be accessed using Google Authentication (Google Sign-In).
              </p>
              <div className="p-3 bg-purple-500/5 rounded-xl border border-purple-500/10 inline-block">
                <p className="text-[11px] font-mono text-purple-300">
                  Whitelisted Email: <span className="text-white font-semibold">mahfujar003@gmail.com</span>
                </p>
              </div>
              <p className="text-[10px] text-slate-500 font-sans">
                (Logging in with any other Gmail address will result in access being denied)
              </p>
            </div>

            <button
              onClick={handleGoogleAuth}
              className="w-full py-4 px-6 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-semibold tracking-wide transition-all duration-300 shadow-lg flex items-center justify-center gap-3 font-sans hover:scale-[1.01] active:scale-[0.99]"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LOGGED IN DASHBOARD
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 flex flex-col md:flex-row shadow-inner">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800/80 shrink-0 flex flex-col justify-between py-6 px-4">
        <div className="space-y-8">
          {/* Sidebar Top Title */}
          <div>
            <div className="flex items-center gap-2.5 px-3">
              <span className="p-1 rounded bg-purple-500/20 text-purple-400">
                <Lock size={15} />
              </span>
              <span className="text-sm font-sans font-extrabold text-white">Portfolio OS Admin</span>
            </div>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest px-3 mt-1.5">Control Shell</p>
          </div>

          {/* Connected Admin Email Badge */}
          <div className="mx-2 p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
            <div className="text-[9px] font-mono uppercase text-purple-400 tracking-wider">Root Account</div>
            <div className="text-[11px] font-mono text-slate-300 break-all leading-tight">{user.email}</div>
          </div>

          {/* Tabs Menu list */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs font-sans transition-all duration-300 ${
                activeTab === 'profile'
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <User size={15} />
                Profile & About
              </span>
              <ChevronRight size={12} className={activeTab === 'profile' ? 'opacity-100' : 'opacity-40'} />
            </button>

            <button
              onClick={() => setActiveTab('skills')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs font-sans transition-all duration-300 ${
                activeTab === 'skills'
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Layers size={15} />
                Manage Skills
              </span>
              <ChevronRight size={12} className={activeTab === 'skills' ? 'opacity-100' : 'opacity-40'} />
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs font-sans transition-all duration-300 ${
                activeTab === 'projects'
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Briefcase size={15} />
                Manage Projects
              </span>
              <ChevronRight size={12} className={activeTab === 'projects' ? 'opacity-100' : 'opacity-40'} />
            </button>

            <button
              onClick={() => setActiveTab('photography')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs font-sans transition-all duration-300 ${
                activeTab === 'photography'
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Camera size={15} />
                Manage Photography
              </span>
              <ChevronRight size={12} className={activeTab === 'photography' ? 'opacity-100' : 'opacity-40'} />
            </button>

            <button
              onClick={() => setActiveTab('contact')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs font-sans transition-all duration-300 ${
                activeTab === 'contact'
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Mail size={15} />
                Manage Contact
              </span>
              <ChevronRight size={12} className={activeTab === 'contact' ? 'opacity-100' : 'opacity-40'} />
            </button>
          </nav>
        </div>

        {/* Sidebar Logout Button */}
        <div className="pt-4 mt-8 md:mt-0 border-t border-slate-800/80">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all font-sans"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12">
        {/* Firebase Cloud Connection Banner */}
        {(!isConfigured || user?.uid === "local-admin-bypassed-uid") ? (
          <div className="mb-8 p-6 rounded-2.5xl bg-amber-500/5 border border-amber-500/20 text-amber-200">
            <div className="flex items-start gap-4">
              <span className="p-2 sm:p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 shrink-0">
                <Camera size={18} className="animate-pulse" />
              </span>
              <div className="space-y-2 flex-1">
                <h3 className="text-sm font-sans font-extrabold text-white">
                  {user?.uid === "local-admin-bypassed-uid" 
                    ? "⚠️ Firebase configured but cloud connection unsuccessful! (Local session active)"
                    : "⚠️ Firebase is not connected (Local browser storage active)"}
                </h3>
                <p className="text-xs text-slate-350 leading-relaxed font-sans">
                  {user?.uid === "local-admin-bypassed-uid"
                    ? "Firebase is configured in your system. However, the connection or login request with Firebase did not succeed. As a result, the site automatically entered a Local Fallback session and is saving data to your browser's Local Storage. It was not saved to your remote Firebase Firestore cloud, meaning items won't be visible in other browsers or incognito mode."
                    : "Your changes are currently temporarily saved in your local browser storage. They have not been saved to the cloud. If you enter the live link from another browser, incognito mode, or a different phone/laptop, your added content will not be displayed."}
                </p>
                <p className="text-xs text-purple-300 font-medium">
                  {user?.uid === "local-admin-bypassed-uid"
                    ? "To connect with the remote Firebase cloud, resolve issue 2 or 3 below:"
                    : "To display your images and content permanently to everyone, connect Firebase by following the steps below:"}
                </p>

                <details className="group border border-slate-800 bg-slate-950/40 rounded-xl mt-3 overflow-hidden" open={user?.uid === "local-admin-bypassed-uid"}>
                  <summary className="px-4 py-2.5 text-xs font-mono font-bold text-amber-400/95 cursor-pointer select-none hover:text-amber-300 flex items-center justify-between list-none font-sans">
                    <span>⚙️ How to fix and activate Firebase connection? (Click here)</span>
                    <span className="text-[10px] text-slate-500 transition-transform group-open:rotate-90">▶</span>
                  </summary>
                  <div className="p-4 border-t border-slate-800/60 space-y-4 text-xs font-sans text-slate-300 bg-slate-950">
                    <div className="space-y-1">
                      <p className="font-bold text-white font-mono text-[11px] text-purple-400">1. Setup Firebase Project (if not done already)</p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-400">
                        <li>Create a project in the <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">Firebase Console</a>.</li>
                        <li>Register a <strong>Web App {"(</>)"}</strong> and retrieve the Firebase configuration code.</li>
                      </ul>
                    </div>

                    <div className="space-y-1.5 p-3 rounded-xl bg-purple-500/5 border border-purple-500/15">
                      <p className="font-bold text-white font-mono text-[11px] text-purple-400">2. Enable Email/Password Auth (Required)</p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-400">
                        <li>Go to <strong>Authentication</strong> from the left menu in the Firebase Console.</li>
                        <li>Click <strong>Get Started</strong>, then select the <strong>Sign-in method</strong> tab.</li>
                        <li>Select <strong>Email/Password</strong> as a provider, <strong>Enable</strong> it, and click Save.</li>
                      </ul>
                    </div>

                    <div className="space-y-1.5 p-3 rounded-xl bg-purple-500/5 border border-purple-500/15">
                      <p className="font-bold text-white font-mono text-[11px] text-purple-400">3. Create Firestore Database (Required)</p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-400">
                        <li>Select <strong>Firestore Database</strong> from the left menu in the Firebase Console.</li>
                        <li>Click <strong>Create Database</strong> and choose your database location.</li>
                        <li>Select <strong>Start in Test Mode</strong> during security rules configuration. Then Save/Publish.</li>
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <p className="font-bold text-white font-mono text-[11px] text-purple-400">4. Add Environment Variables on Vercel or Hosting</p>
                      <p className="text-slate-400 leading-relaxed font-sans">
                        If you are hosting your site on <strong>Vercel (e.g., mahfuz02.vercel.app)</strong>, go to your Vercel Dashboard, select Project &gt; Settings &gt; Environment Variables tab, and add the following keys with their values:
                      </p>
                      <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-1.5 font-mono text-[10.5px] text-slate-300 max-h-52 overflow-y-auto select-all">
                        <div>VITE_FIREBASE_API_KEY = <span className="text-amber-400">_YOUR_API_KEY_</span></div>
                        <div>VITE_FIREBASE_AUTH_DOMAIN = <span className="text-amber-400">_YOUR_PROJECT_ID_.firebaseapp.com</span></div>
                        <div>VITE_FIREBASE_PROJECT_ID = <span className="text-amber-400">_YOUR_PROJECT_ID_</span></div>
                        <div>VITE_FIREBASE_STORAGE_BUCKET = <span className="text-amber-400">_YOUR_PROJECT_ID_.firebasestorage.app</span></div>
                        <div>VITE_FIREBASE_MESSAGING_SENDER_ID = <span className="text-amber-404">_YOUR_MESSAGING_SENDER_ID_</span></div>
                        <div>VITE_FIREBASE_APP_ID = <span className="text-amber-400">_YOUR_APP_ID_</span></div>
                      </div>
                      <p className="text-[10px] text-slate-450 italic mt-1 font-sans">
                        *Ensure the keys are spelled correctly with the VITE_ prefix. Then trigger a <strong>Redeploy</strong> on Vercel.
                      </p>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-400/20 text-emerald-300 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-xs font-sans">
              🟢 <strong>Firebase Cloud Database Connected:</strong> Your portfolio is successfully connected to the Firebase cloud. Your data is permanently secured and accessible from any browser.
            </span>
          </div>
        )}

        {/* Status Messages */}
        {statusMessage && (
          <div className={`p-4 mb-8 rounded-2xl flex items-center justify-between border ${
            statusMessage.type === 'success' 
              ? 'bg-green-500/10 border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            <span className="text-xs leading-relaxed font-sans">{statusMessage.text}</span>
            <button 
              onClick={() => setStatusMessage(null)} 
              className="text-xs font-semibold hover:opacity-85 font-mono px-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* LOADING SHIM */}
        {isSaving && (
          <div className="mb-4 text-xs font-mono text-purple-400 flex items-center gap-2 animate-pulse bg-purple-500/5 p-4 rounded-xl border border-purple-500/10">
            <span className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin inline-block" />
            <span>Syncing database alterations with cloud resources...</span>
          </div>
        )}

        {/* TAB WORKSPACE: PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-xl font-sans font-bold text-white flex items-center gap-2.5">
                <User size={18} className="text-purple-400" />
                Profile Identity Settings
              </h2>
              <p className="text-slate-400 text-xs mt-1 leading-normal">Update public-facing biography metrics, titles, and download documentations.</p>
            </div>

            <form onSubmit={handleProfileSave} className="bg-slate-900 border border-slate-800 rounded-2.5xl p-6 md:p-8 space-y-6">
              {/* Profile image picker block */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-800">
                <div className="relative w-24 h-24 rounded-full p-0.5 bg-gradient-to-tr from-purple-500 to-pink-500 shadow-md shrink-0">
                  <img
                    src={profileForm.avatarUrl || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600"}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-full bg-slate-950 border-2 border-slate-950"
                  />
                </div>
                
                <div className="space-y-3 text-center sm:text-left flex-1 w-full">
                  <h4 className="text-sm font-sans font-bold text-white">Avatar Image</h4>
                  <p className="text-xs text-slate-500 font-mono">Paste a direct image link or URL for your profile avatar.</p>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={profileForm.avatarUrl || ''}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, avatarUrl: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="Paste direct image link (e.g., https://images.unsplash.com/...)"
                    />
                  </div>
                </div>
              </div>

              {/* General details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Biological Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm focus:outline-none focus:border-purple-500"
                    placeholder="E.g., Mahfuj Ahmed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">System Title</label>
                  <input
                    type="text"
                    required
                    value={profileForm.title}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm focus:outline-none focus:border-purple-500"
                    placeholder="E.g., Senior Full-Stack Engineer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Biography description (Bio)</label>
                <textarea
                  rows={4}
                  required
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm focus:outline-none focus:border-purple-500"
                  placeholder="Tell your professional details, tech credentials, or objectives..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Curriculum Vitae Document URL (CV)</label>
                <input
                  type="text"
                  value={profileForm.cvUrl}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, cvUrl: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm focus:outline-none focus:border-purple-500 placeholder-slate-600 font-mono text-xs"
                  placeholder="https://drive.google.com/file/d/..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Hero Title/Greeting</label>
                <input
                  type="text"
                  value={profileForm.heroGreeting || ''}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, heroGreeting: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm focus:outline-none focus:border-purple-500"
                  placeholder="E.g., Hi, I'm Mahfuj Ahmed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Hero Typing Roles (Comma-separated)</label>
                <input
                  type="text"
                  value={profileForm.heroRoles || ''}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, heroRoles: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm focus:outline-none focus:border-purple-500"
                  placeholder="E.g., Lead Full-Stack & Cloud Engineer, Full Stack Master, Cloud Architect"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Hero Subtitle Paragraph</label>
                <textarea
                  rows={3}
                  value={profileForm.heroSubtitle || ''}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm focus:outline-none focus:border-purple-500"
                  placeholder="Let's turn complex design specifications into elegant interactive digital artifacts. Check out my skills and projects below."
                />
              </div>

              {/* ABOUT DETAILED SCREEN SETTINGS */}
              <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h4 className="text-xs font-mono uppercase tracking-widest text-purple-400 font-bold">About Me Detailed Page Settings</h4>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">About Me Detailed Text (Supporting Newlines)</label>
                  <textarea
                    rows={8}
                    value={profileForm.aboutDetailText || ''}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, aboutDetailText: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm focus:outline-none focus:border-purple-500"
                    placeholder="Enter deep description about your professional background, philosophy, achievements, etc."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">About Me Photos (Comma-separated URLs)</label>
                  <textarea
                    rows={3}
                    value={profileForm.aboutImages || ''}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, aboutImages: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm focus:outline-none focus:border-purple-500"
                    placeholder="E.g., https://images.unsplash.com/... , https://images.unsplash.com/..."
                  />
                  <span className="text-[9px] text-slate-500 font-mono">Separate each image URL with a comma. These photos will be displayed nicely in your detailed About page.</span>
                </div>
              </div>

              {/* DYNAMIC RESUME PDF SETTINGS SUB-CARD */}
              <div className="mt-8 pt-8 border-t border-slate-800 space-y-6">
                <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-purple-400 font-sans text-5xl font-black select-none pointer-events-none">
                    PDF BUILDER
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-sans font-bold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                      Downloadable CV (PDF Resume) Configuration
                    </h4>
                    <p className="text-[10px] text-slate-500 font-mono tracking-wide mt-1">
                      Customize all details appearing on the printable PDF resume file downloaded by users.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* CV Name */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block">CV Name / Header</label>
                      <input
                        type="text"
                        value={profileForm.cvName || ''}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, cvName: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-purple-500"
                        placeholder="E.g., MAHFUZ R MASUM"
                      />
                    </div>

                    {/* CV Professional Title */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block">CV Professional Title</label>
                      <input
                        type="text"
                        value={profileForm.cvTitle || ''}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, cvTitle: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-purple-500"
                        placeholder="E.g., Lead Full-Stack & Cloud Engineer"
                      />
                    </div>

                    {/* CV Address */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block">CV Contact Address</label>
                      <input
                        type="text"
                        value={profileForm.cvAddress || ''}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, cvAddress: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-purple-500"
                        placeholder="E.g., Dhaka, Bangladesh"
                      />
                    </div>

                    {/* CV Email */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block">CV Email Address</label>
                      <input
                        type="email"
                        value={profileForm.cvEmail || ''}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, cvEmail: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-purple-500"
                        placeholder="E.g., mahfujar003@gmail.com"
                      />
                    </div>

                    {/* CV Phone */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block">CV Contact Phone</label>
                      <input
                        type="text"
                        value={profileForm.cvPhone || ''}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, cvPhone: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-purple-500"
                        placeholder="E.g., +880 1700 000000"
                      />
                    </div>

                     {/* CV Photo URL */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block">CV Image / Photograph URL</label>
                      <input
                        type="text"
                        value={profileForm.cvPhotoUrl || ''}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, cvPhotoUrl: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-purple-500 font-mono"
                        placeholder="Paste direct photo link (Direct Image URL)"
                      />
                    </div>

                    {/* CV Signature URL */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono uppercase tracking-wider text-slate-300 block">CV Digital Signature (Signature Image URL)</label>
                      <input
                        type="text"
                        value={profileForm.cvSignatureUrl || ''}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, cvSignatureUrl: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-purple-500 font-mono"
                        placeholder="Paste direct signature image URL"
                      />
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Date of Birth</label>
                      <input
                        type="text"
                        value={profileForm.cvDob || ''}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, cvDob: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-purple-500"
                        placeholder="E.g., 25 October 2000"
                      />
                    </div>

                    {/* Nationality */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Nationality</label>
                      <input
                        type="text"
                        value={profileForm.cvNationality || ''}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, cvNationality: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-purple-500"
                        placeholder="E.g., Bangladeshi"
                      />
                    </div>

                    {/* Gender */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Gender / Marital Status</label>
                      <input
                        type="text"
                        value={profileForm.cvGender || ''}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, cvGender: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-purple-500"
                        placeholder="E.g., Male"
                      />
                    </div>

                    {/* Languages */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Languages</label>
                      <input
                        type="text"
                        value={profileForm.cvLanguages || ''}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, cvLanguages: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-purple-500"
                        placeholder="E.g., Bangla, English"
                      />
                    </div>
                  </div>

                  {/* CV Objective Profile Statement Section */}
                  <div className="space-y-1.5 mt-4">
                    <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block">CV Objective / Career Summary</label>
                    <textarea
                      rows={3}
                      value={profileForm.cvObjective || ''}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, cvObjective: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-purple-500 font-sans"
                      placeholder="Professional and highly motivated Software Engineer..."
                    />
                  </div>

                  {/* CV Skills Matrix Section */}
                  <div className="space-y-1.5 mt-4">
                    <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block">CV Skills List (Comma-separated)</label>
                    <input
                      type="text"
                      value={profileForm.cvSkills || ''}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, cvSkills: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-purple-500"
                      placeholder="TypeScript, React, Node.js, GCP, Docker"
                    />
                  </div>

                  {/* CV Education (multi-line textarea) */}
                  <div className="space-y-1.5 mt-4">
                    <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block">CV Education Background</label>
                    <textarea
                      rows={3}
                      value={profileForm.cvEducation || ''}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, cvEducation: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-purple-500 font-sans"
                      placeholder="Format: B.Sc in CSE - Prime University (2022-2026)..."
                    />
                  </div>

                  {/* CV Work Experience (multi-line textarea) */}
                  <div className="space-y-1.5 mt-4">
                    <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block">CV Professional Experience (Career Timeline)</label>
                    <textarea
                      rows={5}
                      value={profileForm.cvExperience || ''}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, cvExperience: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-purple-500 font-sans"
                      placeholder="Format: Senior Web Developer at Aura Soft Inc (2024 - Present)..."
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-800 disabled:to-slate-800 text-white rounded-xl font-medium text-xs transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                Save Identity Parameters
              </button>
            </form>
          </div>
        )}

        {/* TAB WORKSPACE: SKILLS */}
        {activeTab === 'skills' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-xl font-sans font-bold text-white flex items-center gap-2.5">
                <Layers size={18} className="text-purple-400" />
                Manage Skills Matrix
              </h2>
              <p className="text-slate-400 text-xs mt-1 leading-normal">Add, modify, or eliminate skill competencies shown on the telemetry bar.</p>
            </div>

            {/* Input Form Card */}
            <form onSubmit={handleSkillSubmit} className="bg-slate-900 border border-slate-800 rounded-2.5xl p-6 md:p-8 space-y-6">
              <h3 className="text-sm font-sans font-bold text-white">{isEditingSkill ? "Edit Competency" : "Add Competency Item"}</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Competency Name</label>
                  <input
                    type="text"
                    required
                    value={skillForm.name}
                    onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm focus:outline-none focus:border-purple-500"
                    placeholder="E.g., React.js"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Categorization</label>
                  <select
                    value={skillForm.category}
                    onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Cloud & Tools">Cloud & Tools</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Proficiency Percentage</label>
                  <span className="text-xs font-mono font-bold text-purple-400">{skillForm.percentage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skillForm.percentage}
                  onChange={(e) => setSkillForm({ ...skillForm, percentage: Number(e.target.value) })}
                  className="w-full accent-purple-600 bg-slate-950 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium text-xs shadow-md transition-colors cursor-pointer"
                >
                  {isEditingSkill ? "Update Competency Record" : "Append Competency"}
                </button>
                {isEditingSkill && (
                  <button
                    type="button"
                    onClick={() => {
                      setSkillForm({ name: '', category: 'Frontend', percentage: 80 });
                      setIsEditingSkill(false);
                    }}
                    className="px-6 py-3 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl font-medium text-xs transition-colors cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            {/* List of current skills */}
            <div className="bg-slate-900 border border-slate-800 rounded-2.5xl overflow-hidden p-6 md:p-8">
              <h3 className="text-sm font-sans font-bold text-white mb-6">Competencies Registry</h3>
              
              <div className="space-y-3.5">
                {skillsList.map((sk) => (
                  <div key={sk.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 flex items-center justify-between group">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-sans font-bold text-white">{sk.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-500 uppercase">
                          {sk.category}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">Proficiency percentage: {sk.percentage}%</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditSkill(sk)}
                        className="p-2 bg-slate-900 hover:bg-purple-600 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
                        title="Edit Record"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => sk.id && handleDeleteSkill(sk.id)}
                        className="p-2 bg-slate-900 hover:bg-red-600 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
                        title="Delete Record"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}

                {skillsList.length === 0 && (
                  <div className="text-xs text-slate-500 text-center py-6 font-mono">No skill competencies present. Populate using form above.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB WORKSPACE: PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-xl font-sans font-bold text-white flex items-center gap-2.5">
                <Briefcase size={18} className="text-purple-400" />
                Manage Projects Production
              </h2>
              <p className="text-slate-400 text-xs mt-1 leading-normal">Construct references, live sites, source references, and images preview deck.</p>
            </div>

            {/* Project Form */}
            <form onSubmit={handleProjectSubmit} className="bg-slate-900 border border-slate-800 rounded-2.5xl p-6 md:p-8 space-y-6">
              <h3 className="text-sm font-sans font-bold text-white">{isEditingProject ? "Edit Project parameters" : "Append Portfolio Project"}</h3>

              {/* Project preview upload container */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-800">
                <div className="relative aspect-video w-44 rounded-2xl bg-slate-950 overflow-hidden border border-slate-800 shrink-0">
                  <img
                    src={projectForm.imageUrl || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"}
                    alt="Preview visual"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-3 text-center sm:text-left flex-1 w-full">
                  <h4 className="text-xs font-sans font-bold text-white">Project Visual Preview</h4>
                  <p className="text-[10px] text-slate-500 font-mono">Paste the direct URL link to your project's cover image.</p>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={projectForm.imageUrl}
                      onChange={(e) => setProjectForm({ ...projectForm, imageUrl: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="Paste direct project image URL (e.g., https://images.unsplash.com/...)"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Project Title</label>
                <input
                  type="text"
                  required
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm focus:outline-none focus:border-purple-500"
                  placeholder="E.g., Zenith Dashboard Enterprise"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Short Description</label>
                <textarea
                  rows={3}
                  required
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm focus:outline-none focus:border-purple-500"
                  placeholder="Explain what was constructed, stack utilized, or outcomes accomplished..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Detailed Specifications / Case Study (Details popup content)</label>
                <textarea
                  rows={6}
                  value={projectForm.details}
                  onChange={(e) => setProjectForm({ ...projectForm, details: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm focus:outline-none focus:border-purple-500 placeholder-slate-600"
                  placeholder="Enter deep project details, system architecture, challenges solved, results, etc. This will be shown when anyone clicks on the project card."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Live Demo Link</label>
                  <input
                    type="url"
                    value={projectForm.liveUrl}
                    onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm focus:outline-none focus:border-purple-500 placeholder-slate-600 font-mono text-xs"
                    placeholder="https://example.com/site"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">GitHub Source Link</label>
                  <input
                    type="url"
                    value={projectForm.githubUrl}
                    onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm focus:outline-none focus:border-purple-500 placeholder-slate-600 font-mono text-xs"
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium text-xs shadow-md transition-colors cursor-pointer"
                >
                  {isEditingProject ? "Save alterations" : "Append Production"}
                </button>
                {isEditingProject && (
                  <button
                    type="button"
                    onClick={() => {
                      setProjectForm({ title: '', description: '', imageUrl: '', liveUrl: '', githubUrl: '' });
                      setIsEditingProject(false);
                    }}
                    className="px-6 py-3 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl font-medium text-xs transition-colors cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            {/* List of current projects */}
            <div className="bg-slate-900 border border-slate-800 rounded-2.5xl overflow-hidden p-6 md:p-8">
              <h3 className="text-sm font-sans font-bold text-white mb-6">Productions Registry</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectsList.map((pr) => (
                  <div key={pr.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 flex flex-col justify-between space-y-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-12 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 shrink-0">
                        <img src={pr.imageUrl} alt={pr.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1 overflow-hidden">
                        <h4 className="text-xs font-bold text-white truncate">{pr.title}</h4>
                        <p className="text-slate-500 text-[10px] line-clamp-2 leading-relaxed">{pr.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-900 pt-3">
                      <div className="flex gap-2">
                        {pr.liveUrl && <a href={pr.liveUrl} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white"><ExternalLink size={12} /></a>}
                        {pr.githubUrl && <a href={pr.githubUrl} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white"><Github size={12} /></a>}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEditProject(pr)}
                          className="p-2 bg-slate-900 hover:bg-purple-600 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={11} />
                        </button>
                        <button
                          onClick={() => pr.id && handleDeleteProject(pr.id)}
                          className="p-2 bg-slate-900 hover:bg-red-600 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {projectsList.length === 0 && (
                  <div className="col-span-2 text-xs text-slate-500 text-center py-6 font-mono">No active projects. Construct using form above.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB WORKSPACE: PHOTOGRAPHY */}
        {activeTab === 'photography' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-xl font-sans font-bold text-white flex items-center gap-2.5">
                <Camera size={18} className="text-purple-400" />
                Manage Photography Showcase
              </h2>
              <p className="text-slate-400 text-xs mt-1 leading-normal">
                Publish high-detail camera captures, adjust lens/sensor setups (EXIF settings), locations, titles, and cinematic descriptions.
              </p>
            </div>

            <form onSubmit={handlePhotoSubmit} className="bg-slate-900 border border-slate-800 rounded-2.5xl p-6 md:p-8 space-y-6">
              <h3 className="text-xs font-mono uppercase tracking-widest text-purple-400 font-bold border-b border-slate-800 pb-3">
                {isEditingPhoto ? "Edit Present Photo Record" : "Register New Camera Capture"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Photo Title</label>
                  <input
                    type="text"
                    value={photoForm.title}
                    onChange={e => setPhotoForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-sm rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="e.g. Celestial Nomad"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Capture Location</label>
                  <input
                    type="text"
                    value={photoForm.location}
                    onChange={e => setPhotoForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-sm rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="e.g. Sajek Valley, Bangladesh"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">EXIF Setup parameters</label>
                  <input
                    type="text"
                    value={photoForm.cameraSettings}
                    onChange={e => setPhotoForm(prev => ({ ...prev, cameraSettings: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-sm rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="e.g. f/1.8 | 15s | ISO 3200 | 24mm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Visual Shot (Image URL)</label>
                  <input
                    type="text"
                    value={photoForm.imageUrl}
                    onChange={e => setPhotoForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-purple-500 transition-colors font-mono"
                    placeholder="Paste direct photo link (Direct Photo URL - e.g. https://images.unsplash.com/...)"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Cinematic Narrative description</label>
                  <textarea
                    value={photoForm.description || ''}
                    onChange={e => setPhotoForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 text-sm rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-purple-500 transition-colors resize-y leading-relaxed"
                    placeholder="Moody narrative describing the atmosphere, lighting, feeling or subject..."
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold block">SEO Optimized Article & Photo Story</label>
                  <textarea
                    value={photoForm.articleContent || ''}
                    onChange={e => setPhotoForm(prev => ({ ...prev, articleContent: e.target.value }))}
                    rows={6}
                    className="w-full bg-slate-950 border border-slate-800 text-sm rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-purple-500 transition-colors resize-y leading-relaxed"
                    placeholder="Write a detailed article with camera expert settings, the story behind the photo, light/shadow details, and SEO-optimized keywords..."
                  />
                  <span className="text-[10px] text-slate-500 font-mono block">Provide rich, informative details for maximum SEO traction. This will be beautifully displayed as a read-more photologue article.</span>
                </div>
              </div>

              {/* Actions row */}
              <div className="flex items-center gap-3 justify-end pt-4 border-t border-slate-800/80">
                {isEditingPhoto && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingPhoto(false);
                      setPhotoForm({ title: '', description: '', imageUrl: '', cameraSettings: '', location: '', articleContent: '' });
                    }}
                    className="px-5 py-2.5 rounded-xl border border-slate-800/85 hover:bg-slate-800/30 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSaving ? 'Processing...' : isEditingPhoto ? 'Apply Corrections' : 'Commit to Optical Archive'}
                </button>
              </div>
            </form>

            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-slate-550 font-bold">Showcase Gallery Registry ({photographyList.length})</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {photographyList.map((ph) => (
                  <div key={ph.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-4 items-start hover:border-slate-700/80 transition-all">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 relative">
                      <img src={ph.imageUrl} alt={ph.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 justify-between">
                        <h4 className="text-sm font-sans font-bold text-white truncate">{ph.title}</h4>
                        {ph.articleContent ? (
                          <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">SEO Active</span>
                        ) : (
                          <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">No Article</span>
                        )}
                      </div>
                      <p className="text-slate-450 text-xs truncate">{ph.location || 'No Location'}</p>
                      <p className="text-[10px] font-mono text-purple-400 truncate">{ph.cameraSettings || 'f/2.8 | Auto'}</p>
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => handleEditPhoto(ph)}
                          className="p-1 px-2.5 rounded-md border border-slate-800 hover:border-purple-500/20 bg-slate-950 hover:bg-purple-500/5 text-purple-400 hover:text-purple-300 text-[10px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 size={10} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePhoto(ph.id!)}
                          className="p-1 px-2.5 rounded-md border border-slate-800 hover:border-red-500/20 bg-slate-950 hover:bg-red-500/5 text-red-400 hover:text-red-300 text-[10px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={10} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {photographyList.length === 0 && (
                  <div className="col-span-2 text-xs text-slate-500 text-center py-6 font-mono font-sans">
                    No pictures archived yet. Register a shot above!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB WORKSPACE: CONTACT */}
        {activeTab === 'contact' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-xl font-sans font-bold text-white flex items-center gap-2.5">
                <Mail size={18} className="text-purple-400" />
                Contact Resources coordinates Settings
              </h2>
              <p className="text-slate-400 text-xs mt-1 leading-normal">Update public mail, lines coordinates, location nodes, and social profile links.</p>
            </div>

            <form onSubmit={handleContactSave} className="bg-slate-900 border border-slate-800 rounded-2.5xl p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">General Mail Email</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm focus:outline-none focus:border-purple-500 font-sans"
                    placeholder="email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">General Telephone Line</label>
                  <input
                    type="text"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm focus:outline-none focus:border-purple-500 font-sans"
                    placeholder="+1 (555) 124-3450"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">General Node Location Coordinates</label>
                <input
                  type="text"
                  value={contactForm.address}
                  onChange={(e) => setContactForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm focus:outline-none focus:border-purple-500 font-sans"
                  placeholder="E.g., San Francisco, CA"
                />
              </div>

              <div className="border-t border-slate-800/80 pt-6 space-y-6">
                <h4 className="text-xs font-sans font-bold text-white uppercase tracking-wider text-purple-400">Social link registries</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">GitHub profile</label>
                    <input
                      type="url"
                      value={contactForm.github}
                      onChange={(e) => setContactForm(prev => ({ ...prev, github: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="https://github.com/..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">LinkedIn Profile</label>
                    <input
                      type="url"
                      value={contactForm.linkedin}
                      onChange={(e) => setContactForm(prev => ({ ...prev, linkedin: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="https://linkedin.com/..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Twitter profile</label>
                    <input
                      type="url"
                      value={contactForm.twitter}
                      onChange={(e) => setContactForm(prev => ({ ...prev, twitter: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-800 disabled:to-slate-800 text-white rounded-xl font-medium text-xs transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                Save Contact details
              </button>
            </form>
          </div>
        )}


      </main>
    </div>
  );
}
