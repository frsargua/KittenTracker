// server/routes/weightRecordRoutes.js
const express = require("express");
const router = express.Router({ mergeParams: true }); // To access :litterId and :kittenId
const weightRecordController = require("../controllers/weightRecordController");
const upload = require("../middleware/uploadMiddleware"); // Import the upload middleware

// checkJwt already applied by litterRoutes

router.post(
  "/",
  upload.single("photo"),
  weightRecordController.addWeightRecord
);
router.get("/", weightRecordController.getKittenWeightRecords); // Get all weights for a kitten
router.put("/:weightId", weightRecordController.updateWeightRecord);
router.delete("/:weightId", weightRecordController.removeWeightRecord);

module.exports = router;
