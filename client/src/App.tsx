import React from 'react';
import { useGameStore } from './store/gameStore';
import { LobbyPage } from './pages/LobbyPage';
import { GamePage } from './pages/GamePage';

export default function App() {
  const { gameState } = useGameStore();
  const isPlaying = gameState?.phase === 'playing' || gameState?.phase === 'resolution' || gameState?.phase === 'finished';

  return isPlaying ? <GamePage /> : <LobbyPage />;
}

