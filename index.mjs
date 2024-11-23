/*import * as Minio from "minio";
import "dotenv/config";

const s3Client = new Minio.Client({
  endPoint: "s3.amazonaws.com",
  accessKey: process.env.AWS_ACCESS_KEY,
  secretKey: process.env.AWS_SECRET_KEY,
});
try {
  const buckets = await s3Client.listBuckets();
  console.log("Success", buckets);
} catch (err) {
  console.log(err.message);
}*/
// Imports
// This is a cli program to upload, download, list buckets and list objects in a bucket.
import * as Minio from "minio";
import "dotenv/config";
import readline from "readline-sync";
import fs from "fs/promises";

// Initialize S3 client
// Set the endpoints in the MINIO constructor and hide the access keys.
const s3Client = new Minio.Client({
  endPoint: "s3.amazonaws.com",
  accessKey: process.env.AWS_ACCESS_KEY,
  secretKey: process.env.AWS_SECRET_KEY,
});

// List all buckets
async function listBuckets() {
  try {
    const buckets = await s3Client.listBuckets();
    console.log("Buckets:");
    buckets.forEach((bucket) => console.log(`- ${bucket.name}`));
  } catch (err) {
    console.error("Error listing buckets:", err.message);
  }
}

// List objects in a specific bucket
async function listObjects(bucketName) {
  try {
    const stream = s3Client.listObjects(bucketName, "", true);
    console.log(`Objects in bucket "${bucketName}":`);
    stream.on("data", (obj) => console.log(`- ${obj.name}`));
    stream.on("end", () => console.log("End of object list."));
    stream.on("error", (err) =>
      console.error("Error listing objects:", err.message)
    );
  } catch (err) {
    console.error("Error:", err.message);
  }
}

// Upload a file to a bucket
async function uploadObject(bucketName, filePath, objectName) {
  try {
    const stats = await fs.stat(filePath); // Check if file exists
    if (!stats.isFile()) {
      throw new Error(`Path is not a valid file: ${filePath}`);
    }
    await s3Client.fPutObject(bucketName, objectName, filePath);
    console.log(
      `File "${filePath}" uploaded as "${objectName}" to bucket "${bucketName}".`
    );
  } catch (err) {
    console.error("Error uploading file:", err.message);
  }
}

// Download a file from a bucket
async function downloadObject(bucketName, objectName, downloadPath) {
  try {
    await s3Client.fGetObject(bucketName, objectName, downloadPath);
    console.log(`Object "${objectName}" downloaded to "${downloadPath}".`);
  } catch (err) {
    console.error("Error downloading object:", err.message);
  }
}

// Main menu for user input
async function main() {
  console.log("Welcome to the S3 Client App!");
  const action = readline
    .question("Choose an action: (listBuckets/listObjects/upload/download): ")
    .toLowerCase();

  switch (action) {
    case "listbuckets":
      await listBuckets();
      break;
    case "listobjects":
      const bucketToList = readline.question(
        "Enter bucket name to list objects: "
      );
      await listObjects(bucketToList);
      break;
    case "upload":
      const uploadBucket = readline.question(
        "Enter bucket name to upload to: "
      );
      const filePath = readline.question("Enter file path to upload: ");
      const objectName = readline.question("Enter object name for S3: ");
      await uploadObject(uploadBucket, filePath, objectName);
      break;
    case "download":
      const downloadBucket = readline.question(
        "Enter bucket name to download from: "
      );
      const objectToDownload = readline.question(
        "Enter object name to download: "
      );
      const downloadPath = readline.question(
        "Enter file path to save downloaded file: "
      );
      await downloadObject(downloadBucket, objectToDownload, downloadPath);
      break;
    default:
      console.log("Invalid action. Please try again.");
  }
}

// Run the main function
main().catch((err) => console.error("Unexpected error:", err.message));
