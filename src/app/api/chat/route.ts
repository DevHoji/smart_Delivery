import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authConfig';
import prisma from '@/lib/prisma';

// GET messages for a delivery
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
      }
    });
    
    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }
    
    // Check if user is authorized to view these messages
    const userId = session.user.id;
    if (
      userId !== delivery.senderId && 
      userId !== delivery.agentId && 
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Fetch messages for the delivery
    const messages = await prisma.message.findMany({
      where: { deliveryId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create a new message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { content, deliveryId } = await request.json();
    
    if (!content || !deliveryId) {
      return NextResponse.json({ error: 'Content and deliveryId are required' }, { status: 400 });
    }
    
    // Fetch the delivery to check permissions
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      select: {
        id: true,
        senderId: true,
        agentId: true,
      }
    });
    
    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }
    
    // Check if user is authorized to create messages for this delivery
    const userId = session.user.id;
    if (
      userId !== delivery.senderId && 
      userId !== delivery.agentId && 
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        deliveryId,
        senderId: userId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    
    return NextResponse.json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
