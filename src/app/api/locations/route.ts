import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authConfig';
import prisma from '@/lib/prisma';

// GET locations for a specific delivery
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const deliveryId = searchParams.get('deliveryId');
    
    if (!deliveryId) {
      return NextResponse.json({ error: 'Delivery ID is required' }, { status: 400 });
    }
    
    // Fetch the delivery to check permissions
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      select: {
        id: true,
        senderId: true,
        agentId: true,
      },
    });
    
    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }
    
    // Check if user is authorized to view locations for this delivery
    const userId = session.user.id;
    const role = session.user.role;
    
    if (
      role !== 'ADMIN' &&
      userId !== delivery.senderId &&
      userId !== delivery.agentId
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Fetch locations for the delivery, latest first
    const locations = await prisma.location.findMany({
      where: { deliveryId },
      orderBy: { timestamp: 'desc' },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    
    return NextResponse.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create a new location update
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { deliveryId, latitude, longitude } = await request.json();
    
    if (!deliveryId || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'DeliveryId, latitude, and longitude are required' }, { status: 400 });
    }
    
    // Fetch the delivery to check permissions
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      select: {
        id: true,
        agentId: true,
      },
    });
    
    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }
    
    // Only the assigned agent can update location
    const userId = session.user.id;
    
    if (delivery.agentId !== userId && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only the assigned agent can update location' }, { status: 403 });
    }
    
    // Create the location record
    const location = await prisma.location.create({
      data: {
        deliveryId,
        agentId: userId,
        latitude: parseFloat(latitude.toString()),
        longitude: parseFloat(longitude.toString()),
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    
    return NextResponse.json(location);
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
