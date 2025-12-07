# Verified AI Resume & Degree Checker
## Built on Flare Network | Government-Grade Fraud Detection System

[![Flare Network](https://img.shields.io/badge/Flare-Network-orange)](https://flare.network)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-blue)](https://soliditylang.org)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)

> **A tamper-proof, blockchain-powered system for detecting fake degrees, fabricated resumes, identity fraud, and fraudulent experience claims using Flare Network's unique infrastructure.**

---

## 🎯 Core Mission

Build a government-ready, tamper-proof system to detect:
- ✅ Fake degrees and diplomas
- ✅ Fabricated resumes and CVs
- ✅ Identity fraud and impersonation
- ✅ False experience claims
- ✅ Non-existent universities and institutions
- ✅ Modified or tampered documents

---

## 🔥 Why Flare Network?

Flare Network is uniquely positioned for this use case because:

1. **FAssets (Fungible Assets)**: Enables wrapping verified credentials as transferable, viewable assets
2. **FDC (Flare Data Connector)**: Provides cryptographically provable off-chain data verification
3. **FTSO (Flare Time Series Oracle)**: Adds tamper-proof timestamping for all verification records
4. **Smart Accounts**: Enables role-based, multi-signature attestation minting by government officials
5. **State Connector**: Bridges external data sources with cryptographic proofs
6. **EVM Compatibility**: Seamless integration with existing Web3 infrastructure

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React + Web3)                       │
│              MetaMask / Flare Wallet Integration                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│              Backend API (Node.js + Express)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ AI Pipeline  │  │ Resume Parser│  │ Fraud Detector│          │
│  │ (GPT-4/Claude)│  │   (PDF/AI)  │  │   (ML Rules)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│              Flare Network Integration Layer                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  FAssets │  │   FDC    │  │   FTSO   │  │   Smart  │        │
│  │  Wrapper │  │ Connector│  │  Oracle  │  │ Accounts │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│          Flare Smart Contracts (Solidity)                        │
│  • VerificationRegistry.sol                                     │
│  • AttestationNFT.sol                                           │
│  • FAssetCredentialWrapper.sol                                  │
│  • GovernmentSmartAccount.sol                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    Flare Blockchain                              │
│              (Testnet / Mainnet)                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│            External Data Sources (via FDC)                       │
│  • Government Education Databases                                │
│  • University APIs                                               │
│  • Accreditation Lists                                           │
│  • Professional Licensing Boards                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### ⚡ Fastest Way (Windows)

1. **Double-click:** `setup-everything.bat`
2. **Edit:** `backend\.env` file
3. **Start MongoDB:** `mongod`
4. **Double-click:** `start-backend.bat`
5. **Double-click:** `start-frontend.bat`
6. **Open:** http://localhost:3001

### 📋 Manual Setup

**Prerequisites:**
- Node.js 18+ and npm/yarn
- MongoDB
- MetaMask or Flare-compatible wallet (optional for basic testing)

**Commands:**

```bash
# Install all dependencies
npm install
npm run install-all

# Setup environment
copy env.example.txt backend\.env
# Edit backend/.env with your configuration

# Start MongoDB
mongod

# Start backend (Terminal 1)
cd backend
npm run dev

# Start frontend (Terminal 2)
cd frontend
npm run dev
```

**See these guides for detailed instructions:**
- [DO_EVERYTHING.md](./DO_EVERYTHING.md) - Complete command guide
- [START_HERE.md](./START_HERE.md) - Step-by-step setup
- [SETUP.md](./SETUP.md) - Detailed setup instructions

---

## 📁 Project Structure

```
verified-ai-resume-checker/
├── contracts/                 # Flare smart contracts
│   ├── contracts/
│   │   ├── VerificationRegistry.sol
│   │   ├── AttestationNFT.sol
│   │   ├── FAssetCredentialWrapper.sol
│   │   └── GovernmentSmartAccount.sol
│   ├── scripts/
│   │   └── deploy.js
│   └── hardhat.config.js
├── backend/                   # Node.js backend
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── aiVerification.js
│   │   │   ├── resumeParser.js
│   │   │   ├── fraudDetector.js
│   │   │   ├── fdcConnector.js
│   │   │   └── ftsoIntegration.js
│   │   ├── models/
│   │   └── config/
│   ├── package.json
│   └── server.js
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.js
│   └── package.json
├── docs/                      # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   ├── SECURITY.md
│   ├── HACKATHON.md
│   └── OVERVIEW.md
└── README.md
```

---

## 🔐 Key Features

### 1. AI-Powered Resume Analysis
- Natural Language Processing for entity extraction
- Inconsistency detection across resume sections
- Pattern recognition for common fraud indicators
- Semantic analysis of experience claims

### 2. Flare FDC Integration
- Cryptographically provable off-chain data verification
- Real-time queries to government databases
- University API integration
- Accreditation status verification

### 3. FTSO Timestamping
- Immutable timestamp proofs for all verifications
- Oracle-signed verification records
- Temporal fraud detection (impossible dates)

### 4. FAssets Credential Wrapping
- Verifiable credentials as transferable assets
- View-only attestations for employers
- Credential portability across platforms

### 5. Government Smart Accounts
- Multi-signature attestation minting
- Role-based access control
- Audit trail for all official verifications

---

## 📊 Verification Score System

The system generates a **Verification Score (0-100)** based on:

- **Degree Verification** (30 points): Confirmed via FDC against education databases
- **Experience Verification** (25 points): Employer validation and timeline consistency
- **Identity Verification** (20 points): ID document checks and cross-referencing
- **Document Authenticity** (15 points): PDF integrity, metadata analysis
- **Consistency Score** (10 points): Internal resume consistency checks

**Scoring Thresholds:**
- 90-100: **Highly Verified** ✅
- 70-89: **Verified** ✓
- 50-69: **Partial Verification** ⚠️
- 0-49: **Failed Verification** ❌

---

## 🔒 Security Features

- End-to-end encryption for sensitive documents
- On-chain hash storage (IPFS for full documents)
- Multi-signature government approvals
- Role-based access control
- Audit logs for all verification actions
- Tamper-proof evidence storage

---

## 📚 Documentation

- [Quick Setup Guide](./SETUP.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Security Analysis](./docs/SECURITY.md)
- [Project Overview](./docs/OVERVIEW.md)
- [Hackathon Submission](./docs/HACKATHON.md)
- [Project Summary](./PROJECT_SUMMARY.md)

---

## 🧪 Testing

```bash
# Test smart contracts
cd contracts
npx hardhat test

# Test backend API
cd backend
npm test

# Test frontend
cd frontend
npm test
```

---

## 🌐 Deployment

### Flare Testnet

See [Deployment Guide](./docs/DEPLOYMENT.md) for detailed instructions.

```bash
# Deploy to Flare Testnet
cd contracts
npx hardhat run scripts/deploy.js --network flare-testnet
```

### Flare Mainnet

```bash
# Deploy to Flare Mainnet (Production)
npx hardhat run scripts/deploy.js --network flare-mainnet
```

---

## 🎯 Use Cases

### Government
- Public sector hiring verification
- Professional licensing boards
- Immigration services
- Educational accreditation

### Enterprise
- HR departments reducing bad hires
- Background check companies
- Professional services firms
- Financial services compliance

### Individual
- Portable, verifiable credentials
- Fraud protection
- Career opportunities
- Trust in digital credentials

---

## 🔮 Future Enhancements

1. **Machine Learning Model Training**
   - Continuous improvement from fraud patterns
   - Custom ML models for specific industries

2. **Multi-Chain Support**
   - Bridge to other EVM-compatible chains
   - Cross-chain credential verification

3. **Zero-Knowledge Proofs**
   - Privacy-preserving verification
   - Selective disclosure of credentials

4. **Decentralized Identity (DID)**
   - W3C DID standard integration
   - Self-sovereign identity principles

5. **Advanced Analytics Dashboard**
   - Fraud trend analysis
   - Industry-specific reports
   - Government compliance metrics

---

## 🤝 Contributing

This is a hackathon project. Contributions are welcome! Please read our [Contributing Guidelines](./CONTRIBUTING.md).

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) file for details

---

## 🏆 Hackathon Information

- **Track**: Blockchain Infrastructure
- **Prize Category**: Best Use of Flare Network
- **Theme**: Identity Verification & Fraud Prevention

**Flare Technologies Used:**
- ✅ FAssets (Fungible Assets)
- ✅ FDC (Flare Data Connector)
- ✅ FTSO (Flare Time Series Oracle)
- ✅ Smart Accounts

---

## 👥 Team

Built with ❤️ for the Flare Network Hackathon

---

## 📞 Contact

For questions or support, please open an issue on GitHub.

---

**⚠️ Disclaimer**: This system is designed for demonstration purposes. Production deployment requires additional security audits and compliance certifications.

---

## 🌟 Star the Repository

If you find this project useful, please consider giving it a star! ⭐

---

**Last Updated**: 2024
**Version**: 1.0.0
