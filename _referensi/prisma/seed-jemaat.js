const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// === NAME GENERATOR DATA (NTT FLAVOR) ===
const MARGA = [
    "Manafe", "Haning", "Benu", "Tallo", "Lomi", "Nuban", "Neno", "Liu", "Taolin",
    "Kase", "Talan", "Bani", "Mao", "Silla", "Sine", "Foeh", "Amalo", "Gela",
    "Da Costa", "De Fretes", "Pereira", "Gonsalves", "Fernandez"
];

const MALE_NAMES = [
    "Yohanes", "Petrus", "Paulus", "Markus", "Lukas", "Matius", "Simon", "Yakobus",
    "Andreas", "Filipus", "Bartolomeus", "Tomas", "Yudas", "Stefanus", "Daud",
    "Daniel", "Samuel", "Yoseph", "Melki", "Roni", "Jefri", "Deny", "Maxi"
];

const FEMALE_NAMES = [
    "Maria", "Marta", "Magdalena", "Elisabet", "Hana", "Debora", "Ribka", "Rut",
    "Ester", "Sara", "Lea", "Rahel", "Yuliana", "Damaris", "Lydia",
    "Ince", "Merry", "Nona", "Sherly", "Sinta", "Rina", "Tina", "Yanti"
];

// Helper to pick random item
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// Helper to generate username
const generateUsername = (name) => {
    const cleanName = name.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "");
    return `${cleanName}${randomInt(10, 999)}`;
};

async function main() {
    console.log("🌱 Starting Jemaat Seeding (NTT Style)...");

    try {
        // 1. Load Master Data IDs for References
        console.log("📚 Loading Master Data...");

        // Wilayah
        const rayons = await prisma.rayon.findMany();
        // Fetch Kelurahan that belongs to Kab Kupang/Kota Kupang. 
        // Since we seeded many, just take first 50 to randomize
        const kelurahans = await prisma.kelurahan.findMany({ take: 50 });
        const alamatSamples = await prisma.alamat.findMany({ take: 10 }); // Might be empty if fresh

        // Master
        // Master
        // Check/Seed StatusKeluarga (Status KK) if missing
        let stKeluarga = await prisma.statusKeluarga.findMany();
        if (stKeluarga.length === 0) {
            console.log("  ⚠️ Seeding missing StatusKeluarga...");
            const statuses = ["Keluarga Utuh", "Janda", "Duda", "Single Parent"];
            for (const s of statuses) {
                await prisma.statusKeluarga.create({ data: { status: s } });
            }
            stKeluarga = await prisma.statusKeluarga.findMany();
        }

        const stRumah = await prisma.statusKepemilikanRumah.findMany();
        const kdRumah = await prisma.keadaanRumah.findMany();

        // Jemaat Props
        const suku = await prisma.suku.findMany();
        const pend = await prisma.pendidikan.findMany();
        const peker = await prisma.pekerjaan.findMany();
        const penda = await prisma.pendapatan.findMany();
        const jamkes = await prisma.jaminanKesehatan.findMany();

        // Status Dalam Keluarga (The most important one)
        const sdkKepala = await prisma.statusDalamKeluarga.findFirst({ where: { status: "Kepala Keluarga" } });
        const sdkIstri = await prisma.statusDalamKeluarga.findFirst({ where: { status: "Istri" } });
        const sdkAnak = await prisma.statusDalamKeluarga.findFirst({ where: { status: "Anak" } });

        if (!sdkKepala || !sdkIstri || !sdkAnak) {
            throw new Error("Master Data 'StatusDalamKeluarga' is incomplete. Run seed-master first.");
        }

        const hashedPassword = await bcrypt.hash("password123", 10);

        const TOTAL_KK = 40;

        console.log(`🚀 Generating ${TOTAL_KK} Families...`);

        for (let i = 0; i < TOTAL_KK; i++) {
            // --- A. Create Keluarga ---
            const selectedKelurahan = pick(kelurahans);

            // Create new Alamat for this family
            const alamat = await prisma.alamat.create({
                data: {
                    idKelurahan: selectedKelurahan.id,
                    rt: randomInt(1, 10),
                    rw: randomInt(1, 5),
                    jalan: `Jl. ${pick(MARGA)} No. ${randomInt(1, 100)}`
                }
            });

            const familyMarga = pick(MARGA);
            const kartuKeluarga = `5301${randomInt(100000000000, 999999999999)}`; // Mock No KK

            const keluarga = await prisma.keluarga.create({
                data: {
                    idAlamat: alamat.id,
                    idStatusKeluarga: pick(stKeluarga).id || "dummy", // Fallback if empty, but should valid
                    idStatusKepemilikanRumah: pick(stRumah).id,
                    idKeadaanRumah: pick(kdRumah).id,
                    idRayon: pick(rayons).id || rayons[0].id,
                    noBagungan: randomInt(1, 50),
                    noKK: kartuKeluarga
                }
            });

            // --- B. Create Kepala Keluarga (Suami) ---
            const suamiName = `${pick(MALE_NAMES)} ${familyMarga}`;
            const suamiUsername = generateUsername(suamiName);

            const suami = await prisma.jemaat.create({
                data: {
                    idKeluarga: keluarga.id,
                    idStatusDalamKeluarga: sdkKepala.id,
                    idSuku: pick(suku).id,
                    idPendidikan: pick(pend).id,
                    idPekerjaan: pick(peker).id,
                    idPendapatan: pick(penda).id,
                    idJaminanKesehatan: pick(jamkes).id,
                    nama: suamiName,
                    jenisKelamin: true, // Laki-laki
                    tanggalLahir: randomDate(new Date(1960, 0, 1), new Date(1995, 0, 1)),
                    golonganDarah: pick(["A", "B", "AB", "O"]),
                    status: "AKTIF",
                }
            });

            // Create User for Suami
            await prisma.user.create({
                data: {
                    username: suamiUsername,
                    email: `${suamiUsername}@gmit.com`,
                    password: hashedPassword,
                    role: "JEMAAT",
                    idJemaat: suami.id,
                    isActive: true
                }
            });

            process.stdout.write("K"); // K for Kepala

            // --- C. Create Istri (80% chance) ---
            if (Math.random() > 0.2) {
                const istriMarga = pick(MARGA); // Maiden name
                const istriName = `${pick(FEMALE_NAMES)} ${istriMarga}`;
                const istriUsername = generateUsername(istriName);

                const istri = await prisma.jemaat.create({
                    data: {
                        idKeluarga: keluarga.id,
                        idStatusDalamKeluarga: sdkIstri.id,
                        idSuku: pick(suku).id,
                        idPendidikan: pick(pend).id,
                        idPekerjaan: pick(peker).id,
                        idPendapatan: pick(penda).id,
                        idJaminanKesehatan: pick(jamkes).id,
                        nama: istriName,
                        jenisKelamin: false, // P
                        tanggalLahir: randomDate(new Date(1965, 0, 1), new Date(2000, 0, 1)),
                        status: "AKTIF",
                    }
                });

                await prisma.user.create({
                    data: {
                        username: istriUsername,
                        email: `${istriUsername}@gmit.com`,
                        password: hashedPassword,
                        role: "JEMAAT",
                        idJemaat: istri.id,
                        isActive: true
                    }
                });
                process.stdout.write("I");
            }

            // --- D. Create Anak (0 - 4 kids) ---
            const numKids = randomInt(0, 4);
            for (let k = 0; k < numKids; k++) {
                const isBoy = Math.random() > 0.5;
                const kidName = `${isBoy ? pick(MALE_NAMES) : pick(FEMALE_NAMES)} ${familyMarga}`;
                const kidUsername = generateUsername(kidName);

                const anak = await prisma.jemaat.create({
                    data: {
                        idKeluarga: keluarga.id,
                        idStatusDalamKeluarga: sdkAnak.id,
                        idSuku: pick(suku).id,
                        idPendidikan: pick(pend).id, // Random school
                        idPekerjaan: pick(peker).id,
                        idPendapatan: pick(penda).id,
                        idJaminanKesehatan: pick(jamkes).id,
                        nama: kidName,
                        jenisKelamin: isBoy,
                        tanggalLahir: randomDate(new Date(2005, 0, 1), new Date(2023, 0, 1)),
                        status: "AKTIF",
                    }
                });

                await prisma.user.create({
                    data: {
                        username: kidUsername,
                        email: `${kidUsername}@gmit.com`,
                        password: hashedPassword,
                        role: "JEMAAT",
                        idJemaat: anak.id,
                        isActive: true
                    }
                });
                process.stdout.write("a");
            }
            process.stdout.write(" "); // Separator
        }

        console.log("\n\n🎉 Jemaat Seeding Completed!");

    } catch (error) {
        console.error("\n❌ Seeding Failed:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
