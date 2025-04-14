import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { LocationUpdateEvent, MessageEvent, StatusUpdateEvent } from '@/types';

export const config = {
  api: {
    bodyParser: false,
  },
};

export const initSocket = (req: NextApiRequest, res: any, server: NetServer) => {
  if (!res.socket.server.io) {
    const io = new ServerIO(res.socket.server as any, {
      path: '/api/socket',
      addTrailingSlash: false,
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
      socket.on('location-update', (data: LocationUpdateEvent) => {
        io.to(data.deliveryId).emit('location-update', data);
      });

      // Handle messaging
      socket.on('message', (data: MessageEvent) => {
        io.to(data.deliveryId).emit('message', data);
      });

      // Handle delivery status updates
      socket.on('status-update', (data: StatusUpdateEvent) => {
        io.to(data.deliveryId).emit('status-update', data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
      });
    });

    res.socket.server.io = io;
  }
};

// Client-side socket hook will be created separately
