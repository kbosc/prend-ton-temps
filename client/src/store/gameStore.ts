import { create } from 'zustand';
import type { GameState } from '@ptt/shared';
import type { VictoryResult } from '@ptt/shared';

interface GameStore {
  gameState: GameState | null;
  myPlayerId: string | null;
  roomId: string | null;
  victoryResult: VictoryResult | null;

  setGameState: (state: GameState) => void;
  setMyPlayerId: (id: string) => void;
  setRoomId: (id: string) => void;
  setVictoryResult: (result: VictoryResult) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: null,
  myPlayerId: null,
  roomId: null,
  victoryResult: null,

  setGameState: (state) => set({ gameState: state }),
  setMyPlayerId: (id) => set({ myPlayerId: id }),
  setRoomId: (id) => set({ roomId: id }),
  setVictoryResult: (result) => set({ victoryResult: result }),
  reset: () => set({ gameState: null, myPlayerId: null, roomId: null, victoryResult: null }),
}));
