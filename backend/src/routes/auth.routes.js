const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// Wallet authentication
router.post("/wallet", authController.walletAuth);

module.exports = router;

