#!/bin/bash
set -e

echo "╔═══════════════════════════════════════╗"
echo "║   ProductHunt UZ - Setup Script      ║"
echo "╚═══════════════════════════════════════╝"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is required. Install from https://nodejs.org"
    exit 1
fi

echo "✔ Node.js $(node -v) found"

# Setup backend
echo ""
echo "🚀 Setting up backend..."
cd backend
cp -n .env.example .env 2>/dev/null || true
npm install
node database/init.js
node database/seed.js
cd ..

# Setup frontend
echo ""
echo "🎮 Setting up frontend..."
cd frontend
npm install
cd ..

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║   Setup Complete!                    ║"
echo "╚═══════════════════════════════════════╝"
echo ""
echo "To start the app:"
echo "  Terminal 1: cd backend && npm run dev"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "Test accounts:"
echo "  admin@platform.uz / Admin@123456"
echo "  creator@platform.uz / Creator@123456"
echo "  user@platform.uz / User@123456"
