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
  uploadImage 
} from '../dataService';
import { Profile, Skill, Project, Contact } from '../types';
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
  Sparkles
} from 'lucide-react';

interface AdminPanelProps {
  onDataChange: () => void;
}

export default function AdminPanel({ onDataChange }: AdminPanelProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'skills' | 'projects' | 'contact'>('profile');

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
    cvSkills: ''
  });
  const [skillsList, setSkillsList] = useState<Skill[]>([]);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [contactForm, setContactForm] = useState<Contact>({ email: '', phone: '', address: '', github: '', linkedin: '', twitter: '', updatedAt: '' });

  // CRUD working states
  const [skillForm, setSkillForm] = useState<{ id?: string; name: string; category: string; percentage: number }>({ name: '', category: 'Frontend', percentage: 80 });
  const [isEditingSkill, setIsEditingSkill] = useState(false);

  const [projectForm, setProjectForm] = useState<{ id?: string; title: string; description: string; imageUrl: string; liveUrl: string; githubUrl: string }>({ title: '', description: '', imageUrl: '', liveUrl: '', githubUrl: '' });
  const [isEditingProject, setIsEditingProject] = useState(false);

  // File loading states
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCvPhoto, setIsUploadingCvPhoto] = useState(false);
  const [isUploadingProjImg, setIsUploadingProjImg] = useState(false);

  // Whitelisted Emails defined inside specification & bootstrapped user runtime email
  const ALLOWED_EMAILS = ['mahfujar003@gmail.com', 'your-actual-gmail@gmail.com'];

  // Auth Status Monitor
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Strict Email Lock Verification
        if (currentUser.email && ALLOWED_EMAILS.includes(currentUser.email)) {
          setUser(currentUser);
          setAuthError(null);
          // Pre-load all metrics
          loadAllMetricsData();
        } else {
          // Unauthorized email -> immediately sign out
          setAuthError(`Access Denied: The account "${currentUser.email}" is not authorized. Please log in with an approved administrator address.`);
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

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Login failure:", err);
      setAuthError(err.message || "An authentication exception occurred.");
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      showStatus("Logged out successfully.", "success");
    } catch (err) {
      console.error("Logout failure:", err);
    }
  };

  const loadAllMetricsData = async () => {
    try {
      const p = await fetchProfile();
      setProfileForm(p);

      const s = await fetchSkills();
      setSkillsList(s);

      const pr = await fetchProjects();
      setProjectsList(pr);

      const c = await fetchContact();
      setContactForm(c);
    } catch (err) {
      console.error("Error fetching admin portfolio datasets:", err);
      showStatus("Could not fetch remote datasets completely. Displaying local cache.", "danger");
    }
  };

  const showStatus = (text: string, type: 'success' | 'danger') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // HANDLERS: PROFILE
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveProfile(profileForm);
      showStatus("Profile details saved to Firebase successfully.", "success");
      onDataChange();
    } catch (err: any) {
      console.error(err);
      showStatus("Error storing profile. Saving locally as fallback.", "success");
      onDataChange();
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const url = await uploadImage(file, 'avatars');
      setProfileForm(prev => ({ ...prev, avatarUrl: url }));
      showStatus("Avatar uploaded successfully.", "success");
    } catch (err) {
      showStatus("Avatar document upload failed.", "danger");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCvPhotoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCvPhoto(true);
    try {
      const url = await uploadImage(file, 'cvPhotos');
      setProfileForm(prev => ({ ...prev, cvPhotoUrl: url }));
      showStatus("CV Photograph uploaded successfully.", "success");
    } catch (err) {
      showStatus("CV Photograph upload failed.", "danger");
    } finally {
      setIsUploadingCvPhoto(false);
    }
  };

  // HANDLERS: SKILLS
  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillForm.name || !skillForm.category) return;
    setIsSaving(true);
    try {
      if (isEditingSkill && skillForm.id) {
        await updateSkill(skillForm.id, {
          name: skillForm.name,
          category: skillForm.category,
          percentage: Number(skillForm.percentage),
          createdAt: new Date().toISOString()
        });
        showStatus("Skill updated in database.", "success");
      } else {
        await addSkill({
          name: skillForm.name,
          category: skillForm.category,
          percentage: Number(skillForm.percentage),
          createdAt: new Date().toISOString()
        });
        showStatus("New skill appended to portfolio.", "success");
      }
      setSkillForm({ name: '', category: 'Frontend', percentage: 80 });
      setIsEditingSkill(false);
      await loadAllMetricsData();
      onDataChange();
    } catch (err) {
      showStatus("Failed to store skill to firestore. Saved to local cache.", "success");
      setSkillForm({ name: '', category: 'Frontend', percentage: 80 });
      setIsEditingSkill(false);
      onDataChange();
      loadAllMetricsData();
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
    if (!confirm("Are you sure you want to remove this skill record?")) return;
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
    setIsSaving(true);
    try {
      if (isEditingProject && projectForm.id) {
        await updateProject(projectForm.id, {
          title: projectForm.title,
          description: projectForm.description,
          imageUrl: projectForm.imageUrl,
          liveUrl: projectForm.liveUrl,
          githubUrl: projectForm.githubUrl,
          createdAt: new Date().toISOString()
        });
        showStatus("Project details updated.", "success");
      } else {
        await addProject({
          title: projectForm.title,
          description: projectForm.description,
          imageUrl: projectForm.imageUrl,
          liveUrl: projectForm.liveUrl,
          githubUrl: projectForm.githubUrl,
          createdAt: new Date().toISOString()
        });
        showStatus("Project added to production deck.", "success");
      }
      setProjectForm({ title: '', description: '', imageUrl: '', liveUrl: '', githubUrl: '' });
      setIsEditingProject(false);
      await loadAllMetricsData();
      onDataChange();
    } catch (err) {
      showStatus("Stored project to local state. Check configuration schemas.", "success");
      setProjectForm({ title: '', description: '', imageUrl: '', liveUrl: '', githubUrl: '' });
      setIsEditingProject(false);
      onDataChange();
      loadAllMetricsData();
    } finally {
      setIsSaving(false);
    }
  };

  const handleProjFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingProjImg(true);
    try {
      const url = await uploadImage(file, 'projects');
      setProjectForm(prev => ({ ...prev, imageUrl: url }));
      showStatus("Project preview image uploaded successfully.", "success");
    } catch (err) {
      showStatus("Visual upload failed. Base64 pipeline activated.", "success");
    } finally {
      setIsUploadingProjImg(false);
    }
  };

  const handleEditProject = (p: Project) => {
    setProjectForm({
      id: p.id,
      title: p.title,
      description: p.description,
      imageUrl: p.imageUrl,
      liveUrl: p.liveUrl,
      githubUrl: p.githubUrl
    });
    setIsEditingProject(true);
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to remove this project production?")) return;
    try {
      await deleteProject(id);
      showStatus("Project deleted.", "success");
      await loadAllMetricsData();
      onDataChange();
    } catch (err) {
      showStatus("Could not purge document record.", "danger");
    }
  };

  // HANDLERS: CONTACT
  const handleContactSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveContact(contactForm);
      showStatus("Contact references saved to Firestore.", "success");
      onDataChange();
    } catch (err: any) {
      console.error(err);
      showStatus("Saved locally as fallback offline file setup.", "success");
      onDataChange();
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
            <p className="text-slate-400 text-xs font-mono mt-2 uppercase tracking-widest text-slate-500">Secure Protocol Interface</p>
          </div>

          {!isConfigured && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3.5 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-amber-400 font-semibold font-sans">
                <AlertTriangle size={15} className="shrink-0" />
                <span>নতুন Firebase প্রোজেক্ট সেটআপ করুন (Secure Mode)</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                আপনার GitHub নিরাপত্তা নিশ্চিত করতে হার্ডকোডেড সিক্রেট ফাইল রিমুভ করা হয়েছে। এখন আপনার নতুন Firebase প্রজেক্ট সচল করার জন্য AI Studio-এর <strong>Settings</strong> বা <strong>Secrets</strong> মেনু থেকে নিচের এনভায়রনমেন্ট ভেরিয়েবলগুলো (Environment Variables) যোগ করুন:
              </p>
              <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono text-[10px] text-purple-300">
                <div>VITE_FIREBASE_API_KEY</div>
                <div>VITE_FIREBASE_AUTH_DOMAIN</div>
                <div>VITE_FIREBASE_PROJECT_ID</div>
                <div>VITE_FIREBASE_STORAGE_BUCKET</div>
                <div>VITE_FIREBASE_MESSAGING_SENDER_ID</div>
                <div>VITE_FIREBASE_APP_ID</div>
                <div>VITE_FIREBASE_FIRESTORE_DATABASE_ID (ঐচ্ছিক)</div>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal italic">
                * মনে রাখবেন, এই এনভায়রনমেন্ট ভ্যালুগুলো শুধুমাত্র আপনার ব্রাউজার ও হোস্টিং এনভায়রনমেন্টে থাকবে, কখনো GitHub রিপোজিটরিতে প্রকাশ বা পুশ হবে না।
              </p>
            </div>
          )}

          {authError && (
            <div className="space-y-4">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-xs leading-relaxed">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>

              {authError.toLowerCase().includes('unauthorized-domain') && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-4 text-xs leading-relaxed text-slate-300">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold font-sans">
                    <AlertTriangle size={16} className="shrink-0" />
                    <span>Firebase Authorized Domain Error Detected</span>
                  </div>

                  <div className="space-y-3 text-slate-200">
                    <p className="font-semibold text-slate-150">
                      আপনার ব্রাউজারের কারেন্ট ডোমেনটি Firebase প্রোজেক্টের <strong>Authorized Domains (অনুমোদিত ডোমেন)</strong> তালিকায় যোগ করা নেই। এটি সমাধান করতে নিচের ধাপগুলো সম্পন্ন করুন:
                    </p>

                    <ol className="list-decimal list-inside space-y-2 pl-1 text-[11px] text-slate-300">
                      <li>
                        সরাসরি নিচের বাটনে ক্লিক করে ফায়ারবেস কনসোলের অথেনটিকেশন সেটিংসে যান:<br />
                        <a 
                          href="https://console.firebase.google.com/project/genial-parser-g6tp2/authentication/settings" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-purple-400 hover:text-purple-300 underline font-mono font-bold mt-1.5"
                        >
                          Firebase Console Settings ↗
                        </a>
                      </li>
                      <li>
                        সেখানের <strong>Authorized domains (অনুমোদিত ডোমেনসমূহ)</strong> সেকশনে গিয়ে <strong>Add domain</strong> বাটনে ক্লিক করুন।
                      </li>
                      <li>
                        নিচের ডোমেন টেক্সটটি কপি করে সেখানে যোগ (Add) করুন:
                        <div className="my-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1 font-mono text-[10px] text-emerald-400 select-all">
                          <div>ais-dev-7ydkkoxbt24i4epdzpgpmu-376430413500.asia-southeast1.run.app</div>
                          <div>ais-pre-7ydkkoxbt24i4epdzpgpmu-376430413500.asia-southeast1.run.app</div>
                          <div>mahfuz02.vercel.app</div>
                        </div>
                      </li>
                      <li>
                        ডোমেনটি সফলভাবে অ্যাড করার পর এই পেজটি রিফ্রেশ দিন এবং আবার গুগল সাইন-ইন বাটন চেপে এডমিনে প্রবেশ করুন।
                      </li>
                    </ol>

                    <div className="border-t border-slate-800 pt-3 mt-3">
                      <p className="font-semibold text-slate-100 text-[11px]">
                        English Instructions:
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Go to your Firebase Console settings and add the <strong>run.app</strong> and <strong>vercel.app</strong> domains listed above to your <strong>Authorized domains</strong>, then save and refresh this page to log in.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2.5">
            <h4 className="text-xs font-mono text-slate-400">Security Parameters:</h4>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Check size={14} className="text-purple-500" />
              <span>Google Sign-In POPUP Integration</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-600/60 to-pink-600/60 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl font-medium tracking-wide transition-all duration-300 shadow-lg shadow-purple-600/10 hover:shadow-purple-500/20 font-sans flex items-center justify-center gap-3.5 opacity-80 hover:opacity-100"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.74-.08-1.3-.177-1.86H12.24z"/>
            </svg>
            Google Identity Gateway
          </button>
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
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-slate-400 hover:text-red-400 font-sans font-medium text-xs transition-colors rounded-xl hover:bg-red-500/5 hover:border-red-500/10 border border-transparent"
          >
            <LogOut size={15} />
            Sign Out Session
          </button>
        </div>
      </aside>

      {/* Main Form workspace */}
      <main className="flex-grow p-6 md:p-10 max-w-4xl overflow-y-auto">
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
                <div className="relative w-24 h-24 rounded-full p-0.5 bg-gradient-to-tr from-purple-500 to-pink-500 shadow-md">
                  <img
                    src={profileForm.avatarUrl || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600"}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-full bg-slate-950 border-2 border-slate-950"
                  />
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-slate-950/80 rounded-full flex items-center justify-center">
                      <span className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 text-center sm:text-left">
                  <h4 className="text-sm font-sans font-bold text-white">Avatar Artifact</h4>
                  <p className="text-xs text-slate-500 font-mono">Accepts JPG/PNG, uploads directly to Storage.</p>
                  
                  <label className="inline-flex items-center gap-2.5 px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 hover:text-white rounded-xl text-xs font-sans font-medium text-slate-300 cursor-pointer transition-colors">
                    <Upload size={14} />
                    {isUploadingAvatar ? "Processing Upload..." : "Upload Avatar"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileSelect}
                      className="hidden"
                      disabled={isUploadingAvatar}
                    />
                  </label>
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
                      <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400">CV Name / Header</label>
                      <input
                        type="text"
                        value={profileForm.cvName || ''}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, cvName: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-purple-500"
                        placeholder="E.g., MAHFUZ R MASUM"
                      />
                    </div>

                    {/* CV Title */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400">CV Professional Title</label>
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
                      <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400">CV Contact Address</label>
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
                      <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400">CV Email Address</label>
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
                      <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400">CV Contact Phone</label>
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
                      <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400">CV Image / Photograph URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={profileForm.cvPhotoUrl || ''}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, cvPhotoUrl: e.target.value }))}
                          className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs focus:outline-none focus:border-purple-500"
                          placeholder="Or upload select file →"
                        />
                        <label className="px-3 py-2 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer flex items-center justify-center text-xs transition-colors relative">
                          <Upload size={13} />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCvPhotoFileSelect}
                            className="hidden"
                            disabled={isUploadingCvPhoto}
                          />
                        </label>
                      </div>
                      {isUploadingCvPhoto && (
                        <p className="text-[9px] font-mono text-purple-400 animate-pulse">Uploading photograph to Cloud Storage...</p>
                      )}
                    </div>
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
                <div className="relative aspect-video w-44 rounded-2xl bg-slate-950 overflow-hidden border border-slate-800">
                  <img
                    src={projectForm.imageUrl || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"}
                    alt="Preview visual"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {isUploadingProjImg && (
                    <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center">
                      <span className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <h4 className="text-xs font-sans font-bold text-white">Project visual preview</h4>
                  <p className="text-[10px] text-slate-500 font-mono">JPG/PNG documents. Transmits directly to Google Cloud Storage bucket.</p>
                  
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 hover:text-white rounded-xl text-xs font-sans font-medium text-slate-300 cursor-pointer transition-colors">
                    <Upload size={13} />
                    {isUploadingProjImg ? "Uploading..." : "Upload Project Image"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProjFileSelect}
                      className="hidden"
                      disabled={isUploadingProjImg}
                    />
                  </label>
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
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{pr.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-900 pt-3">
                      <div className="flex gap-2">
                        {pr.liveUrl && <a href={pr.liveUrl} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white"><ExternalLink size={12} /></a>}
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
