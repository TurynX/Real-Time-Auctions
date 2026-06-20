# ⚡ Real-Time Auction System

A robust, production-ready real-time auction backend built with **NestJS**, **WebSockets (Socket.io)**, and **Prisma ORM**. This system is designed to handle live bidding concurrency, traffic isolation using WebSocket Rooms, and automated auction closing via background Cron Jobs.

---

## 🛠️ Tech Stack

- **Framework:** [NestJS](https://nestjs.com/) (v11)
- **Database ORM:** [Prisma](https://www.prisma.io/) (v6)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (v15 running inside Docker Alpine)
- **Real-Time Communication:** [Socket.io](https://socket.io/) / WebSockets
- **Task Scheduling:** `@nestjs/schedule` (Cron Jobs)
- **Authentication:** JWT (JSON Web Tokens) & Argon2 (password hashing)
- **Testing:** Jest & Supertest

---

## 📐 Architecture & Flows

The project separates concerns using clean architecture principles, separating **Gateways** (WebSockets), **Controllers** (HTTP), **Use Cases** (Business Logic), and **Repositories** (Data Access).

### 1. Real-Time Room Isolation Flow (WebSocket Gateway)

Rather than broadcasting every single bid to every connected client on the platform, the server isolates network traffic into individual auction channels called **Rooms**.

```mermaid
sequenceDiagram
    autonumber
    participant Client A as User A (Client)
    participant Server as NestJS Gateway
    participant Client B as User B (Client)

    Note over Client A, Server: Handshake with JWT Guard (WsAuthGuard)
    Client A->>Server: join_auction { auctionId }
    Note over Server: Joins room: "auction_{auctionId}"
    Server-->>Client A: bids_history [ ...list of past bids ]
    Server-->>Client B: user_joined { userId, message } (Broadcast to others in room)

    Client A->>Server: place_bid { auctionId, amount }
    Note over Server: Executes placeBidUseCase
    Server-->>Server: Update database with highest bid
    Server-->>Client A: bid_updated { updatedAuction } (To all in room)
    Server-->>Client B: bid_updated { updatedAuction } (To all in room)
    Server-->>Client B: outbid { message } (To others in room)
```

### 2. Background Worker Flow (Cron Job)

To avoid relying on client-side triggers to end an auction, a background cron task manages the lifecycle securely on the server:

```mermaid
flowchart TD
    A[Cron Job Triggered Every 10 Seconds] --> B[Find ACTIVE auctions with endsAt < current_time]
    B --> C{Any expired auctions found?}
    C -- No --> D[Exit Execution]
    C -- Yes --> E[Iterate through expired auctions]
    E --> F[Update status to FINISHED in DB]
    E --> G[Fetch highest bid from DB]
    E --> H{Is there a winning bid?}
    H -- Yes --> I[Assign winnerId to Auction & log victory]
    H -- No --> J[Log auction ended without bids]
    E --> K[Emit 'auction_finished' event to Room 'auction_{id}']
```

---

## 🗄️ Database Schema (Prisma)

The application utilizes **PostgreSQL** with a clean database schema mapped out via Prisma:

- **User**: Represents clients who can register, login, create auctions, place bids, and win auctions.
- **Auction**: Represents an item up for sale. It tracks prices, timestamps, status (`ACTIVE`, `FINISHED`, `CANCELED`), the creator, and the eventual winner.
- **Bid**: Tracks each individual bid amount, connection to the respective user, and the target auction.
- **Payment**: Relates to an auction to handle invoicing/checkout details (defaults to `PENDING`).

```mermaid
erDiagram
    users ||--o{ auctions : "auctionsCreated (creator_id)"
    users ||--o{ auctions : "auctionsWon (winner_id)"
    users ||--o{ bids : "bids (user_id)"
    auctions ||--o{ bids : "bids (auction_id)"
    auctions ||--o| payments : "payment (auction_id)"
```

---

## 🚦 REST API Endpoints

### 🔐 Authentication (`/auth`)

| Method   | Endpoint         | Description              | Payload (JSON)                                                                      |
| :------- | :--------------- | :----------------------- | :---------------------------------------------------------------------------------- |
| **POST** | `/auth/register` | Register a new user      | `{ "name": "John Doe", "email": "john@example.com", "password": "securepassword" }` |
| **POST** | `/auth/login`    | Log in and receive a JWT | `{ "email": "john@example.com", "password": "securepassword" }`                     |

### 🔨 Auctions (`/auction`)

> [!NOTE]
> All `/auction` endpoints require a valid JWT token in the `Authorization: Bearer <token>` header.

| Method   | Endpoint          | Description                       | Payload (JSON) / Params                                                                                                  |
| :------- | :---------------- | :-------------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| **POST** | `/auction/create` | Create a new auction              | `{ "title": "Rare Art", "description": "18th century painting", "initialPrice": 100, "endsAt": "2026-06-25T12:00:00Z" }` |
| **GET**  | `/auction`        | List all auctions                 | _None_                                                                                                                   |
| **GET**  | `/auction/:id`    | Fetch details of a single auction | `:id` (UUID string in route)                                                                                             |
| **POST** | `/auction/bid`    | Place a bid via REST API          | `{ "auctionId": "uuid", "amount": 150 }`                                                                                 |

---

## 📡 WebSocket API (Socket.io)

### Connection Security

WebSocket connections are guarded by `WsAuthGuard`. You must provide your JWT token during the handshake in one of the following places:

1. **Handshake Headers:** `authorization` / `Authorization` (e.g. `Bearer <token>`)
2. **Handshake Auth Payload:** `token` (e.g. `{ auth: { token: "<your-jwt-token>" } }`)

### Listeners (Events client sends to server)

#### 1. `join_auction`

- **Payload:** `{ "auctionId": "string" }`
- **Behavior:** Joins the client to the WebSocket room named after the auction ID. It sends back the history of all bids and broadcasts a notification to other participants that a new user entered.

#### 2. `place_bid`

- **Payload:** `{ "auctionId": "string", "amount": number }`
- **Behavior:** Places a new bid on the auction. Validates bid requirements (e.g., must be higher than current price, auction must be active, etc.). If successful, broadcasts updates.

---

### Emitters (Events server broadcasts to clients)

#### 1. `bids_history`

- **Payload:** Array of bid objects:
  ```json
  [
    {
      "id": "uuid",
      "amount": 150.0,
      "userId": "uuid",
      "createdAt": "2026-06-20T10:00:00.000Z"
    }
  ]
  ```
- **Sent to:** The user who just joined (`join_auction`).

#### 2. `user_joined`

- **Payload:** `{ "userId": "string", "message": "User joined the auction" }`
- **Sent to:** All other users currently in the auction room.

#### 3. `bid_updated`

- **Payload:** Complete updated `Auction` object including latest prices.
- **Sent to:** All users currently in the auction room.

#### 4. `outbid`

- **Payload:** `{ "message": "You have been outbid on the auction" }`
- **Sent to:** All other users currently in the room _except_ the bid creator.

#### 5. `bid_failed`

- **Payload:** `string` (Error message detailing validation/authorization failure).
- **Sent to:** The sender of the failed request only.

#### 6. `auction_finished`

- **Payload:**
  ```json
  {
    "auctionId": "uuid",
    "winnerId": "uuid-or-null",
    "finalPrice": 350.0,
    "message": "This auction has ended!"
  }
  ```
- **Sent to:** All users currently in the auction room. Emitted automatically by the background Cron worker.

---

## ⚙️ Getting Started

### 1. Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for running database services)

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Application Port
PORT=3000

# PostgreSQL Connection String
DATABASE_URL="postgresql://postgres:root@localhost:5439/real-time-auction_db?schema=public"

# JWT Secret
JWT_SECRET_KEY="your-super-secret-jwt-key"
```

Create a `.env.test` file in the root directory for automated testing:

```env
# Test PostgreSQL Connection String (Port 5438 matching docker-compose test container)
DATABASE_URL="postgresql://postgres:root@localhost:5438/real-time-auction_test?schema=public"
JWT_SECRET_KEY="your-test-super-secret-jwt-key"
```

### 3. Spin up the Database Containers

Run the docker-compose command to launch the Dev and Test PostgreSQL instances in the background:

```bash
docker compose up -d
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Setup Databases & Run Migrations

Generate the Prisma client and apply the migrations to your dev database:

```bash
# Push schema changes and run migrations for Dev database
npx prisma migrate dev --name init

# Push schema changes to your Test database
npm run db:test:push
```

### 6. Run the Application

```bash
# Development mode with watch mode enabled
npm run start:dev

# Production build and run
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

---

## 🧪 Testing

The project uses Jest for both Unit and End-to-End (E2E) testing.

```bash
# Run unit tests
npm run test

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with coverage reporting
npm run test:cov

# Run E2E tests
npm run test:e2e
```

---

## 📂 Project Structure

```
├── prisma/
│   ├── migrations/      # Database migrations
│   └── schema.prisma    # Prisma schema definition
├── src/
│   ├── main.ts          # Application bootstrap entrypoint
│   ├── app.module.ts    # Application main module configuration
│   ├── auth/            # Authentication module (JWT, Guards, Register, Login)
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── guards/
│   │   ├── repositories/
│   │   ├── use-case/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── auction/         # Auction module (Bidding, WebSocket Rooms, Cron Jobs)
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── gateways/    # WebSocket Gateway for real-time connection
│   │   ├── repositories/
│   │   ├── use-case/
│   │   ├── auction-cron.service.ts  # Background cron job for closure
│   │   ├── auction.controller.ts
│   │   ├── auction.service.ts
│   │   └── auction.module.ts
│   └── lib/             # Shared libraries (Prisma Client wrapper)
├── docker/              # Local Docker Postgres volumes
├── docker-compose.yml   # Multi-service local Postgres setup
├── package.json         # Scripts, configurations & package dependencies
└── tsconfig.json        # TypeScript configuration
```
