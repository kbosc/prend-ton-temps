import { describe, it, expect, beforeEach } from 'vitest';
import { roomManager } from '../../rooms/roomManager';
import type { Player } from '@ptt/shared';

function makePlayer(id: string, name = 'Test'): Player {
  return { id, name, hand: [], isReady: false, avatarSeed: id };
}

describe('roomManager', () => {
  let roomId: string;

  beforeEach(() => {
    roomId = roomManager.createRoom('creator');
  });

  it('crée une salle et retourne un id', () => {
    expect(roomId).toBeTruthy();
    expect(roomManager.getRoom(roomId)).toBeDefined();
  });

  it('permet à un joueur de rejoindre une salle', () => {
    const { state, error } = roomManager.joinRoom(roomId, makePlayer('p1'));
    expect(error).toBeUndefined();
    expect(state.players).toHaveLength(1);
  });

  it('refuse de rejoindre une salle inexistante', () => {
    const { error } = roomManager.joinRoom('fake-id', makePlayer('p1'));
    expect(error).toBeDefined();
  });

  it('retire un joueur de la salle', () => {
    roomManager.joinRoom(roomId, makePlayer('p1'));
    roomManager.joinRoom(roomId, makePlayer('p2'));
    const state = roomManager.leaveRoom(roomId, 'p1');
    expect(state?.players).toHaveLength(1);
  });

  it('supprime la salle quand le dernier joueur part', () => {
    roomManager.joinRoom(roomId, makePlayer('p1'));
    roomManager.leaveRoom(roomId, 'p1');
    expect(roomManager.getRoom(roomId)).toBeUndefined();
  });

  it('marque un joueur comme prêt', () => {
    roomManager.joinRoom(roomId, makePlayer('p1'));
    const state = roomManager.markPlayerReady(roomId, 'p1');
    expect(state?.players[0].isReady).toBe(true);
  });

  it('allReady retourne false si moins de 4 joueurs', () => {
    roomManager.joinRoom(roomId, makePlayer('p1'));
    roomManager.joinRoom(roomId, makePlayer('p2'));
    roomManager.markPlayerReady(roomId, 'p1');
    roomManager.markPlayerReady(roomId, 'p2');
    expect(roomManager.allReady(roomId)).toBe(false);
  });

  it('allReady retourne true quand 4 joueurs sont tous prêts', () => {
    roomManager.joinRoom(roomId, makePlayer('p1'));
    roomManager.joinRoom(roomId, makePlayer('p2'));
    roomManager.joinRoom(roomId, makePlayer('p3'));
    roomManager.joinRoom(roomId, makePlayer('p4'));
    roomManager.markPlayerReady(roomId, 'p1');
    roomManager.markPlayerReady(roomId, 'p2');
    roomManager.markPlayerReady(roomId, 'p3');
    roomManager.markPlayerReady(roomId, 'p4');
    expect(roomManager.allReady(roomId)).toBe(true);
  });
});

