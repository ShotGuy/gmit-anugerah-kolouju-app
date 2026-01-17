import { apiResponse } from "@/lib/apiHelper";
import { getTokenFromHeader, verifyToken } from "@/lib/jwt";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

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
  if (req.method !== "GET") {
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

    const { prefix = "", search = "" } = req.query;
    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    if (!bucketName) {
      return res.status(500).json(apiResponse(false, null, "S3 bucket not configured"));
    }

    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      Delimiter: "/",
    });

    const response = await s3Client.send(command);

    let objects = response.Contents || [];
    let folders = response.CommonPrefixes?.map((prefix) =>
      prefix.Prefix.replace(/\/$/, "").split("/").pop()
    ) || [];

    if (search) {
      const searchLower = search.toLowerCase();
      objects = objects.filter((obj) =>
        obj.Key.toLowerCase().includes(searchLower)
      );
      folders = folders.filter((folder) =>
        folder.toLowerCase().includes(searchLower)
      );
    }

    const transformedObjects = objects.map((obj) => ({
      key: obj.Key,
      size: obj.Size,
      lastModified: obj.LastModified,
      url: `https://${bucketName}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${obj.Key}`, // Or construct using endpoint if needed
    }));

    return res.status(200).json(apiResponse(true, {
      objects: transformedObjects,
      folders: folders,
      currentPath: prefix,
    }, "Objects listed successfully"));

  } catch (error) {
    console.error("List objects error:", error);
    return res.status(500).json(apiResponse(false, null, "Failed to list S3 objects", error.message));
  }
}
