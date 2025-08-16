import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import {
  NextApiResponseServerIO,
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  createGameRoom,
  addPlayerToRoom,
  removePlayerFromRoom,
  getGameRoom,
  getGamePlayers,
  startMultiplayerGame,
} from '@/lib/socket';

const SocketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new ServerIO<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      // Handle room creation
      socket.on('room:create', async (config) => {
        try {
          const userData = socket.data;
          if (!userData?.userId || !userData?.userName) {
            socket.emit('error', 'Authentication required');
            return;
          }

          // Check if user has Pro access for multiplayer
          if (userData.userRole === 'FREE') {
            socket.emit(
              'error',
              'Multiplayer is a Pro feature. Please upgrade to access multiplayer games.'
            );
            return;
          }

          const room = await createGameRoom(userData.userId, userData.userName, config);
          socket.join(room.id);
          socket.data.roomId = room.id;

          socket.emit('room:created', room);
          console.log(`Room ${room.id} created by ${userData.userName}`);
        } catch (error) {
          console.error('Error creating room:', error);
          socket.emit('error', 'Failed to create room');
        }
      });

      // Handle joining a room
      socket.on('room:join', async (roomId) => {
        try {
          const userData = socket.data;
          if (!userData?.userId || !userData?.userName) {
            socket.emit('error', 'Authentication required');
            return;
          }

          // Check if user has Pro access
          if (userData.userRole === 'FREE') {
            socket.emit(
              'error',
              'Multiplayer is a Pro feature. Please upgrade to access multiplayer games.'
            );
            return;
          }

          const room = getGameRoom(roomId);
          if (!room) {
            socket.emit('error', 'Room not found');
            return;
          }

          const player = {
            id: userData.userId,
            name: userData.userName,
            role: 'player',
            isReady: false,
            score: 0,
          };

          const success = addPlayerToRoom(roomId, player);
          if (!success) {
            socket.emit('error', 'Cannot join room (full or game in progress)');
            return;
          }

          socket.join(roomId);
          socket.data.roomId = roomId;

          const players = getGamePlayers(roomId);
          const updatedRoom = getGameRoom(roomId);

          socket.emit('room:joined', updatedRoom!, players);
          socket.to(roomId).emit('room:updated', updatedRoom!);

          console.log(`${userData.userName} joined room ${roomId}`);
        } catch (error) {
          console.error('Error joining room:', error);
          socket.emit('error', 'Failed to join room');
        }
      });

      // Handle leaving a room
      socket.on('room:leave', () => {
        const roomId = socket.data.roomId;
        const userId = socket.data.userId;

        if (roomId && userId) {
          socket.leave(roomId);
          removePlayerFromRoom(roomId, userId);
          socket.to(roomId).emit('room:left', userId);

          const updatedRoom = getGameRoom(roomId);
          if (updatedRoom) {
            socket.to(roomId).emit('room:updated', updatedRoom);
          }

          socket.data.roomId = undefined;
          console.log(`${socket.data.userName} left room ${roomId}`);
        }
      });

      // Handle player ready state
      socket.on('player:ready', () => {
        const roomId = socket.data.roomId;
        const userId = socket.data.userId;

        if (roomId && userId) {
          socket.to(roomId).emit('player:ready', userId);
          console.log(`${socket.data.userName} is ready in room ${roomId}`);
        }
      });

      // Handle game start
      socket.on('game:start', async () => {
        try {
          const roomId = socket.data.roomId;
          const userId = socket.data.userId;

          if (!roomId || !userId) {
            socket.emit('error', 'Not in a room');
            return;
          }

          const room = getGameRoom(roomId);
          if (!room || room.hostId !== userId) {
            socket.emit('error', 'Only the host can start the game');
            return;
          }

          const gameState = await startMultiplayerGame(roomId);
          if (!gameState) {
            socket.emit('error', 'Cannot start game (not enough players or scenarios)');
            return;
          }

          // Emit game started to all players in room
          io.to(roomId).emit('game:started', gameState);

          // Start countdown
          let countdown = 3;
          const countdownInterval = setInterval(() => {
            io.to(roomId).emit('game:countdown', countdown);
            countdown--;

            if (countdown < 0) {
              clearInterval(countdownInterval);
              // Start first scenario
              io.to(roomId).emit('game:scenario', gameState.currentScenario, gameState.timeLimit);
            }
          }, 1000);

          console.log(`Game started in room ${roomId}`);
        } catch (error) {
          console.error('Error starting game:', error);
          socket.emit('error', 'Failed to start game');
        }
      });

      // Handle player answers
      socket.on('game:answer', (answer, responseTime) => {
        const roomId = socket.data.roomId;
        const userId = socket.data.userId;

        if (roomId && userId) {
          // Broadcast answer to all players in room
          io.to(roomId).emit('game:answer', userId, answer, responseTime);
          console.log(`${socket.data.userName} answered in room ${roomId}`);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        const roomId = socket.data.roomId;
        const userId = socket.data.userId;

        if (roomId && userId) {
          removePlayerFromRoom(roomId, userId);
          socket.to(roomId).emit('room:left', userId);

          const updatedRoom = getGameRoom(roomId);
          if (updatedRoom) {
            socket.to(roomId).emit('room:updated', updatedRoom);
          }
        }

        console.log('Client disconnected:', socket.id);
      });
    });
  }
  res.end();
};

export default SocketHandler;
