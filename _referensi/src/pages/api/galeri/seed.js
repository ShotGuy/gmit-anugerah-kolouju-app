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
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res
      .status(405)
      .json(apiResponse(false, null, `Method ${req.method} not allowed`));
  }

  try {
    // Hardcode data galeri dengan gambar yang sudah ada di S3
    const hardcodedGaleri = {
      namaKegiatan: "Ibadah Minggu Januari 2024",
      deskripsi: "Dokumentasi ibadah minggu pertama bulan Januari 2024 di GMIT Imanuel Oepura. Ibadah dihadiri oleh jemaat dengan khidmat dan penuh sukacita.",
      tempat: "Gereja GMIT Imanuel Oepura",
      tanggalKegiatan: new Date("2024-01-07"),
      fotos: JSON.stringify([
        {
          originalName: "ibadah-minggu-1.jpeg",
          fileName: "galeri/1756789428652.jpeg",
          url: "https://s3.nevaobjects.id/files-bucket/1756789428652.jpeg",
          size: 245760, // Approximate size
          mimetype: "image/jpeg",
        },
        // Tambah beberapa foto dummy lainnya untuk test
        {
          originalName: "ibadah-minggu-2.jpeg", 
          fileName: "galeri/1756789428652-2.jpeg",
          url: "https://s3.nevaobjects.id/files-bucket/1756789428652.jpeg", // Same image for demo
          size: 245760,
          mimetype: "image/jpeg",
        },
        {
          originalName: "ibadah-minggu-3.jpeg",
          fileName: "galeri/1756789428652-3.jpeg", 
          url: "https://s3.nevaobjects.id/files-bucket/1756789428652.jpeg", // Same image for demo
          size: 245760,
          mimetype: "image/jpeg",
        }
      ]),
      isActive: true,
      isPublished: true,
      publishedAt: new Date(),
    };

    // Insert ke database
    const newGaleri = await prisma.galeri.create({
      data: hardcodedGaleri,
    });

    // Parse fotos untuk response
    const result = {
      ...newGaleri,
      fotos: JSON.parse(newGaleri.fotos),
    };

    return res.status(201).json(
      apiResponse(
        true,
        result,
        "Galeri hardcoded berhasil dibuat dengan gambar dari S3"
      )
    );

  } catch (error) {
    console.error("Error creating hardcoded galeri:", error);
    return res.status(500).json(
      apiResponse(
        false,
        null,
        "Gagal membuat galeri hardcoded",
        error.message
      )
    );
  }
}