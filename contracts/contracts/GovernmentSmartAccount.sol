// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "./AttestationNFT.sol";

/**
 * @title GovernmentSmartAccount
 * @notice Multi-signature smart account for government officials
 * @dev Enforces role-based permissions and multi-signature operations for attestation minting
 */
contract GovernmentSmartAccount is AccessControl {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // Events
    event AttestationRequested(
        uint256 indexed verificationId,
        address indexed candidate,
        address indexed requester,
        uint256 timestamp
    );
    
    event AttestationApproved(
        uint256 indexed verificationId,
        address indexed approver,
        uint256 approvalCount,
        uint256 requiredApprovals
    );
    
    event AttestationMinted(
        uint256 indexed verificationId,
        uint256 indexed tokenId,
        address indexed candidate
    );
    
    event RoleGranted(
        bytes32 indexed role,
        address indexed account,
        address indexed admin
    );
    
    event RoleRevoked(
        bytes32 indexed role,
        address indexed account,
        address indexed admin
    );

    // Roles
    bytes32 public constant GOVERNMENT_OFFICIAL_ROLE = keccak256("GOVERNMENT_OFFICIAL_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Structs
    struct AttestationRequest {
        uint256 verificationId;
        address candidate;
        address requester;
        uint256 createdAt;
        bool isMinted;
        uint256 tokenId;
        mapping(address => bool) approvals;
        address[] approvers;
    }

    // State variables
    AttestationNFT public attestationNFT;
    mapping(uint256 => AttestationRequest) public attestationRequests;
    uint256[] public allRequestIds;
    uint256 private nextRequestId;
    
    uint256 public requiredApprovals = 2; // 2-of-3 multi-signature
    uint256 public requestExpiryDuration = 7 days;
    bool public paused;

    // Modifiers
    modifier onlyOfficial() {
        require(hasRole(GOVERNMENT_OFFICIAL_ROLE, msg.sender), "Not a government official");
        _;
    }
    
    modifier onlyVerifier() {
        require(hasRole(VERIFIER_ROLE, msg.sender) || hasRole(GOVERNMENT_OFFICIAL_ROLE, msg.sender), "Not authorized");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    constructor(address _attestationNFT) {
        require(_attestationNFT != address(0), "Invalid NFT contract");
        attestationNFT = AttestationNFT(_attestationNFT);
        
        // Grant admin role to deployer
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        
        paused = false;
    }

    /**
     * @notice Request an attestation to be minted
     * @param verificationId The verification ID
     * @param candidate Address of the candidate
     */
    function requestAttestation(
        uint256 verificationId,
        address candidate
    ) external onlyVerifier whenNotPaused returns (uint256) {
        require(candidate != address(0), "Invalid candidate");
        
        uint256 requestId = nextRequestId++;
        
        AttestationRequest storage request = attestationRequests[requestId];
        request.verificationId = verificationId;
        request.candidate = candidate;
        request.requester = msg.sender;
        request.createdAt = block.timestamp;
        request.isMinted = false;
        
        allRequestIds.push(requestId);
        
        emit AttestationRequested(
            verificationId,
            candidate,
            msg.sender,
            block.timestamp
        );
        
        return requestId;
    }

    /**
     * @notice Approve an attestation request (government official only)
     * @param requestId The request ID
     */
    function approveAttestation(uint256 requestId) external onlyOfficial whenNotPaused {
        AttestationRequest storage request = attestationRequests[requestId];
        require(request.verificationId != 0, "Request not found");
        require(!request.isMinted, "Already minted");
        require(
            block.timestamp <= request.createdAt + requestExpiryDuration,
            "Request expired"
        );
        require(!request.approvals[msg.sender], "Already approved");
        
        request.approvals[msg.sender] = true;
        request.approvers.push(msg.sender);
        
        uint256 approvalCount = request.approvers.length;
        
        emit AttestationApproved(
            request.verificationId,
            msg.sender,
            approvalCount,
            requiredApprovals
        );
        
        // Auto-mint if we have enough approvals
        if (approvalCount >= requiredApprovals) {
            _mintAttestation(requestId);
        }
    }

    /**
     * @notice Mint attestation after sufficient approvals
     */
    function _mintAttestation(uint256 requestId) internal {
        AttestationRequest storage request = attestationRequests[requestId];
        require(!request.isMinted, "Already minted");
        
        // Construct IPFS URI (would be generated off-chain)
        string memory tokenURI = _generateTokenURI(request.verificationId);
        
        // Mint the NFT
        uint256 tokenId = attestationNFT.mint(
            request.candidate,
            request.verificationId,
            tokenURI
        );
        
        request.isMinted = true;
        request.tokenId = tokenId;
        
        emit AttestationMinted(
            request.verificationId,
            tokenId,
            request.candidate
        );
    }

    /**
     * @notice Manually mint if approvals are sufficient
     */
    function mintAttestation(uint256 requestId) external onlyOfficial whenNotPaused {
        AttestationRequest storage request = attestationRequests[requestId];
        require(!request.isMinted, "Already minted");
        require(
            request.approvers.length >= requiredApprovals,
            "Insufficient approvals"
        );
        
        _mintAttestation(requestId);
    }

    /**
     * @notice Generate token URI (placeholder - should be IPFS hash in production)
     */
    function _generateTokenURI(uint256 verificationId) 
        internal 
        pure 
        returns (string memory) 
    {
        // In production, this would return the actual IPFS URI
        return string(abi.encodePacked("ipfs://verification/", _uint2str(verificationId)));
    }

    /**
     * @notice Convert uint to string
     */
    function _uint2str(uint256 _i) 
        internal 
        pure 
        returns (string memory) 
    {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    /**
     * @notice Get request details
     */
    function getRequest(uint256 requestId) 
        external 
        view 
        returns (
            uint256 verificationId,
            address candidate,
            address requester,
            uint256 createdAt,
            bool isMinted,
            uint256 tokenId,
            uint256 approvalCount,
            address[] memory approvers
        ) 
    {
        AttestationRequest storage request = attestationRequests[requestId];
        require(request.verificationId != 0, "Request not found");
        
        return (
            request.verificationId,
            request.candidate,
            request.requester,
            request.createdAt,
            request.isMinted,
            request.tokenId,
            request.approvers.length,
            request.approvers
        );
    }

    /**
     * @notice Set required number of approvals
     */
    function setRequiredApprovals(uint256 _required) external onlyRole(ADMIN_ROLE) {
        require(_required > 0 && _required <= 5, "Invalid approval count");
        requiredApprovals = _required;
    }

    /**
     * @notice Set request expiry duration
     */
    function setRequestExpiryDuration(uint256 _duration) external onlyRole(ADMIN_ROLE) {
        require(_duration > 0, "Invalid duration");
        requestExpiryDuration = _duration;
    }

    /**
     * @notice Add a government official
     */
    function addGovernmentOfficial(address official) external onlyRole(ADMIN_ROLE) {
        require(official != address(0), "Invalid address");
        grantRole(GOVERNMENT_OFFICIAL_ROLE, official);
    }

    /**
     * @notice Remove a government official
     */
    function removeGovernmentOfficial(address official) external onlyRole(ADMIN_ROLE) {
        revokeRole(GOVERNMENT_OFFICIAL_ROLE, official);
    }

    /**
     * @notice Add a verifier
     */
    function addVerifier(address verifier) external onlyRole(ADMIN_ROLE) {
        require(verifier != address(0), "Invalid address");
        grantRole(VERIFIER_ROLE, verifier);
    }

    /**
     * @notice Remove a verifier
     */
    function removeVerifier(address verifier) external onlyRole(ADMIN_ROLE) {
        revokeRole(VERIFIER_ROLE, verifier);
    }

    /**
     * @notice Pause the contract
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        paused = true;
    }

    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        paused = false;
    }

    /**
     * @notice Check if a request has expired
     */
    function isRequestExpired(uint256 requestId) external view returns (bool) {
        AttestationRequest storage request = attestationRequests[requestId];
        if (request.verificationId == 0) return false;
        return block.timestamp > request.createdAt + requestExpiryDuration;
    }
}

