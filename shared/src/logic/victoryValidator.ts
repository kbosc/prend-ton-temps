import type { ClockFace } from '../types/clockFace';
import type { GameState } from '../types/gameState';
import { computeClockFaceSum } from '../types/clockFace';
import { ConditionType } from '../types/condition';
import type { Card } from '../types/card';

/** Résultat de la validation de la victoire */
export interface VictoryResult {
  /** La partie est-elle gagnée ? */
  isVictory: boolean;
  /** Messages décrivant les violations (vides si victoire) */
  violations: string[];
  /** Sommes calculées par cadran */
  sums: number[];
}

/**
 * Récupère toutes les cartes non révélées présentes sur le plateau
 * (utilisé pour valider les conditions de type "plus grande/petite carte")
 */
function getAllBoardCards(gameState: GameState): Card[] {
  return gameState.clockFaces.flatMap((f) => f.cards);
}

/**
 * Valide qu'un cadran respecte sa condition (si elle existe).
 * Retourne null si OK, ou un message d'erreur sinon.
 */
function validateClockFaceCondition(
  face: ClockFace,
  gameState: GameState
): string | null {
  const { condition } = face;
  if (!condition) return null;

  const sum = computeClockFaceSum(face);
  const allCards = getAllBoardCards(gameState);

  switch (condition.type) {
    case ConditionType.SUM_EXCEED_24:
      // Aucune restriction supplémentaire — la règle des 24 ne s'applique pas
      return null;

    case ConditionType.EXACT_COUNT: {
      const expected = condition.params?.exactCount ?? 2;
      if (face.cards.length !== expected) {
        return `C${face.index + 1} : doit contenir exactement ${expected} carte(s) (en a ${face.cards.length}).`;
      }
      return null;
    }

    case ConditionType.STRICT_ORDER: {
      for (let i = 1; i < face.cards.length; i++) {
        if (face.cards[i].value <= face.cards[i - 1].value) {
          return `C${face.index + 1} : les cartes doivent être en ordre strictement croissant de valeur.`;
        }
      }
      return null;
    }

    case ConditionType.LARGEST_BLACK: {
      const maxBlack = Math.max(
        ...allCards.filter((c) => c.color === 'black').map((c) => c.value)
      );
      const hasMaxBlack = face.cards.some(
        (c) => c.color === 'black' && c.value === maxBlack
      );
      if (!hasMaxBlack) {
        return `C${face.index + 1} : doit contenir la carte Noire la plus grande (${maxBlack}).`;
      }
      return null;
    }

    case ConditionType.SMALLEST_BLACK: {
      const minBlack = Math.min(
        ...allCards.filter((c) => c.color === 'black').map((c) => c.value)
      );
      const hasMinBlack = face.cards.some(
        (c) => c.color === 'black' && c.value === minBlack
      );
      if (!hasMinBlack) {
        return `C${face.index + 1} : doit contenir la carte Noire la plus petite (${minBlack}).`;
      }
      return null;
    }

    case ConditionType.LARGEST_WHITE: {
      const maxWhite = Math.max(
        ...allCards.filter((c) => c.color === 'white').map((c) => c.value)
      );
      const hasMaxWhite = face.cards.some(
        (c) => c.color === 'white' && c.value === maxWhite
      );
      if (!hasMaxWhite) {
        return `C${face.index + 1} : doit contenir la carte Blanche la plus grande (${maxWhite}).`;
      }
      return null;
    }

    case ConditionType.SMALLEST_WHITE: {
      const minWhite = Math.min(
        ...allCards.filter((c) => c.color === 'white').map((c) => c.value)
      );
      const hasMinWhite = face.cards.some(
        (c) => c.color === 'white' && c.value === minWhite
      );
      if (!hasMinWhite) {
        return `C${face.index + 1} : doit contenir la carte Blanche la plus petite (${minWhite}).`;
      }
      return null;
    }

    default:
      return null;
  }
}

/**
 * Valide la victoire de la partie.
 *
 * Conditions de victoire :
 * 1. Tous les joueurs ont joué toutes leurs cartes (mains vides).
 * 2. Les sommes des cadrans sont croissantes ou égales (C1 ≤ C2 ≤ ... ≤ C6).
 * 3. La somme de chaque cadran ne dépasse pas 24 (sauf condition SUM_EXCEED_24).
 * 4. Chaque condition de cadran est respectée.
 */
export function validateVictory(gameState: GameState): VictoryResult {
  const violations: string[] = [];
  const sums = gameState.clockFaces.map(computeClockFaceSum);

  // 0. Vérification : aucun cadran ne doit être vide
  for (const face of gameState.clockFaces) {
    if (face.cards.length === 0) {
      violations.push(`C${face.index + 1} : le cadran est vide — au moins une carte est requise.`);
    }
  }

  // 1. Vérification : tous les joueurs ont joué toutes leurs cartes
  const totalCardsInHands = gameState.players.reduce((acc, p) => acc + p.hand.length, 0);
  if (totalCardsInHands > 0) {
    violations.push(
      `Il reste ${totalCardsInHands} carte(s) en main non jouée(s).`
    );
  }

  // 2. Vérification : sommes croissantes ou égales (C1 ≤ C2 ≤ ... ≤ C6)
  for (let i = 1; i < sums.length; i++) {
    if (sums[i] < sums[i - 1]) {
      violations.push(
        `Ordre non respecté : somme C${i} (${sums[i - 1]}) > somme C${i + 1} (${sums[i]}).`
      );
    }
  }

  // 3. Vérification : règle des 24 par cadran
  for (const face of gameState.clockFaces) {
    const canExceed = face.condition?.type === ConditionType.SUM_EXCEED_24;
    const sum = computeClockFaceSum(face);
    if (!canExceed && sum > 24) {
      violations.push(
        `C${face.index + 1} : la somme (${sum}) dépasse 24.`
      );
    }
  }

  // 4. Vérification des conditions de cadran
  for (const face of gameState.clockFaces) {
    const violation = validateClockFaceCondition(face, gameState);
    if (violation) {
      violations.push(violation);
    }
  }

  return {
    isVictory: violations.length === 0,
    violations,
    sums,
  };
}

