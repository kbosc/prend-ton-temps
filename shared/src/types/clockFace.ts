import type { Card } from './card';
import type { Condition } from './condition';

/** Index de cadran (0-5 pour les 6 cadrans) */
export type ClockFaceIndex = 0 | 1 | 2 | 3 | 4 | 5;

/** Représentation d'un cadran du plateau */
export interface ClockFace {
  /** Index du cadran (0 = C1, 5 = C6) */
  index: ClockFaceIndex;
  /** Cartes actuellement posées sur ce cadran */
  cards: Card[];
  /** Condition optionnelle attachée à ce cadran */
  condition?: Condition;
}

/** Retourne la somme des valeurs des cartes d'un cadran */
export function computeClockFaceSum(face: ClockFace): number {
  return face.cards.reduce((acc, card) => acc + card.value, 0);
}

