import React, { useState } from 'react';
import type { GameState } from '@ptt/shared';
import { MAX_REVEALS_BEFORE_RESOLUTION } from '@ptt/shared';
import { ClockFaceSlot } from './ClockFaceSlot';
import { useGameSync } from '../../hooks/useGameSync';
import { ConditionsPanel } from '../ConditionsPanel/ConditionsPanel';
import type { ConditionAssignment } from '../ConditionsPanel/ConditionsPanel';

interface BoardProps {
  gameState: GameState;
  onCardDrop: (clockFaceIndex: number, cardId: string) => void;
  onCardReveal: (clockFaceIndex: number, cardIndex: number) => void;
  onTriggerResolution: () => void;
  myPlayerId: string;
  roomId: string;
}

// Positions des 6 cadrans sur le cercle (12h, 2h, 4h, 6h, 8h, 10h)
const CLOCK_POSITIONS = [
  { top: '0%',  left: '50%' },  // 0 — 12h
  { top: '25%', left: '87%' },  // 1 — 2h
  { top: '72%', left: '87%' },  // 2 — 4h
  { top: '95%', left: '50%' },  // 3 — 6h
  { top: '72%', left: '13%' },  // 4 — 8h
  { top: '25%', left: '13%' },  // 5 — 10h
];

export function Board({
  gameState,
  onCardDrop,
  onCardReveal,
  onTriggerResolution,
  myPlayerId,
  roomId,
}: BoardProps) {
  const { claimFirstTurn, startRound, setCustomConditions, randomizeConditions } = useGameSync();
  const [showCustomPanel, setShowCustomPanel] = useState(false);
  const [conditionChosen, setConditionChosen] = useState(false);

  const allCardsPlayed = gameState.players.every((p) => p.hand.length === 0);
  const isMyTurn = gameState.currentTurn === myPlayerId;
  const noOnePlaying = gameState.currentTurn === '';
  const currentPlayer = gameState.players.find((p) => p.id === gameState.currentTurn);
  const isResolved = gameState.phase === 'resolution' || gameState.phase === 'finished';
  const isCreator = gameState.creatorId === myPlayerId;
  const roundStarted = !!gameState.roundStarted;

  const handleRandomize = () => {
    randomizeConditions(roomId);
    setConditionChosen(true);
  };

  const handleCustomConditionsConfirm = (assignments: ConditionAssignment[]) => {
    setCustomConditions(roomId, assignments);
    setConditionChosen(true);
    setShowCustomPanel(false);
  };

  return (
    <>
      {/* Panel conditions personnalisées */}
      {showCustomPanel && (
        <ConditionsPanel
          onConfirm={handleCustomConditionsConfirm}
          onCancel={() => setShowCustomPanel(false)}
        />
      )}

      {/* pt-16 pour descendre l'horloge */}
      <div className="flex flex-col items-center gap-3 px-4 pt-16 max-w-3xl mx-auto" data-testid="board">
        {/* Barre d'infos */}
        <div className="w-full flex items-center justify-between text-sm text-gray-400">
          <span>
            {noOnePlaying && gameState.phase === 'playing' ? (
              <span className="text-yellow-300 font-semibold">
                {roundStarted ? 'Qui commence ?' : 'En attente du créateur…'}
              </span>
            ) : (
              <>
                Tour de :{' '}
                <strong className={isMyTurn ? 'text-green-400' : 'text-yellow-300'}>
                  {currentPlayer?.name ?? '…'}{isMyTurn ? ' (vous !)' : ''}
                </strong>
              </>
            )}
          </span>
          <span className="text-xs">Salle : {gameState.roomId.slice(0, 8)}…</span>
        </div>

        {/* Plateau horloge */}
        <div className="relative w-full" style={{ maxWidth: 560 }}>
          <div style={{ paddingBottom: '100%', position: 'relative' }}>
            {/* Cercle de fond */}
            <div className="absolute inset-[5%] rounded-full border-2 border-gray-700/50 bg-gray-900/30 pointer-events-none" />

            {/* Point central */}
            <div
              className="absolute w-4 h-4 rounded-full bg-gray-500 border-2 border-gray-300 z-10 pointer-events-none"
              style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            />

            {/* Cadrans */}
            {gameState.clockFaces.map((face) => {
              const pos = CLOCK_POSITIONS[face.index];
              return (
                <div
                  key={face.index}
                  className="absolute"
                  style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)', width: '27%' }}
                >
                  <ClockFaceSlot
                    face={face}
                    onDrop={onCardDrop}
                    onCardClick={onCardReveal}
                    revealedCount={gameState.revealedCount}
                    maxReveals={MAX_REVEALS_BEFORE_RESOLUTION}
                    isMyTurn={isMyTurn}
                    showSum={isResolved}
                  />
                </div>
              );
            })}

            {/* Zone centrale */}
            <div
              className="absolute flex flex-col items-center justify-center gap-2 z-20"
              style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '40%', textAlign: 'center' }}
            >
              {noOnePlaying && gameState.phase === 'playing' && (
                <>
                  {/* ── PHASE 1 : Créateur choisit les conditions ── */}
                  {!roundStarted && isCreator && (
                    <>
                      <p className="text-[10px] text-gray-400 font-semibold leading-tight">Conditions</p>
                      <button
                        onClick={handleRandomize}
                        className="w-full py-1.5 px-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg transition-all hover:scale-105 active:scale-95 shadow"
                      >
                        🎲 Aléatoire
                      </button>
                      <button
                        onClick={() => setShowCustomPanel(true)}
                        className="w-full py-1.5 px-2 bg-purple-700 hover:bg-purple-600 text-white text-[11px] font-bold rounded-lg transition-all hover:scale-105 active:scale-95 shadow"
                      >
                        🎯 Personnalisé
                      </button>
                      {conditionChosen && (
                        <button
                          onClick={() => startRound(roomId)}
                          className="w-full py-1.5 px-2 bg-green-600 hover:bg-green-500 text-white text-[11px] font-black rounded-lg transition-all hover:scale-105 active:scale-95 shadow mt-1"
                        >
                          🚀 Lancer la partie !
                        </button>
                      )}
                    </>
                  )}

                  {/* Attente non-créateur avant lancement */}
                  {!roundStarted && !isCreator && (
                    <p className="text-[10px] text-gray-400 italic leading-tight">
                      Le créateur configure les conditions…
                    </p>
                  )}

                  {/* ── PHASE 2 : Round lancé — tous peuvent cliquer "Je commence" ── */}
                  {roundStarted && (
                    <button
                      onClick={() => claimFirstTurn(roomId)}
                      className="w-full py-2 px-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 text-[11px] font-black rounded-lg transition-all hover:scale-105 active:scale-95 shadow shadow-yellow-900/40"
                    >
                      ▶ Je commence !
                    </button>
                  )}
                </>
              )}

              {/* Bouton résolution */}
              {allCardsPlayed && gameState.phase === 'playing' && !noOnePlaying && (
                <button
                  onClick={onTriggerResolution}
                  data-testid="reveal-button"
                  className="w-full py-2 px-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black rounded-lg shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  🎴 Révéler toutes les cartes
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Compteur révélations — sous le plateau */}
        {gameState.phase === 'playing' && (
          <div className="text-sm text-gray-400 font-semibold">
            Révélations : {gameState.revealedCount} / {MAX_REVEALS_BEFORE_RESOLUTION}
          </div>
        )}
      </div>
    </>
  );
}
