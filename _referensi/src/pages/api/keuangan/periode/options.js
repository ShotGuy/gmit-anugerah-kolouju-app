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

  if (method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res
      .status(405)
      .json(apiResponse(false, null, `Method ${method} not allowed`));
  }

  try {
    const { active = "true", status } = query;

    const where = {};
    if (active === "true") {
      where.isActive = true;
    }

    if (status && status !== '') {
      where.status = status;
    }

    const periods = await prisma.periodeAnggaran.findMany({
      where,
      select: {
        id: true,
        nama: true,
        tahun: true,
        status: true,
        tanggalMulai: true,
        tanggalAkhir: true
      },
      orderBy: [
        { tahun: 'desc' },
        { tanggalMulai: 'desc' }
      ]
    });

    const options = periods.map(period => ({
      value: period.id,
      label: `${period.nama} (${period.tahun})`,
      nama: period.nama,
      tahun: period.tahun,
      status: period.status,
      tanggalMulai: period.tanggalMulai,
      tanggalAkhir: period.tanggalAkhir
    }));

    return res
      .status(200)
      .json(apiResponse(true, options, "Options berhasil diambil"));
  } catch (error) {
    console.error("Error fetching periode anggaran options:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Gagal mengambil options periode anggaran", error.message));
  }
}