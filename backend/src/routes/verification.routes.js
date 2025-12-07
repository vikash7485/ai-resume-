const express = require("express");
const multer = require("multer");
const router = express.Router();
const verificationController = require("../controllers/verification.controller");
const authMiddleware = require("../middleware/auth.middleware");

const upload = multer({
  dest: "./uploads/",
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "text/plain"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF and text files are allowed."));
    }
  },
});

// Upload resume for verification
router.post(
  "/upload",
  authMiddleware,
  upload.single("resume"),
  verificationController.uploadResume
);

// Get verification status
router.get("/:verificationId", authMiddleware, verificationController.getVerification);

// Get verification score
router.get("/:verificationId/score", authMiddleware, verificationController.getScore);

// Get evidence hash
router.get("/:verificationId/evidence", authMiddleware, verificationController.getEvidence);

module.exports = router;

