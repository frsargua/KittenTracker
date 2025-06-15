const express = require("express");
const checkJwt = require("../middleware/authMiddleware");
const litterController = require("../controllers/litterController");
const kittenRouter = require("./kittenRoutes"); // For nested routes
const decryptIdParams = require("../middleware/idObfuscationMiddleware");

const router = express.Router();

router.use(checkJwt);

// Litter Group specific routes
router.post("/", litterController.createLitter);
router.get("/", litterController.getUserLitters);

router.get(
  "/:litterId",
  decryptIdParams(["litterId"]),
  litterController.getLitterById
);
router.put(
  "/:litterId",
  decryptIdParams(["litterId"]),
  litterController.updateLitter
);
router.delete(
  "/:litterId",
  decryptIdParams(["litterId"]),
  litterController.deleteLitter
);

// Nested routes for kittens within a litter
// Pass { mergeParams: true } to kittenRouter if it needs litterId from this router
router.use("/:litterId/kittens", decryptIdParams(["litterId"]), kittenRouter);

module.exports = router;
