const fs = require("fs");
const crypto = require("crypto");

/**
 * Computes multiple hash algorithms (SHA-256, SHA-512, MD5) for a file.
 * @param {string} filePath - Path to target file
 * @returns {Promise<{sha256: string, sha512: string, md5: string}>}
 */
const generateMultiHash = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const sha256 = crypto.createHash("sha256");
      const sha512 = crypto.createHash("sha512");
      const md5 = crypto.createHash("md5");

      const stream = fs.createReadStream(filePath);

      stream.on("data", (chunk) => {
        sha256.update(chunk);
        sha512.update(chunk);
        md5.update(chunk);
      });

      stream.on("end", () => {
        resolve({
          sha256: sha256.digest("hex"),
          sha512: sha512.digest("hex"),
          md5: md5.digest("hex"),
        });
      });

      stream.on("error", (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generateMultiHash;
