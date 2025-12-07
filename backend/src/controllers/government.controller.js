const Attestation = require("../models/Attestation");
const Verification = require("../models/Verification");

/**
 * Mint attestation
 */
exports.mintAttestation = async (req, res, next) => {
  try {
    const { verificationId, candidateWallet, signatures } = req.body;

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

    // In production, verify multi-signature here
    // For demo, just check that signatures exist
    if (!signatures || signatures.length < 2) {
      return res.status(400).json({
        error: {
          code: "INSUFFICIENT_SIGNATURES",
          message: "At least 2 signatures required for multi-sig",
        },
      });
    }

    // Create attestation record
    const attestation = await Attestation.findOne({ verificationId });
    if (!attestation) {
      return res.status(404).json({
        error: {
          code: "ATTESTATION_REQUEST_NOT_FOUND",
          message: "Attestation request not found",
        },
      });
    }

    // In production, mint NFT via smart contract
    const nftTokenId = "12345"; // Would be actual token ID from blockchain
    const blockchainTx = "0x..."; // Would be actual transaction hash

    attestation.status = "minted";
    attestation.nftTokenId = nftTokenId;
    attestation.issuerWallet = req.user.address;
    attestation.mintedAt = new Date();
    attestation.blockchainTx = blockchainTx;
    attestation.approvals = signatures.map((sig) => ({
      approver: sig.address,
      approvedAt: new Date(),
      signature: sig.signature,
    }));

    await attestation.save();

    res.json({
      attestationId: attestation.attestationId,
      nftTokenId,
      verificationId,
      candidateWallet: candidateWallet || verification.candidateWallet,
      blockchainTx,
      mintedAt: attestation.mintedAt,
      contractAddress: process.env.ATTESTATION_NFT_ADDRESS || "0x...",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get pending attestations
 */
exports.getPendingAttestations = async (req, res, next) => {
  try {
    const pending = await Attestation.find({ status: "pending" })
      .populate("verificationId")
      .sort({ createdAt: -1 })
      .limit(50);

    const formatted = await Promise.all(
      pending.map(async (att) => {
        const verification = await Verification.findOne({
          verificationId: att.verificationId,
        });
        return {
          attestationRequestId: att.attestationId,
          verificationId: att.verificationId,
          candidateWallet: att.candidateWallet,
          verificationScore: verification?.verificationScore || 0,
          submittedAt: att.createdAt,
          priority: "normal",
        };
      })
    );

    res.json({
      pending: formatted,
      total: formatted.length,
    });
  } catch (error) {
    next(error);
  }
};

