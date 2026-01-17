import { createApiHandler } from "@/lib/apiHandler";
import { apiResponse } from "@/lib/apiHelper";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseQueryParams } from "@/lib/queryParams";

async function handleGet(req, res) {
    try {
        // Check auth (only Admin for now)
        const auth = await requireAuth(req, res, ["ADMIN"]);
        if (auth.error) return res.status(auth.status).json(apiResponse(false, null, auth.error));

        let { pagination, sort, where } = parseQueryParams(req.query, {
            searchField: "namaLengkap", // Placeholder, will be overriden manually for relation
            defaultSortBy: "createdAt",
        });

        // Custom search logic for relation
        if (req.query.search) {
            where = {
                ...where,
                jemaat: {
                    nama: {
                        contains: req.query.search,
                        mode: 'insensitive'
                    }
                }
            };
            // Remove the potentially wrong 'namaLengkap' filter added by parseQueryParams if it did
            delete where.namaLengkap;
        }

        const total = await prisma.pegawai.count({ where });

        const items = await prisma.pegawai.findMany({
            where,
            skip: pagination.skip,
            take: pagination.limit,
            orderBy: sort.sortBy === 'jemaat.nama' ? {
                jemaat: { nama: sort.sortOrder }
            } : {
                [sort.sortBy]: sort.sortOrder,
            },
            include: {
                jemaat: {
                    select: {
                        id: true,
                        nama: true,
                        // Add more jemaat info if needed, e.g. rayon
                    }
                },
                jenisJabatan: {
                    select: {
                        namaJabatan: true,
                    },
                },
                User: {
                    select: {
                        username: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        const totalPages = Math.ceil(total / pagination.limit);

        const result = {
            items,
            pagination: {
                ...pagination,
                total,
                totalPages,
                hasNext: pagination.page < totalPages,
                hasPrev: pagination.page > 1,
            },
        };

        return res
            .status(200)
            .json(apiResponse(true, result, "Data pegawai berhasil diambil"));
    } catch (error) {
        console.error("Error fetching pegawai:", error);
        return res
            .status(500)
            .json(
                apiResponse(
                    false,
                    null,
                    "Gagal mengambil data pegawai",
                    error.message
                )
            );
    }
}

export default createApiHandler({
    GET: handleGet,
});
