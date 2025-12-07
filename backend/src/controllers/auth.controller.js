const jwt = require("jsonwebtoken");
const { ethers } = require("ethers");

/**
 * Wallet authentication
 */
exports.walletAuth = async (req, res, next) => {
  try {
    const { address, signature, message } = req.body;

    if (!address || !signature || !message) {
      return res.status(400).json({
        error: {
          code: "MISSING_PARAMETERS",
          message: "Address, signature, and message are required",
        },
      });
    }

    // Verify signature
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({
        error: {
          code: "INVALID_SIGNATURE",
          message: "Invalid signature",
        },
      });
    }

    // Determine role (in production, check database)
    const role = determineUserRole(address);

    // Generate JWT token
    const token = jwt.sign(
      {
        address: address.toLowerCase(),
        role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      }
    );

    res.json({
      token,
      user: {
        address: address.toLowerCase(),
        role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Determine user role (simplified - check database in production)
 */
function determineUserRole(address) {
  // In production, check database for user role
  // For demo, return 'candidate' by default
  return "candidate";
}

