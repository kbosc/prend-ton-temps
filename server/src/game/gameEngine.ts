import type { Card, CardValue, CardColor } from '@ptt/shared';
import type { GameState, Player } from '@ptt/shared';
import type { ClockFace, ClockFaceIndex } from '@ptt/shared';
import {
  assignRandomConditions,
  shuffleArray,
  MAX_REVEALS_BEFORE_RESOLUTION,
} from '@ptt/shared';

const CARD_VALUES: CardValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/** Crée le deck complet de 24 cartes */
export function createDeck(): Card[] {
  const colors: CardColor[] = ['white', 'black'];
  return colors.flatMap((color) =>
    CARD_VALUES.map((value) => ({
      id: `${color}-${value}`,
      value,
      color,
      isRevealed: false,
    }))
  );
}

/** Distribue 3 cartes par joueur depuis le deck mélangé */
export function dealCards(deck: Card[], players: Player[]): Player[] {
  if (players.length === 0) return players;
  const shuffled = shuffleArray(deck);
  const CARDS_PER_PLAYER = 3;

  return players.map((player, i) => ({
    ...player,
    hand: shuffled.slice(i * CARDS_PER_PLAYER, (i + 1) * CARDS_PER_PLAYER),
  }));
}

/** Initialise les 6 cadrans vides */
function createClockFaces(): ClockFace[] {
  return ([0, 1, 2, 3, 4, 5] as ClockFaceIndex[]).map((index) => ({
    index,
    cards: [],
  }));
}

/** Démarre une partie depuis un état lobby */
export function startGame(state: GameState): GameState {
  const deck = createDeck();
  const playersWithCards = dealCards(deck, state.players);
  const clockFaces = assignRandomConditions(createClockFaces());

  return {
    ...state,
    phase: 'playing',
    players: playersWithCards,
    clockFaces,
    revealedCount: 0,
    currentTurn: '', // Aucun joueur désigné au départ — un joueur clique "Je commence"
  };
}

/** Joue une carte sur un cadran */
export function playCard(
  state: GameState,
  playerId: string,
  cardId: string,
  clockFaceIndex: ClockFaceIndex
): { state: GameState; error?: string } {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return { state, error: 'Joueur introuvable.' };
  if (state.currentTurn !== playerId) return { state, error: "Ce n'est pas votre tour." };

  const card = player.hand.find((c) => c.id === cardId);
  if (!card) return { state, error: 'Carte introuvable dans votre main.' };

  const face = state.clockFaces[clockFaceIndex];

  // Placer la carte sur le cadran (pas de limite ici, évaluée à la fin)
  const updatedFace: ClockFace = {
    ...face,
    cards: [...face.cards, { ...card, isRevealed: false, playedBy: playerId }],
  };

  const updatedPlayer: Player = {
    ...player,
    hand: player.hand.filter((c) => c.id !== cardId),
  };

  // Prochain joueur
  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  const nextIndex = (playerIndex + 1) % state.players.length;
  const nextTurn = state.players[nextIndex]?.id ?? playerId;

  return {
    state: {
      ...state,
      players: state.players.map((p) => (p.id === playerId ? updatedPlayer : p)),
      clockFaces: state.clockFaces.map((f, i) =>
        i === clockFaceIndex ? updatedFace : f
      ),
      currentTurn: nextTurn,
    },
  };
}

/** Révèle une carte sur le plateau */
export function revealCard(
  state: GameState,
  clockFaceIndex: ClockFaceIndex,
  cardIndex: number
): { state: GameState; error?: string } {
  if (state.revealedCount >= MAX_REVEALS_BEFORE_RESOLUTION) {
    return {
      state,
      error: `Maximum ${MAX_REVEALS_BEFORE_RESOLUTION} révélations atteint avant la résolution.`,
    };
  }

  const face = state.clockFaces[clockFaceIndex];
  if (!face.cards[cardIndex]) return { state, error: 'Carte introuvable.' };
  if (face.cards[cardIndex].isRevealed) return { state, error: 'Carte déjà révélée.' };

  const updatedCards = face.cards.map((c, i) =>
    i === cardIndex ? { ...c, isRevealed: true } : c
  );

  return {
    state: {
      ...state,
      revealedCount: state.revealedCount + 1,
      clockFaces: state.clockFaces.map((f, i) =>
        i === clockFaceIndex ? { ...f, cards: updatedCards } : f
      ),
    },
  };
}

/** Révèle TOUTES les cartes (phase de résolution) */
export function revealAllCards(state: GameState): GameState {
  return {
    ...state,
    phase: 'resolution',
    clockFaces: state.clockFaces.map((face) => ({
      ...face,
      cards: face.cards.map((c) => ({ ...c, isRevealed: true })),
    })),
  };
}



