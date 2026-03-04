import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ClockFaceSlot } from '../components/Board/ClockFaceSlot';
import type { ClockFace } from '@ptt/shared';
import { ConditionType } from '@ptt/shared';

function makeFace(overrides: Partial<ClockFace> = {}): ClockFace {
  return {
    index: 0,
    cards: [],
    ...overrides,
  };
}

describe('ClockFaceSlot', () => {
  it('affiche le numéro du cadran', () => {
    render(
      <ClockFaceSlot
        face={makeFace({ index: 2 })}
        onDrop={vi.fn()}
        onCardClick={vi.fn()}
        revealedCount={0}
        maxReveals={4}
        isMyTurn={true}
      />
    );
    expect(screen.getByText('C3')).toBeInTheDocument();
  });

  it("affiche le message 'Déposez ici' quand vide et c'est mon tour", () => {
    render(
      <ClockFaceSlot
        face={makeFace()}
        onDrop={vi.fn()}
        onCardClick={vi.fn()}
        revealedCount={0}
        maxReveals={4}
        isMyTurn={true}
      />
    );
    expect(screen.getByText('Déposez ici')).toBeInTheDocument();
  });

  it('affiche la condition si présente', () => {
    const face = makeFace({
      condition: {
        id: 'c1',
        type: ConditionType.SUM_EXCEED_24,
        clockFaceIndex: 0,
        label: 'Peut dépasser 24',
      },
    });
    render(
      <ClockFaceSlot
        face={face}
        onDrop={vi.fn()}
        onCardClick={vi.fn()}
        revealedCount={0}
        maxReveals={4}
        isMyTurn={true}
      />
    );
    expect(screen.getByText(/Peut dépasser 24/)).toBeInTheDocument();
  });

  it('affiche la somme Σ uniquement en phase résolution (showSum=true)', () => {
    render(
      <ClockFaceSlot
        face={makeFace()}
        onDrop={vi.fn()}
        onCardClick={vi.fn()}
        revealedCount={0}
        maxReveals={4}
        isMyTurn={true}
        showSum={true}
      />
    );
    expect(screen.getByText(/Σ=0/)).toBeInTheDocument();
  });

  it('appelle onDrop lors du drop de carte', () => {
    const onDrop = vi.fn();
    render(
      <ClockFaceSlot
        face={makeFace({ index: 1 })}
        onDrop={onDrop}
        onCardClick={vi.fn()}
        revealedCount={0}
        maxReveals={4}
        isMyTurn={true}
      />
    );
    const slot = screen.getByTestId('clock-face-1');
    fireEvent.dragOver(slot);
    fireEvent.drop(slot, {
      dataTransfer: { getData: (_k: string) => 'white-5' },
    });
    expect(onDrop).toHaveBeenCalledWith(1, 'white-5');
  });
});

