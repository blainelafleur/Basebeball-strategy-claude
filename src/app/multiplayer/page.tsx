'use client';

import { MultiplayerLobby } from '@/components/multiplayer/lobby';
import { GameHeader } from '@/components/game/header';

export default function MultiplayerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <GameHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Multiplayer Baseball Strategy</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Challenge friends and compete in real-time strategy battles. Test your baseball
            knowledge against players from around the world.
          </p>
        </div>
        <MultiplayerLobby />
      </div>
    </div>
  );
}
