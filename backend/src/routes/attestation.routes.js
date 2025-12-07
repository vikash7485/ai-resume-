const express = require("express");
const router = express.Router();
const attestationController = require("../controllers/attestation.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Request attestation
router.post(
  "/request/:verificationId",
  authMiddleware,
  attestationController.requestAttestation
);

module.exports = router;

