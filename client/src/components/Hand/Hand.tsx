import React from 'react';
import type { Card as CardType } from '@ptt/shared';
import { Card } from '../Card/Card';

interface HandProps {
  cards: CardType[];
  onCardDragStart: (cardId: string) => void;
  onCardDragEnd: () => void;
  /** Id du joueur local (pour vérifier si c'est son tour) */
  isMyTurn: boolean;
  /** La partie est réellement lancée (un joueur a cliqué "Je commence") */
  gameStarted: boolean;
}

export function Hand({ cards, onCardDragStart, onCardDragEnd, isMyTurn, gameStarted }: HandProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-20 bg-gray-900/90 backdrop-blur-sm border-t border-gray-700 p-4"
      data-testid="player-hand"
    >
      <div className="flex items-center gap-2 max-w-4xl mx-auto">
        <div className="text-xs text-gray-400 mr-2 whitespace-nowrap">
          Ma main ({cards.length}) {isMyTurn && <span className="text-yellow-400">— À vous !</span>}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
          {cards.length === 0 ? (
            <p className="text-gray-500 italic text-sm">Aucune carte en main</p>
          ) : (
            cards.map((card) => (
              <Card
                key={card.id}
                card={card}
                faceUp={gameStarted}
                showColor={!gameStarted}
                size="md"
                draggable={isMyTurn && gameStarted}
                onDragStart={(e) => {
                  e.dataTransfer.setData('cardId', card.id);
                  onCardDragStart(card.id);
                }}
                onDragEnd={onCardDragEnd}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

