import React, { useState } from 'react';
import type { ClockFace as ClockFaceType } from '@ptt/shared';
import { computeClockFaceSum } from '@ptt/shared';
import { Card } from '../Card/Card';

interface ClockFaceSlotProps {
  face: ClockFaceType;
  onDrop: (clockFaceIndex: number, cardId: string) => void;
  onCardClick: (clockFaceIndex: number, cardIndex: number) => void;
  revealedCount: number;
  maxReveals: number;
  isMyTurn: boolean;
  /** Afficher la somme uniquement en phase résolution/finished */
  showSum?: boolean;
}

export function ClockFaceSlot({
  face,
  onDrop,
  onCardClick,
  revealedCount,
  maxReveals,
  isMyTurn,
  showSum = false,
}: ClockFaceSlotProps) {
  const [isOver, setIsOver] = useState(false);
  const canReveal = revealedCount < maxReveals;
  const sum = showSum ? computeClockFaceSum(face) : null;

  return (
    <div
      className={`
        relative rounded-xl border-2 p-2 transition-all duration-200 bg-gray-900/90
        ${isOver && isMyTurn
          ? 'border-yellow-400 bg-yellow-400/10 scale-[1.04]'
          : 'border-gray-500'
        }
      `}
      data-testid={`clock-face-${face.index}`}
      onDragOver={(e) => {
        if (!isMyTurn) return;
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        if (!isMyTurn) return;
        const cardId = e.dataTransfer.getData('cardId');
        if (cardId) onDrop(face.index, cardId);
      }}
    >
      {/* En-tête : numéro + somme si résolution */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-black text-white">C{face.index + 1}</span>
        {showSum && sum !== null && (
          <span className={`text-xs font-black ${sum > 24 ? 'text-red-400' : 'text-green-400'}`}>
            Σ={sum}
          </span>
        )}
      </div>

      {/* Condition */}
      {face.condition && (
        <div className="mb-1.5 px-1.5 py-1 rounded-lg bg-purple-900/80 border border-purple-500/60">
          <span className="text-[10px] text-purple-200 leading-snug block">✦ {face.condition.label}</span>
        </div>
      )}

      {/* Cartes posées */}
      <div className="flex flex-wrap gap-0.5 min-h-[44px] items-start">
        {face.cards.length === 0 ? (
          <div className="w-full h-10 flex items-center justify-center text-gray-500 text-[10px] border border-dashed border-gray-600 rounded-lg">
            {isMyTurn ? 'Déposez ici' : '—'}
          </div>
        ) : (
          face.cards.map((card, cardIdx) => (
            <Card
              key={card.id}
              card={card}
              faceUp={card.isRevealed}
              showColor={!card.isRevealed}
              size="sm"
              onClick={
                !card.isRevealed && canReveal
                  ? () => onCardClick(face.index, cardIdx)
                  : undefined
              }
            />
          ))
        )}
      </div>

      {/* Compteur de cartes */}
      {face.cards.length > 0 && (
        <div className="mt-1 text-center text-[10px] text-gray-400 font-semibold">
          {face.cards.length} carte{face.cards.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
