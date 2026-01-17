
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("--- DEBUG FINANCE DATA ---");

    // Check Periods
    const periods = await prisma.periodeAnggaran.findMany({});
    console.log(`Total Periods: ${periods.length}`);
    periods.forEach(p => {
        console.log(`- [${p.id}] ${p.nama} (${p.tahun}) | Status: ${p.status} | Active: ${p.isActive}`);
    });

    // Check Categories
    const categories = await prisma.kategoriKeuangan.findMany({});
    console.log(`\nTotal Categories: ${categories.length}`);
    categories.forEach(c => {
        console.log(`- [${c.id}] ${c.nama} (${c.kode}) | Active: ${c.isActive}`);
    });

    // Check Items
    const items = await prisma.itemKeuangan.findMany({ take: 5 });
    console.log(`\nTotal Items (Sample 5):`);
    items.forEach(i => {
        console.log(`- [${i.id}] ${i.kode} - ${i.nama} | Level: ${i.level} | Active: ${i.isActive} | Children: ?`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
