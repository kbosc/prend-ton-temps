import { describe, it, expect } from 'vitest';
import { createDeck, dealCards, startGame, playCard, revealCard } from '../../game/gameEngine';
import type { GameState, Player } from '@ptt/shared';

function makePlayer(id: string): Player {
  return { id, name: id, hand: [], isReady: true, avatarSeed: id };
}

function makeLobbyState(players: Player[]): GameState {
  return {
    roomId: 'test',
    creatorId: 'p1',
    phase: 'lobby',
    players,
    clockFaces: [0, 1, 2, 3, 4, 5].map((i) => ({
      index: i as 0 | 1 | 2 | 3 | 4 | 5,
      cards: [],
    })),
    currentTurn: '',
    revealedCount: 0,
  };
}

describe('createDeck', () => {
  it('crée 24 cartes', () => {
    expect(createDeck()).toHaveLength(24);
  });

  it('contient 12 cartes blanches et 12 noires', () => {
    const deck = createDeck();
    expect(deck.filter((c) => c.color === 'white')).toHaveLength(12);
    expect(deck.filter((c) => c.color === 'black')).toHaveLength(12);
  });

  it('toutes les cartes sont face cachée', () => {
    createDeck().forEach((c) => expect(c.isRevealed).toBe(false));
  });
});

describe('dealCards', () => {
  it('distribue 3 cartes par joueur', () => {
    const deck = createDeck();
    const players = [makePlayer('p1'), makePlayer('p2')];
    const dealt = dealCards(deck, players);
    expect(dealt[0].hand).toHaveLength(3);
    expect(dealt[1].hand).toHaveLength(3);
  });

  it('retourne les joueurs inchangés si aucun joueur', () => {
    expect(dealCards(createDeck(), [])).toEqual([]);
  });
});

describe('startGame', () => {
  it('passe en phase playing', () => {
    const state = makeLobbyState([makePlayer('p1'), makePlayer('p2')]);
    expect(startGame(state).phase).toBe('playing');
  });

  it('distribue les cartes à tous les joueurs', () => {
    const state = makeLobbyState([makePlayer('p1'), makePlayer('p2')]);
    const started = startGame(state);
    started.players.forEach((p) => expect(p.hand.length).toBeGreaterThan(0));
  });

  it('assigne des conditions aux cadrans', () => {
    const state = makeLobbyState([makePlayer('p1'), makePlayer('p2')]);
    const started = startGame(state);
    const withCondition = started.clockFaces.filter((f) => f.condition);
    expect(withCondition.length).toBeGreaterThanOrEqual(2);
  });
});

describe('playCard', () => {
  it("refuse de jouer si ce n'est pas son tour", () => {
    const lobby = makeLobbyState([makePlayer('p1'), makePlayer('p2')]);
    const gameState = startGame(lobby);
    // Forcer le premier joueur comme joueur courant
    const state = { ...gameState, currentTurn: gameState.players[0].id };
    const otherPlayer = state.players.find((p) => p.id !== state.currentTurn)!;
    const card = otherPlayer.hand[0];
    const { error } = playCard(state, otherPlayer.id, card.id, 0);
    expect(error).toBeDefined();
  });

  it('joue une carte sur un cadran', () => {
    const lobby = makeLobbyState([makePlayer('p1'), makePlayer('p2')]);
    const gameState = startGame(lobby);
    const state = { ...gameState, currentTurn: gameState.players[0].id };
    const playerId = state.currentTurn;
    const player = state.players.find((p) => p.id === playerId)!;
    const card = player.hand[0];
    const { state: next, error } = playCard(state, playerId, card.id, 0);
    expect(error).toBeUndefined();
    expect(next.clockFaces[0].cards).toHaveLength(1);
    expect(next.players.find((p) => p.id === playerId)!.hand).toHaveLength(player.hand.length - 1);
  });

  it('change le tour après avoir joué', () => {
    const lobby = makeLobbyState([makePlayer('p1'), makePlayer('p2')]);
    const gameState = startGame(lobby);
    const state = { ...gameState, currentTurn: gameState.players[0].id };
    const playerId = state.currentTurn;
    const card = state.players.find((p) => p.id === playerId)!.hand[0];
    const { state: next } = playCard(state, playerId, card.id, 0);
    expect(next.currentTurn).not.toBe(playerId);
  });
});

describe('revealCard', () => {
  it('révèle une carte sur le plateau', () => {
    const lobby = makeLobbyState([makePlayer('p1'), makePlayer('p2')]);
    const gameState = startGame(lobby);
    const state = { ...gameState, currentTurn: gameState.players[0].id };
    const playerId = state.currentTurn;
    const card = state.players.find((p) => p.id === playerId)!.hand[0];
    const { state: afterPlay } = playCard(state, playerId, card.id, 0);
    const { state: afterReveal } = revealCard(afterPlay, 0, 0);
    expect(afterReveal.clockFaces[0].cards[0].isRevealed).toBe(true);
    expect(afterReveal.revealedCount).toBe(1);
  });

  it('refuse de dépasser le max de révélations', () => {
    const lobby = makeLobbyState([makePlayer('p1'), makePlayer('p2')]);
    const gameState = startGame(lobby);
    let state = { ...gameState, currentTurn: gameState.players[0].id };
    // Forcer revealedCount au maximum
    state = { ...state, revealedCount: 4 };
    const playerId = state.currentTurn;
    const card = state.players.find((p) => p.id === playerId)!.hand[0];
    const { state: afterPlay } = playCard(state, playerId, card.id, 0);
    const { error } = revealCard(afterPlay, 0, 0);
    expect(error).toBeDefined();
  });
});

