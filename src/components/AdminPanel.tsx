import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updatePassword,
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  auth, 
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
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface AdminPanelProps {
  onDataChange: () => void;
}

export default function AdminPanel({ onDataChange }: AdminPanelProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'skills' | 'projects' | 'contact' | 'security'>('profile');

  // Custom secure login state variables
  const [emailInput, setEmailInput] = useState('mahfujar003@gmail.com');
  const [passwordInput, setPasswordInput] = useState('');
  const [registerMode, setRegisterMode] = useState(false);

  // Security: password update states
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

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
    cvObjective: ''
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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setAuthError("ইমেইল এবং পাসওয়ার্ড দুটিই দিন।");
      return;
    }

    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanWhitelisted = ALLOWED_EMAILS.map(email => email.trim().toLowerCase());

    if (!cleanWhitelisted.includes(cleanEmail)) {
      setAuthError(`অ্যাক্সেস রিফিউজড: "${cleanEmail}" অ্যাডমিন ইমেইল হিসেবে অনুমোদিত নয়। শুধুমাত্র অনুমোদিত ইমেইল দিয়ে সাইন-ইন বা নতুন অ্যাকাউন্ট তৈরি করতে পারেন।`);
      return;
    }

    setAuthLoading(true);
    setAuthError(null);

    try {
      if (registerMode) {
        await createUserWithEmailAndPassword(auth, cleanEmail, passwordInput);
        showStatus("অ্যাডমিন অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে এবং আপনি সাইন-ইন করেছেন!", "success");
      } else {
        await signInWithEmailAndPassword(auth, cleanEmail, passwordInput);
        showStatus("সফলভাবে অ্যাডমিন সাইন-ইন সম্পূর্ণ হয়েছে।", "success");
      }
    } catch (err: any) {
      console.error("Auth Failure Error:", err);
      let errorMsg = err.message || "একটি ত্রুটি ঘটেছে।";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMsg = "ভুল ইমেইল অথবা পাসওয়ার্ড। অনুগ্রহ করে চেক করে পুনরায় চেষ্টা করুন অথবা অ্যাকাউন্ট না থাকলে 'আমার নতুন অ্যাকাউন্ট তৈরি করুন' সিলেক্ট করে পাসওয়ার্ড দিয়ে নতুন অ্যাকাউন্ট তৈরি করুন।";
      } else if (err.code === 'auth/weak-password') {
        errorMsg = "পাসওয়ার্ডটি অত্যন্ত দুর্বল। পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার হওয়া বাঞ্ছনীয়।";
      } else if (err.code === 'auth/email-already-in-use') {
        errorMsg = "এই ইমেইলটি ইতিপূর্বে ব্যবহার করা হয়েছে। অনুগ্রহ করে লগইন করুন।";
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = "ইমেল ফর্ম্যাট অকার্যকর বা ভুল।";
      }
      setAuthError(errorMsg);
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

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmNewPassword) {
      showStatus("দয়া করে পাসওয়ার্ড দিন।", "danger");
      return;
    }
    if (newPassword.length < 6) {
      showStatus("পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার হওয়া বাঞ্ছনীয়।", "danger");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showStatus("দুটি পাসওয়ার্ড মেলেনি। আবার চেষ্টা করুন।", "danger");
      return;
    }

    setIsUpdatingPass(true);
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        showStatus("আপনার অ্যাডমিন পাসওয়ার্ড সফলভাবে ও নিরাপদে আপডেট করা হয়েছে!", "success");
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        showStatus("কোনো লগইন করা ইউজার পাওয়া যায়নি। দয়া করে আবার লগইন করুন।", "danger");
      }
    } catch (err: any) {
      console.error("Password update error:", err);
      let errorMsg = err.message || "পাসওয়ার্ড আপডেট করা যায়নি।";
      if (err.code === 'auth/requires-recent-login') {
        errorMsg = "নিরাপত্তার স্বার্থে পাসওয়ার্ড পরিবর্তনের জন্য আপনাকে অতি সম্প্রতি লগইন করতে হবে। দয়া করে একবার লগআউট করে আবার লগইন করুন, এরপর পাসওয়ার্ড পরিবর্তন করুন।";
      }
      showStatus(errorMsg, "danger");
    } finally {
      setIsUpdatingPass(false);
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
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-4 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-amber-400 font-semibold font-sans">
                <AlertTriangle size={15} className="shrink-0" />
                <span>ফায়ারবেস এনভায়রনমেন্ট সেটআপ ভ্যালুসমূহ (Firebase Setup Key-Values)</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                আপনার <strong>Vercel Dashboard / AI Studio Secrets</strong>-এ নিচের এনভায়রনমেন্ট ভেরিয়েবলগুলো (Environment Variables) যোগ করতে হবে। এগুলো যোগ করে Vercel-এ রি-ডিপ্লয় (Redeploy) করলেই Vercel লিংক দিয়ে সাইন-ইন সঠিকভাবে চলতে শুরু করবে:
              </p>

              <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[9.5px]">
                <div className="flex flex-col sm:flex-row sm:justify-between border-b border-slate-900 pb-1.5 gap-1">
                  <span className="text-purple-400 font-bold">VITE_FIREBASE_API_KEY</span>
                  <span className="text-emerald-400 break-all select-all">"AIzaSyC9ZtpXbUzIiFBejJ1Ja7TcH4j3UbeIZi0"</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between border-b border-slate-900 pb-1.5 gap-1">
                  <span className="text-purple-400 font-bold">VITE_FIREBASE_AUTH_DOMAIN</span>
                  <span className="text-emerald-400 break-all select-all">"genial-parser-g6tp2.firebaseapp.com"</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between border-b border-slate-900 pb-1.5 gap-1">
                  <span className="text-purple-400 font-bold">VITE_FIREBASE_PROJECT_ID</span>
                  <span className="text-emerald-400 break-all select-all">"genial-parser-g6tp2"</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between border-b border-slate-900 pb-1.5 gap-1">
                  <span className="text-purple-400 font-bold">VITE_FIREBASE_STORAGE_BUCKET</span>
                  <span className="text-emerald-400 break-all select-all">"genial-parser-g6tp2.firebasestorage.app"</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between border-b border-slate-900 pb-1.5 gap-1">
                  <span className="text-purple-400 font-bold">VITE_FIREBASE_MESSAGING_SENDER_ID</span>
                  <span className="text-emerald-400 break-all select-all">"618539864809"</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between border-b border-slate-900 pb-1.5 gap-1">
                  <span className="text-purple-400 font-bold">VITE_FIREBASE_APP_ID</span>
                  <span className="text-emerald-400 break-all select-all">"1:618539864809:web:0ca11b242b91aa65e11678"</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-1">
                  <span className="text-purple-400 font-bold">VITE_FIREBASE_FIRESTORE_DATABASE_ID</span>
                  <span className="text-emerald-400 break-all select-all font-semibold">"ai-studio-2423ff64-af59-4327-b2a2-39217a01897e"</span>
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-2.5 text-[10px] text-slate-500 leading-normal space-y-1.5">
                <p>
                  👉 <strong>Vercel Settings</strong> এ গিয়ে এগুলো সেভ করার পর অবশ্যই <strong>Deployments</strong> ট্যাব থেকে সর্বশেষ বিল্ডটি <strong>Redeploy</strong> করবেন।
                </p>
                <p className="italic">
                  * Note: These environment variables are safely bundled at build-time. Go to Vercel Project Settings &gt; Environment Variables, add them, and redeploy.
                </p>
              </div>
            </div>
          )}

          {authError && (
            <div className="space-y-4">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-xs leading-relaxed">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>

              {(authError.toLowerCase().includes('api-key') || authError.toLowerCase().includes('key-not-valid') || authError.toLowerCase().includes('api_key') || authError.toLowerCase().includes('invalid')) && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl space-y-4 text-xs leading-relaxed text-slate-300">
                  <div className="flex items-center gap-2 text-purple-400 font-semibold font-sans">
                    <Sparkles size={16} className="shrink-0 animate-pulse" />
                    <span>Vercel Environment Setup Required (Vercel ও ফায়ারবেস কানেকশন গাইড)</span>
                  </div>

                  <div className="space-y-3.5">
                    <p className="text-slate-200 font-medium">
                      আপনার Vercel প্রজেক্টে এখনও Firebase-এর সিক্রেট এনভায়রনমেন্ট ভ্যারিয়েবলগুলো (Environment Variables) যোগ করা হয়নি। এটি সমাধান করতে নিচের সহজ ধাপগুলো অনুসরণ করুন:
                    </p>

                    <ol className="list-decimal list-inside space-y-2.5 text-[11px] text-slate-300 pl-1">
                      <li>
                        আপনার <strong>Vercel Dashboard</strong>-এ যান এবং আপনার প্রজেক্টটি সিলেক্ট করুন।
                      </li>
                      <li>
                        <strong>Settings</strong> ট্যাব থেকে <strong>Environment Variables</strong> অপশনে ক্লিক করুন।
                      </li>
                      <li>
                        নিচের প্রতিটি ভ্যালু এক এক করে <strong>Key</strong> এবং <strong>Value</strong> হিসেবে কপি-পেস্ট করে যোগ করুন:
                        
                        <div className="mt-2.5 space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[9.5px]">
                          <div className="flex flex-col sm:flex-row sm:justify-between border-b border-slate-900 pb-1.5 gap-1">
                            <span className="text-purple-400">VITE_FIREBASE_API_KEY</span>
                            <span className="text-emerald-400 break-all select-all">"AIzaSyC9ZtpXbUzIiFBejJ1Ja7TcH4j3UbeIZi0"</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between border-b border-slate-900 pb-1.5 gap-1">
                            <span className="text-purple-400">VITE_FIREBASE_AUTH_DOMAIN</span>
                            <span className="text-emerald-400 break-all select-all">"genial-parser-g6tp2.firebaseapp.com"</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between border-b border-slate-900 pb-1.5 gap-1">
                            <span className="text-purple-400">VITE_FIREBASE_PROJECT_ID</span>
                            <span className="text-emerald-400 break-all select-all">"genial-parser-g6tp2"</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between border-b border-slate-900 pb-1.5 gap-1">
                            <span className="text-purple-400">VITE_FIREBASE_STORAGE_BUCKET</span>
                            <span className="text-emerald-400 break-all select-all">"genial-parser-g6tp2.firebasestorage.app"</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between border-b border-slate-900 pb-1.5 gap-1">
                            <span className="text-purple-400">VITE_FIREBASE_MESSAGING_SENDER_ID</span>
                            <span className="text-emerald-400 break-all select-all">"618539864809"</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between border-b border-slate-900 pb-1.5 gap-1">
                            <span className="text-purple-400">VITE_FIREBASE_APP_ID</span>
                            <span className="text-emerald-400 break-all select-all">"1:618539864809:web:0ca11b242b91aa65e11678"</span>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-1">
                            <span className="text-purple-400">VITE_FIREBASE_FIRESTORE_DATABASE_ID</span>
                            <span className="text-emerald-400 break-all select-all font-bold">"ai-studio-2423ff64-af59-4327-b2a2-39217a01897e"</span>
                          </div>
                        </div>
                      </li>
                      <li>
                        সবগুলো ভ্যালু সেভ করা শেষ হলে Vercel-এর <strong>Deployments</strong> ট্যাবে গিয়ে সর্বশেষ ডিপ্লয়মেন্টটির পাশে 3-dots ওপরে চাপুন এবং <strong>Redeploy</strong> বাটনে ক্লিক করুন। নতুন বিল্ড শেষ হওয়ার সাথে সাথেই সাইন-ইন সঠিকভাবে চলতে শুরু করবে!
                      </li>
                    </ol>

                    <div className="border-t border-slate-800/80 pt-3 mt-1 space-y-1.5 text-[11px]">
                      <p className="font-bold text-slate-100 uppercase tracking-wider text-[10px]">English Instructions:</p>
                      <p className="text-slate-400">
                        Vite bundles environment variables at build-time. Since you deployed to Vercel without adding the Firebase variables, Firebase initialized with empty/dummy values.
                      </p>
                      <p className="text-slate-400">
                        To resolve this, add the <strong>VITE_FIREBASE_*</strong> keys listed above to your <strong>Vercel Project Settings &gt; Environment Variables</strong>, then go to the <strong>Deployments</strong> tab in Vercel and trigger a <strong>Redeploy</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {authError.toLowerCase().includes('unauthorized-domain') && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-4 text-xs leading-relaxed text-slate-300">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold font-sans">
                    <AlertTriangle size={16} className="shrink-0 animate-pulse" />
                    <span>Firebase Authorized Domain Error (ডোমেন সম্পর্কিত গুরুত্বপূর্ণ তথ্য)</span>
                  </div>

                  <div className="space-y-3 text-slate-200">
                    <div className="p-3 bg-red-950/40 border border-red-500/20 rounded-xl space-y-1.5 text-[11px] text-red-200">
                      <p className="font-bold">⚠️ "Domain add korar option nei" কেন দেখাচ্ছে?</p>
                      <p>
                        আপনি বর্তমানে যে Firebase প্রজেক্টের ভ্যালুগুলো (`genial-parser-...`) দেখছেন, তা AI Studio-র তৈরি করা অস্থায়ী স্যান্ডবক্স প্রজেক্ট। এর মূল এডমিন অ্যাক্সেস শুধুমাত্র AI Studio প্ল্যাটফর্মের কাছে আছে, তাই এই ডেমো প্রজেক্টের কনসোলে আপনার নতুন কাস্টম ভার্সেল ডোমেন (`mahfuz02.vercel.app`) সরাসরি যুক্ত করার কোনো কনসোল অপশন আপনি পাবেন না।
                      </p>
                      <p className="font-semibold text-amber-300">
                        💡 সমাধান: আপনাকে আপনার নিজের একটি ফ্রি Firebase প্রজেক্ট ব্যবহার করতে হবে (যেমন: `mahfuz002-b0b26` বা আপনার তৈরি কোনো নতুন প্রজেক্ট) যেখানে আপনার সম্পূর্ণ এডমিন অ্যাক্সেস থাকবে।
                      </p>
                    </div>

                    <p className="font-semibold text-slate-150">
                      আপনার নিজের কাস্টম Firebase প্রজেক্টের মাধ্যমে Vercel ডোমেন সচল করার ৩ মিনিটের সহজ গাইড:
                    </p>

                    <ol className="list-decimal list-inside space-y-2.5 pl-1 text-[11px] text-slate-300">
                      <li>
                        প্রথমে সরাসরি আপনার নিজের{' '}
                        <a 
                          href="https://console.firebase.google.com/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 underline font-bold inline-flex items-center gap-0.5"
                        >
                          Firebase Console ↗
                        </a>-এ যান এবং আপনার তৈরিকৃত প্রজেক্টে (যেমন: <code className="text-pink-400 font-mono">mahfuz002-b0b26</code>) প্রবেশ করুন।
                      </li>
                      <li>
                        বাঁদিকের মেনু থেকে <strong>Build &gt; Authentication</strong> এ যান, তারপর <strong>Settings</strong> ট্যাবে ক্লিক করুন।
                      </li>
                      <li>
                        সেখানকার <strong>Authorized domains (অনুমোদিত ডোমেনসমূহ)</strong> সেকশনে গিয়ে <strong>Add domain</strong> বাটনে ক্লিক করে নিচে দেওয়া আপনার Vercel ডোমেনটি যোগ বা পেস্ট করুন (আপনার নিজস্ব প্রোজেক্টে এই অপশনটি ১০০% সচল থাকবে):
                        <div className="my-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[10.5px] text-emerald-400 select-all font-bold">
                          mahfuz02.vercel.app
                        </div>
                      </li>
                      <li>
                        এবার আপনার ফায়ারবেস প্রজেক্টের কাস্টম SDK Web App Config ভ্যালুগুলো (API Key, Auth Domain, Project ID ইত্যাদি) আপনার <strong>Vercel Project Settings &gt; Environment Variables</strong>-এ এক এক করে যোগ করে দিন।
                      </li>
                      <li>
                        সবশেষে Vercel-এর <strong>Deployments</strong> ট্যাবে গিয়ে সর্বশেষ ডিপ্লয়মেন্টের পাশে ৩-ডটসে চেপে <strong>Redeploy</strong> বাটনে ক্লিক করুন। ব্যস! নতুন কাস্টম ফায়ারবেস দিয়ে আপনার সাইন-ইন সঠিকভাবে চলতে শুরু করবে!
                      </li>
                    </ol>

                    <div className="border-t border-slate-800 pt-3 mt-3 text-[11px]">
                      <p className="font-bold text-slate-100 uppercase tracking-wider text-[10px]">
                        English Summary:
                      </p>
                      <p className="text-slate-400 mt-1">
                        The demo Firebase project (<code className="text-pink-400 font-mono">genial-parser-...</code>) is a platform-managed sandbox, so you do not have permission to access its Firebase console or add authorized domains.
                      </p>
                      <p className="text-slate-400 mt-1">
                        To resolve this, please use your <strong>own custom Firebase project</strong> (like <code className="text-pink-400 font-mono">mahfuz002-b0b26</code> or any new one). Go to your own Firebase console, choose your project, navigate to <strong>Authentication &gt; Settings &gt; Authorized domains</strong>, click <strong>Add domain</strong> and add <code className="text-emerald-400 font-mono font-bold">mahfuz02.vercel.app</code>. Finally, update your <strong>Vercel Project &gt; Environment Variables</strong> with your custom credentials and trigger a <strong>Redeploy</strong>!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/85 space-y-4">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-2 flex items-center gap-1.5">
                <Lock size={12} className="text-purple-400" />
                <span>Secure Credentials (এডমিন অথেনটিকেশন):</span>
              </h4>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">
                  Admin Email (অ্যাডমিন ইমেইল)
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-purple-500 p-3 rounded-xl text-slate-200 text-xs focus:outline-none transition-colors"
                  placeholder="e.g., mahfujar003@gmail.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">
                  Password (পাসওয়ার্ড)
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-purple-500 p-3 rounded-xl text-slate-200 text-xs focus:outline-none transition-colors"
                  placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600/70 to-pink-600/70 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl font-semibold tracking-wide transition-all duration-300 shadow-lg shadow-purple-600/10 hover:shadow-purple-500/20 font-sans flex items-center justify-center gap-2"
            >
              <Check size={16} />
              <span>{registerMode ? "আমার নতুন অ্যাকাউন্ট তৈরি করুন" : "অ্যাডমিন প্যানেলে প্রবেশ করুন"}</span>
            </button>

            <div className="text-center pt-1.5">
              <button
                type="button"
                onClick={() => {
                  setRegisterMode(!registerMode);
                  setAuthError(null);
                }}
                className="text-xs text-purple-400 hover:text-purple-300 underline underline-offset-4 transition-all"
              >
                {registerMode 
                  ? "ইতিমধ্যে অ্যাকাউন্ট আছে? সাইন-ইন বা লগইন করুন" 
                  : "নতুন ইউজার? আমার নতুন অ্যাকাউন্ট তৈরি করুন (Register instead)"}
              </button>
            </div>
          </form>
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

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs font-sans transition-all duration-300 ${
                activeTab === 'security'
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Lock size={15} />
                Security Settings (নিরাপত্তা)
              </span>
              <ChevronRight size={12} className={activeTab === 'security' ? 'opacity-100' : 'opacity-40'} />
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
                
                <div className="space-y-3 text-center sm:text-left flex-1">
                  <h4 className="text-sm font-sans font-bold text-white">Avatar Image (অবতার ছবি)</h4>
                  <p className="text-xs text-slate-500 font-mono">JPG/PNG ফাইল আপলোড করুন অথবা সরাসরি ছবির লিংক ডানদিকের বক্সে পেস্ট করুন।</p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <label className="inline-flex justify-center items-center gap-2 px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 hover:text-white rounded-xl text-xs font-sans font-medium text-slate-300 cursor-pointer transition-colors shrink-0">
                      <Upload size={14} />
                      {isUploadingAvatar ? "Processing Upload..." : "Upload Profile Photo"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileSelect}
                        className="hidden"
                        disabled={isUploadingAvatar}
                      />
                    </label>
                    
                    <span className="text-xs text-slate-600 hidden sm:inline">OR</span>
                    
                    <input
                      type="text"
                      value={profileForm.avatarUrl || ''}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, avatarUrl: e.target.value }))}
                      className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="সরাসরি ছবির লিংক (Direct Image URL/Link) এখানে পেস্ট করুন"
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

                    {/* Date of Birth */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Date of Birth (জন্ম তারিখ)</label>
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
                      <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Nationality (জাতীয়তা)</label>
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
                      <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Gender / Marital Status (লিঙ্গ)</label>
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
                      <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Languages (ভাষাসমূহ)</label>
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
                    <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block">CV Objective / Career Summary (ক্যারিয়ারের লক্ষ্য)</label>
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

                <div className="space-y-3 text-center sm:text-left flex-1">
                  <h4 className="text-xs font-sans font-bold text-white">Project visual preview (প্রজেক্ট ছবি)</h4>
                  <p className="text-[10px] text-slate-500 font-mono">JPG/PNG ফাইল আপলোড করুন অথবা সরাসরি ছবির লিংক ডানদিকের বক্সে পেস্ট করুন।</p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <label className="inline-flex justify-center items-center gap-2 px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 hover:text-white rounded-xl text-xs font-sans font-medium text-slate-300 cursor-pointer transition-colors shrink-0">
                      <Upload size={13} />
                      {isUploadingProjImg ? "Uploading..." : "Upload Project Image File"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProjFileSelect}
                        className="hidden"
                        disabled={isUploadingProjImg}
                      />
                    </label>

                    <span className="text-[10px] text-slate-600 hidden sm:inline">OR</span>

                    <input
                      type="text"
                      value={projectForm.imageUrl}
                      onChange={(e) => setProjectForm({ ...projectForm, imageUrl: e.target.value })}
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="সরাসরি ছবির লিংক (Direct Project Image URL/Link) এখানে পেস্ট করুন"
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

        {/* TAB WORKSPACE: SECURITY */}
        {activeTab === 'security' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-xl font-sans font-bold text-white flex items-center gap-2.5">
                <Lock size={18} className="text-purple-400" />
                Change Password (অ্যাডমিন পাসওয়ার্ড পরিবর্তন)
              </h2>
              <p className="text-slate-400 text-xs mt-1 leading-normal">
                পাসওয়ার্ড পরিবর্তন করুন। এটি সম্পূর্ণ সুরক্ষিত এবং Firebase Authentication গেটওয়ে দ্বারা পরিচালিত হয়। কোডে কোনো পাসওয়ার্ড সংরক্ষিত বা ট্র্যাক করা হয় না।
              </p>
            </div>

            <form onSubmit={handlePasswordChangeSubmit} className="bg-slate-900 border border-slate-800 rounded-2.5xl p-6 md:p-8 space-y-6 max-w-xl">
              <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl flex gap-3 text-xs text-slate-300 leading-relaxed">
                <ShieldAlert size={16} className="text-purple-400 shrink-0" />
                <div>
                  <p className="font-semibold text-purple-300">🔒 শতভাগ নিরাপদ ও পাবলিক-কোড ফ্রী</p>
                  <p className="mt-1 text-slate-400">
                    আমাদের এই পোর্টফোলিও সাইটের কোড পাবলিক গিটহাব রিপোজিটরিতে হোস্ট করা থাকলেও আপনার নতুন পাসওয়ার্ডটি গিটহাবের কোনো ফাইলে বা কোনো লোকাল ফাইলে সংরক্ষণ করা হবে না। এটি সরাসরি আপনার ফায়ারবেস অথেনটিকেশন ডাটাবেজে ক্লাউড লেভেলে আপডেট হবে।
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">New Password (নতুন পাসওয়ার্ড)</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm focus:outline-none focus:border-purple-500 font-sans"
                    placeholder="কমপক্ষে ৬ অক্ষরের নতুন পাসওয়ার্ড দিন"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Confirm Password (পাসওয়ার্ড নিশ্চিতকরণ)</label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm focus:outline-none focus:border-purple-500 font-sans"
                    placeholder="নতুন পাসওয়ার্ডটি আবার টাইপ করুন"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingPass}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-800 disabled:to-slate-800 text-white rounded-xl font-medium text-xs transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isUpdatingPass ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    ভেরিফাই এবং পাসওয়ার্ড সেভ করুন
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
