const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { initDatabase, DB_PATH } = require('./init');

initDatabase();

const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');

const users = [
  { id: 'u1', name: 'Alisher Nazarov', email: 'admin@platform.uz', username: 'alisher_n', password: 'Admin@123456', role: 'admin', bio: 'Founder & CEO of ProductHunt UZ.', website: 'https://alisher.uz' },
  { id: 'u2', name: 'Dilnoza Karimova', email: 'creator@platform.uz', username: 'dilnoza_k', password: 'Creator@123456', role: 'creator', bio: 'Full-stack developer & startup founder.' },
  { id: 'u3', name: 'Bobur Toshmatov', email: 'user@platform.uz', username: 'bobur_t', password: 'User@123456', role: 'user', bio: 'Designer & maker.' },
  { id: 'u4', name: 'Feruza Yusupova', email: 'feruza@platform.uz', username: 'feruza_y', password: 'password123', role: 'user', bio: 'Product manager at a fintech startup.' },
  { id: 'u5', name: 'Jasur Mirzayev', email: 'jasur@platform.uz', username: 'jasur_m', password: 'password123', role: 'creator', bio: 'Mobile developer. Flutter enthusiast.' },
  { id: 'u6', name: 'Nilufar Rashidova', email: 'nilufar@platform.uz', username: 'nilufar_r', password: 'password123', role: 'creator', bio: 'AI/ML engineer.' },
];

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (id, name, email, username, password_hash, role, bio, website, email_verified)
  VALUES (@id, @name, @email, @username, @password_hash, @role, @bio, @website, 1)
`);

const insertProduct = db.prepare(`
  INSERT OR IGNORE INTO products (id, name, tagline, description, category, tags, website_url, maker_id, votes_count, views_count, featured, status)
  VALUES (@id, @name, @tagline, @description, @category, @tags, @website_url, @maker_id, @votes_count, @views_count, @featured, @status)
`);

console.log('[Seed] Seeding users...');
for (const user of users) {
  const hash = bcrypt.hashSync(user.password, 10);
  insertUser.run({ ...user, password_hash: hash, website: user.website || '' });
}

const products = [
  { id: 'p1', name: 'PaymeUZ', tagline: "Uzbekistan's fastest mobile payment solution", description: 'PaymeUZ is a comprehensive mobile payment platform designed for Uzbekistan.', category: 'Fintech', tags: JSON.stringify(['payments', 'mobile', 'banking']), website_url: 'https://payme.uz', maker_id: 'u2', votes_count: 847, views_count: 12400, featured: 1, status: 'approved' },
  { id: 'p2', name: 'EduPath', tagline: 'AI-powered learning platform for Uzbek students', description: 'EduPath uses AI to create personalized learning paths for students.', category: 'EdTech', tags: JSON.stringify(['education', 'ai', 'students']), website_url: 'https://edupath.uz', maker_id: 'u6', votes_count: 923, views_count: 18200, featured: 1, status: 'approved' },
  { id: 'p3', name: 'UzGPT', tagline: 'ChatGPT for Uzbek language', description: 'UzGPT is an AI assistant fine-tuned on Uzbek language and culture.', category: 'AI/ML', tags: JSON.stringify(['ai', 'gpt', 'uzbek']), website_url: 'https://uzgpt.uz', maker_id: 'u6', votes_count: 1456, views_count: 41200, featured: 1, status: 'approved' },
  { id: 'p4', name: 'TaximUZ', tagline: 'Smart ride-hailing for Uzbek cities', description: 'TaximUZ revolutionizes urban transportation in Uzbekistan.', category: 'Mobile', tags: JSON.stringify(['transport', 'mobile', 'ridesharing']), website_url: 'https://taxim.uz', maker_id: 'u5', votes_count: 634, views_count: 9800, featured: 0, status: 'approved' },
  { id: 'p5', name: 'CodeUZ', tagline: 'Learn programming the Uzbek way', description: 'CodeUZ is an interactive coding platform with courses in Uzbek language.', category: 'EdTech', tags: JSON.stringify(['coding', 'learning', 'programming']), website_url: 'https://codeuz.dev', maker_id: 'u2', votes_count: 743, views_count: 14300, featured: 0, status: 'approved' },
  { id: 'p6', name: 'DevKit UZ', tagline: 'Essential developer tools for Uzbek developers', description: 'DevKit UZ is a suite of developer tools.', category: 'Developer Tools', tags: JSON.stringify(['tools', 'developer', 'api']), website_url: 'https://devkit.uz', maker_id: 'u2', votes_count: 312, views_count: 5400, featured: 0, status: 'approved' },
];

console.log('[Seed] Seeding products...');
for (const product of products) {
  insertProduct.run(product);
}

db.close();
console.log('[Seed] Done! Database seeded successfully.');
console.log('[Seed] Test accounts:');
console.log('  admin@platform.uz / Admin@123456');
console.log('  creator@platform.uz / Creator@123456');
console.log('  user@platform.uz / User@123456');
