
export type Category = string;
export enum Status { CONFIRMADO = 'Confirmado', PENDIENTE = 'Pendiente', BAJA = 'Baja' }

export enum TrackFlag {
  VERDE = 'Verde',
  AMARILLA = 'Amarilla',
  ROJA = 'Roja',
  AZUL = 'Azul',
  CUADROS = 'Cuadros'
}

export type UserRole = 'SuperAdmin' | 'Comisario Deportivo' | 'Escrutador Técnico' | 'Secretario' | 'Prensa';

export interface AdminUser {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  name: string;
  lastLogin?: number;
  permissions: string[];
}

export interface Championship {
  id: string;
  name: string;
  status: string;
  dates: string;
  tracks: string;
  image: string;
  year: number;
  events?: ChampionshipEvent[];
  champions?: { category: string; pilot: string; kart: string }[];
}

export interface ChampionshipEvent {
  id: string;
  round: number;
  name: string;
  date: string;
  track: string;
  // Added 'Próxima' to allowed statuses
  status: 'Programada' | 'En curso' | 'Finalizada' | 'Suspendida' | 'Próxima';
  briefingSigned?: string[]; // IDs de pilotos que firmaron
  technicalScrutiny?: Record<string, boolean>; // Pilot ID -> Status
}

export interface Circuit {
  id: string;
  name: string;
  location: string;
  length: string;
  image: string;
  description: string;
  features: string[];
  surfaceStatus?: string;
  emergencyPhone?: string;
  records?: { category: string; pilot: string; time: string; date: string }[];
}

export interface Pilot {
  id: string;
  number: string;
  name: string;
  category: Category;
  status: Status;
  ranking: number;
  medicalLicense: string;
  sportsLicense: string;
  transponderId: string;
  conductPoints: number; 
  lastUpdated: string;
  createdAt: number;
  stats: { wins: number; podiums: number; poles: number; points?: number };
  bloodType?: string;
  emergencyContact?: string;
  // Added association property to Pilot interface
  association?: string;
}

export interface SystemSettings {
  paddockTicker: string;
  maintenanceMode: boolean;
  registrationsOpen: boolean;
  activeVoting?: boolean;
  weatherInfo?: string;
  liveTimingUrl: string;
  // Added Orbits configuration properties
  useLocalOrbits?: boolean;
  orbitsIp?: string;
}

export interface AuditLog {
  id: string;
  timestamp: number;
  admin: string;
  action: string;
  details: string;
  ip?: string;
}

export type RegulationCategory = 'Técnico' | 'Deportivo' | 'Calendario' | 'Anexo' | 'Circular';

export interface Regulation {
  id: string;
  title: string;
  description: string;
  category: RegulationCategory;
  version: string;
  date: string;
  fileSize: string;
  fileData: string; // Base64 PDF
  isDraft: boolean;
}

export interface TimingRow {
  pos: number;
  no: string;
  name: string;
  laps: number;
  lastLap: string;
  bestLap: string;
  gap: string;
  // Added fields required by LiveCenter
  s1?: string;
  s2?: string;
  s3?: string;
  interval?: string;
  status?: string;
  isSessionBest?: boolean;
  isPersonalBest?: boolean;
  isS1Best?: boolean;
  isS2Best?: boolean;
  isS3Best?: boolean;
  predictive?: string;
  delta?: 'up' | 'down' | 'steady';
  transponderSignal?: string;
}

export interface PressRelease {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  category: 'Oficial' | 'Prensa' | 'Urgente';
}

// Added missing interfaces for Association, RaceResult, Penalty, and MarketplaceItem
export interface Association {
  id: string;
  name: string;
  description: string;
  circuitIds: string[];
}

export interface RaceResult {
  id: string;
  pilotId: string;
  position: number;
  time: string;
  category: Category;
}

export type PenaltyType = 'Exclusión' | 'Recargo 5s' | 'Recargo 10s' | 'Recargo 20s' | 'Recargo Puesto' | 'Sanción';

export interface Penalty {
  id: string;
  pilotId: string;
  pilotName?: string; // Optional for denormalized display
  number?: string;    // Optional for denormalized display
  category: string;
  type: PenaltyType;
  reason: string;
  points?: number;
  date: string;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  price: string;
  category: 'Kart Completo' | 'Motor' | 'Repuestos' | 'Indumentaria';
  condition: 'Nuevo' | 'Usado';
  image: string;
  contact: string;
}
