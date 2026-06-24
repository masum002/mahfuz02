import { Profile, Skill, Project, Contact, PhotographyItem } from './types';

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
  cvObjective: "Professional and highly motivated Software Engineer with 3+ years of experience in full-stack web architecture, looking to deliver elegant, secure, and modern digital products while tackling intricate development challenges.",
  aboutDetailText: "হ্যালো, আমি মাহফুজ আর মাসুম (MAHFUZ R MASUM)। একজন প্যাশনেট এবং সার্টিফাইড Lead Full-Stack & Cloud Engineer। আমি বিগত কয়েক বছর ধরে রিয়্যাক্ট (React), টাইপস্ক্রিপ্ট (TypeScript), নোড জেএস (Node.js) এবং ক্লাউড কম্পিউটিং টেকনোলজি নিয়ে কাজ করছি।\n\nআমার মূল লক্ষ্য হলো যেকোনো জটিল বিজনেস রিকোয়ারমেন্টস এবং আর্কিটেকচারকে একটি দৃষ্টিনন্দন, অত্যন্ত দ্রুতগতিসম্পন্ন এবং স্কেলেবল ডিজিটাল অ্যাপ্লিকেশনে রূপান্তর করা। আমি প্রতিনিয়ত আধুনিক ওয়েব ট্রেন্ডস এবং সিকিউরিটি স্ট্যান্ডার্ডস অনুসরণ করে কোড লিখে থাকি।\n\nআমার কাজের অভিজ্ঞতা শুধু ফ্রন্টএন্ড ডিজাইনেই সীমাবদ্ধ নয়, বরং নোড জেএস মাইক্রোসার্ভিসেস, ক্লাউড নেটিভ ডেপ্লয়মেন্টস (GCP, Docker, Kubernetes) এবং সিকিউর ডেটাবেস অপ্টিমাইজেশন নিয়েও আমি সমানভাবে কাজ করি। প্রতিটি প্রজেক্টে পিক্সেল-পারফেক্ট ইউজার এক্সপেরিয়েন্স এবং ফ্ললেস অ্যানিমেশন যুক্ত করতে আমি দারুণ ভালোবাসি।",
  aboutImages: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600,https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600,https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600"
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
    details: "Quantum AI Dashboard is a comprehensive analytics command center designed to monitor neural network model training in real-time. Built using React, Tailwind CSS, and d3.js, it features interactive node-link diagrams of active transformer layers, dynamic epoch-by-epoch loss charts, GPU/CPU thermals, memory usage gauges, and automated alerts for training anomalies. It is optimized for high-frequency web data streams with lazy render structures to ensure smooth 60fps operation.",
    createdAt: new Date().toISOString()
  },
  {
    id: "p2",
    title: "Aura Decentrilized Exchange",
    description: "A secure, peer-to-peer digital assets checkout and transaction platform featuring animated chart matrices, responsive token swaps, and localized dark modes.",
    imageUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=800",
    liveUrl: "https://example.com/aura-dex",
    githubUrl: "https://github.com/example/aura-dex",
    details: "Aura DEX is a fully responsive decentralized trading prototype highlighting exceptional user interfaces and complex Web3 state flows. Key highlights include live price feed graphs built with Recharts, interactive token selection lists, automatic gas fee calculators, transaction speed settings, and realistic swap animations. Designed to mimic production platforms like Uniswap with enhanced accessibility controls.",
    createdAt: new Date().toISOString()
  },
  {
    id: "p3",
    title: "Chronos Task Manager",
    description: "A modern timeline-driven productivity planner that implements micro-state persistence, offline synchronization, and responsive calendar drawers.",
    imageUrl: "https://images.unsplash.com/photo-1540350394557-8d14678e7f91?auto=format&fit=crop&q=80&w=800",
    liveUrl: "https://example.com/chronos",
    githubUrl: "https://github.com/example/chronos",
    details: "Chronos Task Manager is a sleek planning ecosystem aimed at reducing cognitive load. It features an fluid drag-and-drop kanban board, dynamic timeline views, task prioritization categories, customizable notification tones, and automatic data persistence using browser storage. Integrated with elegant micro-interactions using Framer Motion to make daily planning highly tactile and satisfying.",
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

export const DEFAULT_PHOTOGRAPHY: PhotographyItem[] = [
  {
    id: "ph1",
    title: "Celestial Nomad",
    description: "A silhouette of a lone wanderer framed against the stunning brilliance of the Milky Way, capturing the vast, breathtaking solitude of the cosmos.",
    imageUrl: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&q=80&w=1200",
    cameraSettings: "f/1.8 | 15s | ISO 3200 | 24mm",
    location: "Sajek Valley, Bangladesh",
    articleContent: "মাঝরাতে সাজেক ভ্যালির মেঘহীন আকাশে যখন কোটি কোটি তারা জ্বলে ওঠে, তখন সেই মহাজাগতিক সৌন্দর্য ক্যামেরাবন্দী করার মজাই আলাদা। গ্যালাক্সি বা মিল্কি ওয়ে ফটোগ্রাফির জন্য সঠিক ক্যামেরা সেটিংস এবং ধৈর্য সবচেয়ে গুরুত্বপূর্ণ উপাদান।\n\nকিভাবে এই ছবিটি তোলা হয়েছে (ক্যামেরা ট্রিপস ও টেকনিক):\n১. ম্যানুয়াল মোড এবং ফোকাস: রাতে ক্যামেরার অটোফোকাস কাজ করে না। তাই লেন্সের ফোকাস মোড ম্যানুয়াল (M) করে দূরবর্তী একটি উজ্জ্বল তারার উপর ফোকাস স্থির করতে হবে।\n২. অ্যাপারচার (Aperture): আপনার লেন্সের সর্বনিম্ন অ্যাপারচার ব্যবহার করুন (যেমন f/1.8 বা f/2.8) যাতে সেন্সরে সর্বোচ্চ পরিমাণ আলো প্রবেশ করতে পারে।\n৩. শাটার স্পীড (Shutter Speed): তারার গতিশীলতার কারণে ছবি যেন ব্লার বা ট্রেইল না হয়ে যায় সেজন্য ৫০০ রুল (500 Rule) ব্যবহার করা ভালো। ২৪ মিমি লেন্সের জন্য ১৫ সেকেন্ডের শাটার স্পীড একদম উপযুক্ত।\n৪. আইএসও (ISO): রাতের অন্ধকারের ডিটেইলস ফুটিয়ে তুলতে আইএসও ৩২০০ নির্ধারণ করা হয়েছে। তবে বেশি নয়েজ এড়াতে হাই-কোয়ালিটি সেন্সর ব্যবহার করা জরুরি।\n\nএসইও টিপস: সাজেক ভ্যালিতে মিল্কিওয়ে বা গ্যালাক্সি ফটোগ্রাফির জন্য বর্ষাকালের শেষভাগ থেকে শীতকালের শুরু পর্যন্ত সময়কাল সেরা। সবসময় একটি মজবুত ট্রাইপড এবং দূরবর্তী রিমোট শাটার রিলিজ ব্যবহার করুন যেন সামান্যতম কম্পনেও ছবি নষ্ট না হয়।",
    createdAt: new Date().toISOString()
  },
  {
    id: "ph2",
    title: "Urban Specter",
    description: "Moody long exposure of neon-glowing downtown speed trails piercing through a rainy midnight fog, showing concrete verticality.",
    imageUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=1200",
    cameraSettings: "f/8.0 | 4s | ISO 100 | 50mm",
    location: "Dhaka Metropolis, BD",
    articleContent: "বৃষ্টিভেজা ঢাকার ব্যস্ততম ফ্লাইওভার কিংবা ইন্টারসেকশনগুলো রাতের বেলা এক অনন্য রূপ নেয়। নিয়ন আলোর প্রতিফলন আর গাড়ির হেডলাইটের আলোর দীর্ঘ রেখা (Light Trails) ক্যামেরায় ধারণ করার জন্য লং এক্সপোজার টেকনিক অসাধারণ কাজ করে।\n\nক্যামেরা সেটিংস এবং মাস্টারক্লাস গাইড:\n১. কম আইএসও (Low ISO): লং এক্সপোজার ফটোগ্রাফিতে আলো বেশি সময় ধরে সেন্সরে ঢোকে, তাই আইএসও সবসময় সর্বনিম্ন (ISO 100) রাখা উচিত যাতে ছবিতে কোনো গ্রেইন বা ডিজিটাল নয়েজ না থাকে।\n২. ন্যারো অ্যাপারচার (Narrow Aperture): অ্যাপারচার f/8 থেকে f/11 এর মধ্যে রাখলে স্ট্রিট লাইটগুলোতে সুন্দর স্টার্স্ট (Starburst) ইফেক্ট তৈরি হয় এবং পুরো ফ্রেমটি পিক্সেল-শার্প থাকে।\n৩. শাটার স্পীড (Shutter Speed): ৪ সেকেন্ডের শাটার স্পীড গাড়ির ট্রেইলগুলোকে মসৃণ এবং দীর্ঘ করতে সাহায্য করে।\n\nশহুরে রাতের ছবি তোলার সময় ভেজা রাস্তার কাছাকাছি লো-অ্যাঙ্গেল ট্রাইপড সেটআপ চমৎকার রিফ্লেকশন দেয়। বৃষ্টির পানি থেকে ক্যামেরা সুরক্ষার জন্য রেইন কভার ব্যবহার করতে ভুলবেন না।",
    createdAt: new Date().toISOString()
  },
  {
    id: "ph3",
    title: "Ethereal Mist",
    description: "Serene morning light filtering through ancient, mossy alpine trees as dense fog rolls down the valley ridge, whispering soft, timeless secrets.",
    imageUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=1200",
    cameraSettings: "f/4.0 | 1/160s | ISO 200 | 70mm",
    location: "Sreemangal Tea Forests, BD",
    articleContent: "শ্রীমঙ্গলের ঘন কুয়াশাচ্ছন্ন চা বাগান এবং বনাঞ্চলগুলোতে সকালের মৃদু আলো যখন কুয়াশা ভেদ করে আসে, তখন এক অপার্থিব পরিবেশের সৃষ্টি হয়। ল্যান্ডস্কেপ ফটোগ্রাফিতে কুয়াশার নরম আলো এবং রহস্যময় মুড ফুটিয়ে তুলতে ডাইনামিক রেঞ্জের সঠিক ব্যবহার আবশ্যক।\n\nকিভাবে আলোর ভারসাম্য বজায় রাখবেন:\n১. এক্সপোজার কমপেনসেশন (Exposure Compensation): ঘন কুয়াশা বা সাদা বরফের ছবি তোলার সময় ক্যামেরার মিটারিং সিস্টেম কনফিউজড হয়ে ছবি অন্ধকার করে ফেলে। তাই এক্সপোজার +0.3 বা +0.7 বাড়িয়ে নেওয়া ভালো।\n২. মিড-টেলিপোটো লেন্স (70mm): ৭০ মিমি বা তার বেশি ফোকাল লেংথ ব্যবহার করলে কুয়াশার স্তরগুলো সংকুচিত (Compressed) দেখায়, যা গভীরতার এক চাক্ষুষ অনুভূতি তৈরি করে।\n৩. হোয়াইট ব্যালেন্স (White Balance): কুয়াশার শীতল ও নীলাভ ভাব ধরে রাখতে 'Cloudy' বা 'Shade' মোডের পরিবর্তে কেভিন স্কেলে ৫০০০K-৫৫০০K মান নির্ধারণ করা হয়েছে।\n\nপ্রকৃতির শান্ত রূপ ফ্রেমবন্দী করতে কুয়াশা কেটে যাওয়ার ঠিক আগের মুহূর্তে গোল্ডেন আওয়ারের প্রথম আলোর জন্য অপেক্ষা করুন।",
    createdAt: new Date().toISOString()
  },
  {
    id: "ph4",
    title: "Neon Cyberpunk Gate",
    description: "Techno-futurism captured in high-contrast neon illumination bouncing off wet asphalt alleys on a quiet Tokyo-style rainy evening.",
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1200",
    cameraSettings: "f/2.0 | 1/125s | ISO 800 | 35mm",
    location: "Shibuya Terminal, JP",
    articleContent: "সাইবারপাংক বা নিও-নয়ার স্ট্রিট ফটোগ্রাফির মূল চাবিকাঠি হলো উচ্চ বৈপরীত্য (High Contrast) এবং সম্পৃক্ত রঙের খেলা। বৃষ্টির দিনে শহরের গলিপথগুলোতে নিয়ন সাইনবোর্ডের প্রতিফলন এই মুড ফুটিয়ে তোলার জন্য আদর্শ।\n\nটেকনিক্যাল ব্রেকডাউন:\n১. ওয়াইড অ্যাপারচার (f/2.0): কম আলোতে হ্যান্ডহেল্ড শুট করার জন্য ওয়াইড অ্যাপারচার দরকার, যা ব্যাকগ্রাউন্ডকে চমৎকার বোকেহ (Bokeh) ইফেক্ট দেয়।\n২. শাটার স্পীড (1/125s): পথচারীদের গতিকে স্থির (Freeze) করতে এবং একই সাথে ক্যামেরার কাঁপন এড়াতে ১/১২৫ সেকেন্ড বা তার চেয়ে দ্রুত শাটার স্পীড ব্যবহার করা হয়েছে।\n৩. কালার গ্রেডিং টিপস: পোস্ট-প্রসেসিংয়ের সময় শ্যাডোতে সায়ান/ব্লু এবং হাইলাইটে ম্যাজেন্টা/অরেঞ্জ টোন যুক্ত করলে নিখুঁত সাইবারপাংক থিম ফুটে ওঠে।\n\nনিওন স্ট্রিট লাইফ ক্যাপচার করার সময় সর্বদা আরজিবি (RGB) হিস্টোগ্রাম চেক করুন যেন নিয়ন আলোর লাল বা নীল চ্যানেলগুলো অতিরিক্ত ব্রাইটনেসের কারণে ফেটে না যায়।",
    createdAt: new Date().toISOString()
  }
];
