const fs = require("fs");
const crypto = require("crypto");
const CryptoJS = require("crypto-js");

/**
 * Generates SHA-256 hash of a file synchronously.
 * Uses native Node crypto for optimal speed & memory, with CryptoJS fallback.
 * @param {string} filePath - Absolute or relative path to file.
 * @returns {string} Hexadecimal SHA-256 hash string.
 */
const generateFileHash = (filePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash("sha256").update(fileBuffer).digest("hex");
  } catch (error) {
    // Fallback to CryptoJS if crypto buffer fails
    const fileBuffer = fs.readFileSync(filePath);
    const wordArray = CryptoJS.lib.WordArray.create(fileBuffer);
    return CryptoJS.SHA256(wordArray).toString();
  }
};

/**
 * Generates SHA-256 hash of a file asynchronously using streams for large files.
 * @param {string} filePath - Absolute or relative path to file.
 * @returns {Promise<string>} Hexadecimal SHA-256 hash string.
 */
const generateFileHashAsync = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);

    stream.on("data", (data) => hash.update(data));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", (err) => reject(err));
  });
};

module.exports = generateFileHash;
module.exports.generateFileHashAsync = generateFileHashAsync;
