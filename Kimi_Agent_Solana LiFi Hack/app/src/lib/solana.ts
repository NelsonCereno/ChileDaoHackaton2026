import { Connection, PublicKey, SystemProgram, Transaction, clusterApiUrl } from '@solana/web3.js';

export const PROGRAM_ID = new PublicKey('Edumint1111111111111111111111111111111111112');
export const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

export interface AcademicWork {
  workId: number;
  professor: string;
  title: string;
  description: string;
  contentHash: string;
  priceLamports: number;
  createdAt: number;
  accessCount: number;
}

export const WORK_SEED = 'academic_work';
export const REGISTRY_SEED = 'registry';
export const ACCESS_RECORD_SEED = 'access_record';

export function getWorkPDA(workId: number, programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(WORK_SEED),
      Buffer.from(new Uint8Array(new BigUint64Array([BigInt(workId)]).buffer)),
    ],
    programId
  );
}

export function getRegistryPDA(authority: PublicKey, programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(REGISTRY_SEED), authority.toBuffer()],
    programId
  );
}

export function lamportsToSOL(lamports: number): string {
  return (lamports / 1_000_000_000).toFixed(4);
}

export function truncateAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// Mock works for demo since we can't deploy a real Anchor program
export const MOCK_WORKS: AcademicWork[] = [
  {
    workId: 1,
    professor: 'Dr7xK9mP2qR5sT8vW1yZ3aB6cD4eF0gH2iJ4kL6nO8p',
    title: 'Quantum Entanglement in Macroscopic Systems',
    description: 'A comprehensive study on the observable effects of quantum entanglement at macroscopic scales, challenging classical decoherence theory.',
    contentHash: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    priceLamports: 50000000,
    createdAt: Date.now() - 86400000 * 5,
    accessCount: 23,
  },
  {
    workId: 2,
    professor: 'Prof9wX7yZ1aB3cD5eF0gH2iJ4kL6nO8pQ0rS2tU4v',
    title: 'Neural Pathways in Adaptive Learning Algorithms',
    description: 'Exploring biologically-inspired neural architectures that enable continuous learning without catastrophic forgetting in deep networks.',
    contentHash: 'fedcba09876543211234567890abcdef1234567890abcdef1234567890abcdef',
    priceLamports: 75000000,
    createdAt: Date.now() - 86400000 * 12,
    accessCount: 47,
  },
  {
    workId: 3,
    professor: 'Res3aB5cD7eF0gH2iJ4kL6nO8pQ0rS2tU4vW6xY8z',
    title: 'Decentralized Consensus Mechanisms for Academic Peer Review',
    description: 'A novel protocol for transparent, incentivized peer review using blockchain technology to ensure research integrity.',
    contentHash: '5678901234abcdef5678901234abcdef5678901234abcdef5678901234abcdef',
    priceLamports: 30000000,
    createdAt: Date.now() - 86400000 * 3,
    accessCount: 15,
  },
  {
    workId: 4,
    professor: 'Dr7xK9mP2qR5sT8vW1yZ3aB6cD4eF0gH2iJ4kL6nO8p',
    title: 'Climate Modeling Through Sparse Satellite Data Fusion',
    description: 'Advanced Bayesian methods for reconstructing global climate patterns from limited satellite observations using tensor decomposition.',
    contentHash: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    priceLamports: 60000000,
    createdAt: Date.now() - 86400000 * 8,
    accessCount: 31,
  },
  {
    workId: 5,
    professor: 'Prof9wX7yZ1aB3cD5eF0gH2iJ4kL6nO8pQ0rS2tU4v',
    title: 'Cryptographic Zero-Knowledge Proofs for Genomic Privacy',
    description: 'Implementing zk-SNARKs to enable privacy-preserving genomic data sharing in distributed medical research networks.',
    contentHash: '1234abcdef5678901234abcdef5678901234abcdef5678901234abcdef567890',
    priceLamports: 90000000,
    createdAt: Date.now() - 86400000 * 20,
    accessCount: 62,
  },
];

// Get all registered works
export async function getAllWorks(): Promise<AcademicWork[]> {
  // In production, this would fetch from the Solana program
  return MOCK_WORKS;
}

// Get a single work by ID
export async function getWorkById(workId: number): Promise<AcademicWork | null> {
  const works = await getAllWorks();
  return works.find(w => w.workId === workId) || null;
}

// Get works by professor
export async function getWorksByProfessor(professorAddress: string): Promise<AcademicWork[]> {
  const works = await getAllWorks();
  return works.filter(w => w.professor === professorAddress);
}

// Access a work (pay and record access)
export async function accessWork(
  connection: Connection,
  payerPublicKey: PublicKey,
  work: AcademicWork,
  sendTransaction: (transaction: Transaction, connection: Connection) => Promise<string>
): Promise<string> {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: payerPublicKey,
      toPubkey: new PublicKey(work.professor),
      lamports: work.priceLamports,
    })
  );

  const signature = await sendTransaction(transaction, connection);
  await connection.confirmTransaction(signature, 'confirmed');

  // Increment access count locally for demo
  work.accessCount += 1;

  return signature;
}

// Register a new work
export async function registerWork(
  _connection: Connection,
  _title: string,
  _description: string,
  _contentHash: string,
  _priceLamports: number,
  _professorPublicKey: PublicKey
): Promise<AcademicWork> {
  // In production, this would call the Anchor program
  const newWork: AcademicWork = {
    workId: MOCK_WORKS.length + 1,
    professor: _professorPublicKey.toString(),
    title: _title,
    description: _description,
    contentHash: _contentHash,
    priceLamports: _priceLamports,
    createdAt: Date.now(),
    accessCount: 0,
  };
  MOCK_WORKS.push(newWork);
  return newWork;
}
