const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
    console.log("🔑 Resetting Admin Account...");

    try {
        const hashedPassword = await bcrypt.hash("admin123", 10);

        // Force Upsert (Create if new, Update password if exists)
        const admin = await prisma.user.upsert({
            where: { email: "admin@gmit.com" },
            update: {
                password: hashedPassword,
                isActive: true, // Ensure active
                role: "ADMIN"
            },
            create: {
                username: "admin",
                email: "admin@gmit.com",
                password: hashedPassword,
                role: "ADMIN",
                noWhatsapp: "081234567890",
                isActive: true,
            }
        });

        console.log(`✅ Admin Account Ready!`);
        console.log(`   Username: ${admin.username}`);
        console.log(`   Email:    ${admin.email}`);
        console.log(`   Password: admin123`);

    } catch (error) {
        console.error("❌ Failed to reset admin:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
