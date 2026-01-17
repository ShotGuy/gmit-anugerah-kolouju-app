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
// ===== 6. API ROUTE - /api/upload/multiple.js =====
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
    // Handle multiple files under the key 'files'
    await runMiddleware(req, res, upload.array("files"));

    const files = req.files;
    const { type: uploadType = "uploads" } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files provided" });
    }

    const uploadPromises = files.map(async (file, index) => {
      try {
        // Validasi per file
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ];
        const maxSize = 5 * 1024 * 1024; // 5MB untuk multiple upload

        if (!allowedTypes.includes(file.mimetype)) {
          throw new Error(`File ${file.originalname}: type not allowed`);
        }

        if (file.size > maxSize) {
          throw new Error(`File ${file.originalname}: too large`);
        }

        const fileName = generateFileName(file.originalname);
        const filePath = getFilePath(uploadType, fileName);

        const publicUrl = await uploadToS3(
          {
            buffer: file.buffer,
            mimetype: file.mimetype,
            originalname: file.originalname,
          },
          filePath
        );

        return {
          success: true,
          url: publicUrl,
          fileName: fileName,
          originalName: file.originalname,
          size: file.size,
          type: file.mimetype,
          path: filePath,
          index: index,
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          fileName: file.originalname,
          index: index,
        };
      }
    });

    const results = await Promise.all(uploadPromises);
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    return res.status(200).json({
      success: failed.length === 0,
      data: {
        uploaded: successful,
        failed: failed,
        total: files.length,
        successCount: successful.length,
        failedCount: failed.length,
      },
      message: failed.length === 0 ? "All files uploaded" : "Some files failed to upload"
    });
  } catch (error) {
    console.error("Multiple upload error:", error);
    return res.status(500).json({
      error: "Upload failed",
      details: error.message,
    });
  }
}
