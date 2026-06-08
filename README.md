# ProductHunt Uzbekistan 🇺🇿

A full-stack product discovery platform for Uzbekistan — inspired by Product Hunt.
Discover, upvote, and discuss the best new products from the Uzbek tech ecosystem.

[![CI/CD](https://github.com/dzyroali/dzyroali/actions/workflows/ci.yml/badge.svg)](https://github.com/dzyroali/dzyroali/actions)

## 📸 Screenshot

```
┌───────────────────────────────────────────────────┐
│  🔶 ProductHunt UZ           Search.. 🔍  │
├───────────────────────────────────────────────────┤
│                                                 │
│  🚀 UzGPT          [▲ 1456]  Featured        │
│  ChatGPT for Uzbek language                   │
│                                                 │
│  🏠 EduPath         [▲  923]  EdTech          │
│  AI-powered learning for Uzbek students       │
│                                                 │
└───────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Clone & Setup

```bash
git clone https://github.com/dzyroali/dzyroali.git
cd dzyroali
chmod +x scripts/setup.sh && ./scripts/setup.sh
```

### 2. Start Development Servers

```bash
# Terminal 1 — Backend (port 3001)
cd backend && npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm run dev
```

Open http://localhost:3000

### 3. Test Accounts

| Role    | Email                   | Password       |
|---------|-------------------------|----------------|
| Admin   | admin@platform.uz       | Admin@123456   |
| Creator | creator@platform.uz     | Creator@123456 |
| User    | user@platform.uz        | User@123456    |

## 🐳 Docker Deployment

```bash
# Copy environment template
cp .env.example .env
# Edit JWT_SECRET in .env!

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

Services:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Via Nginx: http://localhost:80

## 📦 Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| React 18 + TypeScript | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Zustand | State management |
| React Router v6 | Routing |
| Framer Motion | Animations |
| Lucide React | Icons |
| React Hot Toast | Notifications |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js 20 + Express | Server |
| better-sqlite3 | Database (SQLite) |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Joi | Validation |
| Helmet | Security headers |
| express-rate-limit | Rate limiting |

## 🗄️ Database Schema

```sql
users          -- User accounts (id, name, email, username, role)
products       -- Product listings (name, tagline, category, status)
votes          -- Upvotes (user_id, product_id) -- unique constraint
comments       -- Threaded comments (content, parent_id)
follows        -- User follows (follower_id, following_id)
product_views  -- View tracking
```

## 💻 API Reference

### Authentication
```
POST   /api/auth/register    Create account
POST   /api/auth/login       Sign in → JWT token
GET    /api/auth/me          Current user (auth required)
PUT    /api/auth/me          Update profile (auth required)
```

### Products
```
GET    /api/products                    List (filter: category, search, sort, page)
GET    /api/products/:id                Product detail
POST   /api/products                    Create (auth required)
PUT    /api/products/:id                Update (owner/admin)
DELETE /api/products/:id               Delete (owner/admin)
POST   /api/products/:id/vote          Toggle vote (auth required)
```

### Comments
```
GET    /api/products/:id/comments       List comments (threaded)
POST   /api/products/:id/comments      Post comment (auth required)
DELETE /api/products/:id/comments/:cid Delete comment
```

### Users
```
GET    /api/users/:username             Public profile + products
POST   /api/users/:username/follow      Follow/unfollow (auth required)
```

### Admin
```
GET    /api/admin/stats                 Platform stats
GET    /api/admin/products?status=pending  Products to review
PUT    /api/admin/products/:id/approve  Approve product
PUT    /api/admin/products/:id/reject   Reject product
GET    /api/admin/users                 All users
PUT    /api/admin/users/:id/role        Change user role
```

### Other
```
GET    /api/analytics                   Platform analytics
GET    /health                          Health check
```

## 📁 Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Router + Layout
│   │   ├── pages/               # All page components
│   │   ├── components/          # Reusable UI components
│   │   ├── store/               # Zustand state stores
│   │   ├── data/                # Mock data (25+ products)
│   │   └── index.css            # Tailwind + custom styles
│   ├── package.json
│   └── tailwind.config.js
├── backend/
│   ├── server.js            # Express app entry
│   ├── routes/              # API route handlers
│   ├── middleware/          # Auth, validation, logging
│   ├── database/            # SQLite init, seed, connection
│   └── package.json
├── nginx/nginx.conf     # Reverse proxy config
├── docker-compose.yml   # Full stack orchestration
├── scripts/setup.sh     # One-command setup
└── .github/workflows/   # CI/CD pipeline
```

## 🔐 Security

- JWT tokens with expiry
- bcrypt password hashing (12 rounds)
- Helmet.js security headers
- CORS whitelist configuration
- Rate limiting (20 auth req/15min, 500 API req/15min)
- Joi input validation
- SQLite parameterized queries (SQL injection prevention)
- React auto-escaping (XSS prevention)

## 🎨 Features

- ✅ Product listing with trending/newest/top sorting
- ✅ Category filtering (13 categories)
- ✅ Full-text search
- ✅ Upvoting (one vote per user per product)
- ✅ Threaded comments
- ✅ User authentication (JWT)
- ✅ Creator profiles
- ✅ Product submission & management
- ✅ Admin moderation panel
- ✅ Dark / Light mode
- ✅ Fully responsive (mobile-first)
- ✅ 25+ mock products with realistic data
- ✅ Docker + Nginx production setup
- ✅ GitHub Actions CI/CD

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'feat: add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

MIT — free to use, modify, and distribute.

---

Built with ❤️ for the Uzbekistan tech community 🇺🇿
