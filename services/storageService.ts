
import { Pilot, AuditLog, SystemSettings, TrackFlag, Championship, Circuit, Regulation, AdminUser, PressRelease, Penalty, Status, MarketplaceItem } from '../types';
import { INITIAL_PILOTS, INITIAL_CATEGORIES, INITIAL_CIRCUITS, INITIAL_CHAMPIONSHIPS } from '../constants';

const KEYS = {
  PILOTS: 'kdo_v10_pilots',
  SETTINGS: 'kdo_v10_settings',
  LOGS: 'kdo_v10_logs',
  TRACK: 'kdo_v10_track',
  AUTH: 'kdo_v10_auth',
  ADMINS: 'kdo_v10_admins',
  REGS: 'kdo_v10_regs',
  CHAMPS: 'kdo_v10_champs',
  NEWS: 'kdo_v10_news',
  VOTES: 'kdo_v10_votes',
  PENALTIES: 'kdo_v10_penalties',
  MARKETPLACE: 'kdo_v10_marketplace'
};

const defaultAdmins: AdminUser[] = [
  {
    id: 'admin-1',
    username: 'admin',
    password: 'admin123',
    name: 'Director General KDO',
    role: 'SuperAdmin',
    permissions: ['READ', 'WRITE', 'ADMIN']
  }
];

export const storageService = {
  // Pilotos
  getPilots: (): Pilot[] => {
    const data = localStorage.getItem(KEYS.PILOTS);
    return data ? JSON.parse(data) : INITIAL_PILOTS;
  },
  savePilots: (pilots: Pilot[]) => localStorage.setItem(KEYS.PILOTS, JSON.stringify(pilots)),

  // Ajustes
  getSettings: (): SystemSettings => {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      paddockTicker: "BIENVENIDOS A LA TEMPORADA 2026 - KDO OFICIAL",
      maintenanceMode: false,
      registrationsOpen: true,
      activeVoting: true,
      liveTimingUrl: ""
    };
  },
  saveSettings: (settings: SystemSettings) => localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings)),

  // Logs
  getAuditLogs: (): AuditLog[] => {
    const data = localStorage.getItem(KEYS.LOGS);
    return data ? JSON.parse(data) : [];
  },
  addLog: (action: string, details: string) => {
    const logs = storageService.getAuditLogs();
    const auth = storageService.getAuth();
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      admin: auth?.username || 'SYSTEM',
      action,
      details
    };
    localStorage.setItem(KEYS.LOGS, JSON.stringify([newLog, ...logs].slice(0, 100)));
  },

  // Estado de Pista
  getTrackStatus: (): TrackFlag => (localStorage.getItem(KEYS.TRACK) as TrackFlag) || TrackFlag.VERDE,
  saveTrackStatus: (flag: TrackFlag) => localStorage.setItem(KEYS.TRACK, flag),

  // Autenticación
  getAuth: (): AdminUser | null => {
    const data = localStorage.getItem(KEYS.AUTH);
    return data ? JSON.parse(data) : null;
  },
  setAuth: (user: AdminUser | null) => {
    if (user) localStorage.setItem(KEYS.AUTH, JSON.stringify(user));
    else localStorage.removeItem(KEYS.AUTH);
  },

  // Administradores
  getAdminUsers: (): AdminUser[] => {
    const data = localStorage.getItem(KEYS.ADMINS);
    return data ? JSON.parse(data) : defaultAdmins;
  },
  saveAdminUsers: (users: AdminUser[]) => localStorage.setItem(KEYS.ADMINS, JSON.stringify(users)),

  // Reglamentos
  getRegulations: (): Regulation[] => {
    const data = localStorage.getItem(KEYS.REGS);
    return data ? JSON.parse(data) : [];
  },
  saveRegulations: (regs: Regulation[]) => localStorage.setItem(KEYS.REGS, JSON.stringify(regs)),

  // Campeonatos
  getChampionships: (): Championship[] => {
    const data = localStorage.getItem(KEYS.CHAMPS);
    return data ? JSON.parse(data) : INITIAL_CHAMPIONSHIPS;
  },
  saveChampionships: (champs: Championship[]) => localStorage.setItem(KEYS.CHAMPS, JSON.stringify(champs)),

  // Prensa
  getPressReleases: (): PressRelease[] => {
    const data = localStorage.getItem(KEYS.NEWS);
    return data ? JSON.parse(data) : [
      {
        id: 'news-1',
        title: 'Lanzamiento Portal KDO 2026',
        content: 'Iniciamos una nueva era tecnológica en el karting regional. Padrón digital e inscripciones inteligentes.',
        author: 'Prensa KDO',
        date: '01/01/2026',
        category: 'Oficial'
      }
    ];
  },
  savePressReleases: (news: PressRelease[]) => localStorage.setItem(KEYS.NEWS, JSON.stringify(news)),

  // Penalizaciones
  getPenalties: (): Penalty[] => {
    const data = localStorage.getItem(KEYS.PENALTIES);
    if (data) return JSON.parse(data);
    
    // Initial seeded penalties to showcase types
    return [
        { id: 'p1', pilotId: '1', pilotName: 'JUAN ACOSTA', number: '1', category: 'KDO Power', type: 'Exclusión', reason: 'Técnica: Peso inferior al reglamentario', date: '08/03/2026' },
        { id: 'p2', pilotId: '2', pilotName: 'PEDRO RAMIREZ', number: '2', category: 'KDO Power', type: 'Recargo 5s', reason: 'Maniobra peligrosa en Curva 1', date: '08/03/2026' },
        { id: 'p3', pilotId: '3', pilotName: 'FRANCISCO PEROYE', number: '8', category: 'Supermaster', type: 'Recargo 10s', reason: 'Adelantamiento con bandera amarilla', date: '08/03/2026' },
        { id: 'p4', pilotId: '4', pilotName: 'MARTIN GARCIA', number: '12', category: 'KDO Power', type: 'Recargo 20s', reason: 'Exceso de velocidad en boxes', date: '08/03/2026' },
        { id: 'p5', pilotId: '5', pilotName: 'LUCAS GONZALEZ', number: '22', category: 'Clase 3', type: 'Recargo Puesto', reason: 'Toque y ganancia de posición (Devolución pendiente)', date: '08/03/2026' },
        { id: 'p6', pilotId: '6', pilotName: 'MATEO LOPEZ', number: '99', category: 'Escuela', type: 'Sanción', reason: 'Conducta antideportiva en parque cerrado', points: 5, date: '08/03/2026' },
    ];
  },
  savePenalties: (penalties: Penalty[]) => localStorage.setItem(KEYS.PENALTIES, JSON.stringify(penalties)),

  // Mercado
  getMarketplace: (): MarketplaceItem[] => {
    const data = localStorage.getItem(KEYS.MARKETPLACE);
    return data ? JSON.parse(data) : [];
  },
  saveMarketplace: (items: MarketplaceItem[]) => localStorage.setItem(KEYS.MARKETPLACE, JSON.stringify(items)),

  // Auxiliares
  getCircuits: (): Circuit[] => INITIAL_CIRCUITS,
  getCategories: (): string[] => INITIAL_CATEGORIES,
  castVote: (pilotId: string) => {
    const votes = JSON.parse(localStorage.getItem(KEYS.VOTES) || '{}');
    votes[pilotId] = (votes[pilotId] || 0) + 1;
    localStorage.setItem(KEYS.VOTES, JSON.stringify(votes));
  }
};
