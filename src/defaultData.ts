import { Profile, Skill, Project, Contact } from './types';

export const DEFAULT_PROFILE: Profile = {
  name: "MAHFUZ R MASUM",
  title: "Lead Full-Stack & Cloud Engineer",
  bio: "I craft advanced web applications with an emphasis on flawless animation, secure backend systems, and beautiful typography. Specializing in high-performance React architectures, Node.js Microservices, and Cloud Native orchestrations.",
  cvUrl: "#",
  avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600",
  updatedAt: new Date().toISOString(),
  heroGreeting: "Hi, I'm MAHFUZ R MASUM",
  heroSubtitle: "Let's turn complex design specifications into elegant interactive digital artifacts. Check out my skills and projects below.",
  heroRoles: "Lead Full-Stack Engineer, Full Stack Master, Cloud Architect, UI Design Artisan",
  cvName: "MAHFUZ R MASUM",
  cvAddress: "Dhaka, Bangladesh",
  cvPhotoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600",
  cvEmail: "mahfujar003@gmail.com",
  cvPhone: "+880 1700 000000",
  cvTitle: "Lead Full-Stack & Cloud Engineer",
  cvEducation: "Bachelor of Science in Computer Science & Engineering - Prime University (2022-2026)\nDiploma in Computer Technology - Sylhet Polytechnic Institute (2018-2022)",
  cvExperience: "Senior Web Developer at Aura Soft Inc (2024 - Present)\n- Spearheaded scalable frontend application builds using React, Next.js, and Tailwind CSS.\n- Optimized full-stack endpoints leading to a 40% speed increment.\n\nSoftware Developer Intern at Chronos (2023 - 2024)\n- Developed rich, real-time widgets, persistent workspace calendars, and interactive user panels.",
  cvSkills: "TypeScript, React, Next.js, Node.js, Express, Go, Docker, Kubernetes, GCP, Firebase, Tailwind CSS, Framer Motion",
  cvDob: "25 October 2000",
  cvNationality: "Bangladeshi",
  cvGender: "Male",
  cvLanguages: "Bangla (Native), English (Professional)",
  cvObjective: "Professional and highly motivated Software Engineer with 3+ years of experience in full-stack web architecture, looking to deliver elegant, secure, and modern digital products while tackling intricate development challenges."
};

export const DEFAULT_SKILLS: Skill[] = [
  // Frontend
  { id: "s1", name: "React (Vite, Next.js)", category: "Frontend", percentage: 95, createdAt: new Date().toISOString() },
  { id: "s2", name: "TypeScript & Esbuild", category: "Frontend", percentage: 90, createdAt: new Date().toISOString() },
  { id: "s3", name: "Tailwind CSS & Framer Motion", category: "Frontend", percentage: 98, createdAt: new Date().toISOString() },
  // Backend
  { id: "s4", name: "Node.js (Express, NestJS)", category: "Backend", percentage: 88, createdAt: new Date().toISOString() },
  { id: "s5", name: "PostgreSQL & Redis", category: "Backend", percentage: 82, createdAt: new Date().toISOString() },
  { id: "s6", name: "Firebase (Firestore, Auth)", category: "Backend", percentage: 92, createdAt: new Date().toISOString() },
  // Cloud & DevOps
  { id: "s7", name: "Docker & Kubernetes", category: "Cloud & Tools", percentage: 80, createdAt: new Date().toISOString() },
  { id: "s8", name: "Google Cloud Platform (GCP)", category: "Cloud & Tools", percentage: 85, createdAt: new Date().toISOString() },
  { id: "s9", name: "Vercel & CI/CD Pipelines", category: "Cloud & Tools", percentage: 90, createdAt: new Date().toISOString() }
];

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: "p1",
    title: "Quantum AI Dashboard",
    description: "An interactive, ultra-realistic analytics workspace showcasing live AI model streaming, resource telemetry grids, and complex data visualizers built with d3.js.",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
    liveUrl: "https://example.com/quantum-ai",
    githubUrl: "https://github.com/example/quantum-ai",
    createdAt: new Date().toISOString()
  },
  {
    id: "p2",
    title: "Aura Decentrilized Exchange",
    description: "A secure, peer-to-peer digital assets checkout and transaction platform featuring animated chart matrices, responsive token swaps, and localized dark modes.",
    imageUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=800",
    liveUrl: "https://example.com/aura-dex",
    githubUrl: "https://github.com/example/aura-dex",
    createdAt: new Date().toISOString()
  },
  {
    id: "p3",
    title: "Chronos Task Matrix",
    description: "A modern timeline-driven productivity planner that implements micro-state persistence, offline synchronization, and responsive calendar drawers.",
    imageUrl: "https://images.unsplash.com/photo-1540350394557-8d14678e7f91?auto=format&fit=crop&q=80&w=800",
    liveUrl: "https://example.com/chronos",
    githubUrl: "https://github.com/example/chronos",
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_CONTACT: Contact = {
  email: "mahfujar003@gmail.com",
  phone: "+1 (555) 124-3450",
  address: "San Francisco, CA, USA",
  github: "https://github.com/mahfujar003",
  linkedin: "https://linkedin.com/in/mahfujar003",
  twitter: "https://twitter.com/mahfujar003",
  updatedAt: new Date().toISOString()
};
