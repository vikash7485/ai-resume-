# API Documentation
## Verified AI Resume & Degree Checker API

Base URL: `https://api.verifiedresume.flare.network/api/v1`

---

## Authentication

Most endpoints require authentication via JWT token or wallet signature.

### Wallet Authentication
```http
POST /api/v1/auth/wallet
Content-Type: application/json

{
  "address": "0x...",
  "signature": "0x...",
  "message": "Sign in to Verified Resume"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "address": "0x...",
    "role": "candidate"
  }
}
```

### API Key Authentication
```http
Authorization: Bearer <JWT_TOKEN>
```

---

## Endpoints

### 1. Resume Verification

#### Upload Resume
```http
POST /api/v1/verify/upload
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

{
  "resume": <FILE>,
  "candidateWallet": "0x...",
  "metadata": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Response:**
```json
{
  "verificationId": "ver_abc123...",
  "status": "processing",
  "uploadedAt": "2024-01-15T10:30:00Z",
  "resumeHash": "0xabc123...",
  "ipfsHash": "QmXyz..."
}
```

#### Get Verification Status
```http
GET /api/v1/verify/:verificationId
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "verificationId": "ver_abc123...",
  "status": "completed",
  "verificationScore": 87,
  "breakdown": {
    "degreeVerification": 28,
    "experienceVerification": 23,
    "identityVerification": 18,
    "documentAuthenticity": 13,
    "consistencyScore": 5
  },
  "entities": {
    "universities": ["State University"],
    "degrees": ["Bachelor of Science in Computer Science"],
    "employers": ["Tech Corp", "Startup Inc"],
    "dates": {
      "education": [{"start": "2016", "end": "2020"}],
      "employment": [{"start": "2020", "end": "2024"}]
    }
  },
  "flags": {
    "inconsistencies": [],
    "fraudIndicators": [],
    "warnings": ["GPA not verified"]
  },
  "evidenceHash": "0xdef456...",
  "fdcProof": {
    "degree": {
      "verified": true,
      "university": "State University",
      "year": "2020",
      "proofHash": "0x..."
    }
  },
  "ftsoTimestamp": 1705321800,
  "blockchainTx": "0x789abc...",
  "createdAt": "2024-01-15T10:30:00Z",
  "completedAt": "2024-01-15T10:35:00Z"
}
```

#### Get Verification Score
```http
GET /api/v1/verify/:verificationId/score
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "verificationId": "ver_abc123...",
  "score": 87,
  "status": "verified",
  "threshold": 70,
  "breakdown": {
    "degreeVerification": {
      "score": 28,
      "maxScore": 30,
      "details": {
        "universityVerified": true,
        "degreeVerified": true,
        "yearVerified": true
      }
    },
    "experienceVerification": {
      "score": 23,
      "maxScore": 25,
      "details": {
        "employersVerified": 2,
        "totalEmployers": 2,
        "timelineConsistent": true
      }
    },
    "identityVerification": {
      "score": 18,
      "maxScore": 20,
      "details": {
        "nameConsistent": true,
        "documentValid": true
      }
    },
    "documentAuthenticity": {
      "score": 13,
      "maxScore": 15,
      "details": {
        "pdfValid": true,
        "metadataConsistent": true,
        "noTampering": true
      }
    },
    "consistencyScore": {
      "score": 5,
      "maxScore": 10,
      "details": {
        "internalConsistency": 0.5
      }
    }
  }
}
```

#### Get Evidence Hash
```http
GET /api/v1/verify/:verificationId/evidence
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "verificationId": "ver_abc123...",
  "evidenceHash": "0xdef456...",
  "ipfsHash": "QmXyz...",
  "components": {
    "resumeHash": "0xabc123...",
    "aiReportHash": "0xdef789...",
    "fdcProofHash": "0xghi012..."
  },
  "blockchainTx": "0x789abc..."
}
```

---

### 2. Attestation Management

#### Request Attestation
```http
POST /api/v1/verify/:verificationId/attest
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "candidateWallet": "0x...",
  "priority": "normal"
}
```

**Response:**
```json
{
  "attestationRequestId": "att_req_xyz...",
  "verificationId": "ver_abc123...",
  "status": "pending_review",
  "submittedAt": "2024-01-15T11:00:00Z",
  "estimatedReviewTime": "24 hours"
}
```

---

### 3. Government Portal

#### Mint Attestation
```http
POST /api/v1/government/mint
Authorization: Bearer <GOV_JWT_TOKEN>
Content-Type: application/json

{
  "verificationId": "ver_abc123...",
  "candidateWallet": "0x...",
  "signatures": [
    {
      "address": "0x...",
      "signature": "0x..."
    },
    {
      "address": "0x...",
      "signature": "0x..."
    }
  ]
}
```

**Response:**
```json
{
  "attestationId": "att_xyz789...",
  "nftTokenId": "12345",
  "verificationId": "ver_abc123...",
  "candidateWallet": "0x...",
  "blockchainTx": "0xdef789...",
  "mintedAt": "2024-01-15T12:00:00Z",
  "contractAddress": "0x..."
}
```

#### Get Pending Attestations
```http
GET /api/v1/government/pending
Authorization: Bearer <GOV_JWT_TOKEN>
```

**Response:**
```json
{
  "pending": [
    {
      "attestationRequestId": "att_req_xyz...",
      "verificationId": "ver_abc123...",
      "candidateWallet": "0x...",
      "verificationScore": 87,
      "submittedAt": "2024-01-15T11:00:00Z",
      "priority": "normal"
    }
  ],
  "total": 15
}
```

---

### 4. Employer Verification

#### Scan Verification Token
```http
GET /api/v1/employer/scan/:token
Authorization: Bearer <EMPLOYER_API_KEY>
```

**Response:**
```json
{
  "token": "qr_abc123...",
  "valid": true,
  "verification": {
    "verificationId": "ver_abc123...",
    "verificationScore": 87,
    "status": "verified",
    "evidenceHash": "0xdef456...",
    "fdcProof": {
      "degree": {
        "verified": true,
        "university": "State University",
        "year": "2020"
      }
    },
    "ftsoTimestamp": 1705321800,
    "blockchainTx": "0x789abc..."
  },
  "attestation": {
    "nftTokenId": "12345",
    "mintedAt": "2024-01-15T12:00:00Z",
    "issuer": "0x...",
    "contractAddress": "0x..."
  },
  "scannedAt": "2024-01-16T09:00:00Z"
}
```

#### Verify NFT Token
```http
GET /api/v1/employer/verify-nft/:tokenId
Authorization: Bearer <EMPLOYER_API_KEY>
```

**Response:**
```json
{
  "tokenId": "12345",
  "valid": true,
  "onChain": true,
  "metadata": {
    "verificationId": "ver_abc123...",
    "verificationScore": 87,
    "evidenceHash": "0xdef456...",
    "fdcProofHash": "0x...",
    "ftsoTimestamp": 1705321800,
    "issuer": "0x...",
    "issueDate": "2024-01-15T12:00:00Z"
  },
  "blockchain": {
    "contractAddress": "0x...",
    "owner": "0x...",
    "tokenURI": "ipfs://QmXyz..."
  }
}
```

---

### 5. FDC Integration

#### Get FDC Proof Status
```http
GET /api/v1/fdc/proof/:verificationId
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "verificationId": "ver_abc123...",
  "fdcProof": {
    "degree": {
      "verified": true,
      "source": "government-db",
      "data": {
        "degree": "Bachelor of Science",
        "university": "State University",
        "year": "2020"
      },
      "proof": {
        "signature": "0x...",
        "timestamp": 1705321800,
        "merkleRoot": "0x..."
      }
    },
    "university": {
      "verified": true,
      "source": "accreditation-list",
      "data": {
        "name": "State University",
        "accredited": true,
        "accreditationBody": "Regional Board"
      },
      "proof": {
        "signature": "0x...",
        "timestamp": 1705321800
      }
    }
  },
  "status": "completed"
}
```

---

### 6. FTSO Integration

#### Get FTSO Timestamp
```http
GET /api/v1/ftso/timestamp/:verificationId
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "verificationId": "ver_abc123...",
  "ftsoTimestamp": 1705321800,
  "oracleSignature": "0x...",
  "epoch": 12345,
  "confidence": 0.99,
  "verified": true
}
```

---

### 7. FAssets Integration

#### Wrap Credential as FAsset
```http
POST /api/v1/fassets/wrap
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "nftTokenId": "12345",
  "candidateWallet": "0x...",
  "viewOnly": true
}
```

**Response:**
```json
{
  "fAssetTokenId": "fasset_xyz...",
  "nftTokenId": "12345",
  "wrappedAt": "2024-01-15T13:00:00Z",
  "viewOnly": true,
  "blockchainTx": "0x..."
}
```

#### Get FAsset Details
```http
GET /api/v1/fassets/:tokenId
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "fAssetTokenId": "fasset_xyz...",
  "nftTokenId": "12345",
  "verificationId": "ver_abc123...",
  "viewOnly": true,
  "owner": "0x...",
  "metadata": {
    "verificationScore": 87,
    "evidenceHash": "0xdef456...",
    "ftsoTimestamp": 1705321800
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes

- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service temporarily unavailable

### Example Error Response

```json
{
  "error": {
    "code": "VERIFICATION_NOT_FOUND",
    "message": "Verification with ID 'ver_abc123' not found",
    "details": {
      "verificationId": "ver_abc123"
    }
  }
}
```

---

## Rate Limits

- **Free Tier**: 10 requests/minute
- **Employer Tier**: 100 requests/minute
- **Government Tier**: Unlimited

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705321800
```

---

## Webhooks

### Verification Complete
```http
POST <WEBHOOK_URL>
Content-Type: application/json

{
  "event": "verification.completed",
  "verificationId": "ver_abc123...",
  "score": 87,
  "status": "verified",
  "timestamp": "2024-01-15T10:35:00Z"
}
```

### Attestation Minted
```http
POST <WEBHOOK_URL>
Content-Type: application/json

{
  "event": "attestation.minted",
  "attestationId": "att_xyz789...",
  "nftTokenId": "12345",
  "verificationId": "ver_abc123...",
  "blockchainTx": "0xdef789...",
  "timestamp": "2024-01-15T12:00:00Z"
}
```

---

## SDK Examples

### JavaScript/TypeScript

```javascript
import { VerifiedResumeClient } from '@verifiedresume/sdk';

const client = new VerifiedResumeClient({
  apiKey: 'your-api-key',
  network: 'flare-testnet'
});

// Upload resume
const verification = await client.verify.upload({
  resume: fileBuffer,
  candidateWallet: '0x...',
  metadata: {
    name: 'John Doe',
    email: 'john@example.com'
  }
});

// Check status
const status = await client.verify.getStatus(verification.verificationId);

// Scan token (employer)
const result = await client.employer.scanToken('qr_abc123...');
```

---

**API Version**: v1
**Last Updated**: 2024

