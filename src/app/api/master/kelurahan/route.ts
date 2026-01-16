import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    try {
        const data = await prisma.kelurahan.findMany({
            where: search
                ? {
                    nama: {
                        contains: search,
                    },
                }
                : undefined,
            take: 20,
            orderBy: {
                nama: "asc",
            },
        });

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch kelurahan data" },
            { status: 500 }
        );
    }
}
