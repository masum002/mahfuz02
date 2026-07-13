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
  cvDob?: string;
  cvNationality?: string;
  cvGender?: string;
  cvLanguages?: string;
  cvObjective?: string;
  cvSignatureUrl?: string;
  aboutDetailText?: string;
  aboutImages?: string;
  aboutYearsExp?: string;
  aboutProjectsDone?: string;
  aboutSuccessRate?: string;
  aboutHighlight1Title?: string;
  aboutHighlight1Desc?: string;
  aboutHighlight2Title?: string;
  aboutHighlight2Desc?: string;
  aboutAcademicEn?: string;
  aboutAcademicBn?: string;
  aboutAcademicMetrics?: string;
  aboutSpecFront?: string;
  aboutSpecBack?: string;
  aboutSpecCloud?: string;
  aboutVisionsEn?: string;
  aboutVisionsBn?: string;
  aboutVisionsList?: string;
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
  details?: string;
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
  facebook?: string;
  updatedAt: string;
  heading?: string;
  subtitle?: string;
  availability?: string;
  responseTime?: string;
  whatsapp?: string;
  telegram?: string;
}

export interface PhotographyItem {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  cameraSettings?: string; // e.g. "f/1.8 | 1/250s | ISO 100"
  location?: string; // e.g. "Sylhet, Bangladesh"
  articleContent?: string; // SEO Optimized photography article content
  createdAt: string;
}
