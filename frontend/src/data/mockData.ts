export interface User {
  id: string; name: string; email: string; username: string;
  avatar: string; bio: string; website?: string; twitter?: string; github?: string;
  role: 'admin' | 'creator' | 'user';
  createdAt: string; followersCount: number; followingCount: number; productsCount: number;
}

export interface Product {
  id: string; name: string; tagline: string; description: string;
  category: string; tags: string[]; thumbnail: string;
  websiteUrl: string; githubUrl?: string;
  maker: User; makers: User[];
  votesCount: number; commentsCount: number; viewsCount: number;
  createdAt: string; featured: boolean; status: 'pending' | 'approved' | 'rejected';
  hasVoted?: boolean;
}

export interface Comment {
  id: string; content: string; author: User; productId: string;
  parentId?: string; replies?: Comment[];
  likesCount: number; createdAt: string;
}

const avatarColors = ['bg-purple-500','bg-blue-500','bg-green-500','bg-yellow-500','bg-red-500','bg-pink-500','bg-indigo-500','bg-teal-500','bg-orange-500','bg-cyan-500'];
export function getAvatarColor(name: string) { return avatarColors[name.charCodeAt(0) % avatarColors.length]; }
export function getInitials(name: string) { return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); }

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alisher Nazarov', email: 'admin@platform.uz', username: 'alisher_n', avatar: '', bio: 'ProductHub.uz asoschisi. O\'zbek tech ekotizimasini rivojlantirish uchun ishlayapman.', website: 'https://alisher.uz', twitter: '@alisher_n', github: 'alisher_n', role: 'admin', createdAt: '2023-01-15', followersCount: 1240, followingCount: 89, productsCount: 12 },
  { id: 'u2', name: 'Dilnoza Karimova', email: 'creator@platform.uz', username: 'dilnoza_k', avatar: '', bio: 'Full-stack dasturchi & startup asoschisi. Muhim narsalar yarataman.', website: 'https://dilnoza.dev', twitter: '@dilnoza_k', github: 'dilnoza_k', role: 'creator', createdAt: '2023-02-20', followersCount: 856, followingCount: 134, productsCount: 8 },
  { id: 'u3', name: 'Bobur Toshmatov', email: 'user@platform.uz', username: 'bobur_t', avatar: '', bio: 'Dizayner & maker. UX va chiroyli interfeyslarga ishtiyoqmandman.', role: 'user', createdAt: '2023-03-10', followersCount: 423, followingCount: 267, productsCount: 5 },
  { id: 'u4', name: 'Feruza Yusupova', email: 'feruza@platform.uz', username: 'feruza_y', avatar: '', bio: 'Fintech startupda product manager. Ma\'lumotlar va foydalanuvchi tadqiqotlarini yaxshi ko\'raman.', role: 'user', createdAt: '2023-04-05', followersCount: 312, followingCount: 198, productsCount: 3 },
  { id: 'u5', name: 'Jasur Mirzayev', email: 'jasur@platform.uz', username: 'jasur_m', avatar: '', bio: 'Mobil dasturchi. Flutter & React Native ishqibozi.', role: 'creator', createdAt: '2023-05-12', followersCount: 678, followingCount: 145, productsCount: 7 },
  { id: 'u6', name: 'Nilufar Rashidova', email: 'nilufar@platform.uz', username: 'nilufar_r', avatar: '', bio: 'AI/ML muhandisi. O\'zbek tili uchun aqlli yechimlar yarataman.', role: 'creator', createdAt: '2023-06-01', followersCount: 934, followingCount: 211, productsCount: 6 },
  { id: 'u7', name: 'Sardor Alimov', email: 'sardor@platform.uz', username: 'sardor_a', avatar: '', bio: 'Tadbirkor & investor. UZ startaplari ekotizimasi uchun ishlayapman.', role: 'user', createdAt: '2023-07-18', followersCount: 1567, followingCount: 432, productsCount: 4 },
  { id: 'u8', name: 'Nodira Tosheva', email: 'nodira@platform.uz', username: 'nodira_t', avatar: '', bio: 'Fintech mahsulot dizayneri. Foydalanuvchi tajribasiga e\'tibor beraman.', role: 'creator', createdAt: '2023-08-22', followersCount: 287, followingCount: 156, productsCount: 2 },
];

export const CATEGORIES = ['All', 'Fintech', 'AI', 'Ta\'lim', 'Transport', 'Sog\'liq', 'SaaS', 'Mobile', 'Design', 'Developer Tools', 'E-commerce', 'Productivity'];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'OsonTaxi', tagline: 'Shahar bo\'ylab arzon va tez taksi', description: 'OsonTaxi O\'zbekiston shaharlarida eng tez va arzon taksi xizmati. Real vaqt rejimida haydovchi kuzatish, oldindan bron qilish, ayol haydovchilar opsiyasi va to\'liq Toshkent, Samarqand, Buxoro qamroviga ega. Ilovamiz Telegram bot orqali ham ishlaydi va naqd pulsiz to\'lovni qo\'llab-quvvatlaydi.', category: 'Transport', tags: ['taksi', 'mobil', 'xarita', 'transport'], thumbnail: '', websiteUrl: 'https://osontaxi.uz', maker: MOCK_USERS[6], makers: [MOCK_USERS[6], MOCK_USERS[4]], votesCount: 312, commentsCount: 48, viewsCount: 8400, createdAt: '2024-01-10', featured: true, status: 'approved' },
  { id: 'p2', name: 'Hamkor Pay', tagline: 'QR to\'lov hamyoni — bir tegishda', description: 'Hamkor Pay O\'zbekistonning barcha banklari bilan ishlaydigan universal mobil to\'lov ilovasi. QR kod to\'lovi, oniy o\'tkazmalar, biznes analitikasi va 2FA xavfsizlik tizimi bilan jihozlangan. Ilovamiz internetisiz ham ishlaydi va 5 milliondan ortiq foydalanuvchiga xizmat ko\'rsatadi.', category: 'Fintech', tags: ['to\'lov', 'qr', 'hamyon', 'bank'], thumbnail: '', websiteUrl: 'https://hamkorpay.uz', maker: MOCK_USERS[7], makers: [MOCK_USERS[7], MOCK_USERS[1]], votesCount: 287, commentsCount: 34, viewsCount: 7200, createdAt: '2024-01-15', featured: true, status: 'approved' },
  { id: 'p3', name: 'EduUz', tagline: 'O\'zbek tilida onlayn kurslar platformasi', description: 'EduUz o\'zbek tilida eng katta onlayn ta\'lim platformasi. Python, JavaScript, veb-dasturlash, ma\'lumotlar fani va mobil ilovalar bo\'yicha kurslar mavjud. Har bir kurs mentorlik, loyiha asosidagi ta\'lim va sertifikat bilan tugaydi. 50,000+ talabaga xizmat ko\'rsatmoqda.', category: 'Ta\'lim', tags: ['ta\'lim', 'kurslar', 'dasturlash', 'sertifikat'], thumbnail: '', websiteUrl: 'https://eduuz.uz', maker: MOCK_USERS[5], makers: [MOCK_USERS[5], MOCK_USERS[2]], votesCount: 241, commentsCount: 29, viewsCount: 6800, createdAt: '2024-01-20', featured: true, status: 'approved' },
  { id: 'p4', name: 'BozorAI', tagline: 'AI yordamida narxlarni taqqoslash', description: 'BozorAI sun\'iy intellekt yordamida O\'zbekiston bozorlarida eng yaxshi narxlarni topib beradi. Oziq-ovqat, elektronika, kiyim-kechak va boshqa tovarlar narxlarini real vaqtda taqqoslaydi. Telegram boti va veb-sayt orqali ishlaydi.', category: 'AI', tags: ['ai', 'narx', 'bozor', 'taqqoslash'], thumbnail: '', websiteUrl: 'https://bozorai.uz', maker: MOCK_USERS[1], makers: [MOCK_USERS[1]], votesCount: 198, commentsCount: 22, viewsCount: 4900, createdAt: '2024-02-01', featured: false, status: 'approved' },
  { id: 'p5', name: 'Tabib Online', tagline: 'Shifokor bilan videoaloqa', description: 'Tabib Online O\'zbekiston bo\'ylab 200+ shifokor va klinikani birlashtirgan telemedicine platformasi. Video maslahat olish, retsept olish, tibbiy tarixni boshqarish va barcha sog\'liq sug\'urtasi bilan ishlaydi. 24/7 xizmat.', category: 'Sog\'liq', tags: ['tibbiyot', 'video', 'shifokor', 'sog\'liq'], thumbnail: '', websiteUrl: 'https://tabibon.uz', maker: MOCK_USERS[3], makers: [MOCK_USERS[3]], votesCount: 164, commentsCount: 18, viewsCount: 3800, createdAt: '2024-02-10', featured: false, status: 'approved' },
  { id: 'p6', name: 'Uychi', tagline: 'Kvartira va uy ijarasi — vositachisiz', description: 'Uychi O\'zbekistondagi uy-joy ijarasi uchun eng ishonchli platforma. Barcha e\'lonlar tekshirilgan, vositachilarsiz to\'g\'ridan-to\'g\'ri egasi bilan muloqot qilish mumkin. Virtual tour, onlayn shartnoma va xavfsiz to\'lov imkoniyati mavjud.', category: 'E-commerce', tags: ['ijara', 'ko\'chmas mulk', 'kvartira', 'uy'], thumbnail: '', websiteUrl: 'https://uychi.uz', maker: MOCK_USERS[4], makers: [MOCK_USERS[4]], votesCount: 142, commentsCount: 15, viewsCount: 3200, createdAt: '2024-02-15', featured: false, status: 'approved' },
  { id: 'p7', name: 'Dasturchi.uz', tagline: 'IT-mutaxassislar uchun ish birjasi', description: 'Dasturchi.uz O\'zbekiston IT bozori uchun maxsus ishlab chiqilgan ish birjasi. Frontend, backend, mobil dasturlash, dizayn va boshqa IT mutaxassisliklar bo\'yicha 1000+ ish o\'rni. Remote va hybrid ish imkoniyatlari ham mavjud.', category: 'SaaS', tags: ['ish', 'it', 'dasturchi', 'vakansiya'], thumbnail: '', websiteUrl: 'https://dasturchi.uz', maker: MOCK_USERS[2], makers: [MOCK_USERS[2]], votesCount: 97, commentsCount: 9, viewsCount: 2100, createdAt: '2024-03-01', featured: false, status: 'approved' },
  { id: 'p8', name: 'UzBot Studio', tagline: 'Kodsiz Telegram bot yaratish platformasi', description: 'UzBot Studio orqali hech qanday dasturlash bilimsiz Telegram botlar yarating. Mijozlarga xizmat botlari, buyurtma tizimi, uchrashuv rejalashtiruvchi va ko\'proq. Hamkor Pay va Click bilan to\'lov integratsiyasi mavjud.', category: 'SaaS', tags: ['telegram', 'bot', 'kodsiz', 'avtomatlashtirish'], thumbnail: '', websiteUrl: 'https://uzbot.uz', maker: MOCK_USERS[0], makers: [MOCK_USERS[0]], votesCount: 76, commentsCount: 7, viewsCount: 1800, createdAt: '2024-03-10', featured: false, status: 'approved' },
  { id: 'p9', name: 'UzGPT', tagline: 'O\'zbek tilidagi AI yordamchi', description: 'UzGPT o\'zbek tili va madaniyatiga moslashtirilgan sun\'iy intellekt yordamchi. O\'zbekiston qonunlari, madaniyati va biznes amaliyotlarini tushunadi. Yozish, tahlil qilish, kodlash yordami va mijozlarga xizmat ko\'rsatish uchun foydalaning.', category: 'AI', tags: ['ai', 'gpt', 'o\'zbek', 'chatbot'], thumbnail: '', websiteUrl: 'https://uzgpt.uz', maker: MOCK_USERS[5], makers: [MOCK_USERS[5]], votesCount: 1456, commentsCount: 98, viewsCount: 41200, createdAt: '2024-03-20', featured: true, status: 'approved' },
  { id: 'p10', name: 'Lochin Yetkazma', tagline: 'Tunlik yetkazib berish 30 daqiqada', description: 'Lochin tun bo\'yi yetkazib berish xizmati. Dorixona, oziq-ovqat, maishiy buyumlar — barchasi 30 daqiqa ichida. Toshkentning 12 ta tumanida ishlaydi. Ilovadan buyurtma bering va real vaqtda kuzating.', category: 'Mobile', tags: ['yetkazma', 'express', 'tunlik', 'xizmat'], thumbnail: '', websiteUrl: 'https://lochin.uz', maker: MOCK_USERS[4], makers: [MOCK_USERS[4]], votesCount: 119, commentsCount: 11, viewsCount: 2600, createdAt: '2024-04-01', featured: false, status: 'approved' },
  { id: 'p11', name: 'AgriSmart', tagline: 'Dehqonlar uchun aqlli fermerlik texnologiyasi', description: 'AgriSmart IoT sensorlari, ob-havo bashorati, tuproq tahlili va bozor narxlari ma\'lumotlarini dehqonlarga yetkazadi. Mobil ilova oflayn rejimida ham ishlaydi. O\'zbekcha, ruscha va qoraqalpoqcha tillarda mavjud.', category: 'Mobile', tags: ['qishloq xo\'jaligi', 'iot', 'fermerlik'], thumbnail: '', websiteUrl: 'https://agrismart.uz', maker: MOCK_USERS[7], makers: [MOCK_USERS[7]], votesCount: 89, commentsCount: 7, viewsCount: 1900, createdAt: '2024-04-10', featured: false, status: 'approved' },
  { id: 'p12', name: 'Kinouz', tagline: 'O\'zbek kino va seriallar streaming platformasi', description: 'Kinouz O\'zbekiston Netflix. 5000+ kino va seriallar o\'zbek, rus, ingliz, koreys va turk tillarida. Barcha xorijiy kontentda o\'zbek subtitrlari. Oilaviy akkauntlar, ota-ona nazorati va oflayn yuklab olish imkoniyati mavjud.', category: 'Mobile', tags: ['streaming', 'kino', 'serial', 'o\'zbek'], thumbnail: '', websiteUrl: 'https://kinouz.com', maker: MOCK_USERS[6], makers: [MOCK_USERS[6]], votesCount: 1089, commentsCount: 76, viewsCount: 23400, createdAt: '2024-04-15', featured: true, status: 'approved' },
];

export const MOCK_COMMENTS: Comment[] = [
  { id: 'c1', content: 'Zo\'r mahsulot! To\'lov interfeysi juda qulay va tez ishlaydi. Avvalgi ilovadan ko\'ra ancha yaxshi.', author: MOCK_USERS[2], productId: 'p2', likesCount: 24, createdAt: '2024-01-16',
    replies: [
      { id: 'c1r1', content: 'Roziman! QR to\'lov juda qulay, internet sekin bo\'lsa ham ishlaydi.', author: MOCK_USERS[4], productId: 'p2', parentId: 'c1', likesCount: 8, createdAt: '2024-01-17' },
      { id: 'c1r2', content: 'Apple Pay integratsiyasini rejalashtirilyaptimi? Shuni kutyapmiz!', author: MOCK_USERS[6], productId: 'p2', parentId: 'c1', likesCount: 12, createdAt: '2024-01-18' },
    ]
  },
  { id: 'c2', content: 'EduUz platformasi bolalarimning matematika ballarini sezilarli oshirdi. 3 oydan beri foydalanyapmiz.', author: MOCK_USERS[3], productId: 'p3', likesCount: 45, createdAt: '2024-01-22',
    replies: [
      { id: 'c2r1', content: 'Qaysi sinf uchun? O\'g\'lim 5-sinfda, shu platforma mos keladimi?', author: MOCK_USERS[0], productId: 'p3', parentId: 'c2', likesCount: 7, createdAt: '2024-01-23' },
    ]
  },
  { id: 'c3', content: 'UzGPT o\'zbek tilini juda yaxshi tushunadi! ChatGPT bilan solishtirganda ancha yaxshi natijalar beradi.', author: MOCK_USERS[1], productId: 'p9', likesCount: 67, createdAt: '2024-03-21' },
];

export type SortType = 'trending' | 'newest' | 'top';

export function sortProducts(products: Product[], sort: SortType): Product[] {
  switch (sort) {
    case 'trending': return [...products].sort((a, b) => b.votesCount - a.votesCount);
    case 'newest': return [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'top': return [...products].sort((a, b) => b.votesCount - a.votesCount);
    default: return products;
  }
}
