export interface Profile {
  id?: string;
  name: string;
  title: string;
  bio: string;
  cvUrl: string;
  avatarUrl: string;
  updatedAt: string;
  heroGreeting?: string;
  heroSubtitle?: string;
  heroRoles?: string;
  cvName?: string;
  cvAddress?: string;
  cvPhotoUrl?: string;
  cvEmail?: string;
  cvPhone?: string;
  cvTitle?: string;
  cvEducation?: string;
  cvExperience?: string;
  cvSkills?: string;
}

export interface Skill {
  id?: string;
  name: string;
  category: string;
  percentage: number;
  createdAt: string;
}

export interface Project {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  liveUrl: string;
  githubUrl: string;
  createdAt: string;
}

export interface Contact {
  id?: string;
  email: string;
  phone: string;
  address: string;
  github: string;
  linkedin: string;
  twitter: string;
  updatedAt: string;
}
