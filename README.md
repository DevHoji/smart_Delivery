# Smart Delivery Tracker

A modern fullstack delivery tracking web application with real-time updates, role-based dashboards, QR code verification, push notifications, and live map integration.

## Features

- **Real-time Updates**: Track deliveries in real-time with location updates and chat.
- **Role-based Dashboards**: Separate interfaces for Users, Agents, and Admins.
- **QR Code Verification**: Secure delivery confirmation using QR codes.
- **Push Notifications**: Get alerts about delivery status changes.
- **Live Map Integration**: View delivery routes and current locations.
- **Authentication**: Secure login and registration with role-based access control.

## Tech Stack

### Frontend
- Next.js (App Router)
- Tailwind CSS
- TypeScript

### Backend
- Next.js API routes
- PostgreSQL (hosted on Neon.tech)
- Prisma ORM

### Authentication
- NextAuth.js with role-based access control

### Real-time Features
- Socket.io for WebSockets

### Maps & Location
- Google Maps API / Mapbox

### QR Code
- QR code generation and verification

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- PostgreSQL database (or a Neon.tech account)

### Environment Setup
1. Clone the repository
2. Create a `.env` file in the project root with the following:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/smart_delivery_db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google Maps or Mapbox
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-api-key"
# OR
NEXT_PUBLIC_MAPBOX_TOKEN="your-mapbox-token"

# Socket.io
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
```

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
/app                   # Next.js App Router
  /dashboard           # Dashboard pages
    /admin             # Admin dashboard
    /agent             # Agent dashboard
    /user              # User dashboard
  /api                 # API routes
    /auth              # Authentication endpoints
    /deliveries        # Delivery management endpoints
    /chat              # Chat functionality
    /notifications     # Notification services
/components            # Reusable UI components
/lib                   # Utility functions & services
/prisma                # Database schema and client
/public                # Static assets
```

## Deployment

This project can be easily deployed on Vercel:

```bash
npm run build
```

## License

MIT
