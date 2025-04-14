import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authConfig';
import prisma from '@/lib/prisma';

// GET a specific delivery by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const deliveryId = params.id;
    
    // Fetch the delivery with related data
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        // Get the latest location for this delivery
        locations: {
          orderBy: {
            timestamp: 'desc',
          },
          take: 1,
        },
      },
    });
    
    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }
    
    // Check if user is authorized to view this delivery
    const userId = session.user.id;
    const role = session.user.role;
    
    if (
      role !== 'ADMIN' &&
      userId !== delivery.senderId &&
      userId !== delivery.agentId
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return NextResponse.json(delivery);
  } catch (error) {
    console.error('Error fetching delivery:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE a delivery
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const deliveryId = params.id;
    
    // Fetch the delivery to check permissions
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      select: {
        id: true,
        senderId: true,
        status: true,
      },
    });
    
    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }
    
    // Check if user is authorized to delete this delivery
    const userId = session.user.id;
    const role = session.user.role;
    
    // Only admins and the sender of a PENDING delivery can delete it
    if (
      role !== 'ADMIN' &&
      (userId !== delivery.senderId || delivery.status !== 'PENDING')
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Delete related entities first
    await prisma.message.deleteMany({
      where: { deliveryId },
    });
    
    await prisma.location.deleteMany({
      where: { deliveryId },
    });
    
    // Delete the delivery
    await prisma.delivery.delete({
      where: { id: deliveryId },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting delivery:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
