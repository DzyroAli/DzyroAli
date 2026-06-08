export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar: string;
  bio: string;
  website?: string;
  twitter?: string;
  github?: string;
  role: 'admin' | 'creator' | 'user';
  createdAt: string;
  followersCount: number;
  followingCount: number;
  productsCount: number;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail: string;
  websiteUrl: string;
  githubUrl?: string;
  appStoreUrl?: string;
  playStoreUrl?: string;
  maker: User;
  makers: User[];
  votesCount: number;
  commentsCount: number;
  viewsCount: number;
  createdAt: string;
  featured: boolean;
  status: 'pending' | 'approved' | 'rejected';
  hasVoted?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  productId: string;
  parentId?: string;
  replies?: Comment[];
  likesCount: number;
  createdAt: string;
  hasLiked?: boolean;
}

const avatarColors = [
  'bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
  'bg-red-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
];

export function getAvatarColor(name: string): string {
  const index = name.charCodeAt(0) % avatarColors.length;
  return avatarColors[index];
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alisher Nazarov', email: 'admin@platform.uz', username: 'alisher_n', avatar: '', bio: 'Founder & CEO of ProductHunt UZ. Building the future of Uzbekistan tech.', website: 'https://alisher.uz', twitter: '@alisher_n', github: 'alisher_n', role: 'admin', createdAt: '2023-01-15', followersCount: 1240, followingCount: 89, productsCount: 12 },
  { id: 'u2', name: 'Dilnoza Karimova', email: 'creator@platform.uz', username: 'dilnoza_k', avatar: '', bio: 'Full-stack developer & startup founder. I build tools that matter.', website: 'https://dilnoza.dev', twitter: '@dilnoza_k', github: 'dilnoza_k', role: 'creator', createdAt: '2023-02-20', followersCount: 856, followingCount: 134, productsCount: 8 },
  { id: 'u3', name: 'Bobur Toshmatov', email: 'user@platform.uz', username: 'bobur_t', avatar: '', bio: 'Designer & maker. Passionate about UX and beautiful interfaces.', website: '', twitter: '@bobur_t', github: 'bobur_t', role: 'user', createdAt: '2023-03-10', followersCount: 423, followingCount: 267, productsCount: 5 },
  { id: 'u4', name: 'Feruza Yusupova', email: 'feruza@platform.uz', username: 'feruza_y', avatar: '', bio: 'Product manager at a fintech startup. Love data and user research.', role: 'user', createdAt: '2023-04-05', followersCount: 312, followingCount: 198, productsCount: 3 },
  { id: 'u5', name: 'Jasur Mirzayev', email: 'jasur@platform.uz', username: 'jasur_m', avatar: '', bio: 'Mobile developer. Flutter & React Native enthusiast.', role: 'creator', createdAt: '2023-05-12', followersCount: 678, followingCount: 145, productsCount: 7 },
  { id: 'u6', name: 'Nilufar Rashidova', email: 'nilufar@platform.uz', username: 'nilufar_r', avatar: '', bio: 'AI/ML engineer building smart solutions for Uzbekistan.', role: 'creator', createdAt: '2023-06-01', followersCount: 934, followingCount: 211, productsCount: 6 },
  { id: 'u7', name: 'Sherzod Hamidov', email: 'sherzod@platform.uz', username: 'sherzod_h', avatar: '', bio: 'Entrepreneur & investor. Building ecosystem for UZ startups.', role: 'user', createdAt: '2023-07-18', followersCount: 1567, followingCount: 432, productsCount: 4 },
  { id: 'u8', name: 'Kamola Ergasheva', email: 'kamola@platform.uz', username: 'kamola_e', avatar: '', bio: 'DevOps engineer. Cloud, Kubernetes, and open source advocate.', role: 'creator', createdAt: '2023-08-22', followersCount: 287, followingCount: 156, productsCount: 2 },
  { id: 'u9', name: 'Ulugbek Sotvoldiyev', email: 'ulugbek@platform.uz', username: 'ulugbek_s', avatar: '', bio: 'Backend engineer. Node.js, Go, and PostgreSQL enthusiast.', role: 'creator', createdAt: '2023-09-14', followersCount: 445, followingCount: 178, productsCount: 9 },
  { id: 'u10', name: 'Ozoda Mirzayeva', email: 'ozoda@platform.uz', username: 'ozoda_m', avatar: '', bio: 'Growth hacker & marketing expert for tech startups.', role: 'user', createdAt: '2023-10-03', followersCount: 723, followingCount: 312, productsCount: 1 },
  { id: 'u11', name: 'Ravshan Umarov', email: 'ravshan@platform.uz', username: 'ravshan_u', avatar: '', bio: 'React & TypeScript developer. Building web apps since 2018.', role: 'creator', createdAt: '2023-11-08', followersCount: 389, followingCount: 201, productsCount: 5 },
  { id: 'u12', name: 'Munira Hasanova', email: 'munira@platform.uz', username: 'munira_h', avatar: '', bio: 'UX designer. Human-centered design advocate.', role: 'creator', createdAt: '2023-12-01', followersCount: 512, followingCount: 167, productsCount: 4 },
];

export const CATEGORIES = [
  'All', 'SaaS', 'Mobile', 'AI/ML', 'Fintech', 'EdTech', 'E-commerce',
  'Productivity', 'Design', 'Developer Tools', 'Health', 'Social', 'Gaming'
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1', name: 'PaymeUZ', tagline: "Uzbekistan's fastest mobile payment solution",
    description: 'PaymeUZ is a comprehensive mobile payment platform designed specifically for Uzbekistan. It supports all major banks, offers instant transfers, QR code payments, and detailed analytics for businesses. With 2FA security and biometric login, it is the most secure payment app in the region.',
    category: 'Fintech', tags: ['payments', 'mobile', 'banking', 'fintech'],
    thumbnail: '', websiteUrl: 'https://payme.uz', maker: MOCK_USERS[1], makers: [MOCK_USERS[1], MOCK_USERS[4]],
    votesCount: 847, commentsCount: 43, viewsCount: 12400, createdAt: '2024-01-10', featured: true, status: 'approved'
  },
  {
    id: 'p2', name: 'TaximUZ', tagline: 'Smart ride-hailing for Uzbek cities',
    description: 'TaximUZ revolutionizes urban transportation in Uzbekistan. With real-time tracking, female-only drivers option, scheduled rides, and integration with public transport, it offers a complete mobility solution. The app works in all major Uzbek cities including Tashkent, Samarkand, and Bukhara.',
    category: 'Mobile', tags: ['transport', 'mobile', 'maps', 'ridesharing'],
    thumbnail: '', websiteUrl: 'https://taxim.uz', maker: MOCK_USERS[4], makers: [MOCK_USERS[4]],
    votesCount: 634, commentsCount: 28, viewsCount: 9800, createdAt: '2024-01-15', featured: true, status: 'approved'
  },
  {
    id: 'p3', name: 'EduPath', tagline: 'AI-powered learning platform for Uzbek students',
    description: 'EduPath uses artificial intelligence to create personalized learning paths for students from grade 1 to university. It covers all subjects in Uzbek, Russian, and English. The platform gamifies learning with achievements, leaderboards, and real-time feedback. Teachers can track student progress with detailed analytics.',
    category: 'EdTech', tags: ['education', 'ai', 'students', 'uzbek'],
    thumbnail: '', websiteUrl: 'https://edupath.uz', maker: MOCK_USERS[5], makers: [MOCK_USERS[5], MOCK_USERS[11]],
    votesCount: 923, commentsCount: 67, viewsCount: 18200, createdAt: '2024-01-20', featured: true, status: 'approved'
  },
  {
    id: 'p4', name: 'Uzum Market', tagline: 'The Amazon of Uzbekistan',
    description: 'Uzum Market is Uzbekistan\'s largest e-commerce platform. It connects local manufacturers, retailers, and individual sellers with millions of buyers. Features include same-day delivery in Tashkent, installment payments, seller analytics, and a robust review system. The platform supports 50,000+ products across all categories.',
    category: 'E-commerce', tags: ['ecommerce', 'shopping', 'marketplace', 'delivery'],
    thumbnail: '', websiteUrl: 'https://uzum.uz', maker: MOCK_USERS[6], makers: [MOCK_USERS[6]],
    votesCount: 1256, commentsCount: 89, viewsCount: 34500, createdAt: '2024-01-25', featured: true, status: 'approved'
  },
  {
    id: 'p5', name: 'CodeUZ', tagline: 'Learn programming the Uzbek way',
    description: 'CodeUZ is an interactive coding platform with courses in Uzbek language. It covers Python, JavaScript, Web Development, Data Science, and Mobile Development. The platform has a built-in code editor, project-based learning, mentor matching, and a job board specifically for Uzbek developers.',
    category: 'EdTech', tags: ['coding', 'learning', 'programming', 'uzbek'],
    thumbnail: '', websiteUrl: 'https://codeuz.dev', maker: MOCK_USERS[8], makers: [MOCK_USERS[8], MOCK_USERS[10]],
    votesCount: 743, commentsCount: 52, viewsCount: 14300, createdAt: '2024-02-01', featured: false, status: 'approved'
  },
  {
    id: 'p6', name: 'GlobeTranslate', tagline: 'Neural translation engine for Uzbek language',
    description: 'GlobeTranslate provides state-of-the-art neural machine translation for Uzbek-English, Uzbek-Russian, and Uzbek-Turkish pairs. It supports documents, websites, and real-time translation. The API is used by 500+ apps and has processed over 1 billion words.',
    category: 'AI/ML', tags: ['translation', 'ai', 'nlp', 'uzbek'],
    thumbnail: '', websiteUrl: 'https://globe.uz', maker: MOCK_USERS[5], makers: [MOCK_USERS[5]],
    votesCount: 567, commentsCount: 34, viewsCount: 8900, createdAt: '2024-02-05', featured: false, status: 'approved'
  },
  {
    id: 'p7', name: 'Oshxona', tagline: 'Find and book the best restaurants in Uzbekistan',
    description: 'Oshxona is a restaurant discovery and reservation platform for Uzbekistan. Users can browse menus, read reviews, book tables, and even pre-order food. The platform features a unique dish recommendation engine based on Uzbek cuisine preferences and special event planning tools.',
    category: 'Mobile', tags: ['food', 'restaurants', 'booking', 'reviews'],
    thumbnail: '', websiteUrl: 'https://oshxona.uz', maker: MOCK_USERS[3], makers: [MOCK_USERS[3], MOCK_USERS[2]],
    votesCount: 489, commentsCount: 41, viewsCount: 7600, createdAt: '2024-02-10', featured: false, status: 'approved'
  },
  {
    id: 'p8', name: 'DevKit UZ', tagline: 'Essential developer tools for Uzbek developers',
    description: 'DevKit UZ is a suite of developer tools including an API tester, JSON formatter, regex tester, color picker, and code snippets library. All tools are free, fast, and work offline. The platform also has a community where developers share tips and resources.',
    category: 'Developer Tools', tags: ['tools', 'developer', 'api', 'productivity'],
    thumbnail: '', websiteUrl: 'https://devkit.uz', maker: MOCK_USERS[10], makers: [MOCK_USERS[10]],
    votesCount: 312, commentsCount: 19, viewsCount: 5400, createdAt: '2024-02-15', featured: false, status: 'approved'
  },
  {
    id: 'p9', name: 'HealthUZ', tagline: 'Your personal health assistant in Uzbek',
    description: 'HealthUZ connects patients with doctors across Uzbekistan. Book appointments, get video consultations, manage prescriptions, and access your medical history. The platform works with 200+ hospitals and clinics and supports all health insurance providers in Uzbekistan.',
    category: 'Health', tags: ['health', 'doctors', 'telemedicine', 'appointments'],
    thumbnail: '', websiteUrl: 'https://health.uz', maker: MOCK_USERS[9], makers: [MOCK_USERS[9], MOCK_USERS[3]],
    votesCount: 678, commentsCount: 45, viewsCount: 11200, createdAt: '2024-02-20', featured: false, status: 'approved'
  },
  {
    id: 'p10', name: 'AgriTech UZ', tagline: 'Smart farming technology for Uzbek farmers',
    description: 'AgriTech UZ provides IoT sensors, weather prediction, soil analysis, and market price data to help Uzbek farmers increase yields and profits. The mobile app works offline and supports Uzbek, Russian, and Karakalpak languages.',
    category: 'SaaS', tags: ['agriculture', 'iot', 'farming', 'technology'],
    thumbnail: '', websiteUrl: 'https://agritech.uz', maker: MOCK_USERS[7], makers: [MOCK_USERS[7]],
    votesCount: 423, commentsCount: 27, viewsCount: 6700, createdAt: '2024-02-25', featured: false, status: 'approved'
  },
  {
    id: 'p11', name: 'UzDesign', tagline: 'Figma-like design tool built for Uzbek designers',
    description: 'UzDesign is a web-based UI/UX design tool that includes a library of Uzbek design patterns, traditional ornaments, and typography. It supports real-time collaboration, prototype sharing, and CSS export.',
    category: 'Design', tags: ['design', 'ui', 'ux', 'figma', 'collaboration'],
    thumbnail: '', websiteUrl: 'https://uzdesign.uz', maker: MOCK_USERS[11], makers: [MOCK_USERS[11], MOCK_USERS[2]],
    votesCount: 534, commentsCount: 38, viewsCount: 8100, createdAt: '2024-03-01', featured: false, status: 'approved'
  },
  {
    id: 'p12', name: 'Notlar', tagline: 'Beautiful note-taking app for Uzbek speakers',
    description: 'Notlar is a Notion-inspired note-taking app with full Uzbek language support including spell checking and auto-correction. It supports markdown, rich media, templates, and sharing. Sync across all devices with end-to-end encryption.',
    category: 'Productivity', tags: ['notes', 'productivity', 'writing', 'uzbek'],
    thumbnail: '', websiteUrl: 'https://notlar.uz', maker: MOCK_USERS[2], makers: [MOCK_USERS[2]],
    votesCount: 289, commentsCount: 22, viewsCount: 4300, createdAt: '2024-03-05', featured: false, status: 'approved'
  },
  {
    id: 'p13', name: 'Kinouz', tagline: 'Streaming platform for Uzbek movies and series',
    description: 'Kinouz is the Netflix of Uzbekistan with 5000+ movies and series in Uzbek, Russian, English, Korean, and Turkish. Supports Uzbek subtitles for all foreign content. Offers family accounts, parental controls, and offline downloads.',
    category: 'Social', tags: ['streaming', 'movies', 'entertainment', 'uzbek'],
    thumbnail: '', websiteUrl: 'https://kinouz.com', maker: MOCK_USERS[6], makers: [MOCK_USERS[6], MOCK_USERS[9]],
    votesCount: 1089, commentsCount: 76, viewsCount: 23400, createdAt: '2024-03-10', featured: true, status: 'approved'
  },
  {
    id: 'p14', name: 'TalentUZ', tagline: 'LinkedIn for Uzbek professionals',
    description: 'TalentUZ is a professional networking platform for Uzbekistan. Post jobs, build your professional profile, get skill endorsements, and connect with top companies. The platform has AI-powered job matching and salary insights for the Uzbek market.',
    category: 'SaaS', tags: ['jobs', 'networking', 'career', 'professional'],
    thumbnail: '', websiteUrl: 'https://talent.uz', maker: MOCK_USERS[0], makers: [MOCK_USERS[0], MOCK_USERS[3]],
    votesCount: 756, commentsCount: 58, viewsCount: 15600, createdAt: '2024-03-15', featured: false, status: 'approved'
  },
  {
    id: 'p15', name: 'UzBot', tagline: 'Telegram bot builder without coding',
    description: 'UzBot lets you create Telegram bots for your business without any programming knowledge. Build customer support bots, ordering systems, appointment schedulers, and more. Integrates with PaymeUZ and Click for payments.',
    category: 'SaaS', tags: ['telegram', 'bots', 'nocode', 'automation'],
    thumbnail: '', websiteUrl: 'https://uzbot.uz', maker: MOCK_USERS[8], makers: [MOCK_USERS[8]],
    votesCount: 445, commentsCount: 31, viewsCount: 7800, createdAt: '2024-03-20', featured: false, status: 'approved'
  },
  {
    id: 'p16', name: 'Kundalik+', tagline: 'Modern school management system',
    description: 'Kundalik+ is a comprehensive school management system for Uzbek schools. Features include digital gradebooks, attendance tracking, parent communication, homework management, and school analytics. Used by 500+ schools across Uzbekistan.',
    category: 'EdTech', tags: ['education', 'school', 'management', 'grades'],
    thumbnail: '', websiteUrl: 'https://kundalik.uz', maker: MOCK_USERS[5], makers: [MOCK_USERS[5], MOCK_USERS[11]],
    votesCount: 612, commentsCount: 44, viewsCount: 9900, createdAt: '2024-03-25', featured: false, status: 'approved'
  },
  {
    id: 'p17', name: 'SafarUZ', tagline: 'Travel planning made easy for Uzbekistan',
    description: 'SafarUZ is the ultimate travel companion for exploring Uzbekistan. Plan trips along the Silk Road, book hotels, find local guides, and discover hidden gems. Includes offline maps for remote areas and multi-language audio guides.',
    category: 'Mobile', tags: ['travel', 'tourism', 'maps', 'uzbekistan'],
    thumbnail: '', websiteUrl: 'https://safar.uz', maker: MOCK_USERS[3], makers: [MOCK_USERS[3]],
    votesCount: 378, commentsCount: 26, viewsCount: 6200, createdAt: '2024-04-01', featured: false, status: 'approved'
  },
  {
    id: 'p18', name: 'CryptoUZ', tagline: 'Regulated crypto exchange for Uzbekistan',
    description: 'CryptoUZ is a licensed cryptocurrency exchange operating under the National Agency of Perspective Projects of Uzbekistan. Trade BTC, ETH, USDT and other major cryptocurrencies with UZS pairs. Features include staking, P2P trading, and educational resources.',
    category: 'Fintech', tags: ['crypto', 'exchange', 'blockchain', 'fintech'],
    thumbnail: '', websiteUrl: 'https://cryptouz.com', maker: MOCK_USERS[1], makers: [MOCK_USERS[1]],
    votesCount: 834, commentsCount: 62, viewsCount: 16800, createdAt: '2024-04-05', featured: false, status: 'approved'
  },
  {
    id: 'p19', name: 'TaskFlow UZ', tagline: 'Project management tool for Uzbek teams',
    description: 'TaskFlow UZ is a project management platform designed with Uzbek business culture in mind. Manage tasks, deadlines, and team communication with Uzbek interface and Telegram integration. Supports Agile, Scrum, and traditional project management methodologies.',
    category: 'Productivity', tags: ['project-management', 'tasks', 'teams', 'productivity'],
    thumbnail: '', websiteUrl: 'https://taskflow.uz', maker: MOCK_USERS[10], makers: [MOCK_USERS[10], MOCK_USERS[7]],
    votesCount: 267, commentsCount: 18, viewsCount: 4100, createdAt: '2024-04-10', featured: false, status: 'approved'
  },
  {
    id: 'p20', name: 'AgroMarket', tagline: 'B2B marketplace for agricultural products',
    description: 'AgroMarket connects Uzbek farmers directly with food processors, exporters, and retailers. Eliminate middlemen, get better prices, and access export markets. The platform includes quality grading, logistics matching, and financial services.',
    category: 'E-commerce', tags: ['agriculture', 'b2b', 'marketplace', 'export'],
    thumbnail: '', websiteUrl: 'https://agromarket.uz', maker: MOCK_USERS[9], makers: [MOCK_USERS[9]],
    votesCount: 356, commentsCount: 24, viewsCount: 5300, createdAt: '2024-04-15', featured: false, status: 'approved'
  },
  {
    id: 'p21', name: 'UzGPT', tagline: 'ChatGPT for Uzbek language',
    description: 'UzGPT is an AI assistant fine-tuned on Uzbek language and culture. It understands Uzbek context, local laws, culture, and business practices. Use it for writing, analysis, coding help, and customer service automation.',
    category: 'AI/ML', tags: ['ai', 'gpt', 'uzbek', 'chatbot'],
    thumbnail: '', websiteUrl: 'https://uzgpt.uz', maker: MOCK_USERS[5], makers: [MOCK_USERS[5], MOCK_USERS[0]],
    votesCount: 1456, commentsCount: 98, viewsCount: 41200, createdAt: '2024-04-20', featured: true, status: 'approved'
  },
  {
    id: 'p22', name: 'Omborxona', tagline: 'Cloud inventory management for SMEs',
    description: 'Omborxona helps small and medium businesses in Uzbekistan manage their inventory, track sales, and generate reports. It integrates with barcode scanners, e-commerce platforms, and accounting software. Available in Uzbek, Russian, and English.',
    category: 'SaaS', tags: ['inventory', 'saas', 'business', 'management'],
    thumbnail: '', websiteUrl: 'https://omborxona.uz', maker: MOCK_USERS[8], makers: [MOCK_USERS[8], MOCK_USERS[4]],
    votesCount: 234, commentsCount: 15, viewsCount: 3600, createdAt: '2024-04-25', featured: false, status: 'approved'
  },
  {
    id: 'p23', name: 'GymUZ', tagline: 'Find gyms and fitness classes near you',
    description: 'GymUZ is a fitness marketplace for Uzbekistan. Find gyms, yoga studios, swimming pools, and fitness trainers. Book classes, manage memberships, and track your fitness goals. The platform has 800+ fitness venues across Uzbekistan.',
    category: 'Health', tags: ['fitness', 'gym', 'health', 'sports'],
    thumbnail: '', websiteUrl: 'https://gymuz.uz', maker: MOCK_USERS[2], makers: [MOCK_USERS[2]],
    votesCount: 189, commentsCount: 12, viewsCount: 2900, createdAt: '2024-05-01', featured: false, status: 'approved'
  },
  {
    id: 'p24', name: 'LexiUZ', tagline: 'Legal services platform for Uzbekistan',
    description: 'LexiUZ makes legal services accessible to everyone in Uzbekistan. Find lawyers, get document templates, understand your rights, and get legal consultations online. The platform specializes in business registration, real estate, and labor law.',
    category: 'SaaS', tags: ['legal', 'lawyers', 'documents', 'business'],
    thumbnail: '', websiteUrl: 'https://lexi.uz', maker: MOCK_USERS[7], makers: [MOCK_USERS[7], MOCK_USERS[3]],
    votesCount: 312, commentsCount: 21, viewsCount: 4800, createdAt: '2024-05-05', featured: false, status: 'approved'
  },
  {
    id: 'p25', name: 'PhotoUZ', tagline: 'Stock photo library of Uzbekistan',
    description: 'PhotoUZ is a curated stock photography platform with 100,000+ high-quality photos of Uzbekistan. Photos cover culture, architecture, nature, people, and business. All photos are licensed for commercial use and available in multiple resolutions.',
    category: 'Design', tags: ['photography', 'stock', 'images', 'uzbekistan'],
    thumbnail: '', websiteUrl: 'https://photouz.uz', maker: MOCK_USERS[11], makers: [MOCK_USERS[11]],
    votesCount: 278, commentsCount: 17, viewsCount: 4200, createdAt: '2024-05-10', featured: false, status: 'approved'
  },
];

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'c1', content: 'This is exactly what Uzbekistan needed! The payment experience is so smooth. Way better than the old banking apps.',
    author: MOCK_USERS[2], productId: 'p1', likesCount: 24, createdAt: '2024-01-12',
    replies: [
      { id: 'c1r1', content: 'Totally agree! I switched from Payme and the difference is night and day.', author: MOCK_USERS[4], productId: 'p1', parentId: 'c1', likesCount: 8, createdAt: '2024-01-13' },
      { id: 'c1r2', content: 'The QR payment feature is especially good. Works even with slow internet.', author: MOCK_USERS[6], productId: 'p1', parentId: 'c1', likesCount: 12, createdAt: '2024-01-14' },
    ]
  },
  {
    id: 'c2', content: 'Great product! Would love to see Apple Pay integration in the future.',
    author: MOCK_USERS[5], productId: 'p1', likesCount: 15, createdAt: '2024-01-13',
    replies: [
      { id: 'c2r1', content: 'Apple Pay is on our roadmap for Q3 2024! Thanks for the feedback.', author: MOCK_USERS[1], productId: 'p1', parentId: 'c2', likesCount: 31, createdAt: '2024-01-13' },
    ]
  },
  {
    id: 'c3', content: 'Been using EduPath for my kids for 3 months now. The improvement in their math scores is remarkable!',
    author: MOCK_USERS[3], productId: 'p3', likesCount: 45, createdAt: '2024-01-22',
    replies: [
      { id: 'c3r1', content: 'Which grade level? My son is in 5th grade and I\'m looking for something like this.', author: MOCK_USERS[10], productId: 'p3', parentId: 'c3', likesCount: 7, createdAt: '2024-01-23' },
    ]
  },
];

export type SortType = 'trending' | 'newest' | 'top';

export function sortProducts(products: Product[], sort: SortType): Product[] {
  switch (sort) {
    case 'trending':
      return [...products].sort((a, b) => (b.votesCount / (Date.now() - new Date(b.createdAt).getTime())) - (a.votesCount / (Date.now() - new Date(a.createdAt).getTime())));
    case 'newest':
      return [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'top':
      return [...products].sort((a, b) => b.votesCount - a.votesCount);
    default:
      return products;
  }
}
