import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authConfig";
import prisma from "@/lib/prisma";
import QRCode from "qrcode";
import { DeliveryStatus } from "@prisma/client"; // Correct import path

// GET all deliveries (with role-based access)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get("status");
    const userId = session.user.id;
    const role = session.user.role;

    let query: any = {};

    if (role === "ADMIN") {
      if (statusParam) {
        query.where = {
          status: DeliveryStatus[statusParam as keyof typeof DeliveryStatus],
        };
      }
    } else if (role === "AGENT") {
      if (statusParam === "PENDING") {
        query.where = {
          status: DeliveryStatus.PENDING,
          agentId: null,
        };
      } else if (statusParam) {
        query.where = {
          status: DeliveryStatus[statusParam as keyof typeof DeliveryStatus],
          agentId: userId,
        };
      } else {
        query.where = {
          OR: [
            { agentId: userId },
            { status: DeliveryStatus.PENDING, agentId: null },
          ],
        };
      }
    } else {
      query.where = {
        senderId: userId,
      };

      if (statusParam) {
        query.where.status =
          DeliveryStatus[statusParam as keyof typeof DeliveryStatus];
      }
    }

    query.include = {
      sender: {
        select: { id: true, name: true, email: true, image: true },
      },
      agent: {
        select: { id: true, name: true, email: true, image: true },
      },
    };

    query.orderBy = {
      createdAt: "desc",
    };

    const deliveries = await prisma.delivery.findMany(query);
    return NextResponse.json(deliveries);
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create a new delivery
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Fix: find sender by email instead of ID
    const sender = await prisma.user.findUnique({
      where: { email: session.user.email }, // safer & works with your seed
    });

    if (!sender) {
      return NextResponse.json(
        { error: "Sender user not found" },
        { status: 404 }
      );
    }

    const data = await request.json();
    const { origin, destination, packageInfo, description, imageUrl } = data;

    if (!origin || !destination) {
      return NextResponse.json(
        { error: "Origin and destination are required" },
        { status: 400 }
      );
    }

    const deliveryData = {
      origin,
      destination,
      packageInfo: packageInfo || "",
      description: description || "",
      imageUrl,
      senderId: sender.id, // ✅ use actual user.id from the DB
      status: DeliveryStatus.PENDING,
    };

    const delivery = await prisma.delivery.create({ data: deliveryData });

    const qrCodeData = {
      deliveryId: delivery.id,
      origin: delivery.origin,
      destination: delivery.destination,
    };

    const qrCode = await QRCode.toDataURL(JSON.stringify(qrCodeData));

    const updatedDelivery = await prisma.delivery.update({
      where: { id: delivery.id },
      data: { qrCode },
      include: {
        sender: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return NextResponse.json(updatedDelivery);
  } catch (error) {
    console.error("Error creating delivery:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


// PATCH update a delivery
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { id, status, agentId } = data;

    if (!id) {
      return NextResponse.json(
        { error: "Delivery ID is required" },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { error: "Delivery not found" },
        { status: 404 }
      );
    }

    const userId = session.user.id;
    const role = session.user.role;

    let updateData: any = {};

    if (status) {
      const parsedStatus =
        DeliveryStatus[status as keyof typeof DeliveryStatus];

      if (role === "ADMIN") {
        updateData.status = parsedStatus;
      } else if (role === "AGENT" && delivery.agentId === userId) {
        if (parsedStatus !== DeliveryStatus.PENDING) {
          updateData.status = parsedStatus;
        } else {
          return NextResponse.json(
            { error: "Agents cannot set deliveries back to PENDING" },
            { status: 403 }
          );
        }
      } else if (role === "USER" && delivery.senderId === userId) {
        if (
          parsedStatus === DeliveryStatus.CANCELLED &&
          delivery.status === DeliveryStatus.PENDING
        ) {
          updateData.status = parsedStatus;
        } else {
          return NextResponse.json(
            { error: "Users can only cancel pending deliveries" },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    if (agentId !== undefined) {
      if (role === "ADMIN") {
        updateData.agentId = agentId;
      } else if (
        role === "AGENT" &&
        !delivery.agentId &&
        delivery.status === DeliveryStatus.PENDING &&
        agentId === userId
      ) {
        updateData.agentId = userId;
        updateData.status = DeliveryStatus.ACCEPTED;
      } else {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid updates provided" },
        { status: 400 }
      );
    }

    const updatedDelivery = await prisma.delivery.update({
      where: { id },
      data: updateData,
      include: {
        sender: {
          select: { id: true, name: true, email: true, image: true },
        },
        agent: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return NextResponse.json(updatedDelivery);
  } catch (error) {
    console.error("Error updating delivery:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
