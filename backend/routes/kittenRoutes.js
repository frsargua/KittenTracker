const express = require("express");
// mergeParams allows us to access params from parent router (e.g., :litterId)
const router = express.Router({ mergeParams: true });
// checkJwt is already applied by the parent litterRoutes, so not strictly needed here again
// unless these routes could be accessed directly, but good practice to be explicit if needed.
const checkJwt = require("../middleware/authMiddleware");
const kittenController = require("../controllers/kittenController");
const weightRecordRouter = require("./weightRecordRoutes");
const decryptIdParams = require("../middleware/idObfuscationMiddleware");

router.use(checkJwt); // Already protected by parent router

router.post("/", kittenController.addKittenToLitter);
router.get("/", kittenController.getKittensInLitter); // Get all kittens for a litter

router.get(
  "/:kittenId",
  decryptIdParams(["kittenId"]),
  kittenController.getKittenById
);
router.put(
  "/:kittenId",
  decryptIdParams(["kittenId"]),
  kittenController.updateKitten
);
router.delete(
  "/:kittenId",
  decryptIdParams(["kittenId"]),
  kittenController.removeKitten
);

// Nested routes for weight records
router.use(
  "/:kittenId/weights",
  decryptIdParams(["kittenId"]),
  weightRecordRouter
);

module.exports = router;
