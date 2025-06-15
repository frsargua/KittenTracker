// backend/config/idObfuscation.js
const crypto = require("crypto");

const ENCRYPTION_KEY = process.env.ID_ENCRYPTION_KEY;
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  throw new Error(
    "ID_ENCRYPTION_KEY environment variable must be a 64-character hex string."
  );
}

const key = Buffer.from(ENCRYPTION_KEY, "hex");

/**
 * Encrypts a string ID.
 * @param {string} id The ID to encrypt.
 * @returns {string} The encrypted ID, as a hex string.
 */

function encryptId(id) {
  if (!id) return id;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(id, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("hex");
}

/**
 * Decrypts a string ID.
 * @param {string} encryptedId The encrypted ID (hex string).
 * @returns {string|null} The decrypted ID, or null if decryption fails.
 */
function decryptId(encryptedId) {
  if (!encryptedId || typeof encryptedId !== "string") {
    console.error("decryptId called with invalid input:", encryptedId);
    return null;
  }

  try {
    const data = Buffer.from(encryptedId, "hex");

    const AUTH_TAG_LENGTH = 16;
    if (data.length < IV_LENGTH + AUTH_TAG_LENGTH) {
      console.error("[Decrypt] Invalid encrypted data length.");
      return null;
    }

    // Using subarray as you correctly pointed out
    const iv = data.subarray(0, IV_LENGTH);
    const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decryptedBuffer = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    const decryptedString = decryptedBuffer.toString("utf8");
    return decryptedString;
  } catch (error) {
    console.error(
      "[Decrypt] Failed to decrypt ID. This might be due to a wrong key, tampered data, or an invalid ID format.",
      error.message
    );
    return null;
  }
}

function recursivelyEncryptIds(data) {
  // If data is an array, map over it and apply the function to each item
  if (Array.isArray(data)) {
    return data.map((item) => recursivelyEncryptIds(item));
  }

  // If data is a plain object, process its keys
  if (data !== null && typeof data === "object") {
    const newObj = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];

        // --- The Encryption Logic ---
        // If the key ends with 'Id', it's not 'userId', and it's a string, encrypt it.
        if (
          (key.endsWith("Id") || key.startsWith("id")) &&
          // key !== "userId" &&
          typeof value === "string"
        ) {
          console.log("value: " + value);
          newObj[key] = encryptId(value);
        }
        // If the value is another object (or array), recurse into it
        else if (value !== null && typeof value === "object") {
          newObj[key] = recursivelyEncryptIds(value);
        }
        // Otherwise, just copy the value
        else {
          newObj[key] = value;
        }
      }
    }
    return newObj;
  }

  // Return primitive values (strings, numbers, etc.) as they are
  return data;
}

module.exports = { encryptId, decryptId, recursivelyEncryptIds };
