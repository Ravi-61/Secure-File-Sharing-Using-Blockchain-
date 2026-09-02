const dotenv = require("dotenv");
dotenv.config();

const crypto = require("crypto");
const fs = require("fs");

const algorithm = "aes-256-cbc";

if (!process.env.AES_SECRET_KEY) {
  throw new Error("AES_SECRET_KEY is missing in .env");
}

const key = crypto
  .createHash("sha256")
  .update(process.env.AES_SECRET_KEY)
  .digest();

// =========================
// Encrypt File
// =========================
function encryptFile(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);

    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);

    // Save IV at the beginning
    output.write(iv);

    input.pipe(cipher).pipe(output);

    output.on("finish", resolve);
    output.on("error", reject);
    input.on("error", reject);
  });
}

// =========================
// Decrypt File
// =========================
function decryptFile(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const input = fs.createReadStream(inputPath);

    let iv;

    input.once("readable", () => {
      iv = input.read(16);

      const decipher = crypto.createDecipheriv(algorithm, key, iv);

      const output = fs.createWriteStream(outputPath);

      input.pipe(decipher).pipe(output);

      output.on("finish", resolve);
      output.on("error", reject);
    });

    input.on("error", reject);
  });
}

module.exports = {
  encryptFile,
  decryptFile,
};
