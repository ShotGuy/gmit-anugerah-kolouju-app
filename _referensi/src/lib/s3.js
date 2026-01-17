import AWS from 'aws-sdk';

// Konfigurasi S3 untuk Domainesia
const s3Config = {
  endpoint: process.env.S3_ENDPOINT,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
};

const s3 = new AWS.S3(s3Config);

export const uploadFileToS3 = async (fileBuffer, key, mimeType = 'image/webp') => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      ACL: 'public-read', // Untuk bisa diakses public
    };

    const result = await s3.upload(params).promise();
    return {
      success: true,
      url: result.Location,
      key: result.Key,
    };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const deleteFileFromS3 = async (key) => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    };

    await s3.deleteObject(params).promise();
    return { success: true };
  } catch (error) {
    console.error('S3 Delete Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const generateFileName = (originalName, newExtension = 'webp') => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  return `galeri/${timestamp}-${randomString}.${newExtension}`;
};

export default s3;