# 🚀 HoneyChain Deployment Guide

This guide covers deploying HoneyChain to the cloud for live demos and production use.

## Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Netlify (free)  │────▶│ Render (free)    │────▶│ Polygon Amoy │
│  Next.js Client  │ API │ Express Server   │ RPC │  Testnet     │
│  Static Hosting  │     │ + MongoDB Atlas  │     │  Contracts   │
└──────────────────┘     └──────────────────┘     └──────────────┘
```

## Prerequisites

- [MetaMask](https://metamask.io) browser extension with Polygon Amoy network added
- Free POL test tokens from [faucet.polygon.technology](https://faucet.polygon.technology/)
- [MongoDB Atlas](https://www.mongodb.com/atlas) free cluster
- [Render](https://render.com) free account (for server)
- [Netlify](https://www.netlify.com) free account (for frontend)

## Step 1: Deploy Smart Contracts to Polygon Amoy

### 1.1 Configure Wallet

```bash
# In the blockchain/ directory, create .env file:
cd blockchain
copy .env.example .env  # or: cp .env.example .env
```

Edit `blockchain/.env`:
```env
AMOY_RPC_URL=https://polygon-amoy-bor-rpc.publicnode.com
PRIVATE_KEY=your_metamask_private_key_here
```

### 1.2 Deploy Contracts

```bash
# From project root:
npm run deploy:amoy
```

This will:
- Deploy all 3 contracts to Polygon Amoy
- Wait for block confirmations
- Save addresses to `blockchain/deployed-addresses.json`
- Print env vars to copy into `server/.env`

### 1.3 Verify on PolygonScan

After deployment, visit the printed PolygonScan links to confirm your contracts are live.

## Step 2: Deploy Backend to Render

### 2.1 Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) → Create free cluster
2. Create a database user
3. Whitelist `0.0.0.0/0` in Network Access (allows Render to connect)
4. Get your connection string: `mongodb+srv://user:pass@cluster.mongodb.net/honeychain`

### 2.2 Deploy to Render

1. Go to [Render](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. Settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

4. Add **Environment Variables**:

| Variable | Value |
|----------|-------|
| `PORT` | `5000` |
| `MONGODB_URI` | `mongodb+srv://...` (from Atlas) |
| `JWT_SECRET` | `your_strong_random_secret` |
| `JWT_EXPIRY` | `7d` |
| `BLOCKCHAIN_RPC_URL` | `https://polygon-amoy-bor-rpc.publicnode.com` |
| `DEPLOYER_PRIVATE_KEY` | Your MetaMask private key |
| `BEEKEEPER_REGISTRY_ADDRESS` | From deployment output |
| `HONEY_BATCH_ADDRESS` | From deployment output |
| `QUALITY_CERT_ADDRESS` | From deployment output |
| `FRONTEND_URL` | Your Netlify URL |

## Step 3: Deploy Frontend to Netlify

1. Go to [Netlify](https://www.netlify.com) → New site from Git
2. Connect your GitHub repo
3. Settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/.next`

4. Add **Environment Variable**:
   - `NEXT_PUBLIC_API_URL` = Your Render backend URL (e.g., `https://honeychain-api.onrender.com`)

## Step 4: Test

1. Open your Netlify URL
2. Login with seeded accounts
3. Create a batch → check PolygonScan for the transaction
4. Scan QR code → verify blockchain data loads

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No POL balance" | Get tokens from [faucet.polygon.technology](https://faucet.polygon.technology/) |
| RPC timeout | Try alternative: `https://polygon-amoy.drpc.org` |
| Contract verification fails | Get free API key from [polygonscan.com/apis](https://polygonscan.com/apis) |
| Server can't connect to blockchain | Check env vars on Render dashboard |
| Blockchain service shows unavailable | Contract addresses may be empty — redeploy |

## Running Modes

| Mode | How | Blockchain |
|------|-----|------------|
| **Local + Hardhat** | `npm run dev:blockchain` + `deploy:contracts` | Localhost |
| **Local + Amoy** | Set Amoy env vars in `server/.env` | Polygon Amoy |
| **Cloud Demo** | Server on Render + Client on Netlify | Polygon Amoy |
| **No Blockchain** | Remove all `BLOCKCHAIN_*` vars | Disabled (MongoDB only) |
