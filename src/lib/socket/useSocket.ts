import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { LocationUpdateEvent, MessageEvent, StatusUpdateEvent } from '@/types';

type SocketCallbacks = {
  onLocationUpdate?: (data: LocationUpdateEvent) => void;
  onMessageReceived?: (data: MessageEvent) => void;
  onStatusUpdate?: (data: StatusUpdateEvent) => void;
};

export const useSocket = (
  deliveryId?: string,
  callbacks?: SocketCallbacks
) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Create socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || `${window.location.origin}:3001`, {
      path: '/api/socket',
      autoConnect: true,
    });

    // Set up event handlers
    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      
      // Join the delivery room if deliveryId is provided
      if (deliveryId) {
        socketInstance.emit('join-delivery', deliveryId);
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Set up custom event handlers if provided
    if (callbacks) {
      if (callbacks.onLocationUpdate) {
        socketInstance.on('location-update', callbacks.onLocationUpdate);
      }
      
      if (callbacks.onMessageReceived) {
        socketInstance.on('message', callbacks.onMessageReceived);
      }
      
      if (callbacks.onStatusUpdate) {
        socketInstance.on('status-update', callbacks.onStatusUpdate);
      }
    }

    setSocket(socketInstance);

    // Clean up on unmount
    return () => {
      if (deliveryId) {
        socketInstance.emit('leave-delivery', deliveryId);
      }
      socketInstance.disconnect();
    };
  }, [deliveryId, callbacks]);

  // Function to send a location update
  const sendLocationUpdate = (data: LocationUpdateEvent) => {
    if (socket && isConnected) {
      socket.emit('location-update', data);
    }
  };

  // Function to send a message
  const sendMessage = (data: MessageEvent) => {
    if (socket && isConnected) {
      socket.emit('message', data);
    }
  };

  // Function to update delivery status
  const updateDeliveryStatus = (data: StatusUpdateEvent) => {
    if (socket && isConnected) {
      socket.emit('status-update', data);
    }
  };

  return {
    socket,
    isConnected,
    sendLocationUpdate,
    sendMessage,
    updateDeliveryStatus,
  };
};
