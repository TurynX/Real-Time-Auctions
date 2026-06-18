Markdown# ⚡ Real-Time Auction System

A robust, production-ready real-time auction backend built with **NestJS**, **WebSockets (Socket.io)**, and **Prisma**. This system handles live bidding concurrency, group isolation using WebSockets Rooms, and automated auction closing via background Cron Jobs.

---

## 🚀 Features

- **Real-Time Bidding:** Instant bid updates broadcasted to interested users using Socket.io.
- **Performance Optimized (Rooms):** Users only receive updates for the specific auction they are viewing, saving server bandwidth.
- **Automated Auction Closing:** A background Cron Job runs every 10 seconds to detect expired auctions, finalize statuses, and determine winners.
- **Secure Authentication:** WebSocket connections and events are protected by JWT Guards.
- **Clean Architecture:** Strict separation of concerns between the Gateway (Transport), Use Cases (Business Logic), and Repositories (Data Access).

---

## 🛠️ Tech Stack

- **Framework:** [NestJS](https://nestjs.com/)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database:** PostgreSQL
- **Real-Time:** [Socket.io](https://socket.io/)
- **Task Scheduling:** `@nestjs/schedule` (Cron Jobs)

---

## 📐 Architecture & Flow

### 1. The Real-Time Room Flow (`Gateway`)

Instead of broadcasting every bid to every connected user on the platform, the server isolates traffic using **Rooms**.

- When a user opens an auction page, the client emits `join_auction`.
- The server adds the client to a room named `auction_${auctionId}` and alerts other participants (`client.broadcast`).
- When a valid bid is placed via `place_bid`, the updated state is sent **only** to that specific room.

### 2. The Background Worker Flow (`Cron Job`)

To avoid relying on frontend triggers to end an auction, a self-contained background task handles the lifecycle:

```text
[ Every 10 Seconds ]
        │
        ▼
Find auctions where status = 'ACTIVE' AND endsAt < NOW
        │
        ├─► No auctions found? → Exit.
        │
        ▼
For each expired auction:
   1. Update status to 'FINISHED'
   2. Fetch highest bid (Winner)
   3. Emit 'auction_finished' to the WebSocket Room
   4. [Future Hook] Trigger Stripe Payment Charge
🚦 WebSocket Events APIEvent NameTypePayloadDescriptionjoin_auctionListen{ "auctionId": "uuid" }Joins the specific auction room.user_joinedEmit{ "userId": "uuid", "message": "..." }Broadcasted to the room when a new user enters.place_bidListen{ "auctionId": "uuid", "amount": 350 }Submits a new bid (Requires Auth Guard).bid_updatedEmitAuction ObjectBroadcasted to the room when a new highest bid is accepted.bid_failedEmitString (Error Message)Sent only to the sender if the bid violates business rules.auction_finishedEmit{ "auctionId": "uuid", "winnerId": "uuid", "finalPrice": 350 }Broadcasted when the Cron Job closes the auction.⚙️ Getting StartedPrerequisitesNode.js (v18 or higher)PostgreSQL instance runningInstallationClone the repository:Bashgit clone [https://github.com/your-username/realtime-auction-backend.git](https://github.com/your-username/realtime-auction-backend.git)
cd realtime-auction-backend
Install dependencies:Bashnpm install
Setup your environment variables (.env):Code snippetDATABASE_URL="postgresql://user:password@localhost:5432/auction_db?schema=public"
JWT_SECRET="your_ultra_secure_jwt_secret"
Run database migrations:Bashnpx prisma migrate dev
Start the application in development mode:Bashnpm run start:dev
The server will start on http://localhost:3000. You can connect your WebSocket client (like Insomnia or Postman) to ws://localhost:3000.
```
