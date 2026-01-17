const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env
const envConfig = dotenv.parse(fs.readFileSync(path.resolve(__dirname, '../.env')));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

console.log("Loaded Environment:");
console.log("S3_ENDPOINT (raw):", `"${process.env.S3_ENDPOINT}"`);
console.log("S3_REGION:", `"${process.env.S3_REGION}"`);

const endpointString = process.env.S3_ENDPOINT?.startsWith('http')
    ? process.env.S3_ENDPOINT
    : `https://${process.env.S3_ENDPOINT}`;

console.log("Computed Endpoint:", endpointString);

const s3Config = {
    endpoint: endpointString, // Try string first
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.S3_REGION || 'us-east-1',
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
    // logger: console // Debug logging
};

console.log("Initializing S3 with config (redacted keys):", {
    ...s3Config,
    accessKeyId: '***',
    secretAccessKey: '***'
});

const s3 = new AWS.S3(s3Config);

async function testConnection() {
    try {
        console.log("Attempting to list buckets...");
        const data = await s3.listBuckets().promise();
        console.log("Success! Buckets:", data.Buckets.map(b => b.Name));
    } catch (err) {
        console.error("Connection Failed:", err);
    }
}

testConnection();
