import { Prisma } from "@prisma/client";
import { AppError } from "@/lib/errors";

export async function generateKeluargaId(
    tx: Prisma.TransactionClient,
    idRayon: string
): Promise<string> {
    // 1. Fetch Rayon to get name
    const rayon = await tx.rayon.findUnique({
        where: { idRayon },
    });

    if (!rayon) {
        throw new AppError("Rayon tidak ditemukan", 404);
    }

    // 2. Extract digits from Rayon name (e.g. "Rayon 5" -> "05")
    const rayonMatch = rayon.namaRayon.match(/\d+/);
    const rayonNum = rayonMatch ? rayonMatch[0].padStart(2, "0") : "00";
    const prefix = `JBTT/${rayonNum}/`;

    // 3. Find max sequence safely (in-memory sort to avoid string sort issues)
    const existingIds = await tx.keluarga.findMany({
        where: {
            idKeluarga: {
                startsWith: prefix,
            },
        },
        select: {
            idKeluarga: true,
        },
    });

    let maxSeq = 0;
    existingIds.forEach((item) => {
        const parts = item.idKeluarga.split("/");
        if (parts.length === 3) {
            const seq = parseInt(parts[2]);
            if (!isNaN(seq) && seq > maxSeq) {
                maxSeq = seq;
            }
        }
    });

    // 4. Increment and format
    const sequence = String(maxSeq + 1).padStart(3, "0");
    const newIdKeluarga = `${prefix}${sequence}`;

    return newIdKeluarga;
}
