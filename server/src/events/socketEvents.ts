/** Événements émis par le CLIENT → SERVEUR */
export const CLIENT_EVENTS = {
  CREATE_ROOM: 'create_room',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
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

export const SERVER_EVENTS = {
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

export type ClientEvent = (typeof CLIENT_EVENTS)[keyof typeof CLIENT_EVENTS];
export type ServerEvent = (typeof SERVER_EVENTS)[keyof typeof SERVER_EVENTS];

