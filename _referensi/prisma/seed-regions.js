const { PrismaClient } = require("@prisma/client");
const https = require("https");

const prisma = new PrismaClient();

// Helper to fetch JSON from URL
function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    console.error("Failed to parse JSON from", url, data);
                    resolve([]); // Return empty on error
                }
            });
        }).on("error", reject);
    });
}

async function main() {
    console.log("🌱 Starting Region Seeding (Kupang Area)...");

    try {
        // 1. Ensure Provinsi Exist (NTT = 53)
        console.log("📍 Verifying Provinsi...");
        let provinsi = await prisma.provinsi.findFirst({ where: { nama: "Nusa Tenggara Timur" } });
        if (!provinsi) {
            provinsi = await prisma.provinsi.create({
                data: {
                    nama: "Nusa Tenggara Timur",
                    isActive: true
                }
            });
            console.log("  ✅ Created Provinsi NTT");
        }

        // 2. Define Targets: Kab. Kupang (5301) & Kota Kupang (5371)
        const targets = [
            { id: "5301", nama: "Kabupaten Kupang" },
            { id: "5371", nama: "Kota Kupang" }
        ];

        for (const target of targets) {
            // Create/Check Kota/Kab
            console.log(`📍 Verifying ${target.nama}...`);
            let kotaKab = await prisma.kotaKab.findFirst({ where: { nama: target.nama } });
            if (!kotaKab) {
                kotaKab = await prisma.kotaKab.create({
                    data: {
                        idProvinsi: provinsi.id,
                        nama: target.nama,
                        isActive: true
                    }
                });
                console.log(`  ✅ Created ${target.nama}`);
            }

            // Fetch Kecamatan
            const KEC_URL = `https://ibnux.github.io/data-indonesia/kecamatan/${target.id}.json`;
            console.log(`📡 Fetching Kecamatan from ${target.nama}...`);
            const kecamatanList = await fetchJson(KEC_URL);
            console.log(`   > Found ${kecamatanList.length} Kecamatan.`);

            for (const kec of kecamatanList) {
                // Create/Check Kecamatan
                let kecamatanRecord = await prisma.kecamatan.findFirst({ where: { nama: kec.nama, idKotaKab: kotaKab.id } });
                if (!kecamatanRecord) {
                    kecamatanRecord = await prisma.kecamatan.create({
                        data: {
                            idKotaKab: kotaKab.id,
                            nama: kec.nama,
                            isActive: true
                        }
                    });
                    process.stdout.write(".");
                }

                // Fetch Kelurahan
                const KEL_URL = `https://ibnux.github.io/data-indonesia/kelurahan/${kec.id}.json`;
                const kelurahanList = await fetchJson(KEL_URL);

                for (const kel of kelurahanList) {
                    // Generate Mock Code (85xxx)
                    const suffix = kel.id.slice(-3);
                    const mockKodePos = `85${suffix}`;

                    const existingKel = await prisma.kelurahan.findFirst({ where: { nama: kel.nama, idKecamatan: kecamatanRecord.id } });
                    if (!existingKel) {
                        await prisma.kelurahan.create({
                            data: {
                                idKecamatan: kecamatanRecord.id,
                                nama: kel.nama,
                                kodePos: mockKodePos,
                                isActive: true
                            }
                        });
                    }
                }
            }
            console.log(`\n  ✅ Finished processing ${target.nama}`);
        }

        console.log("\n🎉 Region Seeding Completed Successfully!");

    } catch (error) {
        console.error("\n❌ Seeding Failed:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
