import { s3Client } from "@/lib/s3-client";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

// Generate unique filename
export function generateFileName(originalName) {
  const timestamp = Date.now();
  const uuid = uuidv4().substring(0, 8);
  const ext = originalName.split(".").pop();
  return `${timestamp}-${uuid}.${ext}`;
}

// Get file path based on type
export function getFilePath(type, fileName) {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");

  const basePaths = {
    galeri: `galeri/${year}/${month}`,
    pengumuman: `pengumuman/${year}/${month}`,
    documents: `documents/${year}/${month}`,
    avatars: `avatars/${year}/${month}`,
  };

  return `${basePaths[type] || "uploads"}/${fileName}`;
}

// Upload file to S3
export async function uploadToS3(file, filePath) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: filePath,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read", // Buat file bisa diakses public
  });

  try {
    await s3Client.send(command);

    // Return public URL
    const publicUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${filePath}`;
    return publicUrl;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload file");
  }
}

// Delete file from S3
export async function deleteFromS3(filePath) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: filePath,
  });

  try {
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error("Error deleting from S3:", error);
    throw new Error("Failed to delete file");
  }
}

// ===== 6. API ROUTE - /api/upload/multiple.js =====

// ===== 5. API ROUTE - /api/upload/single.js =====
//  import {
//   uploadToS3,
//   generateFileName,
//   getFilePath,
// } from "@/lib/upload-helpers";

import multer from "multer";

export const config = {
  api: {
    bodyParser: false,
  },
};

const storage = multer.memoryStorage();
const upload = multer({ storage });

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await runMiddleware(req, res, upload.single("file"));

    const file = req.file;
    const { type: uploadType = "uploads" } = req.body;

    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // Validasi file type dan size
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        error:
          "File type not allowed. Only JPEG, PNG, WebP, and PDF files are accepted.",
      });
    }

    if (file.size > maxSize) {
      return res.status(400).json({
        error: "File too large. Maximum size is 10MB.",
      });
    }

    // Generate filename dan path
    const fileName = generateFileName(file.originalname);
    const filePath = getFilePath(uploadType, fileName);

    // Upload ke S3
    const publicUrl = await uploadToS3(
      {
        buffer: file.buffer,
        mimetype: file.mimetype,
        originalname: file.originalname,
      },
      filePath
    );

    return res.status(200).json({
      success: true,
      data: {
        url: publicUrl,
        fileName: fileName,
        originalName: file.originalname,
        size: file.size,
        type: file.mimetype,
        path: filePath,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      error: "Upload failed",
      details: error.message,
    });
  }
}
