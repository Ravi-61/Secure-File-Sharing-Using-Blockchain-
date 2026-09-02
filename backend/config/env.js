const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const requiredEnvVars = ["PORT", "MONGO_URI", "JWT_SECRET", "AES_SECRET_KEY"];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn(
    `[WARNING] Missing environment variables: ${missingVars.join(", ")}. Using default fallbacks where applicable.`
  );
}

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/securefilesharing",
  JWT_SECRET: process.env.JWT_SECRET || "default_fallback_jwt_secret_key_2026",
  AES_SECRET_KEY: process.env.AES_SECRET_KEY || "SecureFileSharing2026@Blockchain#AES256",
  NODE_ENV: process.env.NODE_ENV || "development",
};
