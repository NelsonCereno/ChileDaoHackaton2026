import { AnchorProvider, Program, BN } from '@coral-xyz/anchor';
import type { AnchorWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, SystemProgram, clusterApiUrl } from '@solana/web3.js';
import idl from '@/idl/edumint.json';

export const WORK_SEED = 'academic_work';
export const REGISTRY_SEED = 'registry';
export const ACCESS_SEED = 'access';

export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

export interface AcademicWork {
  workId: number;
  professor: string;
  title: string;
  description: string;
  contentHash: string;
  priceLamports: number;
  priceUsdc: number;
  createdAt: number;
  accessCount: number;
}

export interface AccessRecord {
  workId: number;
  student: string;
  accessedAt: number;
}

const DEFAULT_RPC = clusterApiUrl('devnet');
export const connection = new Connection(
  import.meta.env.VITE_SOLANA_RPC_URL || DEFAULT_RPC,
  'confirmed'
);

const PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_SOLANA_PROGRAM_ID || (idl as any).metadata?.address
);

export function getUsdcMint(): PublicKey {
  return new PublicKey(
    import.meta.env.VITE_SOLANA_USDC_MINT || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  );
}

function getReadOnlyWallet(): AnchorWallet {
  return {
    publicKey: SystemProgram.programId,
    signTransaction: async (tx) => tx,
    signAllTransactions: async (txs) => txs,
  };
}

function getProvider(conn: Connection, wallet?: AnchorWallet): AnchorProvider {
  const useWallet = wallet ?? getReadOnlyWallet();
  return new AnchorProvider(conn, useWallet, { preflightCommitment: 'confirmed' });
}

function getProgram(provider: AnchorProvider): any {
  const rawIdl = idl as any;
  const idlWithAddress = {
    ...rawIdl,
    address: PROGRAM_ID.toString(),
    metadata: {
      ...(rawIdl.metadata || {}),
      address: PROGRAM_ID.toString(),
    },
  };

  return new Program(idlWithAddress, provider as any) as Program;
}

export function getRegistryPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from(REGISTRY_SEED)], PROGRAM_ID);
}

export function getWorkPDA(workId: number): [PublicKey, number] {
  const idBytes = new BN(workId).toArrayLike(Buffer, 'le', 8);
  return PublicKey.findProgramAddressSync([Buffer.from(WORK_SEED), idBytes], PROGRAM_ID);
}

export function getAccessPDA(workId: number, student: PublicKey): [PublicKey, number] {
  const idBytes = new BN(workId).toArrayLike(Buffer, 'le', 8);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(ACCESS_SEED), idBytes, student.toBuffer()],
    PROGRAM_ID
  );
}

export function getAssociatedTokenAddress(owner: PublicKey, mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
}

export function lamportsToSOL(lamports: number): string {
  return (lamports / 1_000_000_000).toFixed(4);
}

export function baseUnitsToUsdc(amount: number): string {
  return (amount / 1_000_000).toFixed(2);
}

export function truncateAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

async function ensureRegistry(provider: AnchorProvider, wallet: AnchorWallet): Promise<void> {
  const program = getProgram(provider);
  const [registryPda] = getRegistryPDA();
  try {
    await program.account.registry.fetch(registryPda);
  } catch {
    await program.methods
      .initializeRegistry()
      .accounts({
        registry: registryPda,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }
}

function mapWork(raw: any): AcademicWork {
  return {
    workId: Number(raw.workId),
    professor: raw.professor.toString(),
    title: raw.title,
    description: raw.description,
    contentHash: raw.contentHash,
    priceLamports: Number(raw.priceLamports),
    priceUsdc: Number(raw.priceUsdc),
    createdAt: Number(raw.createdAt) * 1000,
    accessCount: Number(raw.accessCount),
  };
}

function mapAccess(raw: any): AccessRecord {
  return {
    workId: Number(raw.workId),
    student: raw.student.toString(),
    accessedAt: Number(raw.accessedAt) * 1000,
  };
}

export async function getAllWorks(conn: Connection = connection): Promise<AcademicWork[]> {
  const provider = getProvider(conn);
  const program = getProgram(provider);
  const accounts = await program.account.academicWork.all();
  return accounts.map((a: any) => mapWork(a.account));
}

export async function getWorkById(workId: number, conn: Connection = connection): Promise<AcademicWork | null> {
  const provider = getProvider(conn);
  const program = getProgram(provider);
  const [workPda] = getWorkPDA(workId);
  try {
    const account = await program.account.academicWork.fetch(workPda);
    return mapWork(account);
  } catch {
    return null;
  }
}

export async function getWorksByProfessor(
  professorAddress: string,
  conn: Connection = connection
): Promise<AcademicWork[]> {
  const works = await getAllWorks(conn);
  return works.filter((w) => w.professor === professorAddress);
}

export async function getAccessRecord(
  conn: Connection,
  workId: number,
  student: PublicKey
): Promise<AccessRecord | null> {
  const provider = getProvider(conn);
  const program = getProgram(provider);
  const [accessPda] = getAccessPDA(workId, student);

  try {
    const account = await program.account.access.fetch(accessPda);
    return mapAccess(account);
  } catch {
    return null;
  }
}

export async function hasAccess(
  conn: Connection,
  workId: number,
  student: PublicKey
): Promise<boolean> {
  const access = await getAccessRecord(conn, workId, student);
  return !!access;
}

export async function registerWork(
  conn: Connection,
  wallet: AnchorWallet,
  title: string,
  description: string,
  contentHash: string,
  priceLamports: number,
  priceUsdc: number
): Promise<AcademicWork> {
  const provider = getProvider(conn, wallet);
  await ensureRegistry(provider, wallet);
  const program = getProgram(provider);
  const [registryPda] = getRegistryPDA();
  const registry = await program.account.registry.fetch(registryPda);
  const nextWorkId = Number(registry.nextWorkId);
  const [workPda] = getWorkPDA(nextWorkId);

  await program.methods
    .registerWork(title, description, contentHash, new BN(priceLamports), new BN(priceUsdc))
    .accounts({
      registry: registryPda,
      work: workPda,
      professor: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  const account = await program.account.academicWork.fetch(workPda);
  return mapWork(account);
}

export async function updateWorkPrice(
  conn: Connection,
  wallet: AnchorWallet,
  workId: number,
  newPriceLamports: number
): Promise<void> {
  const provider = getProvider(conn, wallet);
  const program = getProgram(provider);
  const [workPda] = getWorkPDA(workId);

  await program.methods
    .updatePrice(new BN(newPriceLamports))
    .accounts({
      work: workPda,
      professor: wallet.publicKey,
    })
    .rpc();
}

export async function accessWork(
  conn: Connection,
  wallet: AnchorWallet,
  work: AcademicWork
): Promise<string> {
  const provider = getProvider(conn, wallet);
  const program = getProgram(provider);
  const [workPda] = getWorkPDA(work.workId);
  const [accessPda] = getAccessPDA(work.workId, wallet.publicKey);
  const professorKey = new PublicKey(work.professor);

  return program.methods
    .accessWork()
    .accounts({
      work: workPda,
      access: accessPda,
      payer: wallet.publicKey,
      professor: professorKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

export async function purchaseAccessUsdc(
  conn: Connection,
  wallet: AnchorWallet,
  work: AcademicWork,
  usdcMint: PublicKey = getUsdcMint()
): Promise<string> {
  const provider = getProvider(conn, wallet);
  const program = getProgram(provider);
  const [workPda] = getWorkPDA(work.workId);
  const [accessPda] = getAccessPDA(work.workId, wallet.publicKey);
  const professor = new PublicKey(work.professor);
  const [payerToken] = getAssociatedTokenAddress(wallet.publicKey, usdcMint);

  const professorTokenFromEnv = import.meta.env.VITE_SOLANA_PROFESSOR_USDC_ATA;
  const professorToken = professorTokenFromEnv
    ? new PublicKey(professorTokenFromEnv)
    : getAssociatedTokenAddress(professor, usdcMint)[0];

  return program.methods
    .purchaseAccessUsdc()
    .accounts({
      work: workPda,
      access: accessPda,
      payer: wallet.publicKey,
      professor,
      payerToken,
      professorToken,
      usdcMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}
