import type { Card } from './card';
import type { ClockFace } from './clockFace';

/** Phase du jeu */
export type GamePhase = 'lobby' | 'playing' | 'resolution' | 'finished';

/** Représentation d'un joueur */
export interface Player {
  /** Identifiant unique du joueur (socket id) */
  id: string;
  /** Pseudo du joueur */
  name: string;
  /** Cartes en main (privées, visibles uniquement par le joueur) */
  hand: Card[];
  /** Indique si le joueur est prêt */
  isReady: boolean;
  /** Seed pour l'avatar DiceBear */
  avatarSeed: string;
}

/** Maximum de cartes révélables avant la phase de résolution */
export const MAX_REVEALS_BEFORE_RESOLUTION = 4;

/** Somme maximale autorisée par cadran (sauf condition SUM_EXCEED_24) */
export const MAX_CLOCK_FACE_SUM = 24;

/** État global de la partie */
export interface GameState {
  /** Identifiant unique de la salle */
  roomId: string;
  /** Identifiant du joueur créateur de la salle */
  creatorId: string;
  /** Phase courante du jeu */
  phase: GamePhase;
  /** Liste des joueurs dans la salle */
  players: Player[];
  /** Les 6 cadrans du plateau */
  clockFaces: ClockFace[];
  /** Identifiant du joueur dont c'est le tour */
  currentTurn: string;
  /** Nombre de cartes révélées sur l'ensemble du plateau */
  revealedCount: number;
  /** Le créateur a lancé le round — tous les joueurs peuvent maintenant cliquer "Je commence" */
  roundStarted?: boolean;
  /** Résultat de la partie (disponible en phase 'finished') */
  victory?: boolean;
  /** Messages d'erreur des conditions non respectées (en phase 'finished') */
  violationMessages?: string[];
}

