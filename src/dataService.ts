import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, OperationType, handleFirestoreError, isConfigured } from './firebase';
import { Profile, Skill, Project, Contact } from './types';
import { 
  DEFAULT_PROFILE, 
  DEFAULT_SKILLS, 
  DEFAULT_PROJECTS, 
  DEFAULT_CONTACT 
} from './defaultData';

// Helper to check if Firebase is configured with real credentials (not placeholders)
export function isFirebaseConfigured(): boolean {
  return isConfigured;
}

// PROFILE SERVICE
export async function fetchProfile(): Promise<Profile> {
  const collectionName = 'profile';
  const docId = 'main';
  try {
    const local = localStorage.getItem('profile_main');
    if (!isConfigured) {
      if (local) return JSON.parse(local);
      return DEFAULT_PROFILE;
    }
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Profile;
    }
    // Check localStorage fallback
    if (local) return JSON.parse(local);
    return DEFAULT_PROFILE;
  } catch (error) {
    console.warn("Firestore fetchProfile error, using fallback data:", error);
    const local = localStorage.getItem('profile_main');
    if (local) return JSON.parse(local);
    return DEFAULT_PROFILE;
  }
}

export async function saveProfile(profile: Profile): Promise<void> {
  const collectionName = 'profile';
  const docId = 'main';
  const data = {
    ...profile,
    updatedAt: new Date().toISOString()
  };
  try {
    localStorage.setItem('profile_main', JSON.stringify(data));
    if (!isConfigured) {
      return;
    }
    const docRef = doc(db, collectionName, docId);
    // Write field-by-field or overwrite
    await setDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${docId}`);
  }
}

// SKILLS SERVICE
export async function fetchSkills(): Promise<Skill[]> {
  const collectionName = 'skills';
  try {
    const local = localStorage.getItem('skills_list');
    if (!isConfigured) {
      if (local) return JSON.parse(local);
      return DEFAULT_SKILLS;
    }
    const q = query(collection(db, collectionName));
    const querySnapshot = await getDocs(q);
    const fetchedSkills: Skill[] = [];
    querySnapshot.forEach((doc) => {
      fetchedSkills.push({ id: doc.id, ...doc.data() } as Skill);
    });
    
    if (fetchedSkills.length > 0) {
      return fetchedSkills;
    }
    
    // Check localStorage
    if (local) return JSON.parse(local);
    return DEFAULT_SKILLS;
  } catch (error) {
    console.warn("Firestore fetchSkills error, using fallback data:", error);
    const local = localStorage.getItem('skills_list');
    if (local) return JSON.parse(local);
    return DEFAULT_SKILLS;
  }
}

export async function addSkill(skill: Omit<Skill, 'id'>): Promise<string> {
  const collectionName = 'skills';
  const data = {
    ...skill,
    createdAt: new Date().toISOString()
  };
  try {
    if (!isConfigured) {
      const tempId = `local_s_${Date.now()}`;
      const skills = await fetchSkills();
      localStorage.setItem('skills_list', JSON.stringify([...skills, { id: tempId, ...data }]));
      return tempId;
    }
    const docRef = await addDoc(collection(db, collectionName), data);
    
    // Sync to local for high-performance instant fallback
    const skills = await fetchSkills();
    const currentList = skills.filter(s => s.id !== "s1" && s.id !== "s2" && s.id !== "s3"); // Filter out static fallback if populated
    localStorage.setItem('skills_list', JSON.stringify([...currentList, { id: docRef.id, ...data }]));
    
    return docRef.id;
  } catch (error) {
    // Save to local anyway
    const tempId = `local_s_${Date.now()}`;
    const skills = await fetchSkills();
    localStorage.setItem('skills_list', JSON.stringify([...skills, { id: tempId, ...data }]));
    handleFirestoreError(error, OperationType.CREATE, collectionName);
    return tempId;
  }
}

export async function updateSkill(id: string, skill: Omit<Skill, 'id'>): Promise<void> {
  const collectionName = 'skills';
  const data = {
    ...skill,
    createdAt: skill.createdAt || new Date().toISOString()
  };
  try {
    const skills = await fetchSkills();
    const updatedList = skills.map(s => s.id === id ? { id, ...data } : s);
    localStorage.setItem('skills_list', JSON.stringify(updatedList));

    if (!isConfigured) {
      return;
    }

    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${id}`);
  }
}

export async function deleteSkill(id: string): Promise<void> {
  const collectionName = 'skills';
  try {
    const skills = await fetchSkills();
    localStorage.setItem('skills_list', JSON.stringify(skills.filter(s => s.id !== id)));

    if (!isConfigured) {
      return;
    }

    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
  }
}

// PROJECTS SERVICE
export async function fetchProjects(): Promise<Project[]> {
  const collectionName = 'projects';
  try {
    const local = localStorage.getItem('projects_list');
    if (!isConfigured) {
      if (local) return JSON.parse(local);
      return DEFAULT_PROJECTS;
    }
    const q = query(collection(db, collectionName));
    const querySnapshot = await getDocs(q);
    const fetchedProjects: Project[] = [];
    querySnapshot.forEach((doc) => {
      fetchedProjects.push({ id: doc.id, ...doc.data() } as Project);
    });
    
    if (fetchedProjects.length > 0) {
      return fetchedProjects;
    }
    
    if (local) return JSON.parse(local);
    return DEFAULT_PROJECTS;
  } catch (error) {
    console.warn("Firestore fetchProjects error, using fallback data:", error);
    const local = localStorage.getItem('projects_list');
    if (local) return JSON.parse(local);
    return DEFAULT_PROJECTS;
  }
}

export async function addProject(project: Omit<Project, 'id'>): Promise<string> {
  const collectionName = 'projects';
  const data = {
    ...project,
    createdAt: new Date().toISOString()
  };
  try {
    if (!isConfigured) {
      const tempId = `local_p_${Date.now()}`;
      const projects = await fetchProjects();
      localStorage.setItem('projects_list', JSON.stringify([...projects, { id: tempId, ...data }]));
      return tempId;
    }
    const docRef = await addDoc(collection(db, collectionName), data);
    
    const projects = await fetchProjects();
    localStorage.setItem('projects_list', JSON.stringify([...projects, { id: docRef.id, ...data }]));
    return docRef.id;
  } catch (error) {
    const tempId = `local_p_${Date.now()}`;
    const projects = await fetchProjects();
    localStorage.setItem('projects_list', JSON.stringify([...projects, { id: tempId, ...data }]));
    handleFirestoreError(error, OperationType.CREATE, collectionName);
    return tempId;
  }
}

export async function updateProject(id: string, project: Omit<Project, 'id'>): Promise<void> {
  const collectionName = 'projects';
  const data = {
    ...project,
    createdAt: project.createdAt || new Date().toISOString()
  };
  try {
    const projects = await fetchProjects();
    const updatedList = projects.map(p => p.id === id ? { id, ...data } : p);
    localStorage.setItem('projects_list', JSON.stringify(updatedList));

    if (!isConfigured) {
      return;
    }

    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${id}`);
  }
}

export async function deleteProject(id: string): Promise<void> {
  const collectionName = 'projects';
  try {
    const projects = await fetchProjects();
    localStorage.setItem('projects_list', JSON.stringify(projects.filter(p => p.id !== id)));

    if (!isConfigured) {
      return;
    }

    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
  }
}

// CONTACT SERVICE
export async function fetchContact(): Promise<Contact> {
  const collectionName = 'contacts';
  const docId = 'main';
  try {
    const local = localStorage.getItem('contact_main');
    if (!isConfigured) {
      if (local) return JSON.parse(local);
      return DEFAULT_CONTACT;
    }
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Contact;
    }
    if (local) return JSON.parse(local);
    return DEFAULT_CONTACT;
  } catch (error) {
    console.warn("Firestore fetchContact error, using fallback data:", error);
    const local = localStorage.getItem('contact_main');
    if (local) return JSON.parse(local);
    return DEFAULT_CONTACT;
  }
}

export async function saveContact(contact: Contact): Promise<void> {
  const collectionName = 'contacts';
  const docId = 'main';
  const data = {
    ...contact,
    updatedAt: new Date().toISOString()
  };
  try {
    localStorage.setItem('contact_main', JSON.stringify(data));
    if (!isConfigured) {
      return;
    }
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${docId}`);
  }
}

// STORAGE UPLOAD (With Base64 dynamic fallback when offline or Firebase Storage is unprovisioned)
export async function uploadImage(file: File, folder: string): Promise<string> {
  try {
    if (!isConfigured) {
      throw new Error("Firebase Storage is currently not configured");
    }
    const fileRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.warn("Storage upload failed, fallback to local base64:", error);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
