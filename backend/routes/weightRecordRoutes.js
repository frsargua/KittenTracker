// server/routes/weightRecordRoutes.js
const express = require("express");
const router = express.Router({ mergeParams: true }); // To access :litterId and :kittenId
const weightRecordController = require("../controllers/weightRecordController");
const upload = require("../middleware/uploadMiddleware"); // Import the upload middleware
const decryptIdParams = require("../middleware/idObfuscationMiddleware");

// checkJwt already applied by litterRoutes

router.post(
  "/",
  upload.single("photo"),
  weightRecordController.addWeightRecord
);
router.get("/", weightRecordController.getKittenWeightRecords);

router.put(
  "/:weightId",
  decryptIdParams(["weightId"]),
  weightRecordController.updateWeightRecord
);
router.delete(
  "/:weightId",
  decryptIdParams(["weightId"]),
  weightRecordController.removeWeightRecord
);

module.exports = router;
