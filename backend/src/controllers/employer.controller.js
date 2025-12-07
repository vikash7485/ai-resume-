const Verification = require("../models/Verification");
const Attestation = require("../models/Attestation");

/**
 * Scan verification token
 */
exports.scanToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    // In production, decode token to get verification ID
    // For demo, assume token is verification ID
    const verificationId = token.startsWith("ver_") ? token : `ver_${token}`;

    const verification = await Verification.findOne({ verificationId });

    if (!verification) {
      return res.status(404).json({
        error: {
          code: "VERIFICATION_NOT_FOUND",
          message: "Verification not found",
        },
      });
    }

    const attestation = await Attestation.findOne({ verificationId });

    res.json({
      token,
      valid: true,
      verification: {
        verificationId: verification.verificationId,
        verificationScore: verification.verificationScore,
        status: verification.verificationScore >= 70 ? "verified" : "failed",
        evidenceHash: verification.evidenceHash,
        fdcProof: verification.fdcProof,
        ftsoTimestamp: verification.ftsoTimestamp,
        blockchainTx: verification.blockchainTx,
      },
      attestation: attestation
        ? {
            nftTokenId: attestation.nftTokenId,
            mintedAt: attestation.mintedAt,
            issuer: attestation.issuerWallet,
            contractAddress: attestation.contractAddress || process.env.ATTESTATION_NFT_ADDRESS,
          }
        : null,
      scannedAt: new Date(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify NFT token
 */
exports.verifyNFT = async (req, res, next) => {
  try {
    const { tokenId } = req.params;

    const attestation = await Attestation.findOne({ nftTokenId: tokenId });

    if (!attestation) {
      return res.status(404).json({
        error: {
          code: "NFT_NOT_FOUND",
          message: "NFT token not found",
        },
      });
    }

    const verification = await Verification.findOne({
      verificationId: attestation.verificationId,
    });

    res.json({
      tokenId,
      valid: attestation.status === "minted" && !attestation.revokedAt,
      onChain: true,
      metadata: {
        verificationId: attestation.verificationId,
        verificationScore: verification?.verificationScore || 0,
        evidenceHash: verification?.evidenceHash || "",
        fdcProofHash: verification?.fdcProof?.degree?.proofHash || "",
        ftsoTimestamp: verification?.ftsoTimestamp || 0,
        issuer: attestation.issuerWallet,
        issueDate: attestation.mintedAt,
      },
      blockchain: {
        contractAddress: attestation.contractAddress || process.env.ATTESTATION_NFT_ADDRESS,
        owner: attestation.candidateWallet,
        tokenURI: `ipfs://attestation/${tokenId}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

