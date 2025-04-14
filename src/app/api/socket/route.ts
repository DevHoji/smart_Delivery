import { createServer } from 'http';
import { NextRequest } from 'next/server';
import { Server } from 'socket.io';

// Set up a global variable to keep track of the Socket.io instance
let io: Server | null = null;

export async function GET(req: NextRequest) {
  // If we haven't created a server yet, create one
  if (!io) {
    // Create an HTTP server
    const httpServer = createServer();

    // Create a new Socket.io server with CORS settings
    io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    // Socket.io event handlers
    io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id);

      // Join delivery room
      socket.on('join-delivery', (deliveryId: string) => {
        console.log(`Socket ${socket.id} joined delivery room: ${deliveryId}`);
        socket.join(deliveryId);
      });

      // Leave delivery room
      socket.on('leave-delivery', (deliveryId: string) => {
        console.log(`Socket ${socket.id} left delivery room: ${deliveryId}`);
        socket.leave(deliveryId);
      });

      // Handle location updates
      socket.on('location-update', (data) => {
        io?.to(data.deliveryId).emit('location-update', data);
      });

      // Handle messaging
      socket.on('message', (data) => {
        io?.to(data.deliveryId).emit('message', data);
      });

      // Handle delivery status updates
      socket.on('status-update', (data) => {
        io?.to(data.deliveryId).emit('status-update', data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
      });
    });

    // Start the HTTP server
    httpServer.listen(process.env.SOCKET_PORT || 3001);
  }

  return new Response('Socket.io server is running', {
    status: 200,
  });
}
