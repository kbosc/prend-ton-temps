import React from 'react';
import type { VictoryResult } from '@ptt/shared';

interface ResolutionOverlayProps {
  result: VictoryResult;
  sums: number[];
  onClose: () => void;
  onRestart?: () => void;
}

export function ResolutionOverlay({ result, sums, onClose, onRestart }: ResolutionOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-bounce-in"
      data-testid="resolution-overlay"
    >
      <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl">
        {/* Titre */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">
            {result.isVictory ? '🏆' : '💀'}
          </div>
          <h2 className={`text-3xl font-black ${result.isVictory ? 'text-yellow-400' : 'text-red-400'}`}>
            {result.isVictory ? 'Victoire !' : 'Défaite…'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {result.isVictory
              ? 'Les sommes sont bien strictement croissantes !'
              : 'Les conditions de victoire ne sont pas respectées.'}
          </p>
        </div>

        {/* Sommes par cadran */}
        <div className="mb-6">
          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Sommes des cadrans</h3>
          <div className="flex gap-2 justify-center flex-wrap">
            {sums.map((sum, i) => (
              <div
                key={i}
                className={`flex flex-col items-center px-3 py-2 rounded-lg border ${
                  i < sums.length - 1 && sums[i] < sums[i + 1]
                    ? 'border-green-600 bg-green-900/30 text-green-400'
                    : i < sums.length - 1 && sums[i] >= sums[i + 1]
                    ? 'border-red-600 bg-red-900/30 text-red-400'
                    : 'border-gray-600 bg-gray-800 text-gray-300'
                }`}
              >
                <span className="text-xs text-gray-500">C{i + 1}</span>
                <span className="font-bold text-lg">{sum}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Violations */}
        {result.violations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Violations</h3>
            <ul className="space-y-1">
              {result.violations.map((v, i) => (
                <li key={i} className="text-sm text-red-300 flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
          onClick={onClose}
        >
          Fermer
        </button>
        {onRestart && (
          <button
            className="w-full mt-3 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
            onClick={onRestart}
          >
            🔄 Rejouer une partie
          </button>
        )}
      </div>
    </div>
  );
}
