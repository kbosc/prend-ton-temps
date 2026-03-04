import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ResolutionOverlay } from '../components/ResolutionOverlay/ResolutionOverlay';
import type { VictoryResult } from '@ptt/shared';

const victoryResult: VictoryResult = {
  isVictory: true,
  violations: [],
  sums: [1, 3, 6, 10, 15, 21],
};

const defeatResult: VictoryResult = {
  isVictory: false,
  violations: ['Ordre non respect\u00e9 : somme C1 (5) >= somme C2 (3).'],
  sums: [5, 3, 6, 10, 15, 21],
};

describe('ResolutionOverlay', () => {
  it('affiche Victoire pour un resultat gagnant', () => {
    render(<ResolutionOverlay result={victoryResult} sums={victoryResult.sums} onClose={vi.fn()} />);
    expect(screen.getByText('Victoire !')).toBeInTheDocument();
  });

  it('affiche Defaite pour un resultat perdant', () => {
    render(<ResolutionOverlay result={defeatResult} sums={defeatResult.sums} onClose={vi.fn()} />);
    expect(screen.getByText('D\u00e9faite\u2026')).toBeInTheDocument();
  });

  it('liste les violations', () => {
    render(<ResolutionOverlay result={defeatResult} sums={defeatResult.sums} onClose={vi.fn()} />);
    expect(screen.getByText(/Ordre non respect/)).toBeInTheDocument();
  });

  it('affiche les 6 sommes de cadrans', () => {
    render(<ResolutionOverlay result={victoryResult} sums={victoryResult.sums} onClose={vi.fn()} />);
    expect(screen.getByText('21')).toBeInTheDocument();
  });

  it('appelle onClose au clic sur Fermer', () => {
    const onClose = vi.fn();
    render(<ResolutionOverlay result={victoryResult} sums={victoryResult.sums} onClose={onClose} />);
    fireEvent.click(screen.getByText('Fermer'));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

