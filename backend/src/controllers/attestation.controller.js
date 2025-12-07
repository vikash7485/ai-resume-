const Attestation = require("../models/Attestation");
const Verification = require("../models/Verification");
const { v4: uuidv4 } = require("uuid");

/**
 * Request attestation
 */
exports.requestAttestation = async (req, res, next) => {
  try {
    const { verificationId } = req.params;
    const { candidateWallet } = req.body;

    // Find verification
    const verification = await Verification.findOne({ verificationId });

    if (!verification) {
      return res.status(404).json({
        error: {
          code: "VERIFICATION_NOT_FOUND",
          message: `Verification with ID '${verificationId}' not found`,
        },
      });
    }

    // Check if verification score meets threshold
    if (verification.verificationScore < 70) {
      return res.status(400).json({
        error: {
          code: "LOW_SCORE",
          message: "Verification score must be at least 70 to request attestation",
        },
      });
    }

    // Check if already attested
    const existingAttestation = await Attestation.findOne({ verificationId });
    if (existingAttestation) {
      return res.status(400).json({
        error: {
          code: "ALREADY_ATTESTED",
          message: "Attestation already exists for this verification",
        },
      });
    }

    // Create attestation request
    const attestationId = `att_${uuidv4().replace(/-/g, "")}`;

    const attestation = new Attestation({
      attestationId,
      verificationId,
      candidateWallet: candidateWallet || verification.candidateWallet,
      status: "pending",
    });

    await attestation.save();

    res.status(201).json({
      attestationRequestId: attestationId,
      verificationId,
      status: "pending_review",
      submittedAt: attestation.createdAt,
      estimatedReviewTime: "24 hours",
    });
  } catch (error) {
    next(error);
  }
};

