import prisma from "@/lib/prisma";

const apiResponse = (success, data = null, message = "", errors = null) => {
  return {
    success,
    data,
    message,
    errors,
    timestamp: new Date().toISOString(),
  };
};

export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  if (!id) {
    return res.status(400).json(
      apiResponse(false, null, "Validasi gagal", {
        id: "ID pengumuman wajib diisi",
      })
    );
  }

  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res
      .status(405)
      .json(apiResponse(false, null, `Method ${method} not allowed`));
  }

  try {
    // Get pengumuman dengan attachments saja
    const pengumuman = await prisma.pengumuman.findUnique({
      where: { id },
      select: {
        id: true,
        judul: true,
        attachments: true,
        kategori: {
          select: { id: true, nama: true }
        },
        jenis: {
          select: { id: true, nama: true }
        },
      },
    });

    if (!pengumuman) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Pengumuman tidak ditemukan"));
    }

    // Transform response untuk kemudahan frontend
    const result = {
      id: pengumuman.id,
      judul: pengumuman.judul,
      kategori: pengumuman.kategori,
      jenis: pengumuman.jenis,
      attachments: pengumuman.attachments || [],
      totalAttachments: pengumuman.attachments?.length || 0,
    };

    return res
      .status(200)
      .json(apiResponse(true, result, "Lampiran pengumuman berhasil diambil"));
  } catch (error) {
    console.error("Error fetching attachments:", error);
    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil lampiran pengumuman",
          error.message
        )
      );
  }
}