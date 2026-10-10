import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "dropbin";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID!,
    secretAccessKey: R2_SECRET_ACCESS_KEY!,
  },
});

// Generating a temp presigned URL for the browser to upload directly to R2.
export async function getPresignedUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2, command, { expiresIn: 300 });
}
// generate temporary download link for private drop

export async function getPresignedDownloadUrl(key: string, fileName?: string) {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: fileName
      ? `attachment; filename="${fileName}"`
      : undefined,
  });
  return getSignedUrl(r2, command, { expiresIn: 3600 });
}

//  Deletes an object from R2 (used by the cleanup cron).
export async function deleteR2Object(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });
  return r2.send(command);
}

//  Step 1: Frontend calls POST /api/upload/presigned-url
// - Body: { fileName: "photo.png", contentType: "image/png", fileSize: 1048576 }
// - Backend validates size & type, generates a unique fileKey (e.g. `uploads/${uuid}-${fileName}`)
// - Backend returns: { uploadUrl: "https://....", fileKey: "..." }
//
// Step 2: Frontend uploads directly to R2
// - fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } })
//
// Step 3: Frontend calls POST /api/drop
// - Body: { type: "image", fileKey, fileName, fileSize, mimeType, code, duration }
// - Backend creates the DB record in Postgres!
