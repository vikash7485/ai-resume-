// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./VerificationRegistry.sol";

/**
 * @title AttestationNFT
 * @notice ERC-721 NFT representing a verified resume/degree attestation
 * @dev Minted by government smart accounts after verification approval
 */
contract AttestationNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    // Events
    event AttestationMinted(
        uint256 indexed tokenId,
        uint256 indexed verificationId,
        address indexed recipient,
        address issuer,
        uint256 timestamp
    );
    
    event AttestationRevoked(
        uint256 indexed tokenId,
        address indexed revokedBy,
        string reason
    );

    // Structs
    struct AttestationMetadata {
        uint256 verificationId;
        uint8 verificationScore;
        bytes32 evidenceHash;
        bytes32 fdcProofHash;
        uint256 ftsoTimestamp;
        address issuer;
        uint256 issuedAt;
        bool isRevoked;
        string revokeReason;
    }

    // State variables
    Counters.Counter private _tokenIdCounter;
    VerificationRegistry public verificationRegistry;
    address public governmentSmartAccount;
    
    mapping(uint256 => AttestationMetadata) public attestationMetadata;
    mapping(uint256 => uint256) public verificationToToken; // verificationId => tokenId
    
    bool public paused;

    // Modifiers
    modifier onlyGovernmentAccount() {
        require(msg.sender == governmentSmartAccount, "Only government account");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    constructor(
        address _verificationRegistry,
        address _governmentSmartAccount
    ) ERC721("Verified Resume Attestation", "VRA") Ownable(msg.sender) {
        require(_verificationRegistry != address(0), "Invalid registry address");
        require(_governmentSmartAccount != address(0), "Invalid government address");
        
        verificationRegistry = VerificationRegistry(_verificationRegistry);
        governmentSmartAccount = _governmentSmartAccount;
        paused = false;
    }

    /**
     * @notice Mint a new attestation NFT
     * @param recipient Address to receive the NFT
     * @param verificationId The verification ID from the registry
     * @param tokenURI IPFS URI for NFT metadata
     */
    function mint(
        address recipient,
        uint256 verificationId,
        string memory tokenURI
    ) external onlyGovernmentAccount whenNotPaused returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(verificationToToken[verificationId] == 0, "Already minted");
        
        // Verify the verification record exists
        VerificationRegistry.VerificationRecord memory record = 
            verificationRegistry.getVerification(verificationId);
        require(record.verificationId != 0, "Verification not found");
        
        // Mint the token
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        // Store metadata
        attestationMetadata[tokenId] = AttestationMetadata({
            verificationId: verificationId,
            verificationScore: record.score,
            evidenceHash: record.evidenceHash,
            fdcProofHash: record.fdcProofHash,
            ftsoTimestamp: record.ftsoTimestamp,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            isRevoked: false,
            revokeReason: ""
        });
        
        verificationToToken[verificationId] = tokenId;
        
        // Link attestation in registry
        verificationRegistry.linkAttestation(verificationId, tokenId);
        
        emit AttestationMinted(
            tokenId,
            verificationId,
            recipient,
            msg.sender,
            block.timestamp
        );
        
        return tokenId;
    }

    /**
     * @notice Revoke an attestation (government only)
     * @param tokenId The token ID to revoke
     * @param reason Reason for revocation
     */
    function revoke(
        uint256 tokenId,
        string memory reason
    ) external onlyGovernmentAccount {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(!attestationMetadata[tokenId].isRevoked, "Already revoked");
        
        attestationMetadata[tokenId].isRevoked = true;
        attestationMetadata[tokenId].revokeReason = reason;
        
        emit AttestationRevoked(tokenId, msg.sender, reason);
    }

    /**
     * @notice Check if an attestation is valid
     */
    function isValid(uint256 tokenId) external view returns (bool) {
        if (_ownerOf(tokenId) == address(0)) return false;
        return !attestationMetadata[tokenId].isRevoked;
    }

    /**
     * @notice Get full attestation metadata
     */
    function getMetadata(uint256 tokenId) 
        external 
        view 
        returns (AttestationMetadata memory) 
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return attestationMetadata[tokenId];
    }

    /**
     * @notice Get token ID from verification ID
     */
    function getTokenByVerification(uint256 verificationId) 
        external 
        view 
        returns (uint256) 
    {
        uint256 tokenId = verificationToToken[verificationId];
        require(tokenId != 0, "No token for this verification");
        return tokenId;
    }

    /**
     * @notice Set government smart account address
     */
    function setGovernmentSmartAccount(address _account) external onlyOwner {
        require(_account != address(0), "Invalid address");
        governmentSmartAccount = _account;
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
     * @notice Override to prevent transfers of revoked tokens
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        require(
            !attestationMetadata[tokenId].isRevoked || to == address(0),
            "Cannot transfer revoked attestation"
        );
        return super._update(to, tokenId, auth);
    }
}

