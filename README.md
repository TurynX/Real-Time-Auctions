# ⚡ Real-Time Auction System

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

- **Framework:** NestJS
- **Database ORM:** Prisma
- **Database:** PostgreSQL
- **Real-Time:** Socket.io
- **Task Scheduling:** @nestjs/schedule (Cron Jobs)

---

## 📐 Architecture & Flow

### 1. The Real-Time Room Flow (Gateway)

Instead of broadcasting every bid to every connected user on the platform, the server isolates traffic using **Rooms**.

- When a user opens an auction page, the client emits `join_auction`.
- The server adds the client to a room named `auction_{auctionId}` and alerts other participants (`client.broadcast`).
- When a valid bid is placed via `place_bid`, the updated state is sent **only** to that specific room.

### 2. The Background Worker Flow (Cron Job)

To avoid relying on frontend triggers to end an auction, a self-contained background task handles the lifecycle:

- Every 10 Seconds the Cron Job runs automatically.
- It finds auctions where status is ACTIVE and endsAt is less than the current time.
- If none are found, it exits.
- For each expired auction: it updates the status to FINISHED, fetches the highest bid to determine the winner, and emits `auction_finished` directly to that WebSocket Room.

---

## 🚦 WebSocket Events API

- **`join_auction`** (Listen) -> Payload: `{ "auctionId": "uuid" }` -> Joins the specific auction room.
- **`user_joined`** (Emit) -> Payload: `{ "userId": "uuid", "message": "..." }` -> Broadcasted to the room when a new user enters.
- **`place_bid`** (Listen) -> Payload: `{ "auctionId": "uuid", "amount": 350 }` -> Submits a new bid (Requires Auth Guard).
- **`bid_updated`** (Emit) -> Payload: `Auction Object` -> Broadcasted to the room when a new highest bid is accepted.
- **`bid_failed`** (Emit) -> Payload: `String (Error Message)` -> Sent only to the sender if the bid violates business rules.
- **`auction_finished`** (Emit) -> Payload: `{ "auctionId": "uuid", "winnerId": "uuid", "finalPrice": 350 }` -> Broadcasted when the Cron Job closes the auction.

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL instance running

### Installation

1. Clone the repository:

```bash
git clone [https://github.com/your-username/realtime-auction-backend.git](https://github.com/your-username/realtime-auction-backend.git)
cd realtime-auction-backend
```
