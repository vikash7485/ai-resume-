const Verification = require("../models/Verification");
const resumeParser = require("../services/resumeParser");
const aiVerification = require("../services/aiVerification");
const fraudDetector = require("../services/fraudDetector");
const fdcConnector = require("../services/fdcConnector");
const ftsoIntegration = require("../services/ftsoIntegration");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const fs = require("fs").promises;

/**
 * Upload resume for verification
 */
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: { code: "NO_FILE", message: "No resume file provided" },
      });
    }

    const { candidateWallet, metadata } = req.body;

    if (!candidateWallet) {
      return res.status(400).json({
        error: { code: "MISSING_WALLET", message: "Candidate wallet address required" },
      });
    }

    // Read file buffer
    const fileBuffer = await fs.readFile(req.file.path);

    // Parse resume
    const parsed = await resumeParser.parseResume(fileBuffer, req.file.mimetype);

    // Generate verification ID
    const verificationId = `ver_${uuidv4().replace(/-/g, "")}`;

    // Create verification record
    const verification = new Verification({
      verificationId,
      candidateWallet,
      resumeHash: `0x${parsed.hash}`,
      ipfsHash: "Qm...", // Would upload to IPFS in production
      uploadedAt: new Date(),
      status: "processing",
      metadata: metadata ? JSON.parse(metadata) : {},
      entities: parsed.entities,
    });

    await verification.save();

    // Process verification asynchronously (would use queue in production)
    processVerificationAsync(verificationId, parsed, candidateWallet);

    // Clean up uploaded file
    await fs.unlink(req.file.path);

    res.status(201).json({
      verificationId,
      status: "processing",
      uploadedAt: verification.uploadedAt,
      resumeHash: verification.resumeHash,
      ipfsHash: verification.ipfsHash,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get verification status
 */
exports.getVerification = async (req, res, next) => {
  try {
    const { verificationId } = req.params;

    const verification = await Verification.findOne({ verificationId });

    if (!verification) {
      return res.status(404).json({
        error: {
          code: "VERIFICATION_NOT_FOUND",
          message: `Verification with ID '${verificationId}' not found`,
        },
      });
    }

    res.json({
      verificationId: verification.verificationId,
      status: verification.status,
      verificationScore: verification.verificationScore,
      breakdown: verification.breakdown,
      entities: verification.entities,
      flags: verification.flags,
      evidenceHash: verification.evidenceHash,
      fdcProof: verification.fdcProof,
      ftsoTimestamp: verification.ftsoTimestamp,
      blockchainTx: verification.blockchainTx,
      createdAt: verification.createdAt,
      completedAt: verification.completedAt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get verification score
 */
exports.getScore = async (req, res, next) => {
  try {
    const { verificationId } = req.params;

    const verification = await Verification.findOne({ verificationId });

    if (!verification) {
      return res.status(404).json({
        error: {
          code: "VERIFICATION_NOT_FOUND",
          message: `Verification with ID '${verificationId}' not found`,
        },
      });
    }

    res.json({
      verificationId: verification.verificationId,
      score: verification.verificationScore,
      status: verification.verificationScore >= 70 ? "verified" : "failed",
      threshold: 70,
      breakdown: verification.breakdown,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get evidence hash
 */
exports.getEvidence = async (req, res, next) => {
  try {
    const { verificationId } = req.params;

    const verification = await Verification.findOne({ verificationId });

    if (!verification) {
      return res.status(404).json({
        error: {
          code: "VERIFICATION_NOT_FOUND",
          message: `Verification with ID '${verificationId}' not found`,
        },
      });
    }

    res.json({
      verificationId: verification.verificationId,
      evidenceHash: verification.evidenceHash,
      ipfsHash: verification.ipfsHash,
      components: {
        resumeHash: verification.resumeHash,
        aiReportHash: "0x...", // Would calculate in production
        fdcProofHash: verification.fdcProof?.degree?.proofHash || "0x...",
      },
      blockchainTx: verification.blockchainTx,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Process verification asynchronously
 */
async function processVerificationAsync(verificationId, parsed, candidateWallet) {
  try {
    const verification = await Verification.findOne({ verificationId });
    if (!verification) return;

    verification.status = "processing";
    await verification.save();

    // 1. AI Analysis
    const aiAnalysis = await aiVerification.analyzeResume(parsed.text, parsed.entities);

    // 2. Fraud Detection
    const fraudResult = fraudDetector.detectFraud(parsed.text, parsed.entities, aiAnalysis);

    // 3. FDC Verification
    const fdcResults = {};
    if (parsed.entities.universities.length > 0 && parsed.entities.degrees.length > 0) {
      const degree = parsed.entities.degrees[0];
      const university = parsed.entities.universities[0];
      const year = parsed.entities.dates.education[0]?.end || "";

      fdcResults.degree = await fdcConnector.verifyDegree(degree, university, year, "");
      fdcResults.university = await fdcConnector.verifyUniversityAccreditation(university);
    }

    // 4. FTSO Timestamp
    const ftsoData = await ftsoIntegration.getTimestamp();

    // 5. Calculate Verification Score
    const breakdown = calculateScore(aiAnalysis, fdcResults, fraudResult);
    const totalScore = Object.values(breakdown).reduce((sum, score) => sum + score, 0);

    // 6. Generate Evidence Hash
    const evidenceComponents = {
      resumeHash: verification.resumeHash,
      aiReport: aiAnalysis,
      fdcProof: fdcResults,
      fraudDetection: fraudResult,
    };
    const evidenceHash = generateEvidenceHash(evidenceComponents);

    // 7. Store on blockchain (would do this in production)
    // const tx = await recordOnBlockchain(verificationId, totalScore, evidenceHash, ftsoData);

    // 8. Update verification record
    verification.status = "completed";
    verification.verificationScore = totalScore;
    verification.breakdown = breakdown;
    verification.flags = {
      inconsistencies: [...(aiAnalysis.flags?.inconsistencies || []), ...(fraudResult.fraudIndicators || [])],
      fraudIndicators: fraudResult.fraudIndicators || [],
      warnings: [...(aiAnalysis.flags?.warnings || []), ...(fraudResult.warnings || [])],
    };
    verification.evidenceHash = `0x${evidenceHash}`;
    verification.fdcProof = fdcResults;
    verification.ftsoTimestamp = ftsoData.timestamp;
    verification.ftsoEpoch = ftsoData.epoch;
    verification.completedAt = new Date();
    // verification.blockchainTx = tx.hash;

    await verification.save();
  } catch (error) {
    console.error("Verification processing error:", error);
    const verification = await Verification.findOne({ verificationId });
    if (verification) {
      verification.status = "failed";
      verification.error = {
        message: error.message,
        stack: error.stack,
      };
      await verification.save();
    }
  }
}

/**
 * Calculate verification score breakdown
 */
function calculateScore(aiAnalysis, fdcResults, fraudResult) {
  let degreeVerification = 0;
  let experienceVerification = 0;
  let identityVerification = 0;
  let documentAuthenticity = 15; // Default score
  let consistencyScore = aiAnalysis?.consistencyScore || 0;

  // Degree verification (0-30)
  if (fdcResults.degree?.verified) {
    degreeVerification += 20;
  }
  if (fdcResults.university?.verified && fdcResults.university?.accredited) {
    degreeVerification += 10;
  }

  // Experience verification (0-25) - simplified
  experienceVerification = 20; // Would verify with employers

  // Identity verification (0-20) - simplified
  identityVerification = 15; // Would verify ID documents

  // Deduct for fraud indicators
  const fraudPenalty = fraudResult.fraudIndicators.length * 5;
  degreeVerification = Math.max(0, degreeVerification - fraudPenalty);
  experienceVerification = Math.max(0, experienceVerification - fraudPenalty);

  return {
    degreeVerification: Math.min(30, degreeVerification),
    experienceVerification: Math.min(25, experienceVerification),
    identityVerification: Math.min(20, identityVerification),
    documentAuthenticity: Math.min(15, documentAuthenticity),
    consistencyScore: Math.min(10, consistencyScore),
  };
}

/**
 * Generate evidence hash
 */
function generateEvidenceHash(components) {
  const dataString = JSON.stringify(components);
  return crypto.createHash("sha256").update(dataString).digest("hex");
}

