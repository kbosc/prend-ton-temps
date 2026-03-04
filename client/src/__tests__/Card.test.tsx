import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Card } from '../components/Card/Card';
import type { Card as CardType } from '@ptt/shared';

function makeCard(overrides: Partial<CardType> = {}): CardType {
  return {
    id: 'w5',
    value: 5,
    color: 'white',
    isRevealed: true,
    ...overrides,
  };
}

describe('Card component', () => {
  it('affiche la valeur de la carte quand face visible', () => {
    render(<Card card={makeCard({ value: 7, isRevealed: true })} faceUp />);
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it("affiche le dos de carte (transform rotateY) quand face cachée", () => {
    const { container } = render(<Card card={makeCard({ value: 7, isRevealed: false })} faceUp={false} />);
    // L'inner wrapper doit avoir rotateY(180deg) quand face cachée
    const inner = container.querySelector('[style*="rotateY(180deg)"]');
    expect(inner).toBeInTheDocument();
  });

  it('appelle onClick quand cliqué', () => {
    const onClick = vi.fn();
    render(<Card card={makeCard()} faceUp onClick={onClick} />);
    fireEvent.click(screen.getByTestId('card-w5'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('a le bon data-testid', () => {
    render(<Card card={makeCard({ id: 'b3' })} faceUp />);
    expect(screen.getByTestId('card-b3')).toBeInTheDocument();
  });

  it('affiche le bon emoji selon la couleur', () => {
    const { rerender } = render(<Card card={makeCard({ color: 'white' })} faceUp />);
    expect(screen.getByText('⬜')).toBeInTheDocument();

    rerender(<Card card={makeCard({ color: 'black' })} faceUp />);
    expect(screen.getByText('⬛')).toBeInTheDocument();
  });
});


