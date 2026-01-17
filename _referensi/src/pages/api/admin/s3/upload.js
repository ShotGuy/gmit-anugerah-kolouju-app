import { apiResponse } from "@/lib/apiHelper";
import { getTokenFromHeader, verifyToken } from "@/lib/jwt";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import multer from "multer";

export const config = {
  api: {
    bodyParser: false,
  },
};

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

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
    return res.status(405).json(apiResponse(false, null, "Method not allowed"));
  }

  try {
    const token = getTokenFromHeader(req.headers.authorization);
    if (!token) {
      return res.status(401).json(apiResponse(false, null, "No token provided"));
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN") {
      return res.status(401).json(apiResponse(false, null, "Unauthorized access"));
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) {
      return res.status(500).json(apiResponse(false, null, "S3 bucket not configured"));
    }

    // Use multer to parse the multipart/form-data
    await runMiddleware(req, res, upload.single("file"));

    const file = req.file;
    const { prefix } = req.body;

    if (!file) {
      return res.status(400).json(apiResponse(false, null, "No file provided"));
    }

    const fileName = file.originalname;
    const fileKey = prefix ? `${prefix}/${fileName}` : fileName;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype || "application/octet-stream",
    });

    await s3Client.send(command);

    return res.status(200).json(apiResponse(true, {
      message: "File uploaded successfully",
      key: fileKey,
    }, "File uploaded successfully"));

  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json(apiResponse(false, null, "Failed to upload file", error.message));
  }
}
