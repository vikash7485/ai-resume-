// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VerificationRegistry
 * @notice Main registry for all verification records on Flare Network
 * @dev Stores verification records with evidence hashes, FDC proofs, and FTSO timestamps
 */
contract VerificationRegistry {
    
    // Events
    event VerificationRecorded(
        uint256 indexed verificationId,
        address indexed candidate,
        uint8 score,
        bytes32 evidenceHash,
        bytes32 fdcProofHash,
        uint256 ftsoTimestamp,
        address indexed recordedBy
    );
    
    event AttestationLinked(
        uint256 indexed verificationId,
        address indexed attestationNFT,
        uint256 tokenId
    );

    // Structs
    struct VerificationRecord {
        address candidate;              // Wallet address of the candidate
        uint256 verificationId;         // Unique verification identifier
        uint8 score;                    // Verification score (0-100)
        bytes32 evidenceHash;           // SHA-256 hash of resume + AI report
        bytes32 fdcProofHash;           // Hash of FDC cryptographic proof
        uint256 ftsoTimestamp;          // FTSO oracle timestamp
        bool isAttested;                // Whether attestation NFT has been minted
        address attestationNFT;         // Address of the attestation NFT contract
        uint256 attestationTokenId;     // Token ID of the attestation NFT
        uint256 createdAt;              // Block timestamp of creation
        address recordedBy;             // Address that recorded this verification
    }

    // State variables
    mapping(uint256 => VerificationRecord) public verifications;
    mapping(address => uint256[]) public candidateVerifications;
    uint256[] public allVerificationIds;
    uint256 private nextVerificationId;
    
    address public owner;
    address public attestationNFTContract;
    bool public paused;

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyAttestationNFT() {
        require(msg.sender == attestationNFTContract, "Only attestation NFT");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    constructor() {
        owner = msg.sender;
        nextVerificationId = 1;
        paused = false;
    }

    /**
     * @notice Record a new verification on-chain
     * @param candidate Address of the candidate being verified
     * @param score Verification score (0-100)
     * @param evidenceHash SHA-256 hash of combined resume + AI report
     * @param fdcProofHash Hash of FDC cryptographic proof
     * @param ftsoTimestamp FTSO oracle timestamp
     */
    function recordVerification(
        address candidate,
        uint8 score,
        bytes32 evidenceHash,
        bytes32 fdcProofHash,
        uint256 ftsoTimestamp
    ) external whenNotPaused returns (uint256) {
        require(candidate != address(0), "Invalid candidate address");
        require(score <= 100, "Score must be <= 100");
        require(evidenceHash != bytes32(0), "Evidence hash required");
        require(ftsoTimestamp > 0, "FTSO timestamp required");
        
        uint256 verificationId = nextVerificationId++;
        
        VerificationRecord memory record = VerificationRecord({
            candidate: candidate,
            verificationId: verificationId,
            score: score,
            evidenceHash: evidenceHash,
            fdcProofHash: fdcProofHash,
            ftsoTimestamp: ftsoTimestamp,
            isAttested: false,
            attestationNFT: address(0),
            attestationTokenId: 0,
            createdAt: block.timestamp,
            recordedBy: msg.sender
        });
        
        verifications[verificationId] = record;
        candidateVerifications[candidate].push(verificationId);
        allVerificationIds.push(verificationId);
        
        emit VerificationRecorded(
            verificationId,
            candidate,
            score,
            evidenceHash,
            fdcProofHash,
            ftsoTimestamp,
            msg.sender
        );
        
        return verificationId;
    }

    /**
     * @notice Link an attestation NFT to a verification record
     * @param verificationId The verification ID
     * @param tokenId The NFT token ID
     */
    function linkAttestation(
        uint256 verificationId,
        uint256 tokenId
    ) external onlyAttestationNFT {
        require(verifications[verificationId].verificationId != 0, "Verification not found");
        require(!verifications[verificationId].isAttested, "Already attested");
        
        verifications[verificationId].isAttested = true;
        verifications[verificationId].attestationNFT = msg.sender;
        verifications[verificationId].attestationTokenId = tokenId;
        
        emit AttestationLinked(
            verificationId,
            msg.sender,
            tokenId
        );
    }

    /**
     * @notice Get verification record by ID
     */
    function getVerification(uint256 verificationId) 
        external 
        view 
        returns (VerificationRecord memory) 
    {
        require(verifications[verificationId].verificationId != 0, "Verification not found");
        return verifications[verificationId];
    }

    /**
     * @notice Get all verification IDs for a candidate
     */
    function getCandidateVerifications(address candidate) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return candidateVerifications[candidate];
    }

    /**
     * @notice Get total number of verifications
     */
    function getTotalVerifications() external view returns (uint256) {
        return allVerificationIds.length;
    }

    /**
     * @notice Set the attestation NFT contract address
     */
    function setAttestationNFTContract(address _contract) external onlyOwner {
        require(_contract != address(0), "Invalid address");
        attestationNFTContract = _contract;
    }

    /**
     * @notice Pause the contract
     */
    function pause() external onlyOwner {
        paused = true;
    }

    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        paused = false;
    }

    /**
     * @notice Transfer ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}

