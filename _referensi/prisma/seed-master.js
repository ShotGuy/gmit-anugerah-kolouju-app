const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting Master Data Seeding...");

    try {
        // 1. Seed Klasis (Wilayah)
        console.log("📍 Seeding Klasis & Rayon...");
        const existingKlasis = await prisma.klasis.findFirst();

        if (!existingKlasis) {
            await prisma.klasis.create({
                data: {
                    nama: "Klasis Kupang Tengah",
                    isActive: true,
                },
            });
        }

        const rayons = ["Rayon 1", "Rayon 2", "Rayon 3", "Rayon 4", "Rayon 5"];

        for (const r of rayons) {
            const existing = await prisma.rayon.findFirst({ where: { namaRayon: r } });
            if (!existing) {
                await prisma.rayon.create({
                    data: { namaRayon: r } // Removed deskripsi
                });
            }
        }

        // 2. Seed Master Data Jemaat
        console.log("📚 Seeding Reference Data...");

        // Helper to seed simple master tables
        const seedTable = async (model, items, field) => {
            for (const item of items) {
                const where = {};
                where[field] = item;
                const exists = await prisma[model].findFirst({ where });
                if (!exists) {
                    const data = {};
                    data[field] = item;
                    await prisma[model].create({ data });
                }
            }
        };

        // Suku (namaSuku)
        await seedTable("suku", ["Timor", "Rote", "Sabu", "Alor", "Flores", "Jawa", "Batak", "Lainnya"], "namaSuku");

        // Pendidikan (jenjang)
        await seedTable("pendidikan", ["SD", "SMP", "SMA/SMK", "D3", "S1", "S2", "S3", "Tidak Sekolah"], "jenjang");

        // Pekerjaan (namaPekerjaan)
        await seedTable("pekerjaan", ["PNS", "Swasta", "Wiraswasta", "Petani", "Nelayan", "Pelajar/Mahasiswa", "Ibu Rumah Tangga", "Tidak Bekerja"], "namaPekerjaan");

        // Status Keluarga (status)
        await seedTable("statusDalamKeluarga", ["Kepala Keluarga", "Istri", "Anak", "Famili Lain"], "status");

        // Status Rumah (status)
        await seedTable("statusKepemilikanRumah", ["Milik Sendiri", "Sewa/Kontrak"], "status");

        // Keadaan Rumah (keadaan)
        await seedTable("keadaanRumah", ["Permanen", "Semi Permanen"], "keadaan");

        // Jaminan Kesehatan (jenisJaminan)
        await seedTable("jaminanKesehatan", ["BPJS", "Asuransi Swasta", "Tidak Ada"], "jenisJaminan");

        // Pendapatan (Manual handling due to min/max)
        const pendapatanData = [
            { label: "< 1 Juta", min: 0, max: 1000000 },
            { label: "1 - 3 Juta", min: 1000000, max: 3000000 },
            { label: "3 - 5 Juta", min: 3000000, max: 5000000 },
            { label: "> 5 Juta", min: 5000000, max: 999999999 }
        ];

        for (const p of pendapatanData) {
            const exists = await prisma.pendapatan.findFirst({ where: { label: p.label } });
            if (!exists) {
                await prisma.pendapatan.create({ data: p });
            }
        }

        // 3. Seed Jenis Jabatan (namaJabatan)
        console.log("👔 Seeding Jenis Jabatan...");
        await seedTable("jenisJabatan", ["Pendeta", "Majelis", "Tata Usaha", "Koster"], "namaJabatan");

        // 4. Seed Admin User
        console.log("👤 Seeding Admin User...");
        const existingAdmin = await prisma.user.findUnique({ where: { email: "admin@gmit.com" } });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash("admin123", 10);
            await prisma.user.create({
                data: {
                    username: "admin",
                    email: "admin@gmit.com",
                    password: hashedPassword,
                    role: "ADMIN",
                    noWhatsapp: "081234567890",
                    isActive: true,
                }
            });
            console.log("Admin created: admin / admin123");
        } else {
            console.log("Admin already exists.");
        }

        console.log("🎉 Seeding Completed Successfully!");

    } catch (error) {
        console.error("❌ Seeding Failed:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
