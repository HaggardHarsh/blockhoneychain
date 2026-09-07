# 🍯 HoneyChain

**Blockchain-based Honey Traceability & Smart Beekeeping System**

Built for Smart India Hackathon (SIH) 2026 — KVIC Honey Mission

## Features

- 🔗 **Blockchain Traceability** — Immutable batch tracking from hive to consumer on Polygon
- 📱 **QR Code Verification** — Consumers scan to verify honey authenticity
- 🧪 **FSSAI Quality Testing** — Lab results stored on blockchain with IPFS
- 🧑🌾 **Beekeeper App** — Mobile-first PWA for registration, hive & batch management
- 🏛️ **Admin Dashboard** — KVIC oversight with analytics, approvals, and quality audit
- 🐝 **Smart Beekeeping** — IoT-ready architecture for hive monitoring (Phase 2)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 + Tailwind CSS + shadcn/ui |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Blockchain | Solidity + Hardhat + Polygon Amoy |
| Auth | JWT + bcryptjs |
| Storage | IPFS (Pinata) |

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- Git

### Setup

```bash
# 1. Clone and install dependencies
git clone <repo-url>
cd honeychain
npm run install:all

# 2. Set up environment variables
copy server\.env.example server\.env
# Edit server/.env with your MongoDB URI, JWT secret, etc.

# 3. Start local blockchain (Option A - for local dev)
npm run dev:blockchain

# 4. Deploy contracts locally (in new terminal)
npm run deploy:contracts

# 5. Seed database with demo data
npm run seed

# 6. Start backend
npm run dev:server

# 7. Start frontend (in new terminal)
npm run dev:client
```

### Access
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Hardhat Node**: http://localhost:8545

### Demo Accounts (after seeding)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@honeychain.com | admin123 |
| Beekeeper | ram@example.com | beekeeper123 |
| Lab Tester | lab@honeychain.com | lab123 |

## 🔷 Deploy to Polygon Amoy Testnet

To deploy smart contracts to the real Polygon blockchain (testnet):

### 1. Set Up MetaMask Wallet
- Install [MetaMask](https://metamask.io/download/) browser extension
- Add Polygon Amoy network manually:
  - **RPC URL**: `https://polygon-amoy-bor-rpc.publicnode.com`
  - **Chain ID**: `80002`
  - **Symbol**: `POL`
  - **Explorer**: `https://amoy.polygonscan.com/`
- Get free test tokens from [faucet.polygon.technology](https://faucet.polygon.technology/)

### 2. Configure & Deploy

```bash
# Create blockchain .env with your private key
cd blockchain
copy .env.example .env  # Edit and add your PRIVATE_KEY

# Deploy to Amoy
npm run deploy:amoy

# Copy the printed contract addresses to server/.env
```

### 3. Update Server
Set `BLOCKCHAIN_RPC_URL` and contract addresses in `server/.env` (the deploy script prints exactly what to copy).

### 4. Verify
Visit the PolygonScan links printed after deployment to see your contracts live on the blockchain!

## ☁️ Cloud Deployment

For deploying to Netlify + Render for live demos, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Project Structure

```
honeychain/
├── blockchain/     # Solidity smart contracts (Hardhat)
├── server/         # Express.js REST API
├── client/         # Next.js 14 PWA frontend
├── client-landing/ # Landing page
├── DEPLOYMENT.md   # Cloud deployment guide
└── README.md
```

## Running Modes

| Mode | Command | Blockchain |
|------|---------|------------|
| Local + Hardhat | `npm run dev:blockchain` | Localhost (default) |
| Local + Amoy | Set Amoy env vars | Polygon Amoy testnet |
| Cloud Demo | Deploy to Render + Netlify | Polygon Amoy testnet |
| No Blockchain | Leave BLOCKCHAIN_* empty | Disabled (MongoDB only) |

## License

MIT — Built for SIH 2026
