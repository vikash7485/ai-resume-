require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    "flare-testnet": {
      url: process.env.FLARE_RPC_URL || "https://coston2-api.flare.network/ext/bc/C/rpc",
      chainId: 114,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 250000000000,
    },
    "flare-mainnet": {
      url: process.env.FLARE_MAINNET_RPC_URL || "https://flare-api.flare.network/ext/bc/C/rpc",
      chainId: 14,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 250000000000,
    },
    hardhat: {
      chainId: 1337,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  etherscan: {
    apiKey: {
      "flare-testnet": process.env.FLARE_TESTNET_EXPLORER_API_KEY || "",
      "flare-mainnet": process.env.FLARE_MAINNET_EXPLORER_API_KEY || "",
    },
    customChains: [
      {
        network: "flare-testnet",
        chainId: 114,
        urls: {
          apiURL: "https://coston2-explorer.flare.network/api",
          browserURL: "https://coston2-explorer.flare.network",
        },
      },
      {
        network: "flare-mainnet",
        chainId: 14,
        urls: {
          apiURL: "https://flare-explorer.flare.network/api",
          browserURL: "https://flare-explorer.flare.network",
        },
      },
    ],
  },
};

