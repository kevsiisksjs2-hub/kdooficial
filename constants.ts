
import { Status, Pilot, Championship, Circuit, Association } from './types';

export const INITIAL_CATEGORIES = [
  'KDO Power',
  'Supermaster',
  'Máster',
  'Clase 3',
  'Clase 2',
  'Clase 1',
  'Menores',
  'Escuela'
];

export const HISTORICAL_RANKINGS = [];

export const INITIAL_ASSOCIATIONS: Association[] = [
  {
    id: 'assoc1',
    name: 'Kart Disciplina Oficial (KDO)',
    description: 'Entidad oficial de fiscalización y fomento del karting.',
    circuitIds: ['ci1']
  }
];

export const INITIAL_REGISTRATION_LINKS = INITIAL_CATEGORIES.map(cat => ({
  category: cat,
  url: '#'
}));

// Pilot objects now correctly match the Pilot interface with the association property
export const INITIAL_PILOTS: Pilot[] = [
  { id: '1', number: '1', name: 'JUAN ACOSTA', category: 'KDO Power', status: Status.CONFIRMADO, ranking: 1, lastUpdated: '2026-05-01', createdAt: 1714560000000, association: 'KDO Kart Disciplina Oficial', medicalLicense: '1001', sportsLicense: '2001', transponderId: 'TX-1001', conductPoints: 10, stats: { wins: 5, podiums: 10, poles: 2, points: 145.5 } },
  { id: '2', number: '2', name: 'PEDRO RAMIREZ', category: 'KDO Power', status: Status.CONFIRMADO, ranking: 2, lastUpdated: '2026-05-01', createdAt: 1714563600000, association: 'KDO Kart Disciplina Oficial', medicalLicense: '1002', sportsLicense: '2002', transponderId: 'TX-1002', conductPoints: 9, stats: { wins: 2, podiums: 8, poles: 1, points: 112.0 } },
  { id: '3', number: '8', name: 'FRANCISCO PEROYE', category: 'Supermaster', status: Status.CONFIRMADO, ranking: 1, lastUpdated: '2026-05-01', createdAt: 1714567200000, association: 'KDO Kart Disciplina Oficial', medicalLicense: '1003', sportsLicense: '2003', transponderId: 'TX-1003', conductPoints: 10, stats: { wins: 4, podiums: 7, poles: 4, points: 130.5 } },
  { id: '4', number: '12', name: 'MARTIN GARCIA', category: 'KDO Power', status: Status.CONFIRMADO, ranking: 3, lastUpdated: '2026-05-02', createdAt: 1714646400000, association: 'KDO Kart Disciplina Oficial', medicalLicense: '1004', sportsLicense: '2004', transponderId: 'TX-1004', conductPoints: 10, stats: { wins: 1, podiums: 4, poles: 0, points: 88.0 } },
];

export const INITIAL_CHAMPIONSHIPS: Championship[] = [
  {
    id: 'c1',
    name: "Campeonato Oficial KDO 2026",
    status: "En curso",
    dates: "Marzo - Diciembre 2026",
    tracks: "Chivilcoy, Salto, Chacabuco",
    image: "https://images.unsplash.com/photo-1547631618-f29792042761?w=800&auto=format",
    year: 2026,
    events: [
      { id: 'e1', round: 1, name: 'Gran Premio Apertura', date: '08/03/2026', track: 'Kartódromo Chivilcoy', status: 'Finalizada' },
      { id: 'e2', round: 2, name: 'Copa Ciudad de Salto', date: '05/04/2026', track: 'Circuito El Bosque', status: 'Finalizada' },
      { id: 'e3', round: 3, name: 'GP Homenaje Pilotos', date: '03/05/2026', track: 'Kartódromo Chacabuco', status: 'Finalizada' },
      { id: 'e4', round: 4, name: 'Desafío de la Tierra', date: '07/06/2026', track: 'Kartódromo Chivilcoy', status: 'Próxima' },
      { id: 'e5', round: 5, name: 'Especial con Invitados', date: '05/07/2026', track: 'Circuito El Bosque', status: 'Programada' },
      { id: 'e6', round: 6, name: 'Copa Invierno KDO', date: '02/08/2026', track: 'Kartódromo Chacabuco', status: 'Programada' },
      { id: 'e7', round: 7, name: 'GP Primavera', date: '06/09/2026', track: 'Kartódromo Chivilcoy', status: 'Programada' },
      { id: 'e8', round: 8, name: 'Pre-Coronación', date: '04/10/2026', track: 'Circuito El Bosque', status: 'Programada' },
      { id: 'e9', round: 9, name: 'GP Coronación Parte I', date: '08/11/2026', track: 'Kartódromo Chacabuco', status: 'Programada' },
      { id: 'e10', round: 10, name: 'Gran Final 2026', date: '06/12/2026', track: 'Kartódromo Chivilcoy', status: 'Programada' }
    ]
  }
];

export const INITIAL_CIRCUITS: Circuit[] = [
  {
    id: 'ci1',
    name: 'Kartódromo KDO Chivilcoy',
    location: "Chivilcoy, Buenos Aires",
    length: "1.100 mts",
    image: "https://s11.aconvert.com/convert/p3r68-cdx67/13ion-ed12c.webp",
    description: "Referente de Kart Disciplina Oficial en suelo de tierra.",
    features: ["Superficie: Tierra Compactada", "Trazado Técnico", "Boxes KDO"],
    surfaceStatus: 'Seco',
    emergencyPhone: '107',
    records: []
  }
];
