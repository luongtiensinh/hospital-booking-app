const crypto = require("crypto");

const ENCRYPTION_KEY = crypto
  .createHash("sha256")
  .update(process.env.QR_ENCRYPTION_KEY || "medcare-default-secret-key")
  .digest();

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

/**
 * Encrypts a plain text string (e.g. appointment_id) to a secure encrypted string.
 * @param {string} text - The text to encrypt
 * @returns {string} The encrypted string in format: ivHex:encryptedHex
 */
function encrypt(text) {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Could not encrypt data");
  }
}

/**
 * Decrypts a secure encrypted string back to the plain text.
 * @param {string} encryptedText - The encrypted string in format: ivHex:encryptedHex
 * @returns {string|null} The decrypted plain text, or null if decryption fails
 */
function decrypt(encryptedText) {
  try {
    const parts = encryptedText.split(":");
    if (parts.length !== 2) return null;

    const iv = Buffer.from(parts[0], "hex");
    const encrypted = Buffer.from(parts[1], "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error.message);
    return null;
  }
}

module.exports = {
  encrypt,
  decrypt,
};
