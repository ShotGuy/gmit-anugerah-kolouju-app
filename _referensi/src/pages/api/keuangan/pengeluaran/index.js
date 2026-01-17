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
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json(apiResponse(false, null, "Method not allowed"));
  }

  try {
    const { periodeId, anggaran } = req.query;
    const includeAnggaran = anggaran === "true";

    // Ambil kategori pengeluaran
    const kategoriPengeluaran = await prisma.kategoriKeuangan.findFirst({
      where: { kode: "B" }, // Pengeluaran
    });

    if (!kategoriPengeluaran) {
      return res.status(404).json(apiResponse(false, null, "Kategori pengeluaran belum di-setup"));
    }

    // Ambil semua item pengeluaran
    const items = await prisma.itemKeuangan.findMany({
      where: {
        kategoriId: kategoriPengeluaran.id,
        isActive: true,
      },
      include: {
        ...(includeAnggaran &&
          periodeId && {
          AnggaranItem: {
            where: { periodeId },
          },
        }),
      },
      orderBy: [{ level: "asc" }, { urutan: "asc" }],
    });

    // Build tree structure
    const tree = buildItemTree(items);

    return res.status(200).json(apiResponse(true, {
      kategori: kategoriPengeluaran,
      items: items,
      tree: tree,
      summary: {
        totalItems: items.length,
        totalTargetAnggaran: items.reduce(
          (sum, item) => sum + Number(item.totalTarget || 0),
          0
        ),
      },
    }, "Data pengeluaran berhasil diambil"));
  } catch (error) {
    console.error("Error fetching pengeluaran:", error);
    return res.status(500).json(apiResponse(false, null, "Failed to fetch pengeluaran", error.message));
  }
}

// ===== 5. HELPER FUNCTION =====
function buildItemTree(items) {
  const itemMap = new Map();
  const rootItems = [];

  items.forEach((item) => {
    itemMap.set(item.id, { ...item, children: [] });
  });

  items.forEach((item) => {
    const itemWithChildren = itemMap.get(item.id);

    if (item.parentId) {
      const parent = itemMap.get(item.parentId);
      if (parent) {
        parent.children.push(itemWithChildren);
      }
    } else {
      rootItems.push(itemWithChildren);
    }
  });

  return rootItems.sort((a, b) => a.urutan - b.urutan);
}
