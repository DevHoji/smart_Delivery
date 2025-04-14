import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authConfig';
import prisma from '@/lib/prisma';
import QRCode from 'qrcode';

// GET all deliveries (with role-based access)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const userId = session.user.id;
    const role = session.user.role;
    
    // Build the query based on user role
    let query: any = {};
    
    if (role === 'ADMIN') {
      // Admins can see all deliveries, optionally filtered by status
      if (status) {
        query.where = { status };
      }
    } else if (role === 'AGENT') {
      // Agents see deliveries assigned to them or available ones
      if (status === 'PENDING') {
        // Available deliveries (not assigned to an agent)
        query.where = {
          status: 'PENDING',
          agentId: null,
        };
      } else if (status) {
        // Filtered by status for this agent
        query.where = {
          status,
          agentId: userId,
        };
      } else {
        // All deliveries for this agent
        query.where = {
          OR: [
            { agentId: userId },
            { status: 'PENDING', agentId: null }, // Also show available deliveries
          ],
        };
      }
    } else {
      // Regular users see only their deliveries
      query.where = {
        senderId: userId,
      };
      
      if (status) {
        query.where.status = status;
      }
    }
    
    // Include related user data but exclude sensitive information
    query.include = {
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
    };
    
    // Order by most recent first
    query.orderBy = {
      createdAt: 'desc',
    };
    
    const deliveries = await prisma.delivery.findMany(query);
    
    return NextResponse.json(deliveries);
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create a new delivery
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await request.json();
    const { origin, destination, packageInfo, description, imageUrl } = data;
    
    // Validate required fields
    if (!origin || !destination) {
      return NextResponse.json({ error: 'Origin and destination are required' }, { status: 400 });
    }
    
    // Create delivery with QR code
    const deliveryData = {
      origin,
      destination,
      packageInfo: packageInfo || '',
      description: description || '',
      imageUrl,
      senderId: session.user.id,
      status: 'PENDING',
    };
    
    const delivery = await prisma.delivery.create({
      data: deliveryData,
    });
    
    // Generate QR code
    const qrCodeData = {
      deliveryId: delivery.id,
      origin: delivery.origin,
      destination: delivery.destination,
    };
    
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrCodeData));
    
    // Update delivery with QR code
    const updatedDelivery = await prisma.delivery.update({
      where: { id: delivery.id },
      data: {
        qrCode,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
    
    return NextResponse.json(updatedDelivery);
  } catch (error) {
    console.error('Error creating delivery:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH update a delivery
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await request.json();
    const { id, status, agentId } = data;
    
    if (!id) {
      return NextResponse.json({ error: 'Delivery ID is required' }, { status: 400 });
    }
    
    // Fetch the delivery to check permissions
    const delivery = await prisma.delivery.findUnique({
      where: { id },
      select: {
        id: true,
        senderId: true,
        agentId: true,
        status: true,
      },
    });
    
    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }
    
    const userId = session.user.id;
    const role = session.user.role;
    
    // Build update data based on permissions
    let updateData: any = {};
    
    // Status updates
    if (status) {
      // Check permissions for status updates
      if (role === 'ADMIN') {
        // Admins can change any status
        updateData.status = status;
      } else if (role === 'AGENT' && delivery.agentId === userId) {
        // Agents can update status of their assigned deliveries
        // But cannot set back to PENDING
        if (status !== 'PENDING') {
          updateData.status = status;
        } else {
          return NextResponse.json({ error: 'Agents cannot set deliveries back to PENDING' }, { status: 403 });
        }
      } else if (role === 'USER' && delivery.senderId === userId) {
        // Users can only cancel their own deliveries
        if (status === 'CANCELLED' && delivery.status === 'PENDING') {
          updateData.status = 'CANCELLED';
        } else {
          return NextResponse.json({ error: 'Users can only cancel pending deliveries' }, { status: 403 });
        }
      } else {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    
    // Agent assignment
    if (agentId !== undefined) {
      if (role === 'ADMIN') {
        // Admins can assign any agent
        updateData.agentId = agentId;
      } else if (role === 'AGENT' && !delivery.agentId && delivery.status === 'PENDING' && agentId === userId) {
        // Agents can self-assign available deliveries
        updateData.agentId = userId;
        updateData.status = 'ACCEPTED';
      } else {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    
    // If no valid updates, return error
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }
    
    // Update the delivery
    const updatedDelivery = await prisma.delivery.update({
      where: { id },
      data: updateData,
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
      },
    });
    
    return NextResponse.json(updatedDelivery);
  } catch (error) {
    console.error('Error updating delivery:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
