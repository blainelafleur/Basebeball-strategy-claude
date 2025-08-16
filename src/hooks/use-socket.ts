import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  GameRoom,
  Player,
  GameState,
} from '@/lib/socket';

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function useSocket() {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initSocket = async () => {
      if (!session?.user) return;

      await fetch('/api/socket');

      socket = io({
        path: '/api/socket',
      });

      // Set user data for socket
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = session.user as any;
      socket.auth = {
        userId: user.id,
        userName: user.name || user.email,
        userRole: user.role || 'FREE',
      };

      // Store user data in socket
      if (socket.connected) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (socket as any).data = {
          userId: user.id,
          userName: user.name || user.email,
          userRole: user.role || 'FREE',
        };
      }

      socket.on('connect', () => {
        setIsConnected(true);
        setError(null);
        console.log('Connected to socket server');
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from socket server');
      });

      socket.on('error', (message) => {
        setError(message);
        console.error('Socket error:', message);
      });

      // Room events
      socket.on('room:created', (room) => {
        setCurrentRoom(room);
        setPlayers([
          {
            id: user.id,
            name: user.name || user.email,
            role: 'host',
            isReady: false,
            score: 0,
          },
        ]);
      });

      socket.on('room:joined', (room, roomPlayers) => {
        setCurrentRoom(room);
        setPlayers(roomPlayers);
      });

      socket.on('room:left', (playerId) => {
        setPlayers((prev) => prev.filter((p) => p.id !== playerId));
      });

      socket.on('room:updated', (room) => {
        setCurrentRoom(room);
      });

      // Game events
      socket.on('game:started', (newGameState) => {
        setGameState(newGameState);
      });

      socket.on('game:countdown', (seconds) => {
        console.log('Countdown:', seconds);
      });

      socket.on('game:scenario', (scenario, timeLimit) => {
        console.log('New scenario:', scenario, 'Time limit:', timeLimit);
      });

      socket.on('game:answer', (playerId, answer, responseTime) => {
        console.log('Player answered:', playerId, answer, responseTime);
      });

      socket.on('player:ready', (playerId) => {
        setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, isReady: true } : p)));
      });
    };

    if (session?.user && !socket) {
      initSocket();
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [session]);

  const createRoom = (config: { maxPlayers: number; isPrivate: boolean }) => {
    if (socket) {
      socket.emit('room:create', config);
    }
  };

  const joinRoom = (roomId: string) => {
    if (socket) {
      socket.emit('room:join', roomId);
    }
  };

  const leaveRoom = () => {
    if (socket) {
      socket.emit('room:leave');
      setCurrentRoom(null);
      setPlayers([]);
      setGameState(null);
    }
  };

  const markReady = () => {
    if (socket) {
      socket.emit('player:ready');
    }
  };

  const startGame = () => {
    if (socket) {
      socket.emit('game:start');
    }
  };

  const submitAnswer = (answer: string, responseTime: number) => {
    if (socket) {
      socket.emit('game:answer', answer, responseTime);
    }
  };

  return {
    isConnected,
    currentRoom,
    players,
    gameState,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    markReady,
    startGame,
    submitAnswer,
    clearError: () => setError(null),
  };
}
