# EduMint — Decentralized Academic IP Registry

A decentralized platform where professors and researchers notarize their study materials on-chain as proof of intellectual property ownership, and global students pay micro-fees to access that content using crypto from any blockchain.

## Deployed Program

- **Program ID:** `EdumintXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` (replace after deploy)
- **Network:** Solana Devnet
- **Explorer:** https://explorer.solana.com/address/[YOUR_PROGRAM_ID]?cluster=devnet

## Live Demo

- **Frontend:** [YOUR_DEPLOYED_URL]

## What It Does

EduMint allows professors to notarize academic works on-chain and receive payments from students worldwide. Students can pay directly with SOL on Solana, or use tokens from any EVM chain (Ethereum, Base, Arbitrum, Polygon, BSC) via LI.FI cross-chain bridging.

### Key Features

- **On-chain IP Registry:** Professors register academic works with SHA-256 content hashes as proof of existence
- **SOL Payments:** Students pay directly with SOL to access academic works
- **Cross-Chain Payments:** Students can pay from any EVM chain via LI.FI — ETH on Base bridges to SOL on Solana
- **Access Control:** On-chain access records prevent double-purchases and verify ownership

## Tech Stack

- **Smart Contract:** Rust + Anchor 0.30.1 — Solana program with 4 instructions
- **Cross-Chain:** LI.FI SDK — quotes and route execution from EVM → Solana
- **Frontend:** React + Vite + Tailwind CSS
- **Wallet:** Solana Wallet Adapter (Phantom, Solflare)

## How to Test

1. Connect your Solana wallet (Phantom recommended)
2. Switch to Devnet
3. As a professor: register a work with title, description, file upload, and price
4. As a student: browse works and access one by paying SOL on devnet
5. Try cross-chain: use the LI.FI option to pay from Base/ETH

## Local Development

### Prerequisites

- Rust + Cargo
- Solana CLI (`solana-install init 1.18.18`)
- Anchor CLI (`cargo install --git https://github.com/coral-xyz/anchor avm`)
- Node.js 18+

### Deploy the Program

```bash
cd "Kimi_Agent_Solana LiFi Hack/app/anchor"

# Generate a new keypair for the program
solana-keygen new -o target/deploy/edumint-keypair.json --force

# Get the program ID
NEW_PROGRAM_ID=$(solana address -k target/deploy/edumint-keypair.json)
echo "New Program ID: $NEW_PROGRAM_ID"

# Update lib.rs with the new program ID
# Replace: declare_id!("EdumintXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
# With:    declare_id!("YOUR_NEW_PROGRAM_ID");

# Update Anchor.toml with the new program ID
# Replace: edumint = "EdumintXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
# With:    edumint = "YOUR_NEW_PROGRAM_ID"

# Update the frontend IDL
# In app/src/idl/edumint.json, replace the metadata.address field

# Build and deploy
anchor build
anchor deploy --provider.cluster devnet
```

### Run the Frontend

```bash
cd "Kimi_Agent_Solana LiFi Hack/app"

# Install dependencies
npm install

# Create .env file (optional, for custom RPC or program ID)
echo "VITE_SOLANA_PROGRAM_ID=YOUR_PROGRAM_ID" > .env
echo "VITE_SOLANA_RPC_URL=https://api.devnet.solana.com" >> .env

# Start dev server
npm run dev
```

## Program Instructions

| Instruction | Description |
|---|---|
| `initializeRegistry` | Creates the global registry (singleton PDA) |
| `registerWork` | Professor registers academic work with title, description, content hash, and price |
| `updatePrice` | Professor updates the SOL price of their work |
| `accessWork` | Student pays SOL to professor and gets access to the work |

## Account Structures

| Account | Fields |
|---|---|
| `Registry` | authority, next_work_id |
| `AcademicWork` | work_id, professor, title, description, content_hash, price_lamports, created_at, access_count |
| `Access` | work_id, student, accessed_at |

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Student   │────▶│  LI.FI SDK   │────▶│  Solana Devnet  │
│  (EVM Chain)│     │  (Bridge)    │     │  (Program)      │
└─────────────┘     └──────────────┘     └─────────────────┘
                                                  │
┌─────────────┐     ┌──────────────┐              │
│  Professor  │◀────│   SOL        │◀─────────────┘
│  (Wallet)   │     │   Payment    │
└─────────────┘     └──────────────┘
```
