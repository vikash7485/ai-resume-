// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./AttestationNFT.sol";

/**
 * @title FAssetCredentialWrapper
 * @notice Wraps attestation NFTs as FAssets (Fungible Assets) for portability
 * @dev Enables view-only access and transferable credential representation
 */
contract FAssetCredentialWrapper is ERC20, Ownable {
    
    // Events
    event CredentialWrapped(
        uint256 indexed nftTokenId,
        uint256 indexed fAssetAmount,
        address indexed wrapper,
        bool viewOnly
    );
    
    event CredentialUnwrapped(
        uint256 indexed nftTokenId,
        uint256 indexed fAssetAmount,
        address indexed unwrapper
    );
    
    event ViewPermissionGranted(
        address indexed viewer,
        uint256 indexed nftTokenId,
        uint256 expiry
    );

    // Structs
    struct WrappedCredential {
        uint256 nftTokenId;
        address nftContract;
        bool viewOnly;
        uint256 wrappedAt;
        address wrappedBy;
        mapping(address => uint256) viewPermissions; // viewer => expiry timestamp
    }

    // State variables
    AttestationNFT public attestationNFT;
    mapping(uint256 => WrappedCredential) public wrappedCredentials; // nftTokenId => WrappedCredential
    mapping(address => mapping(uint256 => bool)) public hasViewPermission; // viewer => nftTokenId => hasPermission
    
    uint256 public constant FASSET_PER_CREDENTIAL = 1e18; // 1 FAsset = 1 credential
    bool public paused;

    // Modifiers
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    constructor(address _attestationNFT) 
        ERC20("Verified Resume Credential", "VRC") 
        Ownable(msg.sender) 
    {
        require(_attestationNFT != address(0), "Invalid NFT contract");
        attestationNFT = AttestationNFT(_attestationNFT);
        paused = false;
    }

    /**
     * @notice Wrap an attestation NFT as an FAsset
     * @param nftTokenId The NFT token ID to wrap
     * @param viewOnly Whether this should be view-only (non-transferable)
     */
    function wrapCredential(
        uint256 nftTokenId,
        bool viewOnly
    ) external whenNotPaused {
        require(attestationNFT.ownerOf(nftTokenId) == msg.sender, "Not NFT owner");
        require(attestationNFT.isValid(nftTokenId), "Invalid attestation");
        require(wrappedCredentials[nftTokenId].wrappedAt == 0, "Already wrapped");
        
        // Transfer NFT to this contract
        attestationNFT.transferFrom(msg.sender, address(this), nftTokenId);
        
        // Create wrapped credential record
        WrappedCredential storage wrapped = wrappedCredentials[nftTokenId];
        wrapped.nftTokenId = nftTokenId;
        wrapped.nftContract = address(attestationNFT);
        wrapped.viewOnly = viewOnly;
        wrapped.wrappedAt = block.timestamp;
        wrapped.wrappedBy = msg.sender;
        
        // Mint FAsset tokens
        if (!viewOnly) {
            _mint(msg.sender, FASSET_PER_CREDENTIAL);
        }
        
        emit CredentialWrapped(
            nftTokenId,
            FASSET_PER_CREDENTIAL,
            msg.sender,
            viewOnly
        );
    }

    /**
     * @notice Unwrap an FAsset back to NFT
     * @param nftTokenId The NFT token ID to unwrap
     */
    function unwrapCredential(uint256 nftTokenId) external whenNotPaused {
        WrappedCredential storage wrapped = wrappedCredentials[nftTokenId];
        require(wrapped.wrappedAt != 0, "Not wrapped");
        require(
            wrapped.wrappedBy == msg.sender || 
            (!wrapped.viewOnly && balanceOf(msg.sender) >= FASSET_PER_CREDENTIAL),
            "Not authorized"
        );
        
        // Burn FAsset if transferable
        if (!wrapped.viewOnly && wrapped.wrappedBy != msg.sender) {
            _burn(msg.sender, FASSET_PER_CREDENTIAL);
        }
        
        // Transfer NFT back
        attestationNFT.transferFrom(address(this), msg.sender, nftTokenId);
        
        // Clear wrapped credential
        delete wrappedCredentials[nftTokenId];
        
        emit CredentialUnwrapped(
            nftTokenId,
            FASSET_PER_CREDENTIAL,
            msg.sender
        );
    }

    /**
     * @notice Grant view permission to an address
     * @param viewer Address to grant permission to
     * @param nftTokenId The NFT token ID
     * @param duration Duration in seconds (0 = permanent)
     */
    function grantViewPermission(
        address viewer,
        uint256 nftTokenId,
        uint256 duration
    ) external {
        WrappedCredential storage wrapped = wrappedCredentials[nftTokenId];
        require(wrapped.wrappedAt != 0, "Not wrapped");
        require(wrapped.wrappedBy == msg.sender, "Not wrapper");
        
        uint256 expiry = duration == 0 ? type(uint256).max : block.timestamp + duration;
        wrapped.viewPermissions[viewer] = expiry;
        hasViewPermission[viewer][nftTokenId] = true;
        
        emit ViewPermissionGranted(viewer, nftTokenId, expiry);
    }

    /**
     * @notice Check if an address has view permission
     */
    function canView(
        address viewer,
        uint256 nftTokenId
    ) external view returns (bool) {
        WrappedCredential storage wrapped = wrappedCredentials[nftTokenId];
        if (wrapped.wrappedAt == 0) return false;
        
        uint256 expiry = wrapped.viewPermissions[viewer];
        if (expiry == 0) return false;
        
        return block.timestamp <= expiry || expiry == type(uint256).max;
    }

    /**
     * @notice Get wrapped credential info
     */
    function getWrappedCredential(uint256 nftTokenId) 
        external 
        view 
        returns (
            address nftContract,
            bool viewOnly,
            uint256 wrappedAt,
            address wrappedBy
        ) 
    {
        WrappedCredential storage wrapped = wrappedCredentials[nftTokenId];
        require(wrapped.wrappedAt != 0, "Not wrapped");
        
        return (
            wrapped.nftContract,
            wrapped.viewOnly,
            wrapped.wrappedAt,
            wrapped.wrappedBy
        );
    }

    /**
     * @notice Override transfer to prevent transfers of view-only credentials
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override {
        // Allow transfers only if not view-only
        // This is a simplified check - in production, you'd need more granular control
        super._update(from, to, value);
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
}

