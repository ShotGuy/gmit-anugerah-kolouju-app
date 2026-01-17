import multer from "multer";
import { v4 as uuidv4 } from "uuid";

import { apiResponse } from "@/lib/apiHelper";
import { getTokenFromHeader, verifyToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import { uploadFileToS3 } from "@/lib/s3";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Tipe file harus PNG, JPG, atau JPEG"), false);
    }
  },
});

// Helper to run multer middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

// GET - Get all pastor profiles or active one
async function handleGet(req, res) {
  try {
    const { active } = req.query;

    let where = {};

    if (active === "true") {
      where.isActive = true;
    }

    const profiles = await prisma.profilPendeta.findMany({
      where,
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    });

    // If requesting active profile, return only the first one
    if (active === "true") {
      const activeProfile = profiles.length > 0 ? profiles[0] : null;

      return res
        .status(200)
        .json(
          apiResponse(
            true,
            activeProfile,
            "Data profil pendeta aktif berhasil diambil"
          )
        );
    }

    return res
      .status(200)
      .json(
        apiResponse(true, profiles, "Data profil pendeta berhasil diambil")
      );
  } catch (error) {
    console.error("Error fetching pastor profiles:", error);

    return res
      .status(500)
      .json(
        apiResponse(
          false,
          null,
          "Gagal mengambil data profil pendeta",
          error.message
        )
      );
  }
}

// POST - Create new pastor profile
async function handlePost(req, res) {
  try {
    // Check authentication
    const token = getTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res
        .status(401)
        .json(apiResponse(false, null, "Token tidak ditemukan"));
    }

    const decoded = await verifyToken(token);

    if (!decoded) {
      return res
        .status(401)
        .json(apiResponse(false, null, "Token tidak valid"));
    }

    // Check if user is admin
    if (decoded.role !== "ADMIN") {
      return res
        .status(403)
        .json(
          apiResponse(
            false,
            null,
            "Hanya admin yang dapat membuat profil pendeta"
          )
        );
    }

    // Run multer middleware
    await runMiddleware(req, res, upload.single("foto"));

    const { nama, status, periode, quote } = req.body;
    const file = req.file;

    if (!nama) {
      return res
        .status(400)
        .json(apiResponse(false, null, "Nama pendeta harus diisi"));
    }

    let urlFoto = null;
    let s3Key = null;

    // Upload photo if provided
    if (file) {
      const fileName = `profil-pendeta-${Date.now()}-${uuidv4()}`;
      const fileExtension = file.mimetype === "image/png" ? ".png" : ".jpg";

      s3Key = `profil-pendeta/${fileName}${fileExtension}`;

      const uploadResult = await uploadFileToS3(
        file.buffer,
        s3Key,
        file.mimetype
      );

      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }
      urlFoto = uploadResult.url;
    }

    //! i just comment this part because it will deactivate all existing profiles.
    // Deactivate all existing profiles
    // await prisma.profilPendeta.updateMany({
    //   where: { isActive: true },
    //   data: { isActive: false }
    // });

    // Create new profile
    const newProfile = await prisma.profilPendeta.create({
      data: {
        nama,
        status,
        periode,
        quote,
        urlFoto,
        s3Key,
        isActive: true,
        // createdBy: user.id,
      },
    });

    return res
      .status(201)
      .json(apiResponse(true, newProfile, "Profil pendeta berhasil dibuat"));
  } catch (error) {
    console.error("Error creating pastor profile:", error);

    // Handle multer errors
    if (error.message === "Tipe file harus PNG, JPG, atau JPEG") {
      return res.status(400).json(apiResponse(false, null, error.message));
    }

    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal membuat profil pendeta", error.message)
      );
  }
}

export default async function handler(req, res) {
  switch (req.method) {
    case "GET":
      return handleGet(req, res);
    case "POST":
      return handlePost(req, res);
    default:
      return res
        .status(405)
        .json(apiResponse(false, null, "Method tidak diizinkan"));
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
