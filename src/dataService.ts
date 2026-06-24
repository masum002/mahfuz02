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
import { Profile, Skill, Project, Contact, PhotographyItem } from './types';
import { 
  DEFAULT_PROFILE, 
  DEFAULT_SKILLS, 
  DEFAULT_PROJECTS, 
  DEFAULT_CONTACT,
  DEFAULT_PHOTOGRAPHY
} from './defaultData';

// Helper to check if Firebase is configured with real credentials (not placeholders)
export function isFirebaseConfigured(): boolean {
  return isConfigured;
}

// Helper to wrap a promise with a timeout to keep the UI responsive
function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 3000, label: string = 'Firebase Operation'): Promise<T> {
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Timeout: ${label} exceeded ${timeoutMs}ms limit.`));
    }, timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
}

// PROFILE SERVICE
export async function fetchProfile(): Promise<Profile> {
  const collectionName = 'profile';
  const docId = 'main';
  try {
    if (!isConfigured) {
      return DEFAULT_PROFILE;
    }
    const docRef = doc(db, collectionName, docId);
    const docSnap = await withTimeout(getDoc(docRef), 3000, "fetchProfile");
    if (docSnap.exists()) {
      return docSnap.data() as Profile;
    }
    return DEFAULT_PROFILE;
  } catch (error) {
    console.warn("Firestore fetchProfile error, falling back to static default:", error);
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
    if (!isConfigured) {
      console.warn("Firebase not configured. Cannot save profile.");
      return;
    }
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${docId}`);
  }
}

// SKILLS SERVICE
export async function fetchSkills(): Promise<Skill[]> {
  const collectionName = 'skills';
  try {
    if (!isConfigured) {
      return DEFAULT_SKILLS;
    }
    const q = query(collection(db, collectionName));
    const querySnapshot = await withTimeout(getDocs(q), 3000, "fetchSkills");
    const fetchedSkills: Skill[] = [];
    querySnapshot.forEach((doc) => {
      fetchedSkills.push({ id: doc.id, ...doc.data() } as Skill);
    });
    
    if (fetchedSkills.length > 0) {
      return fetchedSkills;
    }
    const seeded = await isDatabaseSeeded();
    if (seeded) {
      return [];
    }
    return DEFAULT_SKILLS;
  } catch (error) {
    console.warn("Firestore fetchSkills error, falling back to static default:", error);
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
      throw new Error("Firebase not configured. Cannot add skill.");
    }
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionName);
    throw error;
  }
}

export async function updateSkill(id: string, skill: Omit<Skill, 'id'>): Promise<void> {
  const collectionName = 'skills';
  const data = {
    ...skill,
    createdAt: skill.createdAt || new Date().toISOString()
  };
  try {
    if (!isConfigured) {
      throw new Error("Firebase not configured. Cannot update skill.");
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
    if (!isConfigured) {
      throw new Error("Firebase not configured. Cannot delete skill.");
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
    if (!isConfigured) {
      return DEFAULT_PROJECTS;
    }
    const q = query(collection(db, collectionName));
    const querySnapshot = await withTimeout(getDocs(q), 3000, "fetchProjects");
    const fetchedProjects: Project[] = [];
    querySnapshot.forEach((doc) => {
      fetchedProjects.push({ id: doc.id, ...doc.data() } as Project);
    });
    
    if (fetchedProjects.length > 0) {
      return fetchedProjects;
    }
    const seeded = await isDatabaseSeeded();
    if (seeded) {
      return [];
    }
    return DEFAULT_PROJECTS;
  } catch (error) {
    console.warn("Firestore fetchProjects error, falling back to static default:", error);
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
      throw new Error("Firebase not configured. Cannot add project.");
    }
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionName);
    throw error;
  }
}

export async function updateProject(id: string, project: Omit<Project, 'id'>): Promise<void> {
  const collectionName = 'projects';
  const data = {
    ...project,
    createdAt: project.createdAt || new Date().toISOString()
  };
  try {
    if (!isConfigured) {
      throw new Error("Firebase not configured. Cannot update project.");
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
    if (!isConfigured) {
      throw new Error("Firebase not configured. Cannot delete project.");
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
    if (!isConfigured) {
      return DEFAULT_CONTACT;
    }
    const docRef = doc(db, collectionName, docId);
    const docSnap = await withTimeout(getDoc(docRef), 3000, "fetchContact");
    if (docSnap.exists()) {
      return docSnap.data() as Contact;
    }
    return DEFAULT_CONTACT;
  } catch (error) {
    console.warn("Firestore fetchContact error, falling back to static default:", error);
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
    if (!isConfigured) {
      console.warn("Firebase not configured. Cannot save contact.");
      return;
    }
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${docId}`);
  }
}

// STORAGE UPLOAD (With Base64 fallbacks when Storage is unprovisioned)
export async function uploadImage(file: File, folder: string): Promise<string> {
  try {
    if (!isConfigured) {
      throw new Error("Firebase Storage is currently not configured");
    }
    const fileRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.warn("Storage upload failed, falling back to local base64 preview:", error);
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

// PHOTOGRAPHY SERVICE
export async function fetchPhotographyItems(): Promise<PhotographyItem[]> {
  const collectionName = 'photography';
  try {
    if (!isConfigured) {
      return DEFAULT_PHOTOGRAPHY;
    }
    const q = query(collection(db, collectionName));
    const querySnapshot = await withTimeout(getDocs(q), 3000, "fetchPhotographyItems");
    const fetchedItems: PhotographyItem[] = [];
    querySnapshot.forEach((doc) => {
      fetchedItems.push({ id: doc.id, ...doc.data() } as PhotographyItem);
    });
    
    if (fetchedItems.length > 0) {
      return fetchedItems.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    const seeded = await isDatabaseSeeded();
    if (seeded) {
      return [];
    }
    return DEFAULT_PHOTOGRAPHY;
  } catch (error) {
    console.warn("Firestore fetchPhotographyItems error, falling back to static default:", error);
    return DEFAULT_PHOTOGRAPHY;
  }
}

export async function addPhotographyItem(item: Omit<PhotographyItem, 'id'>): Promise<string> {
  const collectionName = 'photography';
  const data = {
    ...item,
    createdAt: new Date().toISOString()
  };
  try {
    if (!isConfigured) {
      throw new Error("Firebase not configured. Cannot add photography item.");
    }
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionName);
    throw error;
  }
}

export async function updatePhotographyItem(id: string, item: Omit<PhotographyItem, 'id'>): Promise<void> {
  const collectionName = 'photography';
  const data = {
    ...item,
    createdAt: item.createdAt || new Date().toISOString()
  };
  try {
    if (!isConfigured) {
      throw new Error("Firebase not configured. Cannot update photography item.");
    }
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${id}`);
  }
}

export async function deletePhotographyItem(id: string): Promise<void> {
  const collectionName = 'photography';
  try {
    if (!isConfigured) {
      throw new Error("Firebase not configured. Cannot delete photography item.");
    }
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
  }
}

// DATABASE AUTO-SEEDING HELPERS FOR CLOUD SYNC
let isSeedingCompleted = false;

export async function isDatabaseSeeded(): Promise<boolean> {
  if (!isConfigured) return false;
  if (isSeedingCompleted) return true;
  
  const projectId = db.app.options.projectId || 'unknown_project';
  const projectSpecificKey = `portfolio_seeded_${projectId}`;

  try {
    const docRef = doc(db, 'metadata', 'seeded');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data()?.seeded === true) {
      isSeedingCompleted = true;
      localStorage.setItem(projectSpecificKey, 'true');
      return true;
    }
  } catch (error) {
    console.warn("Error checking seeded state from Firestore:", error);
  }

  if (localStorage.getItem(projectSpecificKey) === 'true') {
    isSeedingCompleted = true;
    return true;
  }
  return false;
}

export async function seedDatabase(): Promise<void> {
  if (!isConfigured) return;
  const seeded = await isDatabaseSeeded();
  if (seeded) return;

  const projectId = db.app.options.projectId || 'unknown_project';
  const projectSpecificKey = `portfolio_seeded_${projectId}`;

  try {
    console.log("Seeding Firestore database with default portfolio data...");
    
    // 1. Profile document
    const profileRef = doc(db, 'profile', 'main');
    await setDoc(profileRef, DEFAULT_PROFILE);

    // 2. Contacts document
    const contactRef = doc(db, 'contacts', 'main');
    await setDoc(contactRef, DEFAULT_CONTACT);

    // 3. Skills documents
    const skillsCollection = collection(db, 'skills');
    for (const skill of DEFAULT_SKILLS) {
      const { id, ...skillData } = skill;
      if (id) {
        await setDoc(doc(skillsCollection, id), skillData);
      } else {
        await addDoc(skillsCollection, skillData);
      }
    }

    // 4. Projects documents
    const projectsCollection = collection(db, 'projects');
    for (const project of DEFAULT_PROJECTS) {
      const { id, ...projectData } = project;
      if (id) {
        await setDoc(doc(projectsCollection, id), projectData);
      } else {
        await addDoc(projectsCollection, projectData);
      }
    }

    // 5. Photography items
    const photographyCollection = collection(db, 'photography');
    for (const item of DEFAULT_PHOTOGRAPHY) {
      const { id, ...itemData } = item;
      if (id) {
        await setDoc(doc(photographyCollection, id), itemData);
      } else {
        await addDoc(photographyCollection, itemData);
      }
    }

    // 6. Write seed verification flag doc
    const seedFlagRef = doc(db, 'metadata', 'seeded');
    await setDoc(seedFlagRef, { seeded: true, timestamp: new Date().toISOString() });
    
    isSeedingCompleted = true;
    localStorage.setItem(projectSpecificKey, 'true');
    console.log("Firestore database seeding successfully completed.");
  } catch (error) {
    console.error("Firestore database seeding failed:", error);
  }
}

