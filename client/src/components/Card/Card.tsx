import React from 'react';
import type { Card as CardType } from '@ptt/shared';

interface CardProps {
  card: CardType;
  /** Afficher la face (true) ou le dos (false) */
  faceUp?: boolean;
  /** Afficher la couleur sans la valeur (carte posée, face cachée mais couleur visible) */
  showColor?: boolean;
  /** Carte en cours de glissement */
  isDragging?: boolean;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'w-10 h-14 text-xs',
  md: 'w-14 h-20 text-sm',
  lg: 'w-20 h-28 text-base',
};

export function Card({
  card,
  faceUp = card.isRevealed,
  showColor = false,
  isDragging = false,
  onClick,
  draggable = false,
  onDragStart,
  onDragEnd,
  size = 'md',
}: CardProps) {
  const sizeClass = SIZE_CLASSES[size];

  // Mode "couleur visible sans valeur" : carte posée face cachée mais couleur connue
  if (!faceUp && showColor) {
    return (
      <div
        className={`relative ${sizeClass} rounded-lg select-none transition-all duration-300
          ${isDragging ? 'opacity-50 scale-95 rotate-3' : ''}
          ${onClick ? 'cursor-pointer hover:scale-105 hover:-translate-y-1' : ''}
        `}
        onClick={onClick}
        data-card-id={card.id}
        data-testid={`card-${card.id}`}
      >
        <div
          className={`w-full h-full rounded-lg border-2 flex flex-col items-center justify-center shadow-md
            ${card.color === 'white'
              ? 'bg-gray-200 border-gray-300 text-gray-500'
              : 'bg-gray-800 border-gray-600 text-gray-400'
            }`}
        >
          <span className="text-lg opacity-70">
            {card.color === 'white' ? '⬜' : '⬛'}
          </span>
          <span className="text-[9px] mt-0.5 opacity-50">?</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative ${sizeClass} rounded-lg cursor-pointer select-none transition-all duration-300
        ${isDragging ? 'opacity-50 scale-95 rotate-3' : 'hover:scale-105 hover:-translate-y-1'}
        ${onClick ? 'cursor-pointer' : ''}
      `}
      style={{ perspective: '600px' }}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      data-card-id={card.id}
      data-testid={`card-${card.id}`}
    >
      <div
        className={`w-full h-full transition-transform duration-500 relative`}
        style={{
          transformStyle: 'preserve-3d',
          transform: faceUp ? 'rotateY(0deg)' : 'rotateY(180deg)',
        }}
      >
        {/* Face avant */}
        <div
          className={`absolute inset-0 rounded-lg border-2 flex flex-col items-center justify-center font-bold shadow-md
            ${card.color === 'white'
              ? 'bg-white border-gray-300 text-gray-900'
              : 'bg-gray-900 border-gray-700 text-white'
            }`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-2xl font-black leading-none">{card.value}</span>
          <span className="text-xs mt-1 opacity-60">
            {card.color === 'white' ? '⬜' : '⬛'}
          </span>
        </div>

        {/* Dos de la carte */}
        <div
          className="absolute inset-0 rounded-lg border-2 border-blue-800 bg-blue-900 flex items-center justify-center shadow-md"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <span className="text-2xl">🕐</span>
        </div>
      </div>
    </div>
  );
}
