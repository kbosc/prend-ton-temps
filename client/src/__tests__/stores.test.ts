import {describe, it, expect, beforeEach} from 'vitest';
import {useGameStore} from '../store/gameStore';
import {useUiStore} from '../store/uiStore';
import type {GameState} from '@ptt/shared';

function makeGameState(): GameState {
    return {
        roomId: 'room-1',
        creatorId: 'p1',
        phase: 'playing',
        players: [],
        clockFaces: [0, 1, 2, 3, 4, 5].map((i) => ({
            index: i as 0 | 1 | 2 | 3 | 4 | 5,
            cards: [],
        })),
        currentTurn: 'p1',
        revealedCount: 0,
    };
}

describe('gameStore', () => {
    beforeEach(() => {
        useGameStore.getState().reset();
    });

    it('setGameState met à jour le state', () => {
        const state = makeGameState();
        useGameStore.getState().setGameState(state);
        expect(useGameStore.getState().gameState?.roomId).toBe('room-1');
    });

    it('setMyPlayerId met à jour le playerId', () => {
        useGameStore.getState().setMyPlayerId('p42');
        expect(useGameStore.getState().myPlayerId).toBe('p42');
    });

    it('reset remet tout à null', () => {
        useGameStore.getState().setGameState(makeGameState());
        useGameStore.getState().setMyPlayerId('p1');
        useGameStore.getState().reset();
        expect(useGameStore.getState().gameState).toBeNull();
        expect(useGameStore.getState().myPlayerId).toBeNull();
    });
});

describe('uiStore', () => {
    it('setDragging active le dragging avec un cardId', () => {
        useUiStore.getState().setDragging(true, 'card-123');
        expect(useUiStore.getState().isDragging).toBe(true);
        expect(useUiStore.getState().dragCardId).toBe('card-123');
    });

    it('setDragging(false) désactive le dragging', () => {
        useUiStore.getState().setDragging(true, 'card-123');
        useUiStore.getState().setDragging(false);
        expect(useUiStore.getState().isDragging).toBe(false);
        expect(useUiStore.getState().dragCardId).toBeNull();
    });

    it('showResolution / hideResolution gèrent la visibilité', () => {
        useUiStore.getState().showResolution();
        expect(useUiStore.getState().isResolutionVisible).toBe(true);
        useUiStore.getState().hideResolution();
        expect(useUiStore.getState().isResolutionVisible).toBe(false);
    });

    it('setError stocke et efface le message', () => {
        useUiStore.getState().setError('Erreur test');
        expect(useUiStore.getState().errorMessage).toBe('Erreur test');
        useUiStore.getState().setError(null);
        expect(useUiStore.getState().errorMessage).toBeNull();
    });
});

