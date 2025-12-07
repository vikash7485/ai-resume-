const express = require("express");
const router = express.Router();
const employerController = require("../controllers/employer.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Scan verification token
router.get("/scan/:token", authMiddleware, employerController.scanToken);

// Verify NFT token
router.get("/verify-nft/:tokenId", authMiddleware, employerController.verifyNFT);

module.exports = router;

