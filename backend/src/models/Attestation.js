const mongoose = require("mongoose");

const AttestationSchema = new mongoose.Schema({
  attestationId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  verificationId: {
    type: String,
    required: true,
    ref: "Verification",
    index: true,
  },
  nftTokenId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  candidateWallet: {
    type: String,
    required: true,
    index: true,
  },
  issuerWallet: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "minted", "revoked"],
    default: "pending",
  },
  mintedAt: {
    type: Date,
  },
  blockchainTx: {
    type: String,
  },
  contractAddress: {
    type: String,
  },
  requestId: {
    type: String,
  },
  approvals: [{
    approver: String,
    approvedAt: Date,
    signature: String,
  }],
  revokedAt: {
    type: Date,
  },
  revokeReason: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
AttestationSchema.index({ candidateWallet: 1 });
AttestationSchema.index({ status: 1 });
AttestationSchema.index({ mintedAt: -1 });

module.exports = mongoose.model("Attestation", AttestationSchema);

