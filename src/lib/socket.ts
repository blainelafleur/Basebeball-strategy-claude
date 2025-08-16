import { Server as NetServer } from 'http';
import { NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import { prisma } from './prisma';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

// Game room types
export interface GameRoom {
  id: string;
  hostId: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  isPrivate: boolean;
  status: 'waiting' | 'playing' | 'finished';
  currentScenario?: unknown;
  createdAt: Date;
}

export interface Player {
  id: string;
  name: string;
  role: string;
  isReady: boolean;
  score: number;
  currentAnswer?: string;
  responseTime?: number;
}

export interface GameState {
  roomId: string;
  players: Player[];
  currentScenario: unknown;
  currentRound: number;
  totalRounds: number;
  timeLimit: number;
  answers: Record<string, string>;
  scores: Record<string, number>;
  status: 'waiting' | 'countdown' | 'playing' | 'reviewing' | 'finished';
}

// Socket event types
export interface ServerToClientEvents {
  'room:created': (room: GameRoom) => void;
  'room:joined': (room: GameRoom, players: Player[]) => void;
  'room:left': (playerId: string) => void;
  'room:updated': (room: GameRoom) => void;
  'game:started': (gameState: GameState) => void;
  'game:scenario': (scenario: unknown, timeLimit: number) => void;
  'game:countdown': (seconds: number) => void;
  'game:answer': (playerId: string, answer: string, responseTime: number) => void;
  'game:results': (results: unknown) => void;
  'game:finished': (finalResults: unknown) => void;
  'player:ready': (playerId: string) => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  'room:create': (config: { maxPlayers: number; isPrivate: boolean }) => void;
  'room:join': (roomId: string) => void;
  'room:leave': () => void;
  'player:ready': () => void;
  'game:start': () => void;
  'game:answer': (answer: string, responseTime: number) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  userName: string;
  userRole: string;
  roomId?: string;
}

// In-memory storage for game rooms (in production, use Redis)
export const gameRooms = new Map<string, GameRoom>();
export const gameStates = new Map<string, GameState>();
export const roomPlayers = new Map<string, Map<string, Player>>();

export function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createGameRoom(
  hostId: string,
  hostName: string,
  config: { maxPlayers: number; isPrivate: boolean }
): Promise<GameRoom> {
  const roomId = generateRoomId();

  const room: GameRoom = {
    id: roomId,
    hostId,
    hostName,
    playerCount: 1,
    maxPlayers: config.maxPlayers,
    isPrivate: config.isPrivate,
    status: 'waiting',
    createdAt: new Date(),
  };

  // Initialize host as first player
  const hostPlayer: Player = {
    id: hostId,
    name: hostName,
    role: 'host',
    isReady: false,
    score: 0,
  };

  gameRooms.set(roomId, room);
  roomPlayers.set(roomId, new Map([[hostId, hostPlayer]]));

  // Log to database for analytics
  try {
    await prisma.challenge.create({
      data: {
        senderId: hostId,
        receiverId: hostId, // Temporary, will be updated when players join
        scenarioIds: JSON.stringify([]), // Will be populated when game starts
        status: 'pending',
      },
    });
  } catch (error) {
    console.warn('Failed to log game room creation:', error);
  }

  return room;
}

export function getGameRoom(roomId: string): GameRoom | null {
  return gameRooms.get(roomId) || null;
}

export function getGamePlayers(roomId: string): Player[] {
  const players = roomPlayers.get(roomId);
  return players ? Array.from(players.values()) : [];
}

export function addPlayerToRoom(roomId: string, player: Player): boolean {
  const room = gameRooms.get(roomId);
  if (!room || room.playerCount >= room.maxPlayers || room.status !== 'waiting') {
    return false;
  }

  const players = roomPlayers.get(roomId) || new Map();
  players.set(player.id, player);
  roomPlayers.set(roomId, players);

  room.playerCount = players.size;
  gameRooms.set(roomId, room);

  return true;
}

export function removePlayerFromRoom(roomId: string, playerId: string): boolean {
  const players = roomPlayers.get(roomId);
  if (!players || !players.has(playerId)) {
    return false;
  }

  players.delete(playerId);

  if (players.size === 0) {
    // Room is empty, clean up
    gameRooms.delete(roomId);
    roomPlayers.delete(roomId);
    gameStates.delete(roomId);
  } else {
    // Update player count
    const room = gameRooms.get(roomId);
    if (room) {
      room.playerCount = players.size;

      // If host left, assign new host
      if (room.hostId === playerId) {
        const newHost = Array.from(players.values())[0];
        room.hostId = newHost.id;
        room.hostName = newHost.name;
        newHost.role = 'host';
      }

      gameRooms.set(roomId, room);
    }
    roomPlayers.set(roomId, players);
  }

  return true;
}

export async function startMultiplayerGame(roomId: string): Promise<GameState | null> {
  const room = gameRooms.get(roomId);
  const players = getGamePlayers(roomId);

  if (!room || players.length < 2 || room.status !== 'waiting') {
    return null;
  }

  // Get random scenarios for the game
  const scenarios = await prisma.scenario.findMany({
    where: { isPublic: true },
    take: 5, // 5 rounds per game
    orderBy: { timesPlayed: 'asc' }, // Prefer less played scenarios
  });

  if (scenarios.length === 0) {
    return null;
  }

  const gameState: GameState = {
    roomId,
    players: players.map((p) => ({ ...p, score: 0 })),
    currentScenario: scenarios[0],
    currentRound: 1,
    totalRounds: scenarios.length,
    timeLimit: 30, // 30 seconds per question
    answers: {},
    scores: {},
    status: 'countdown',
  };

  room.status = 'playing';
  gameRooms.set(roomId, room);
  gameStates.set(roomId, gameState);

  return gameState;
}
