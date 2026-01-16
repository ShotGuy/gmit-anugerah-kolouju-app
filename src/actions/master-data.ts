"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session.server";

export async function getMasterDataAction(slug: string) {
    await verifySession();
    try {
        switch (slug) {
            case "pendidikan":
                return await prisma.pendidikan.findMany();
            case "pekerjaan":
                return await prisma.pekerjaan.findMany();
            case "pendapatan":
                return await prisma.pendapatan.findMany();
            case "jaminan-kesehatan":
                return await prisma.jaminanKes.findMany();
            case "status-dalam-keluarga":
                return await prisma.statusDalamKeluarga.findMany();
            case "status-kepemilikan-rumah":
                return await prisma.statusKepemilikanRumah.findMany();
            case "status-tanah":
                return await prisma.statusTanah.findMany();
            case "rayon":
                return await prisma.rayon.findMany();
            case "klasis":
                return await prisma.klasis.findMany();
            case "jabatan":
                return await prisma.jabatan.findMany();
            case "provinsi":
                return await prisma.provinsi.findMany();
            case "kota-kabupaten":
                return await prisma.kotaKab.findMany();
            case "kecamatan":
                return await prisma.kecamatan.findMany();
            case "kelurahan":
                return await prisma.kelurahan.findMany();
            default:
                // Return empty array instead of throwing to avoid breaking the UI if slug is unknown
                console.warn(`Unknown master data slug: ${slug}`);
                return [];
        }
    } catch (error) {
        console.error(`Failed to fetch master data for ${slug}:`, error);
        throw new Error(`Failed to fetch master data for ${slug}`);
    }
}
