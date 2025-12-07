const express = require("express");
const router = express.Router();
const governmentController = require("../controllers/government.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

// Mint attestation (government only)
router.post(
  "/mint",
  authMiddleware,
  roleMiddleware(["government", "admin"]),
  governmentController.mintAttestation
);

// Get pending attestations
router.get(
  "/pending",
  authMiddleware,
  roleMiddleware(["government", "admin"]),
  governmentController.getPendingAttestations
);

module.exports = router;

