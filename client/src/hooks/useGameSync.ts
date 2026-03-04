import { useEffect, useCallback } from 'react';
import { getSocket, connectSocket } from '../socket/socketClient';
import { useGameStore } from '../store/gameStore';
import { useUiStore } from '../store/uiStore';
// Re-export SERVER_EVENTS inline to avoid server-only import issues
const SERVER_EVENTS = {
  ROOM_CREATED: 'room_created',
  ROOM_JOINED: 'room_joined',
  ROOM_ERROR: 'room_error',
  GAME_STATE_UPDATE: 'game_state_update',
  GAME_STARTED: 'game_started',
  CARD_PLAYED: 'card_played',
  CARD_REVEALED: 'card_revealed',
  GAME_RESOLVED: 'game_resolved',
  PLAYER_LEFT: 'player_left',
  TURN_CHANGED: 'turn_changed',
} as const;

const CLIENT_EVENTS = {
  CREATE_ROOM: 'create_room',
  JOIN_ROOM: 'join_room',
  PLAYER_READY: 'player_ready',
  CLAIM_FIRST_TURN: 'claim_first_turn',
  START_ROUND: 'start_round',
  PLAY_CARD: 'play_card',
  REVEAL_CARD: 'reveal_card',
  TRIGGER_RESOLUTION: 'trigger_resolution',
  RESTART_GAME: 'restart_game',
  SET_CUSTOM_CONDITIONS: 'set_custom_conditions',
  RANDOMIZE_CONDITIONS: 'randomize_conditions',
} as const;

export function useGameSync() {
  const { setGameState, setMyPlayerId, setRoomId, setVictoryResult } = useGameStore();
  const { setError, showResolution } = useUiStore();

  useEffect(() => {
    const socket = getSocket();
    connectSocket();

    setMyPlayerId(socket.id ?? '');

    socket.on('connect', () => setMyPlayerId(socket.id ?? ''));

    socket.on(SERVER_EVENTS.ROOM_CREATED, ({ roomId, state }: any) => {
      setRoomId(roomId);
      setGameState(state);
    });

    socket.on(SERVER_EVENTS.ROOM_JOINED, ({ state }: any) => {
      setRoomId(state.roomId);
      setGameState(state);
    });
    socket.on(SERVER_EVENTS.GAME_STATE_UPDATE, (state: any) => setGameState(state));
    socket.on(SERVER_EVENTS.GAME_STARTED, (state: any) => setGameState(state));
    socket.on(SERVER_EVENTS.CARD_PLAYED, (state: any) => setGameState(state));
    socket.on(SERVER_EVENTS.CARD_REVEALED, (state: any) => setGameState(state));
    socket.on(SERVER_EVENTS.PLAYER_LEFT, ({ state }: any) => setGameState(state));

    socket.on(SERVER_EVENTS.GAME_RESOLVED, ({ state, result }: any) => {
      setGameState(state);
      setVictoryResult(result);
      showResolution();
    });

    socket.on(SERVER_EVENTS.ROOM_ERROR, ({ message }: { message: string }) => {
      setError(message);
      setTimeout(() => setError(null), 4000);
    });

    return () => {
      socket.removeAllListeners();
    };
  }, []);

  const createRoom = useCallback((name: string) => {
    getSocket().emit(CLIENT_EVENTS.CREATE_ROOM, { name });
  }, []);

  const joinRoom = useCallback((roomId: string, name: string) => {
    getSocket().emit(CLIENT_EVENTS.JOIN_ROOM, { roomId, name });
  }, []);

  const setReady = useCallback((roomId: string) => {
    getSocket().emit(CLIENT_EVENTS.PLAYER_READY, { roomId });
  }, []);

  const playCard = useCallback(
    (roomId: string, cardId: string, clockFaceIndex: number) => {
      getSocket().emit(CLIENT_EVENTS.PLAY_CARD, { roomId, cardId, clockFaceIndex });
    },
    []
  );

  const revealCard = useCallback(
    (roomId: string, clockFaceIndex: number, cardIndex: number) => {
      getSocket().emit(CLIENT_EVENTS.REVEAL_CARD, { roomId, clockFaceIndex, cardIndex });
    },
    []
  );

  const triggerResolution = useCallback((roomId: string) => {
    getSocket().emit(CLIENT_EVENTS.TRIGGER_RESOLUTION, { roomId });
  }, []);

  const claimFirstTurn = useCallback((roomId: string) => {
    getSocket().emit(CLIENT_EVENTS.CLAIM_FIRST_TURN, { roomId });
  }, []);

  const startRound = useCallback((roomId: string) => {
    getSocket().emit(CLIENT_EVENTS.START_ROUND, { roomId });
  }, []);

  const restartGame = useCallback((roomId: string) => {
    getSocket().emit(CLIENT_EVENTS.RESTART_GAME, { roomId });
  }, []);

  const setCustomConditions = useCallback((
    roomId: string,
    assignments: Array<{ faceIndex: number; conditionType: string; label?: string; params?: Record<string, unknown> }>
  ) => {
    getSocket().emit(CLIENT_EVENTS.SET_CUSTOM_CONDITIONS, { roomId, assignments });
  }, []);

  const randomizeConditions = useCallback((roomId: string) => {
    getSocket().emit(CLIENT_EVENTS.RANDOMIZE_CONDITIONS, { roomId });
  }, []);

  return { createRoom, joinRoom, setReady, playCard, revealCard, triggerResolution, claimFirstTurn, startRound, restartGame, setCustomConditions, randomizeConditions };
}

