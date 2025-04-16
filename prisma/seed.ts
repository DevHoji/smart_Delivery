const { PrismaClient } = require("./generated/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // ✅ Upsert users in advance to ensure they exist
  const [adminUser, agentUser, regularUser] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@smartdelivery.com" },
      update: {},
      create: {
        name: "Admin User",
        email: "admin@smartdelivery.com",
        password: await bcrypt.hash("Admin123!", 10),
        role: "ADMIN",
      },
    }),
    prisma.user.upsert({
      where: { email: "agent@smartdelivery.com" },
      update: {},
      create: {
        name: "Delivery Agent",
        email: "agent@smartdelivery.com",
        password: await bcrypt.hash("Agent123!", 10),
        role: "AGENT",
      },
    }),
    prisma.user.upsert({
      where: { email: "user@smartdelivery.com" },
      update: {},
      create: {
        name: "Regular User",
        email: "user@smartdelivery.com",
        password: await bcrypt.hash("User123!", 10),
        role: "USER",
      },
    }),
  ]);

  console.log("✅ Users seeded.");

  // ✅ Delete existing related data if needed (safe for dev/test env)
  await prisma.statusUpdate.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.location.deleteMany({});
  await prisma.delivery.deleteMany({});

  console.log("✅ Cleaned previous data (optional for dev).");

  // ✅ Create new delivery
  const sampleDelivery = await prisma.delivery.create({
    data: {
      trackingId: "TRK12345678",
      senderId: regularUser.id,
      agentId: agentUser.id,
      status: "IN_TRANSIT",
      origin: "123 Sender St, San Francisco, CA",
      destination: "456 Receiver Ave, San Francisco, CA",
      pickupAddress: "123 Sender St, San Francisco, CA",
      deliveryAddress: "456 Receiver Ave, San Francisco, CA",
      pickupLat: 37.7749,
      pickupLng: -122.4194,
      deliveryLat: 37.7833,
      deliveryLng: -122.4167,
      packageDescription: "Electronics - Fragile",
      weight: 2.5,
      dimensions: "30x20x15 cm",
      notes: "Please handle with care. Call before delivery.",
      estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h from now
      statusUpdates: {
        create: [
          {
            status: "PENDING",
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            notes: "Delivery request created",
          },
          {
            status: "ACCEPTED",
            timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
            notes: "Delivery accepted by agent",
          },
          {
            status: "IN_TRANSIT",
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
            notes: "Package picked up and on the way",
          },
        ],
      },
    },
  });

  console.log("✅ Sample delivery created.");

  // ✅ Add location updates
  await prisma.location.createMany({
    data: [
      {
        latitude: 37.7749,
        longitude: -122.4194,
        agentId: agentUser.id,
        deliveryId: sampleDelivery.id,
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      },
      {
        latitude: 37.7755,
        longitude: -122.418,
        agentId: agentUser.id,
        deliveryId: sampleDelivery.id,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
      {
        latitude: 37.779,
        longitude: -122.417,
        agentId: agentUser.id,
        deliveryId: sampleDelivery.id,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    ],
  });

  // ✅ Add messages
  await prisma.message.createMany({
    data: [
      {
        content: "Hello, I just accepted your delivery request.",
        senderId: agentUser.id,
        deliveryId: sampleDelivery.id,
        createdAt: new Date(Date.now() - 17 * 60 * 60 * 1000),
      },
      {
        content: "Great! When do you expect to pick up the package?",
        senderId: regularUser.id,
        deliveryId: sampleDelivery.id,
        createdAt: new Date(Date.now() - 16 * 60 * 60 * 1000),
      },
      {
        content: "I will be there in about 10 minutes!",
        senderId: agentUser.id,
        deliveryId: sampleDelivery.id,
        createdAt: new Date(Date.now() - 8.5 * 60 * 60 * 1000),
      },
      {
        content: "Package picked up. On my way to the delivery location.",
        senderId: agentUser.id,
        deliveryId: sampleDelivery.id,
        createdAt: new Date(Date.now() - 7.5 * 60 * 60 * 1000),
      },
    ],
  });

  console.log("✅ Messages and location updates created.");
  console.log("\n🚀 Database has been seeded with test data.");
  console.log(`🔐 Admin:    admin@smartdelivery.com / Admin123!`);
  console.log(`🚚 Agent:    agent@smartdelivery.com / Agent123!`);
  console.log(`👤 User:     user@smartdelivery.com / User123!`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
