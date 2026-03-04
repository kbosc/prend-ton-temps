import { describe, it, expect } from 'vitest';
import {
  CONDITION_POOL,
  assignRandomConditions,
  createConditionFromDefinition,
  shuffleArray,
} from '../../logic/conditionPool';
import { ConditionType } from '../../types/condition';
import type { ClockFace } from '../../types/clockFace';

function makeEmptyFaces(): ClockFace[] {
  return [0, 1, 2, 3, 4, 5].map((i) => ({
    index: i as 0 | 1 | 2 | 3 | 4 | 5,
    cards: [],
  }));
}

describe('CONDITION_POOL', () => {
  it('contient tous les types de conditions', () => {
    const types = CONDITION_POOL.map((d) => d.type);
    expect(types).toContain(ConditionType.LARGEST_BLACK);
    expect(types).toContain(ConditionType.SMALLEST_BLACK);
    expect(types).toContain(ConditionType.LARGEST_WHITE);
    expect(types).toContain(ConditionType.SMALLEST_WHITE);
    expect(types).toContain(ConditionType.EXACT_COUNT);
    expect(types).toContain(ConditionType.STRICT_ORDER);
    expect(types).toContain(ConditionType.SUM_EXCEED_24);
  });

  it('chaque définition a un label non vide', () => {
    CONDITION_POOL.forEach((def) => {
      expect(def.label.length).toBeGreaterThan(0);
    });
  });
});

describe('createConditionFromDefinition', () => {
  it('crée une condition avec les bonnes propriétés', () => {
    const def = CONDITION_POOL.find((d) => d.type === ConditionType.EXACT_COUNT)!;
    const condition = createConditionFromDefinition(def, 2);
    expect(condition.type).toBe(ConditionType.EXACT_COUNT);
    expect(condition.clockFaceIndex).toBe(2);
    expect(condition.label).toBe(def.label);
    expect(condition.params?.exactCount).toBe(2);
  });

  it('génère des ids uniques', () => {
    const def = CONDITION_POOL[0];
    const c1 = createConditionFromDefinition(def, 0);
    const c2 = createConditionFromDefinition(def, 0);
    expect(c1.id).not.toBe(c2.id);
  });
});

describe('assignRandomConditions', () => {
  it('assigne exactement N conditions aux cadrans', () => {
    const faces = makeEmptyFaces();
    const result = assignRandomConditions(faces, 3);
    const withCondition = result.filter((f) => f.condition !== undefined);
    expect(withCondition).toHaveLength(3);
  });

  it('ne modifie pas les cartes existantes', () => {
    const faces = makeEmptyFaces();
    faces[0].cards = [{ id: 'c1', value: 5, color: 'white', isRevealed: false }];
    const result = assignRandomConditions(faces, 2);
    expect(result[0].cards).toHaveLength(1);
  });

  it('retourne 6 cadrans', () => {
    const faces = makeEmptyFaces();
    const result = assignRandomConditions(faces, 4);
    expect(result).toHaveLength(6);
  });

  it('utilise des conditions valides du pool', () => {
    const faces = makeEmptyFaces();
    const result = assignRandomConditions(faces, 4);
    const validTypes = Object.values(ConditionType);
    result.filter((f) => f.condition).forEach((f) => {
      expect(validTypes).toContain(f.condition!.type);
    });
  });
});

describe('shuffleArray', () => {
  it('conserve tous les éléments', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(arr);
    expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('ne mute pas le tableau original', () => {
    const arr = [1, 2, 3];
    const original = [...arr];
    shuffleArray(arr);
    expect(arr).toEqual(original);
  });
});



