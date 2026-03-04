import React, { useState } from 'react';
import { useGameSync } from '../hooks/useGameSync';
import { useGameStore } from '../store/gameStore';

export function LobbyPage() {
  const [name, setName] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const [copied, setCopied] = useState(false);
  const { createRoom, joinRoom, setReady } = useGameSync();
  const { gameState, myPlayerId, roomId } = useGameStore();

  const handleCreate = () => {
    if (name.trim()) createRoom(name.trim());
  };

  const handleJoin = () => {
    if (name.trim() && roomInput.trim()) joinRoom(roomInput.trim(), name.trim());
  };

  const handleReady = () => {
    if (roomId) setReady(roomId);
  };

  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const myPlayer = gameState?.players.find((p) => p.id === myPlayerId);
  const isInRoom = !!gameState && gameState.phase === 'lobby';
  const playerCount = gameState?.players.length ?? 0;
  const allReadyWaiting = myPlayer?.isReady && playerCount < 4;
  const waitingForReady = myPlayer?.isReady && playerCount === 4;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
          🕐 Prend Ton Temps
        </h1>
        <p className="text-gray-400 mt-2">Jeu de cartes stratégique multijoueur</p>
      </div>

      {!isInRoom ? (
        <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm border border-gray-700 space-y-4">
          <input
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none focus:border-indigo-500 text-white placeholder-gray-500"
            placeholder="Votre pseudo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
          />

          {mode === null && (
            <div className="flex gap-3">
              <button
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition-colors"
                onClick={() => setMode('create')}
              >
                Créer une salle
              </button>
              <button
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
                onClick={() => setMode('join')}
              >
                Rejoindre
              </button>
            </div>
          )}

          {mode === 'create' && (
            <div className="space-y-3">
              <button
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition-colors disabled:opacity-50"
                onClick={handleCreate}
                disabled={!name.trim()}
              >
                Créer et rejoindre
              </button>
              <button className="w-full text-xs text-gray-500 hover:text-gray-300" onClick={() => setMode(null)}>
                ← Retour
              </button>
            </div>
          )}

          {mode === 'join' && (
            <div className="space-y-3">
              <input
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none focus:border-indigo-500 text-white placeholder-gray-500"
                placeholder="ID de la salle"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
              />
              <button
                className="w-full py-2 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-colors disabled:opacity-50"
                onClick={handleJoin}
                disabled={!name.trim() || !roomInput.trim()}
              >
                Rejoindre
              </button>
              <button className="w-full text-xs text-gray-500 hover:text-gray-300" onClick={() => setMode(null)}>
                ← Retour
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm border border-gray-700 space-y-4">
          <div className="text-center">
            <p className="text-gray-400 text-xs mb-1">ID de la salle</p>
            <button
              onClick={handleCopyRoomId}
              title="Cliquer pour copier"
              className="group flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <code className="text-indigo-400 font-mono text-sm break-all group-hover:text-indigo-300 transition-colors">
                {roomId}
              </code>
              <span className="text-gray-500 group-hover:text-indigo-300 transition-colors text-base">
                {copied ? '✅' : '📋'}
              </span>
            </button>
            {copied && <p className="text-green-400 text-xs mt-1">Copié !</p>}
          </div>

          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              Joueurs ({playerCount}/4)
            </p>
            {gameState.players.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <img
                  src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${p.avatarSeed}`}
                  alt={p.name}
                  className="w-8 h-8 rounded-full bg-gray-700"
                />
                <span className="flex-1 text-sm">{p.name}{p.id === myPlayerId && ' (vous)'}</span>
                {p.isReady && <span className="text-green-400 text-xs">✓ Prêt</span>}
              </div>
            ))}
          </div>

          {playerCount < 4 && (
            <p className="text-center text-yellow-400 text-xs">
              En attente de {4 - playerCount} joueur{4 - playerCount > 1 ? 's' : ''} supplémentaire{4 - playerCount > 1 ? 's' : ''}…
            </p>
          )}

          {!myPlayer?.isReady && (
            <button
              className="w-full py-2 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-colors"
              onClick={handleReady}
            >
              Je suis prêt !
            </button>
          )}
          {allReadyWaiting && (
            <p className="text-center text-green-400 text-sm">
              ✓ Vous êtes prêt — en attente des autres joueurs…
            </p>
          )}
          {waitingForReady && (
            <p className="text-center text-green-400 text-sm">
              ✓ Vous êtes prêt — en attente que tout le monde soit prêt…
            </p>
          )}
        </div>
      )}
    </div>
  );
}

