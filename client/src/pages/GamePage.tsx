import React from 'react';
import { useGameStore } from '../store/gameStore';
import { useUiStore } from '../store/uiStore';
import { useGameSync } from '../hooks/useGameSync';
import { Board } from '../components/Board/Board';
import { Hand } from '../components/Hand/Hand';
import { ResolutionOverlay } from '../components/ResolutionOverlay/ResolutionOverlay';

export function GamePage() {
  const { gameState, myPlayerId, roomId, victoryResult } = useGameStore();
  const { isResolutionVisible, hideResolution, showResolution, setDragging, errorMessage } = useUiStore();
  const { playCard, revealCard, triggerResolution, restartGame } = useGameSync();

  if (!gameState || !myPlayerId || !roomId) return null;

  const myPlayer = gameState.players.find((p) => p.id === myPlayerId);
  const isMyTurn = gameState.currentTurn === myPlayerId;
  const isFinished = gameState.phase === 'finished';

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-32">
      {/* Toast erreur */}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-900 border border-red-500 text-red-200 px-4 py-2 rounded-lg text-sm shadow-lg">
          ⚠ {errorMessage}
        </div>
      )}

      <Board
        gameState={gameState}
        myPlayerId={myPlayerId}
        roomId={roomId}
        onCardDrop={(clockFaceIndex, cardId) => playCard(roomId, cardId, clockFaceIndex)}
        onCardReveal={(clockFaceIndex, cardIndex) => revealCard(roomId, clockFaceIndex, cardIndex)}
        onTriggerResolution={() => triggerResolution(roomId)}
      />

      {myPlayer && (
        <Hand
          cards={myPlayer.hand}
          isMyTurn={isMyTurn}
          onCardDragStart={(cardId) => setDragging(true, cardId)}
          onCardDragEnd={() => setDragging(false)}
        />
      )}

      {/* Bouton flottant pour rouvrir le résultat après avoir fermé l'overlay */}
      {isFinished && victoryResult && !isResolutionVisible && (
        <button
          onClick={showResolution}
          className={`fixed top-4 right-4 z-40 px-4 py-2 rounded-xl font-bold text-sm shadow-lg transition-all hover:scale-105 active:scale-95 ${
            victoryResult.isVictory
              ? 'bg-yellow-500 hover:bg-yellow-400 text-gray-900'
              : 'bg-red-700 hover:bg-red-600 text-white'
          }`}
        >
          {victoryResult.isVictory ? '🏆' : '💀'} Voir le résultat
        </button>
      )}

      {isResolutionVisible && victoryResult && (
        <ResolutionOverlay
          result={victoryResult}
          sums={victoryResult.sums}
          onClose={hideResolution}
          onRestart={() => restartGame(roomId)}
        />
      )}
    </div>
  );
}
