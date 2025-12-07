# System Architecture
## Verified AI Resume & Degree Checker on Flare Network

---

## 🏗️ High-Level Architecture

This document provides a comprehensive overview of the system architecture, components, data flows, and Flare Network integrations.

---

## 📐 System Components

### 1. Frontend Layer (React + Web3)

**Technology Stack:**
- React 18+ with hooks
- Web3.js / Ethers.js for Flare integration
- MetaMask / Flare Wallet connection
- Material-UI / Tailwind CSS for UI
- Axios for API calls

**Key Features:**
- Resume upload interface (PDF/text)
- Real-time verification status
- QR code generation for verification tokens
- Employer verification scanner
- Government dashboard for attestation minting
- Transaction status monitoring

**Component Structure:**
```
frontend/src/
├── components/
│   ├── ResumeUpload.jsx
│   ├── VerificationStatus.jsx
│   ├── VerificationQR.jsx
│   ├── EmployerScanner.jsx
│   ├── GovernmentDashboard.jsx
│   └── FlareWalletConnector.jsx
├── pages/
│   ├── CandidateDashboard.jsx
│   ├── EmployerVerification.jsx
│   └── GovernmentPortal.jsx
└── hooks/
    ├── useFlareWallet.js
    ├── useVerification.js
    └── useFAsset.js
```

---

### 2. Backend API Layer (Node.js + Express)

**Technology Stack:**
- Node.js 18+
- Express.js framework
- MongoDB / PostgreSQL for data storage
- Redis for caching
- Bull queue for async processing
- JWT for authentication

**Key Services:**

#### 2.1 AI Verification Pipeline
- **Resume Parser**: Extracts entities using NLP
- **Fraud Detector**: ML-based inconsistency detection
- **Entity Extraction**: Universities, degrees, employers, dates
- **Consistency Analyzer**: Cross-validates resume sections

#### 2.2 Flare Integration Services
- **FDC Connector**: Off-chain data verification
- **FTSO Integration**: Timestamp oracle integration
- **FAsset Service**: Credential wrapping logic
- **Smart Contract Client**: Contract interaction layer

#### 2.3 Verification Engine
- Multi-source data aggregation
- Scoring algorithm
- Evidence compilation
- Report generation

**API Endpoints:**
```
POST   /api/v1/verify/upload          # Upload resume
GET    /api/v1/verify/:id             # Get verification status
GET    /api/v1/verify/:id/score       # Get verification score
POST   /api/v1/verify/:id/attest      # Request attestation
GET    /api/v1/verify/:id/evidence    # Get evidence hash
POST   /api/v1/government/mint        # Mint attestation (gov only)
GET    /api/v1/employer/scan/:token   # Scan verification token
```

---

### 3. Flare Network Integration Layer

#### 3.1 FAssets (Fungible Assets)
**Purpose**: Wrap verified credentials as transferable assets

**Implementation:**
- Each verified credential becomes an FAsset token
- View-only access for employers
- Transferable between candidate wallets
- Metadata includes verification score and evidence hash

**Use Cases:**
- Portable credentials across platforms
- Employer verification without re-verification
- Credential history tracking

#### 3.2 FDC (Flare Data Connector)
**Purpose**: Cryptographically provable off-chain data verification

**Data Sources:**
- Government education databases
- University registrar APIs
- Professional licensing boards
- Accreditation bodies

**Flow:**
1. Backend requests verification from FDC
2. FDC queries external data sources
3. Returns signed data package with proof
4. Proof stored on-chain with verification record

**Cryptographic Proof Structure:**
```json
{
  "data": {
    "degree": "Bachelor of Science",
    "university": "State University",
    "year": "2020",
    "status": "verified"
  },
  "proof": {
    "signature": "0x...",
    "timestamp": 1234567890,
    "source": "government-db",
    "merkleRoot": "0x..."
  }
}
```

#### 3.3 FTSO (Flare Time Series Oracle)
**Purpose**: Tamper-proof timestamping for verification records

**Implementation:**
- Every verification record includes FTSO timestamp
- Oracle-signed proof of verification time
- Prevents backdating fraud
- Temporal consistency checks

**Integration Points:**
- Verification timestamp
- Attestation mint timestamp
- Evidence hash generation timestamp

#### 3.4 Flare Smart Accounts
**Purpose**: Role-based, multi-signature attestation minting

**Roles:**
- **Government Official**: Can mint attestations (multi-sig required)
- **Verifier**: Can initiate verification requests
- **Candidate**: Can upload resumes and view status
- **Employer**: Can scan and verify credentials

**Multi-Signature Flow:**
1. Government official initiates attestation mint
2. Requires 2-of-3 signatures from authorized accounts
3. Transaction executed on Flare network
4. NFT minted to candidate's address

---

### 4. Smart Contract Layer

#### 4.1 VerificationRegistry.sol
**Purpose**: Main registry for all verification records

**Key Functions:**
```solidity
struct VerificationRecord {
    address candidate;
    uint256 verificationId;
    uint8 score;              // 0-100
    bytes32 evidenceHash;     // SHA-256 of resume + report
    bytes32 fdcProofHash;     // FDC proof hash
    uint256 ftsoTimestamp;    // FTSO timestamp
    bool isAttested;
    address attestationNFT;
}
```

**Storage:**
- Mapping: `verificationId => VerificationRecord`
- Mapping: `candidate => verificationId[]`
- Array: All verification IDs

#### 4.2 AttestationNFT.sol
**Purpose**: ERC-721 NFT for verified attestations

**Metadata:**
- Verification ID
- Verification score
- Evidence hash
- FDC proof hash
- FTSO timestamp
- Issuer (government smart account)
- Issue date

**Functions:**
- `mint(address to, uint256 verificationId)` - Gov only
- `verify(uint256 tokenId)` - Check authenticity
- `getMetadata(uint256 tokenId)` - Retrieve full metadata

#### 4.3 FAssetCredentialWrapper.sol
**Purpose**: Wrap attestations as FAssets

**Implementation:**
- Converts NFT attestation to FAsset token
- Maintains reference to original NFT
- Enables view-only access permissions

#### 4.4 GovernmentSmartAccount.sol
**Purpose**: Smart account with role-based permissions

**Features:**
- Multi-signature support (2-of-3)
- Role-based access control
- Audit trail for all actions
- Time-locked operations for security

---

### 5. Data Storage Layer

#### 5.1 Primary Database (PostgreSQL/MongoDB)
**Collections/Tables:**

**Verifications:**
```javascript
{
  _id: ObjectId,
  verificationId: String,        // Unique ID
  candidateWallet: String,       // Wallet address
  resumeHash: String,            // SHA-256
  uploadedAt: Date,
  status: String,                // pending, processing, completed, failed
  verificationScore: Number,     // 0-100
  breakdown: {
    degreeVerification: Number,
    experienceVerification: Number,
    identityVerification: Number,
    documentAuthenticity: Number,
    consistencyScore: Number
  },
  entities: {
    universities: Array,
    degrees: Array,
    employers: Array,
    dates: Array
  },
  flags: {
    inconsistencies: Array,
    fraudIndicators: Array,
    warnings: Array
  },
  evidenceHash: String,          // On-chain hash
  fdcProof: Object,              // FDC response
  ftsoTimestamp: Number,         // FTSO timestamp
  blockchainTx: String,          // Transaction hash
  createdAt: Date,
  updatedAt: Date
}
```

**Attestations:**
```javascript
{
  _id: ObjectId,
  attestationId: String,
  verificationId: String,
  nftTokenId: String,
  candidateWallet: String,
  issuerWallet: String,          // Government account
  mintedAt: Date,
  blockchainTx: String
}
```

**Government Accounts:**
```javascript
{
  _id: ObjectId,
  walletAddress: String,
  role: String,                  // official, verifier, admin
  name: String,
  department: String,
  isActive: Boolean,
  createdAt: Date
}
```

#### 5.2 IPFS (InterPlanetary File System)
**Purpose**: Decentralized storage for full documents

**Storage:**
- Original resume PDF
- Complete verification report
- Evidence documents
- FDC proof documents

**Retrieval:**
- IPFS hash stored on-chain
- Content-addressed storage
- Immutable document history

---

## 🔄 System Flow

### Complete Verification Flow

```
1. Candidate Upload
   │
   ├─> Resume PDF/Text uploaded to backend
   │
   ├─> Document hash generated (SHA-256)
   │
   └─> Uploaded to IPFS, IPFS hash stored

2. AI Processing Pipeline
   │
   ├─> Resume Parser extracts entities
   │   • Universities
   │   • Degrees
   │   • Employers
   │   • Dates
   │   • Skills
   │
   ├─> Fraud Detector analyzes
   │   • Inconsistencies
   │   • Impossible dates
   │   • Pattern anomalies
   │   • Semantic contradictions
   │
   └─> Consistency Analyzer validates
       • Timeline coherence
       • Cross-section validation
       • Format standardization

3. FDC Verification (Parallel)
   │
   ├─> Query Government Education DB
   │   • Degree verification
   │   • University accreditation
   │   • Graduation year
   │
   ├─> Query University APIs
   │   • Enrollment verification
   │   • Degree confirmation
   │   • GPA validation (if available)
   │
   └─> Query Licensing Boards
       • Professional certifications
       • License status

4. Verification Score Calculation
   │
   ├─> Degree Verification: 30 points
   ├─> Experience Verification: 25 points
   ├─> Identity Verification: 20 points
   ├─> Document Authenticity: 15 points
   └─> Consistency Score: 10 points

5. Evidence Compilation
   │
   ├─> Combine resume + AI report + FDC proofs
   ├─> Generate evidence hash (SHA-256)
   └─> Upload full evidence to IPFS

6. FTSO Timestamp
   │
   ├─> Request timestamp from FTSO oracle
   ├─> Receive oracle-signed timestamp
   └─> Include in verification record

7. On-Chain Storage
   │
   ├─> Create VerificationRecord on Flare
   ├─> Store evidence hash
   ├─> Store FDC proof hash
   ├─> Store FTSO timestamp
   └─> Link to candidate wallet

8. Attestation Request (if score > 70)
   │
   ├─> Candidate requests attestation
   ├─> Government official reviews
   ├─> Multi-signature approval (2-of-3)
   └─> NFT minted via Smart Account

9. FAsset Wrapping (Optional)
   │
   ├─> Wrap NFT as FAsset token
   ├─> Enable view-only permissions
   └─> Make credential portable
```

---

## 🔐 Security Architecture

### Encryption Layers

1. **In-Transit**: TLS 1.3 for all API communications
2. **At-Rest**: AES-256 encryption for sensitive database fields
3. **On-Chain**: Cryptographic hashes (SHA-256) for document integrity
4. **Access Control**: JWT tokens with role-based permissions

### Authentication & Authorization

- **Candidates**: Wallet signature verification
- **Employers**: API key authentication
- **Government**: Multi-signature smart account verification
- **Backend Services**: Service-to-service API keys

### Audit Trail

- All verification actions logged
- Blockchain transaction history
- IPFS content addressing ensures immutability
- Database audit logs with timestamps

---

## 🚀 Scalability Considerations

### Horizontal Scaling
- Backend API: Stateless design, can scale horizontally
- Database: Read replicas for query distribution
- IPFS: Distributed storage, inherent scalability

### Caching Strategy
- Redis cache for frequently accessed verifications
- CDN for static frontend assets
- Database query result caching

### Async Processing
- Bull queue for AI processing tasks
- Event-driven architecture for FDC callbacks
- WebSocket for real-time status updates

---

## 🔗 Flare Network Integration Details

### Network Configuration

**Testnet:**
- RPC URL: `https://coston2-api.flare.network/ext/bc/C/rpc`
- Chain ID: 114
- Explorer: `https://coston2-explorer.flare.network`

**Mainnet:**
- RPC URL: `https://flare-api.flare.network/ext/bc/C/rpc`
- Chain ID: 14
- Explorer: `https://flare-explorer.flare.network`

### Contract Deployment

1. Deploy VerificationRegistry
2. Deploy AttestationNFT
3. Deploy FAssetCredentialWrapper
4. Deploy GovernmentSmartAccount
5. Configure contract addresses in backend

### Gas Optimization

- Batch operations where possible
- Use events for off-chain indexing
- Optimize storage patterns
- Leverage Flare's low gas costs

---

## 📊 Monitoring & Analytics

### Metrics Tracked

- Verification success rate
- Average verification time
- Fraud detection accuracy
- Blockchain transaction costs
- API response times
- FDC query success rate
- FTSO timestamp accuracy

### Logging

- Structured JSON logs
- Error tracking (Sentry integration)
- Performance monitoring
- Security event logging

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

## 📚 References

- [Flare Network Documentation](https://docs.flare.network)
- [FAssets Specification](https://docs.flare.network/fassets)
- [FDC Documentation](https://docs.flare.network/fdc)
- [FTSO Documentation](https://docs.flare.network/ftso)
- [Smart Accounts](https://docs.flare.network/smart-contracts)

---

**Last Updated**: 2024
**Version**: 1.0.0

