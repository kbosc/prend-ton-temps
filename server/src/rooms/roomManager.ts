import { v4 as uuidv4 } from 'uuid';
import type { GameState, Player } from '@ptt/shared';

const rooms = new Map<string, GameState>();

/** Crée un état de salle initial (phase lobby) */
function createInitialState(roomId: string, creatorId = ''): GameState {
  return {
    roomId,
    creatorId,
    phase: 'lobby',
    players: [],
    clockFaces: [0, 1, 2, 3, 4, 5].map((index) => ({
      index: index as 0 | 1 | 2 | 3 | 4 | 5,
      cards: [],
    })),
    currentTurn: '',
    revealedCount: 0,
  };
}

export const roomManager = {
  /** Crée une nouvelle salle et retourne son id */
  createRoom(creatorId: string): string {
    const roomId = uuidv4();
    rooms.set(roomId, createInitialState(roomId, creatorId));
    return roomId;
  },

  /** Ajoute un joueur dans une salle existante */
  joinRoom(
    roomId: string,
    player: Player
  ): { state: GameState; error?: string } {
    const state = rooms.get(roomId);
    if (!state) return { state: createInitialState(roomId), error: 'Salle introuvable.' };
    if (state.phase !== 'lobby') return { state, error: 'La partie a déjà commencé.' };
    if (state.players.find((p) => p.id === player.id)) return { state };
    if (state.players.length >= 4) return { state, error: 'La salle est complète (4 joueurs maximum).' };

    const updated: GameState = {
      ...state,
      players: [...state.players, player],
    };
    rooms.set(roomId, updated);
    return { state: updated };
  },

  /** Retire un joueur d'une salle */
  leaveRoom(roomId: string, playerId: string): GameState | null {
    const state = rooms.get(roomId);
    if (!state) return null;
    const updated: GameState = {
      ...state,
      players: state.players.filter((p) => p.id !== playerId),
    };
    if (updated.players.length === 0) {
      rooms.delete(roomId);
      return null;
    }
    rooms.set(roomId, updated);
    return updated;
  },

  getRoom(roomId: string): GameState | undefined {
    return rooms.get(roomId);
  },

  setRoom(roomId: string, state: GameState): void {
    rooms.set(roomId, state);
  },

  markPlayerReady(roomId: string, playerId: string): GameState | null {
    const state = rooms.get(roomId);
    if (!state) return null;
    const updated: GameState = {
      ...state,
      players: state.players.map((p) =>
        p.id === playerId ? { ...p, isReady: true } : p
      ),
    };
    rooms.set(roomId, updated);
    return updated;
  },

  allReady(roomId: string): boolean {
    const state = rooms.get(roomId);
    if (!state || state.players.length < 4) return false;
    return state.players.every((p) => p.isReady);
  },
};

