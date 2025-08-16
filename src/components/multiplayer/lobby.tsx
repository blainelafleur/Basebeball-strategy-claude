'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RoleGuard } from '@/components/auth/role-guard';
import { useSocket } from '@/hooks/use-socket';
import {
  Users,
  Crown,
  Play,
  Copy,
  UserPlus,
  CheckCircle,
  Clock,
  Gamepad2,
  Trophy,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

export function MultiplayerLobby() {
  const {
    isConnected,
    currentRoom,
    players,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    markReady,
    startGame,
    clearError,
  } = useSocket();

  const [joinRoomId, setJoinRoomId] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomConfig, setRoomConfig] = useState({
    maxPlayers: 4,
    isPrivate: false,
  });

  const handleCreateRoom = () => {
    createRoom(roomConfig);
    setShowCreateRoom(false);
    toast.success('Room created successfully!');
  };

  const handleJoinRoom = () => {
    if (joinRoomId.trim()) {
      joinRoom(joinRoomId.trim().toUpperCase());
      setJoinRoomId('');
    }
  };

  const copyRoomId = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom.id);
      toast.success('Room ID copied to clipboard!');
    }
  };

  const handleReady = () => {
    markReady();
    toast.success('Marked as ready!');
  };

  const handleStartGame = () => {
    const readyPlayers = players.filter((p) => p.isReady || p.role === 'host');
    if (readyPlayers.length < 2) {
      toast.error('Need at least 2 ready players to start the game');
      return;
    }
    startGame();
  };

  const isHost =
    currentRoom &&
    players.find((p) => p.role === 'host')?.id === players.find((p) => p.role === 'host')?.id;
  const currentPlayer = players.find((p) => p.id === players.find((p) => p.role === 'host')?.id);
  const allPlayersReady =
    players.length >= 2 && players.every((p) => p.isReady || p.role === 'host');

  if (error) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <div className="text-red-500 mb-4">
            <Trophy className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
            <p>{error}</p>
          </div>
          <Button onClick={clearError}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <RoleGuard
      requiredRole={['PRO', 'TEAM', 'ADMIN']}
      fallback={
        <Card className="max-w-2xl mx-auto border-dashed border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-8 text-center">
            <Crown className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <h3 className="text-xl font-semibold mb-2">Multiplayer - Pro Feature</h3>
            <p className="text-gray-600 mb-6">
              Challenge friends and compete in real-time baseball strategy battles
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <h4 className="font-medium">Real-time Competition</h4>
                <p className="text-sm text-gray-500">Compete with up to 8 players</p>
              </div>
              <div className="text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <h4 className="font-medium">Live Scoring</h4>
                <p className="text-sm text-gray-500">See results as they happen</p>
              </div>
              <div className="text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <h4 className="font-medium">Leaderboards</h4>
                <p className="text-sm text-gray-500">Track your ranking</p>
              </div>
            </div>
            <Button className="bg-blue-500 hover:bg-blue-600">Upgrade to Pro</Button>
          </CardContent>
        </Card>
      }
      showUpgrade={false}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-center space-x-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>

        {!currentRoom ? (
          /* Lobby Home */
          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Room */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserPlus className="w-5 h-5" />
                  <span>Create Room</span>
                </CardTitle>
                <CardDescription>Start a new multiplayer game</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showCreateRoom ? (
                  <Button
                    onClick={() => setShowCreateRoom(true)}
                    className="w-full bg-green-500 hover:bg-green-600"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create New Room
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="maxPlayers">Max Players</Label>
                      <select
                        id="maxPlayers"
                        value={roomConfig.maxPlayers}
                        onChange={(e) =>
                          setRoomConfig((prev) => ({
                            ...prev,
                            maxPlayers: parseInt(e.target.value),
                          }))
                        }
                        className="w-full mt-1 p-2 border border-input bg-background rounded-md"
                      >
                        <option value={2}>2 Players</option>
                        <option value={4}>4 Players</option>
                        <option value={6}>6 Players</option>
                        <option value={8}>8 Players</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isPrivate"
                        checked={roomConfig.isPrivate}
                        onChange={(e) =>
                          setRoomConfig((prev) => ({ ...prev, isPrivate: e.target.checked }))
                        }
                      />
                      <Label htmlFor="isPrivate">Private Room</Label>
                    </div>

                    <div className="flex space-x-2">
                      <Button onClick={handleCreateRoom} className="flex-1">
                        Create Room
                      </Button>
                      <Button variant="outline" onClick={() => setShowCreateRoom(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Join Room */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gamepad2 className="w-5 h-5" />
                  <span>Join Room</span>
                </CardTitle>
                <CardDescription>Enter a room ID to join</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="roomId">Room ID</Label>
                  <Input
                    id="roomId"
                    placeholder="Enter 6-digit room ID"
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value)}
                    maxLength={6}
                    className="uppercase"
                  />
                </div>
                <Button
                  onClick={handleJoinRoom}
                  disabled={joinRoomId.length !== 6}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Join Room
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* In Room */
          <div className="space-y-6">
            {/* Room Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Room {currentRoom.id}</span>
                      {currentRoom.isPrivate && <Badge variant="secondary">Private</Badge>}
                    </CardTitle>
                    <CardDescription>
                      Host: {currentRoom.hostName} • {currentRoom.playerCount}/
                      {currentRoom.maxPlayers} players
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={copyRoomId}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy ID
                    </Button>
                    <Button variant="outline" size="sm" onClick={leaveRoom}>
                      Leave Room
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Players List */}
            <Card>
              <CardHeader>
                <CardTitle>Players</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {player.role === 'host' && <Crown className="w-4 h-4 text-yellow-500" />}
                          <span className="font-medium">{player.name}</span>
                        </div>
                        {player.role === 'host' && (
                          <Badge variant="secondary" className="text-xs">
                            Host
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {player.isReady ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Ready
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Clock className="w-3 h-3 mr-1" />
                            Waiting
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Game Controls */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">Ready to Play?</h3>
                    <p className="text-sm text-muted-foreground">
                      {allPlayersReady
                        ? 'All players ready! Host can start the game.'
                        : `Waiting for ${players.filter((p) => !p.isReady && p.role !== 'host').length} players to be ready.`}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {!currentPlayer?.isReady && currentPlayer?.role !== 'host' && (
                      <Button onClick={handleReady}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Ready Up
                      </Button>
                    )}
                    {isHost && (
                      <Button
                        onClick={handleStartGame}
                        disabled={!allPlayersReady}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Game
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
