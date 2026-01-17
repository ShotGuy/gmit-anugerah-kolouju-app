import { apiResponse } from "@/lib/apiHelper";
import { getTokenFromHeader, verifyToken } from "@/lib/jwt";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT, // Add endpoint support just in case (e.g. for Domainesia/MinIO support if needed)
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Often needed for S3 compatible storages
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json(apiResponse(false, null, "Method not allowed"));
  }

  try {
    // Check if user is authenticated and has admin role
    const token = getTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json(apiResponse(false, null, "No token provided"));
    }

    const decoded = await verifyToken(token);

    if (!decoded || decoded.role !== "ADMIN") {
      return res.status(401).json(apiResponse(false, null, "Unauthorized access"));
    }

    const { key } = req.query;

    if (!key) {
      return res.status(400).json(apiResponse(false, null, "File key not provided"));
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    if (!bucketName) {
      return res.status(500).json(apiResponse(false, null, "S3 bucket not configured"));
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    try {
      const response = await s3Client.send(command);

      if (!response.Body) {
        return res.status(404).json(apiResponse(false, null, "File not found"));
      }

      // Convert stream to buffer
      const stream = response.Body;
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      const fileName = key.split("/").pop();

      res.setHeader("Content-Type", response.ContentType || "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
      res.setHeader("Content-Length", buffer.length);

      return res.send(buffer);
    } catch (s3Error) {
      console.error("S3 Get Error:", s3Error);
      return res.status(404).json(apiResponse(false, null, "File not found or access denied"));
    }

  } catch (error) {
    console.error("Download error:", error);
    return res.status(500).json(apiResponse(false, null, "Failed to download file", error.message));
  }
}
