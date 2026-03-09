import React from 'react';
import type { Player } from '@ptt/shared';
import { Card } from '../Card/Card';

interface OtherPlayersHandsProps {
  /** Tous les joueurs sauf le joueur local */
  players: Player[];
  /** Id du joueur dont c'est le tour */
  currentTurnId: string;
}

export function OtherPlayersHands({ players, currentTurnId }: OtherPlayersHandsProps) {
  if (players.length === 0) return null;

  return (
    <div className="fixed top-14 right-4 z-30 flex flex-col gap-2 max-w-[200px]">
      {players.map((player) => {
        const isTurn = player.id === currentTurnId;
        return (
          <div
            key={player.id}
            className={`bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 border ${
              isTurn ? 'border-yellow-500' : 'border-gray-700'
            }`}
          >
            <div className="flex items-center gap-1 mb-1">
              <span
                className={`text-[10px] font-bold truncate ${
                  isTurn ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                {player.name}
                {isTurn && ' 🎯'}
              </span>
              <span className="text-[9px] text-gray-500 ml-auto">{player.hand.length} carte(s)</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {player.hand.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  faceUp={false}
                  showColor={true}
                  size="sm"
                />
              ))}
              {player.hand.length === 0 && (
                <span className="text-[9px] text-gray-500 italic">Aucune carte</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

