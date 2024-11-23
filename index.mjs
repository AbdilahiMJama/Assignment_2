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

// Set the endpoints in the MINIO constructor and hide the access keys.
const s3Client = new Minio.Client({
  endPoint: "s3.amazonaws.com",
  accessKey: process.env.AWS_ACCESS_KEY,
  secretKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});
async function createBucket(bucketName) {
  try {
    await s3Client.makeBucket(bucketName, process.env.AWS_REGION);
    console.log(`Bucket "${bucketName}" created.`);
  } catch (err) {
    console.error("Error creating bucket:", err.message);
  }
}
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
async function deleteBucket(bucketName) {
  try {
    await s3Client.removeBucket(bucketName);
    console.log(`Bucket "${bucketName}" removed.`);
  } catch (err) {
    console.error("Error removing bucket:", err.message);
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
/*
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
}*/

async function uploadObject(bucketName, filePath, objectName) {
  try {
    const fileData = await new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    const metaData = {
      "Content-Type": "text/plain",
    };

    await minioClient.putObject(bucketName, objectName, fileData, metaData);
    console.log("File uploaded successfully.");
  } catch (err) {
    console.error("Error uploading file:", err);
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

async function removeObject(bucketName, objectName) {
  try {
    await s3Client.removeObject(bucketName, objectName);
    console.log(`Object "${objectName}" removed from bucket "${bucketName}".`);
  } catch (err) {
    console.error("Error removing object:", err.message);
  }
}

// Main menu for user input
async function main() {
  console.log("Welcome to the Minio - S3 Client App!");
  const action = readline
    .question(
      "Choose an action: (createBucket/listBuckets/deleteBucket/listObjects/uploadObject/downloadObject/removeObject): "
    )
    .toLowerCase();
  console.log("Action selected:", action);
  switch (action) {
    case "listbuckets":
      await listBuckets();
      break;
    case "createbucket":
      const bucketName = readline.question("Enter bucket name to create: ");
      await createBucket(bucketName);
      break;
    case "listobjects":
      const bucketToList = readline.question(
        "Enter bucket name to list objects: "
      );
      await listObjects(bucketToList);
      break;
    case "uploadobject":
      const uploadBucket = readline.question(
        "Enter bucket name to upload to: "
      );
      const filePath = readline.question("Enter file path to upload: ");
      const objectName = readline.question("Enter object name for S3: ");
      await uploadObject(uploadBucket, filePath, objectName);
      break;
    case "downloadobject":
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
    case "removeobject":
      const removeBucket = readline.question("Enter bucket name to remove: ");
      await removeBucket(removeBucket);
      break;
    default:
      console.log("Invalid action. Please try again.");
  }
}

// Run the main function
main().catch((err) => console.error("Unexpected error:", err.message));
