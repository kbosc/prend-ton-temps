import { ConditionType } from '../types/condition';
import type { Condition } from '../types/condition';
import type { ClockFace, ClockFaceIndex } from '../types/clockFace';

/** Définition d'une entrée du pool de conditions */
export interface ConditionDefinition {
  /** Type de la condition */
  type: ConditionType;
  /** Libellé affiché à l'utilisateur */
  label: string;
  /** Paramètres optionnels par défaut */
  defaultParams?: Record<string, unknown>;
}

/**
 * Pool extensible de conditions disponibles.
 * Ajoutez de nouvelles entrées ici pour enrichir le jeu.
 */
export const CONDITION_POOL: ConditionDefinition[] = [
  {
    type: ConditionType.LARGEST_BLACK,
    label: 'Doit contenir la carte Noire la plus grande de la partie.',
  },
  {
    type: ConditionType.SMALLEST_BLACK,
    label: 'Doit contenir la carte Noire la plus petite de la partie.',
  },
  {
    type: ConditionType.LARGEST_WHITE,
    label: 'Doit contenir la carte Blanche la plus grande de la partie.',
  },
  {
    type: ConditionType.SMALLEST_WHITE,
    label: 'Doit contenir la carte Blanche la plus petite de la partie.',
  },
  {
    type: ConditionType.EXACT_COUNT,
    label: 'Doit contenir exactement 2 cartes.',
    defaultParams: { exactCount: 2 },
  },
  {
    type: ConditionType.STRICT_ORDER,
    label: 'Les cartes doivent être jouées en ordre strictement croissant de valeur.',
  },
  {
    type: ConditionType.SUM_EXCEED_24,
    label: 'La somme de ce cadran peut exceptionnellement dépasser 24.',
  },
];

let _conditionCounter = 0;

/**
 * Crée une instance de `Condition` à partir d'une définition et d'un index de cadran.
 */
export function createConditionFromDefinition(
  def: ConditionDefinition,
  clockFaceIndex: ClockFaceIndex
): Condition {
  return {
    id: `cond-${++_conditionCounter}`,
    type: def.type,
    clockFaceIndex,
    label: def.label,
    params: def.defaultParams
      ? { ...def.defaultParams }
      : undefined,
  };
}

/**
 * Assigne aléatoirement des conditions issues du pool à un sous-ensemble de cadrans.
 *
 * @param clockFaces - Les 6 cadrans du plateau
 * @param count - Nombre de cadrans à décorer (par défaut entre 2 et 4)
 * @returns Les cadrans mis à jour avec leurs conditions
 */
export function assignRandomConditions(
  clockFaces: ClockFace[],
  count?: number
): ClockFace[] {
  const nbConditions =
    count ?? Math.floor(Math.random() * 3) + 2; // 2, 3 ou 4

  // Copie pour immutabilité
  const updated: ClockFace[] = clockFaces.map((f) => ({ ...f, cards: [...f.cards] }));

  // Indices des cadrans à décorer (sélection aléatoire sans doublon)
  const indices = shuffleArray([0, 1, 2, 3, 4, 5] as ClockFaceIndex[]).slice(
    0,
    nbConditions
  );

  // Pool mélangé
  const shuffledPool = shuffleArray([...CONDITION_POOL]);

  indices.forEach((faceIndex, i) => {
    const def = shuffledPool[i % shuffledPool.length];
    updated[faceIndex] = {
      ...updated[faceIndex],
      condition: createConditionFromDefinition(def, faceIndex),
    };
  });

  return updated;
}

/** Mélange un tableau (Fisher-Yates) */
export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

