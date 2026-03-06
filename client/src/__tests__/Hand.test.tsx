import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Hand } from '../components/Hand/Hand';
import type { Card } from '@ptt/shared';

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 'w5',
    value: 5,
    color: 'white',
    isRevealed: false,
    ...overrides,
  };
}

const noop = () => {};

describe('Hand component', () => {
  describe('avant le lancement de la partie (gameStarted = false)', () => {
    it('affiche la couleur des cartes mais pas leur valeur', () => {
      const cards = [
        makeCard({ id: 'w5', value: 5, color: 'white' }),
        makeCard({ id: 'b3', value: 3, color: 'black' }),
      ];

      render(
        <Hand
          cards={cards}
          isMyTurn={false}
          gameStarted={false}
          onCardDragStart={noop}
          onCardDragEnd={noop}
        />,
      );

      // Les emojis de couleur doivent être visibles
      expect(screen.getByTestId('card-w5')).toBeInTheDocument();
      expect(screen.getByTestId('card-b3')).toBeInTheDocument();

      // Le "?" doit apparaître (mode showColor)
      const questionMarks = screen.getAllByText('?');
      expect(questionMarks).toHaveLength(2);

      // Les valeurs numériques ne doivent PAS être affichées
      expect(screen.queryByText('5')).not.toBeInTheDocument();
      expect(screen.queryByText('3')).not.toBeInTheDocument();
    });

    it('affiche le bon emoji selon la couleur de la carte', () => {
      const cards = [
        makeCard({ id: 'w1', value: 1, color: 'white' }),
        makeCard({ id: 'b2', value: 2, color: 'black' }),
      ];

      render(
        <Hand
          cards={cards}
          isMyTurn={false}
          gameStarted={false}
          onCardDragStart={noop}
          onCardDragEnd={noop}
        />,
      );

      expect(screen.getByText('⬜')).toBeInTheDocument();
      expect(screen.getByText('⬛')).toBeInTheDocument();
    });

    it('ne rend pas les cartes draggable', () => {
      const cards = [makeCard({ id: 'w5', value: 5 })];

      const { container } = render(
        <Hand
          cards={cards}
          isMyTurn={true}
          gameStarted={false}
          onCardDragStart={noop}
          onCardDragEnd={noop}
        />,
      );

      // Même si c'est le tour du joueur, les cartes ne doivent pas être draggable
      const cardEl = container.querySelector('[data-card-id="w5"]');
      expect(cardEl).toBeInTheDocument();
      // En mode showColor le rendu n'a pas d'attribut draggable
      expect(cardEl?.getAttribute('draggable')).not.toBe('true');
    });
  });

  describe('après le lancement de la partie (gameStarted = true)', () => {
    it('affiche la valeur des cartes', () => {
      const cards = [
        makeCard({ id: 'w5', value: 5, color: 'white' }),
        makeCard({ id: 'b3', value: 3, color: 'black' }),
      ];

      render(
        <Hand
          cards={cards}
          isMyTurn={false}
          gameStarted={true}
          onCardDragStart={noop}
          onCardDragEnd={noop}
        />,
      );

      // Les valeurs numériques doivent être visibles
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();

      // Le "?" ne doit PAS apparaître
      expect(screen.queryByText('?')).not.toBeInTheDocument();
    });

    it('rend les cartes draggable quand c\'est le tour du joueur', () => {
      const cards = [makeCard({ id: 'w5', value: 5 })];

      const { container } = render(
        <Hand
          cards={cards}
          isMyTurn={true}
          gameStarted={true}
          onCardDragStart={noop}
          onCardDragEnd={noop}
        />,
      );

      const cardEl = container.querySelector('[data-card-id="w5"]');
      expect(cardEl).toBeInTheDocument();
      expect(cardEl?.getAttribute('draggable')).toBe('true');
    });

    it('ne rend pas les cartes draggable quand ce n\'est pas le tour du joueur', () => {
      const cards = [makeCard({ id: 'w5', value: 5 })];

      const { container } = render(
        <Hand
          cards={cards}
          isMyTurn={false}
          gameStarted={true}
          onCardDragStart={noop}
          onCardDragEnd={noop}
        />,
      );

      const cardEl = container.querySelector('[data-card-id="w5"]');
      expect(cardEl).toBeInTheDocument();
      expect(cardEl?.getAttribute('draggable')).toBe('false');
    });
  });

  it('affiche un message quand la main est vide', () => {
    render(
      <Hand
        cards={[]}
        isMyTurn={false}
        gameStarted={true}
        onCardDragStart={noop}
        onCardDragEnd={noop}
      />,
    );

    expect(screen.getByText('Aucune carte en main')).toBeInTheDocument();
  });

  it('affiche le nombre de cartes en main', () => {
    const cards = [
      makeCard({ id: 'w1', value: 1 }),
      makeCard({ id: 'w2', value: 2 }),
      makeCard({ id: 'w3', value: 3 }),
    ];

    render(
      <Hand
        cards={cards}
        isMyTurn={false}
        gameStarted={false}
        onCardDragStart={noop}
        onCardDragEnd={noop}
      />,
    );

    expect(screen.getByText(/Ma main \(3\)/)).toBeInTheDocument();
  });
});

