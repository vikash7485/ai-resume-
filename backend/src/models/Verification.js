const mongoose = require("mongoose");

const VerificationSchema = new mongoose.Schema({
  verificationId: {
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
  resumeHash: {
    type: String,
    required: true,
  },
  ipfsHash: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending",
  },
  verificationScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  breakdown: {
    degreeVerification: { type: Number, default: 0 },
    experienceVerification: { type: Number, default: 0 },
    identityVerification: { type: Number, default: 0 },
    documentAuthenticity: { type: Number, default: 0 },
    consistencyScore: { type: Number, default: 0 },
  },
  entities: {
    universities: [String],
    degrees: [String],
    employers: [String],
    dates: {
      education: [{
        start: String,
        end: String,
        institution: String,
      }],
      employment: [{
        start: String,
        end: String,
        employer: String,
      }],
    },
  },
  flags: {
    inconsistencies: [String],
    fraudIndicators: [String],
    warnings: [String],
  },
  evidenceHash: {
    type: String,
  },
  fdcProof: {
    degree: {
      verified: Boolean,
      university: String,
      year: String,
      proofHash: String,
      source: String,
    },
    university: {
      verified: Boolean,
      accredited: Boolean,
      accreditationBody: String,
      proofHash: String,
    },
  },
  ftsoTimestamp: {
    type: Number,
  },
  ftsoEpoch: {
    type: Number,
  },
  blockchainTx: {
    type: String,
  },
  metadata: {
    name: String,
    email: String,
    phone: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  error: {
    message: String,
    stack: String,
  },
}, {
  timestamps: true,
});

// Indexes
VerificationSchema.index({ candidateWallet: 1, createdAt: -1 });
VerificationSchema.index({ status: 1 });
VerificationSchema.index({ verificationScore: -1 });

module.exports = mongoose.model("Verification", VerificationSchema);

