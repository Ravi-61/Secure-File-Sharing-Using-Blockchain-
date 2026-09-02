const CryptoJS = require("crypto-js");
require("dotenv").config();

const SECRET_KEY = process.env.AES_SECRET_KEY;

const encryptText = (text) => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

const decryptText = (cipherText) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);

  return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = {
  encryptText,
  decryptText,
};
