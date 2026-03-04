import React, { useState } from 'react';
import { CONDITION_POOL } from '@ptt/shared';
import type { ConditionDefinition } from '@ptt/shared';

export interface ConditionAssignment {
  faceIndex: number;
  conditionType: string;
  label: string;
  params?: Record<string, unknown>;
}

/** Entrée unifiée — pool standard ou condition custom */
interface AnyConditionEntry {
  type: string;
  label: string;
  isCustom?: boolean;
  defaultParams?: Record<string, unknown>;
}

interface ConditionsPanelProps {
  onConfirm: (assignments: ConditionAssignment[]) => void;
  onCancel: () => void;
}

export function ConditionsPanel({ onConfirm, onCancel }: ConditionsPanelProps) {
  const [assignments, setAssignments] = useState<ConditionAssignment[]>([]);
  const [customLabel, setCustomLabel] = useState('');
  const [customConditions, setCustomConditions] = useState<AnyConditionEntry[]>([]);
  const [draggingType, setDraggingType] = useState<string | null>(null);
  const [draggingLabel, setDraggingLabel] = useState<string | null>(null);
  const [overFace, setOverFace] = useState<number | null>(null);

  const poolEntries: AnyConditionEntry[] = CONDITION_POOL.map((d: ConditionDefinition) => ({
    type: d.type as string,
    label: d.label,
    defaultParams: d.defaultParams,
  }));
  const allConditions: AnyConditionEntry[] = [...poolEntries, ...customConditions];

  const addCustomCondition = () => {
    const trimmed = customLabel.trim();
    if (!trimmed) return;
    setCustomConditions((prev) => [
      ...prev,
      { type: `CUSTOM_${Date.now()}`, label: trimmed, isCustom: true },
    ]);
    setCustomLabel('');
  };

  const removeAssignment = (faceIndex: number) => {
    setAssignments((prev) => prev.filter((a) => a.faceIndex !== faceIndex));
  };

  const getAssignment = (faceIndex: number) =>
    assignments.find((a) => a.faceIndex === faceIndex);

  const handleDropOnFace = (faceIndex: number) => {
    if (!draggingType || !draggingLabel) return;
    setAssignments((prev) => {
      const filtered = prev.filter((a) => a.faceIndex !== faceIndex);
      return [...filtered, { faceIndex, conditionType: draggingType, label: draggingLabel }];
    });
    setDraggingType(null);
    setDraggingLabel(null);
    setOverFace(null);
  };

  const handleConfirm = () => {
    onConfirm(assignments);
  };

  return (
    <div className="fixed inset-0 z-40 flex bg-black/70 backdrop-blur-sm">
      {/* Panel gauche — liste des conditions */}
      <div className="w-72 bg-gray-900 border-r border-gray-700 flex flex-col h-full overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white">🎯 Conditions</h2>
          <p className="text-xs text-gray-400 mt-1">Glissez une condition sur un cadran</p>
        </div>

        {/* Liste des conditions disponibles */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {allConditions.map((def) => (
            <div
              key={def.type}
              draggable
              onDragStart={() => {
                setDraggingType(def.type);
                setDraggingLabel(def.label);
              }}
              onDragEnd={() => {
                setDraggingType(null);
                setDraggingLabel(null);
              }}
              className={`
                p-3 rounded-xl border cursor-grab active:cursor-grabbing select-none transition-all
                ${draggingType === def.type
                  ? 'border-indigo-400 bg-indigo-900/40 scale-95'
                  : 'border-gray-600 bg-gray-800 hover:border-indigo-500 hover:bg-gray-700'
                }
              `}
            >
              <div className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">✦</span>
                <span className="text-sm text-gray-200 leading-snug">{def.label}</span>
              </div>
              {('isCustom' in def) && (
                <span className="text-[10px] text-indigo-400 mt-1 block">Personnalisée</span>
              )}
            </div>
          ))}
        </div>

        {/* Ajouter une condition personnalisée */}
        <div className="p-3 border-t border-gray-700 space-y-2">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">+ Ajouter une condition</p>
          <input
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            placeholder="Ex: Doit avoir une carte 7"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomCondition()}
          />
          <button
            onClick={addCustomCondition}
            disabled={!customLabel.trim()}
            className="w-full py-2 bg-indigo-700 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Ajouter
          </button>
        </div>
      </div>

      {/* Zone droite — les 6 cadrans drop targets */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
        <div className="text-center mb-2">
          <h2 className="text-2xl font-black text-white">Assigner les conditions aux cadrans</h2>
          <p className="text-gray-400 text-sm mt-1">
            Glissez une condition depuis le panneau gauche sur le cadran souhaité.<br />
            Les cadrans sans condition n'auront pas de contrainte spéciale.
          </p>
        </div>

        {/* Grille 3×2 des 6 cadrans */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
          {[0, 1, 2, 3, 4, 5].map((faceIndex) => {
            const assignment = getAssignment(faceIndex);
            const isOver = overFace === faceIndex;
            return (
              <div
                key={faceIndex}
                onDragOver={(e) => { e.preventDefault(); setOverFace(faceIndex); }}
                onDragLeave={() => setOverFace(null)}
                onDrop={() => handleDropOnFace(faceIndex)}
                className={`
                  relative rounded-2xl border-2 p-4 min-h-[90px] flex flex-col items-center justify-center gap-2 transition-all
                  ${isOver
                    ? 'border-yellow-400 bg-yellow-400/10 scale-[1.03]'
                    : assignment
                      ? 'border-purple-500 bg-purple-900/20'
                      : 'border-gray-600 bg-gray-800/50 border-dashed'
                  }
                `}
              >
                <span className="text-xs font-bold text-gray-400">Cadran {faceIndex + 1}</span>
                {assignment ? (
                  <>
                    <div className="text-center px-1 py-0.5 rounded bg-purple-900/70 border border-purple-500/40">
                      <span className="text-[11px] text-purple-200 leading-tight block">✦ {assignment.label}</span>
                    </div>
                    <button
                      onClick={() => removeAssignment(faceIndex)}
                      className="text-[10px] text-red-400 hover:text-red-300 transition-colors"
                    >
                      ✕ Retirer
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-gray-600">Aucune condition</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Boutons de confirmation */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
          >
            ← Annuler
          </button>
          <button
            onClick={handleConfirm}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            ✓ Valider les conditions
          </button>
        </div>
      </div>
    </div>
  );
}
