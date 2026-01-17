import { apiResponse } from "@/lib/apiHelper";
import { getTokenFromHeader, verifyToken } from "@/lib/jwt";
import { DeleteObjectsCommand, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

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

    const { keys } = req.body;

    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json(apiResponse(false, null, "No keys provided"));
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    if (!bucketName) {
      return res.status(500).json(apiResponse(false, null, "S3 bucket not configured"));
    }

    const deleteObjects = keys.map((key) => ({ Key: key }));

    const command = new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: {
        Objects: deleteObjects,
      },
    });

    const response = await s3Client.send(command);

    return res.status(200).json(apiResponse(true, {
      message: `${keys.length} files deleted successfully`,
      deleted: response.Deleted || [],
      errors: response.Errors || [],
    }, "Files deleted successfully"));

  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json(apiResponse(false, null, "Failed to delete files", error.message));
  }
}
