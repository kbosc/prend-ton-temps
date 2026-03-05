import { describe, it, expect, beforeEach } from 'vitest';
import { validateVictory } from '../../logic/victoryValidator';
import type { GameState } from '../../types/gameState';
import type { ClockFace } from '../../types/clockFace';
import type { Card } from '../../types/card';
import { ConditionType } from '../../types/condition';

/** Crée une carte de test */
function makeCard(id: string, value: Card['value'], color: Card['color'], isRevealed = true): Card {
  return { id, value, color, isRevealed };
}

/** Crée un cadran vide */
function makeFace(index: 0 | 1 | 2 | 3 | 4 | 5, cards: Card[] = []): ClockFace {
  return { index, cards };
}

/** Crée un GameState minimal pour les tests */
function makeGameState(clockFaces: ClockFace[]): GameState {
  return {
    roomId: 'test-room',
    creatorId: 'creator',
    phase: 'resolution',
    players: [],
    clockFaces,
    currentTurn: '',
    revealedCount: 0,
  };
}

// 24 cartes réparties en 4 par cadran, sommes strictement croissantes
// C1=4, C2=8, C3=12, C4=16, C5=20, C6=24  ✓  (chacune ≤ 24)
function buildVictoryState(): GameState {
  return makeGameState([
    makeFace(0, [makeCard('w1', 1, 'white'), makeCard('b1', 1, 'black'), makeCard('w2', 1, 'white'), makeCard('b2', 1, 'black')]),   // sum=4
    makeFace(1, [makeCard('w3', 2, 'white'), makeCard('b3', 2, 'black'), makeCard('w4', 2, 'white'), makeCard('b4', 2, 'black')]),   // sum=8
    makeFace(2, [makeCard('w5', 3, 'white'), makeCard('b5', 3, 'black'), makeCard('w6', 3, 'white'), makeCard('b6', 3, 'black')]),   // sum=12
    makeFace(3, [makeCard('w7', 4, 'white'), makeCard('b7', 4, 'black'), makeCard('w8', 4, 'white'), makeCard('b8', 4, 'black')]),   // sum=16
    makeFace(4, [makeCard('w9', 5, 'white'), makeCard('b9', 5, 'black'), makeCard('w10', 5, 'white'), makeCard('b10', 5, 'black')]), // sum=20
    makeFace(5, [makeCard('w11', 6, 'white'), makeCard('b11', 6, 'black'), makeCard('w12', 6, 'white'), makeCard('b12', 6, 'black')]), // sum=24
  ]);
}

describe('validateVictory', () => {
  it('retourne isVictory=true pour un état gagnant', () => {
    const result = validateVictory(buildVictoryState());
    expect(result.isVictory).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('calcule correctement les sommes par cadran', () => {
    const result = validateVictory(buildVictoryState());
    expect(result.sums).toEqual([4, 8, 12, 16, 20, 24]);
  });

  it('accepte une égalité entre deux cadrans consécutifs', () => {
    const state = buildVictoryState();
    // Forcer C1 = C2 = 8
    state.clockFaces[0].cards = [makeCard('eq1', 2, 'white'), makeCard('eq2', 2, 'black'), makeCard('eq3', 2, 'white'), makeCard('eq4', 2, 'black')]; // sum=8
    // C2 reste à 8 → égalité autorisée
    const result = validateVictory(state);
    // L'égalité ne doit PAS être une violation
    expect(result.violations.some((v) => v.includes('C1') && v.includes('C2'))).toBe(false);
  });

  it('détecte un ordre décroissant entre cadrans', () => {
    const state = buildVictoryState();
    // C1=8, C2=4 → décroissant
    state.clockFaces[0].cards = [makeCard('a1', 2, 'white'), makeCard('a2', 2, 'black'), makeCard('a3', 2, 'white'), makeCard('a4', 2, 'black')]; // sum=8
    state.clockFaces[1].cards = [makeCard('b1', 1, 'white'), makeCard('b2', 1, 'black'), makeCard('b3', 1, 'white'), makeCard('b4', 1, 'black')]; // sum=4
    const result = validateVictory(state);
    expect(result.isVictory).toBe(false);
    expect(result.violations.some((v) => v.includes('C1') && v.includes('C2'))).toBe(true);
  });

  it('détecte une somme dépassant 24 sans condition SUM_EXCEED_24', () => {
    const state = buildVictoryState();
    // Remplacer C6 par 4 cartes dont la somme > 24, garder total = 24 cartes
    state.clockFaces[5].cards = [
      makeCard('x1', 7, 'white'),
      makeCard('x2', 7, 'black'),
      makeCard('x3', 7, 'white'),
      makeCard('x4', 7, 'black'), // sum=28 > 24
    ];
    const result = validateVictory(state);
    expect(result.violations.some((v) => v.includes('C6') && v.includes('24'))).toBe(true);
  });

  it('autorise une somme > 24 si la condition SUM_EXCEED_24 est présente', () => {
    const state = buildVictoryState();
    // C6 avec somme > 24 mais condition SUM_EXCEED_24, total reste 24 cartes
    state.clockFaces[5] = {
      index: 5,
      cards: [
        makeCard('y1', 7, 'white'),
        makeCard('y2', 7, 'black'),
        makeCard('y3', 7, 'white'),
        makeCard('y4', 7, 'black'), // sum=28 > 24, mais C5=20 < C6=28 ✓
      ],
      condition: {
        id: 'cond-exceed',
        type: ConditionType.SUM_EXCEED_24,
        clockFaceIndex: 5,
        label: 'Peut dépasser 24',
      },
    };
    const result = validateVictory(state);
    // La violation sur "dépasse 24" ne doit pas apparaître pour C6
    expect(result.violations.some((v) => v.includes('C6') && v.includes('24'))).toBe(false);
  });

  it('détecte des cartes manquantes sur le plateau (cartes encore en main)', () => {
    const state = makeGameState([
      makeFace(0, [makeCard('c1', 1, 'white')]),
      makeFace(1, [makeCard('c2', 2, 'white')]),
      makeFace(2, [makeCard('c3', 3, 'white')]),
      makeFace(3, [makeCard('c4', 4, 'white')]),
      makeFace(4, [makeCard('c5', 5, 'white')]),
      makeFace(5, [makeCard('c6', 6, 'white')]),
    ]);
    // Simuler un joueur qui a encore des cartes en main
    state.players = [
      { id: 'p1', name: 'P1', hand: [makeCard('h1', 7, 'black')], isReady: true, avatarSeed: 'p1' },
    ];
    const result = validateVictory(state);
    expect(result.violations.some((v) => v.includes('reste') && v.includes('main'))).toBe(true);
  });

  it('valide la condition EXACT_COUNT', () => {
    const state = buildVictoryState();
    // C1 a 4 cartes mais la condition exige exactement 3
    state.clockFaces[0] = {
      index: 0,
      cards: [makeCard('z1', 1, 'white'), makeCard('z2', 1, 'black'), makeCard('z3', 1, 'white'), makeCard('z4', 1, 'black')],
      condition: {
        id: 'c1',
        type: ConditionType.EXACT_COUNT,
        clockFaceIndex: 0,
        label: 'Exactement 3 cartes',
        params: { exactCount: 3 },
      },
    };
    const result = validateVictory(state);
    expect(result.violations.some((v) => v.includes('C1') && v.includes('exactement 3'))).toBe(true);
  });

  it('valide la condition STRICT_ORDER', () => {
    const state = buildVictoryState();
    // C1 : cartes en ordre décroissant → violation STRICT_ORDER
    state.clockFaces[0] = {
      index: 0,
      cards: [makeCard('o1', 3, 'white'), makeCard('o2', 1, 'black'), makeCard('o3', 1, 'white'), makeCard('o4', 1, 'black')],
      condition: {
        id: 'c2',
        type: ConditionType.STRICT_ORDER,
        clockFaceIndex: 0,
        label: 'Ordre croissant',
      },
    };
    const result = validateVictory(state);
    expect(result.violations.some((v) => v.includes('C1') && v.includes('croissant'))).toBe(true);
  });

  it('valide la condition LARGEST_BLACK', () => {
    const state = buildVictoryState();
    // La plus grande carte noire sur tout le plateau est valeur 6 (dans C6).
    // On place la condition LARGEST_BLACK sur C1 qui ne contient que des blanches.
    state.clockFaces[0] = {
      index: 0,
      cards: [makeCard('lb1', 1, 'white'), makeCard('lb2', 1, 'white'), makeCard('lb3', 1, 'white'), makeCard('lb4', 1, 'white')],
      condition: {
        id: 'c3',
        type: ConditionType.LARGEST_BLACK,
        clockFaceIndex: 0,
        label: 'Doit avoir la plus grande noire',
      },
    };
    const result = validateVictory(state);
    expect(result.violations.some((v) => v.includes('C1') && v.includes('Noire la plus grande'))).toBe(true);
  });
});






