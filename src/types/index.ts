// Authentication types
export type Role = 'USER' | 'AGENT' | 'ADMIN';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  image?: string;
}

// Delivery types
export type DeliveryStatus = 'PENDING' | 'ACCEPTED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';

export interface Delivery {
  id: string;
  trackingId?: string;
  senderId: string;
  agentId?: string;
  status: DeliveryStatus;
  origin: string;
  destination: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  pickupLat?: number;
  pickupLng?: number;
  deliveryLat?: number;
  deliveryLng?: number;
  packageInfo?: string;
  packageDescription?: string;
  weight?: number;
  dimensions?: string;
  imageUrl?: string;
  description?: string;
  notes?: string;
  estimatedDelivery?: Date;
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;
  sender?: User;
  agent?: User;
  messages?: Message[];
  locations?: Location[];
  statusUpdates?: StatusUpdate[];
}

// Status update type
export interface StatusUpdate {
  status: DeliveryStatus;
  timestamp: Date;
  notes?: string;
}

// User type
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Message type
export interface Message {
  id: string;
  content: string;
  senderId: string;
  deliveryId: string;
  createdAt: Date;
  sender?: User;
}

// Location type
export interface Location {
  id: string;
  latitude: number;
  longitude: number;
  agentId: string;
  deliveryId: string;
  timestamp: Date;
}

// Socket.io event types
export interface LocationUpdateEvent {
  deliveryId: string;
  latitude: number;
  longitude: number;
  agentId: string;
}

export interface MessageEvent {
  deliveryId: string;
  content: string;
  senderId: string;
}

export interface StatusUpdateEvent {
  deliveryId: string;
  status: DeliveryStatus;
}
