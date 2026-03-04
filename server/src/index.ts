import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import type { ClockFaceIndex } from '@ptt/shared';
import { validateVictory, createConditionFromDefinition, CONDITION_POOL, assignRandomConditions } from '@ptt/shared';
import { CLIENT_EVENTS, SERVER_EVENTS } from './events/socketEvents.js';
import { roomManager } from './rooms/roomManager.js';
import {
  startGame,
  playCard,
  revealCard,
  revealAllCards,
} from './game/gameEngine.js';

const PORT = process.env.PORT ?? 3001;
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173';

const app = express();
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: CLIENT_URL, methods: ['GET', 'POST'] },
});

io.on('connection', (socket) => {
  console.log(`[Socket] Connecté : ${socket.id}`);

  /* ── CREATE ROOM ── */
  socket.on(CLIENT_EVENTS.CREATE_ROOM, ({ name }: { name: string }) => {
    const roomId = roomManager.createRoom(socket.id);
    const player = {
      id: socket.id,
      name,
      hand: [],
      isReady: false,
      avatarSeed: socket.id,
    };
    const { state, error } = roomManager.joinRoom(roomId, player);
    if (error) {
      socket.emit(SERVER_EVENTS.ROOM_ERROR, { message: error });
      return;
    }
    socket.join(roomId);
    socket.emit(SERVER_EVENTS.ROOM_CREATED, { roomId, state });
  });

  /* ── JOIN ROOM ── */
  socket.on(CLIENT_EVENTS.JOIN_ROOM, ({ roomId, name }: { roomId: string; name: string }) => {
    const player = {
      id: socket.id,
      name,
      hand: [],
      isReady: false,
      avatarSeed: socket.id,
    };
    const { state, error } = roomManager.joinRoom(roomId, player);
    if (error) {
      socket.emit(SERVER_EVENTS.ROOM_ERROR, { message: error });
      return;
    }
    socket.join(roomId);
    io.to(roomId).emit(SERVER_EVENTS.ROOM_JOINED, { playerId: socket.id, state });
  });

  /* ── PLAYER READY ── */
  socket.on(CLIENT_EVENTS.PLAYER_READY, ({ roomId }: { roomId: string }) => {
    const state = roomManager.markPlayerReady(roomId, socket.id);
    if (!state) return;
    io.to(roomId).emit(SERVER_EVENTS.GAME_STATE_UPDATE, state);

    if (roomManager.allReady(roomId)) {
      const started = startGame(state);
      roomManager.setRoom(roomId, started);
      // Envoyer à chaque joueur son état personnalisé (main privée)
      started.players.forEach((player) => {
        const playerSocket = io.sockets.sockets.get(player.id);
        if (playerSocket) {
          playerSocket.emit(SERVER_EVENTS.GAME_STARTED, started);
        }
      });
    }
  });

  /* ── START ROUND (créateur valide les conditions et ouvre le choix du premier joueur) ── */
  socket.on(CLIENT_EVENTS.START_ROUND, ({ roomId }: { roomId: string }) => {
    const state = roomManager.getRoom(roomId);
    if (!state || state.phase !== 'playing') return;
    if (state.creatorId !== socket.id) {
      socket.emit(SERVER_EVENTS.ROOM_ERROR, { message: 'Seul le créateur peut lancer le round.' });
      return;
    }
    if (state.roundStarted) return;
    const updated = { ...state, roundStarted: true };
    roomManager.setRoom(roomId, updated);
    io.to(roomId).emit(SERVER_EVENTS.GAME_STATE_UPDATE, updated);
  });

  /* ── CLAIM FIRST TURN ── */
  socket.on(CLIENT_EVENTS.CLAIM_FIRST_TURN, ({ roomId }: { roomId: string }) => {
    const state = roomManager.getRoom(roomId);
    if (!state || state.phase !== 'playing') return;
    if (!state.roundStarted) return; // Le créateur n'a pas encore lancé le round
    if (state.currentTurn !== '') return; // Déjà réclamé
    const updated = { ...state, currentTurn: socket.id };
    roomManager.setRoom(roomId, updated);
    io.to(roomId).emit(SERVER_EVENTS.GAME_STATE_UPDATE, updated);
  });

  /* ── PLAY CARD ── */
  socket.on(
    CLIENT_EVENTS.PLAY_CARD,
    ({ roomId, cardId, clockFaceIndex }: { roomId: string; cardId: string; clockFaceIndex: ClockFaceIndex }) => {
      const state = roomManager.getRoom(roomId);
      if (!state) return;
      const { state: next, error } = playCard(state, socket.id, cardId, clockFaceIndex);
      if (error) {
        socket.emit(SERVER_EVENTS.ROOM_ERROR, { message: error });
        return;
      }
      roomManager.setRoom(roomId, next);
      io.to(roomId).emit(SERVER_EVENTS.CARD_PLAYED, next);
      io.to(roomId).emit(SERVER_EVENTS.TURN_CHANGED, { currentTurn: next.currentTurn });
    }
  );

  /* ── REVEAL CARD ── */
  socket.on(
    CLIENT_EVENTS.REVEAL_CARD,
    ({ roomId, clockFaceIndex, cardIndex }: { roomId: string; clockFaceIndex: ClockFaceIndex; cardIndex: number }) => {
      const state = roomManager.getRoom(roomId);
      if (!state) return;
      const { state: next, error } = revealCard(state, clockFaceIndex, cardIndex);
      if (error) {
        socket.emit(SERVER_EVENTS.ROOM_ERROR, { message: error });
        return;
      }
      roomManager.setRoom(roomId, next);
      io.to(roomId).emit(SERVER_EVENTS.CARD_REVEALED, next);
    }
  );

  /* ── TRIGGER RESOLUTION ── */
  socket.on(CLIENT_EVENTS.TRIGGER_RESOLUTION, ({ roomId }: { roomId: string }) => {
    const state = roomManager.getRoom(roomId);
    if (!state) return;
    const resolved = revealAllCards(state);
    const result = validateVictory(resolved);
    const finished = {
      ...resolved,
      phase: 'finished' as const,
      victory: result.isVictory,
      violationMessages: result.violations,
    };
    roomManager.setRoom(roomId, finished);
    io.to(roomId).emit(SERVER_EVENTS.GAME_RESOLVED, { state: finished, result });
  });

  /* ── RESTART GAME ── */
  socket.on(CLIENT_EVENTS.RESTART_GAME, ({ roomId }: { roomId: string }) => {
    const state = roomManager.getRoom(roomId);
    if (!state || state.phase !== 'finished') return;
    // Repasser en lobby, réinitialiser mains et isReady
    const reset = {
      ...state,
      phase: 'lobby' as const,
      players: state.players.map((p) => ({ ...p, hand: [], isReady: false })),
      clockFaces: [0, 1, 2, 3, 4, 5].map((i) => ({ index: i as ClockFaceIndex, cards: [] })),
      currentTurn: '',
      revealedCount: 0,
      victory: undefined,
      violationMessages: undefined,
    };
    roomManager.setRoom(roomId, reset);
    io.to(roomId).emit(SERVER_EVENTS.GAME_STATE_UPDATE, reset);
  });

  /* ── SET CUSTOM CONDITIONS ── */
  socket.on(CLIENT_EVENTS.SET_CUSTOM_CONDITIONS, ({
    roomId,
    assignments,
  }: {
    roomId: string;
    assignments: Array<{ faceIndex: ClockFaceIndex; conditionType: string; label?: string; params?: Record<string, unknown> }>;
  }) => {
    const state = roomManager.getRoom(roomId);
    if (!state || state.phase !== 'playing') return;
    if (state.creatorId !== socket.id) {
      socket.emit(SERVER_EVENTS.ROOM_ERROR, { message: 'Seul le créateur peut modifier les conditions.' });
      return;
    }
    const updatedFaces = state.clockFaces.map((face) => {
      const assignment = assignments.find((a) => a.faceIndex === face.index);
      if (!assignment) return { ...face, condition: undefined };
      const poolDef = CONDITION_POOL.find((d) => d.type === assignment.conditionType);
      if (poolDef) {
        return {
          ...face,
          condition: createConditionFromDefinition(
            { ...poolDef, ...(assignment.label ? { label: assignment.label } : {}), defaultParams: assignment.params ?? poolDef.defaultParams },
            face.index
          ),
        };
      }
      return {
        ...face,
        condition: {
          id: `custom-${Date.now()}-${face.index}`,
          type: assignment.conditionType as any,
          clockFaceIndex: face.index,
          label: assignment.label ?? assignment.conditionType,
          params: assignment.params,
        },
      };
    });
    const updated = { ...state, clockFaces: updatedFaces };
    roomManager.setRoom(roomId, updated);
    io.to(roomId).emit(SERVER_EVENTS.GAME_STATE_UPDATE, updated);
  });

  /* ── RANDOMIZE CONDITIONS ── */
  socket.on(CLIENT_EVENTS.RANDOMIZE_CONDITIONS, ({ roomId }: { roomId: string }) => {
    const state = roomManager.getRoom(roomId);
    if (!state || state.phase !== 'playing') return;
    if (state.creatorId !== socket.id) {
      socket.emit(SERVER_EVENTS.ROOM_ERROR, { message: 'Seul le créateur peut modifier les conditions.' });
      return;
    }
    const cleanFaces = state.clockFaces.map((f) => ({ ...f, condition: undefined, cards: [...f.cards] }));
    const updated = { ...state, clockFaces: assignRandomConditions(cleanFaces) };
    roomManager.setRoom(roomId, updated);
    io.to(roomId).emit(SERVER_EVENTS.GAME_STATE_UPDATE, updated);
  });

  /* ── DISCONNECT ── */
  socket.on('disconnect', () => {
    console.log(`[Socket] Déconnecté : ${socket.id}`);
    // Retirer le joueur de toutes les salles
    io.sockets.adapter.rooms.forEach((_sockets, roomId) => {
      const updated = roomManager.leaveRoom(roomId, socket.id);
      if (updated) {
        io.to(roomId).emit(SERVER_EVENTS.PLAYER_LEFT, { playerId: socket.id, state: updated });
      }
    });
  });
});

httpServer.listen(PORT, () => {
  console.log(`[Server] En écoute sur http://localhost:${PORT}`);
});

export { app, httpServer, io };

