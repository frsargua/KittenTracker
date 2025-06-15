const { decryptId } = require("../config/idObfuscation");

/**
 * Middleware to decrypt specified route parameters.
 * @param {string[]} paramsToDecrypt - An array of param names to decrypt (e.g., ['litterId', 'kittenId']).
 */
const decryptIdParams = (paramsToDecrypt) => (req, res, next) => {
  for (const param of paramsToDecrypt) {
    if (req.params[param]) {
      const decryptedId = decryptId(req.params[param]);
      if (!decryptedId) {
        return res
          .status(404)
          .json({ message: "Resource not found or invalid ID." });
      }
      req.params[param] = decryptedId;
    }
  }
  next();
};

module.exports = decryptIdParams;
