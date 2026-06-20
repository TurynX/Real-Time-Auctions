# ⚡ Real-Time Auction System

A robust real-time auction backend built with **NestJS**, **WebSockets (Socket.io)**, and **Prisma ORM**.

---

## 🛠️ Tech Stack

- **Framework:** NestJS
- **ORM:** Prisma
- **Database:** PostgreSQL (Docker)
- **Real-Time:** Socket.io
- **Task Scheduling:** `@nestjs/schedule` (Cron Jobs)
- **Authentication:** JWT & Argon2

---

## 📐 Key Architectures

1. **Real-Time Rooms:** WebSocket traffic is isolated into rooms named `auction_{auctionId}` so only users active in a specific auction receive its real-time updates.
2. **Automated Closures:** A Cron Job checks active auctions every 10 seconds. When an auction expires, the status is updated to `FINISHED`, the winner is calculated, and the `auction_finished` event is emitted.

---

## 🚦 REST API Endpoints

All `/auction` routes require an `Authorization: Bearer <token>` header.

### Authentication (`/auth`)
- **POST** `/auth/register` - Create a user.
- **POST** `/auth/login` - Authenticate and get JWT token.

### Auctions (`/auction`)
- **POST** `/auction/create` - Create a new auction.
- **GET** `/auction` - List all auctions.
- **GET** `/auction/:id` - Fetch details of a single auction.
- **POST** `/auction/bid` - Place a bid via REST.

---

## 📡 WebSocket Events (Socket.io)

WebSocket connections require authentication (JWT) passed in handshake headers (e.g. `Authorization` or `authorization`) or via the `token` auth payload.

### Listeners (Client -> Server)
- **`join_auction`** - Join the room `auction_{auctionId}`. Payload: `{ "auctionId": "string" }`
- **`place_bid`** - Place a bid. Payload: `{ "auctionId": "string", "amount": number }`

### Emitters (Server -> Client)
- **`bids_history`** - Emits the list of previous bids to the user who joined.
- **`user_joined`** - Broadcasts when a user joins the room.
- **`bid_updated`** - Broadcasts the updated auction details on new bid.
- **`outbid`** - Broadcasts warning message to users outbid in the room.
- **`bid_failed`** - Emits validation error directly to the sender.
- **`auction_finished`** - Broadcasts winner and final price when the Cron Job closes the auction.

---

## ⚙️ Getting Started

### 1. Environment Setup
Create a `.env` file in the root:
```env
PORT=3000
DATABASE_URL="postgresql://postgres:root@localhost:5439/real-time-auction_db?schema=public"
JWT_SECRET_KEY="your-secret-key"
```

Create a `.env.test` file:
```env
DATABASE_URL="postgresql://postgres:root@localhost:5438/real-time-auction_test?schema=public"
JWT_SECRET_KEY="your-test-secret-key"
```

### 2. Start PostgreSQL Containers
```bash
docker compose up -d
```

### 3. Install & Setup Database
```bash
npm install
npx prisma migrate dev --name init
npm run db:test:push
```

### 4. Running the App
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### 5. Running Tests
```bash
# Unit Tests
npm run test

# E2E Tests
npm run test:e2e
```
