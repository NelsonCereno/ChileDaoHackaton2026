# EduMint Anchor Program

This folder contains the Anchor program for the EduMint registry.

## Setup

1) Install Solana + Anchor.
2) Create or reuse a devnet wallet: `solana-keygen new`.
3) Airdrop devnet SOL: `solana airdrop 2`.

## Build & Deploy (devnet)

From this folder:

- `anchor build`
- `anchor deploy`

After deployment, update these values to the new program id:

- app/anchor/Anchor.toml
- app/anchor/programs/edumint/src/lib.rs (declare_id)
- app/src/idl/edumint.json (metadata.address)
- app/.env (VITE_SOLANA_PROGRAM_ID)

Then rebuild the frontend.
