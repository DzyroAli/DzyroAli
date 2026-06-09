FROM node:20-alpine AS base
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN node database/init.js && node database/seed.js

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "server.js"]
