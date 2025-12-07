const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  const network = hre.network.name;
  console.log(`\nDeploying to ${network}...\n`);

  // Step 1: Deploy VerificationRegistry
  console.log("1. Deploying VerificationRegistry...");
  const VerificationRegistry = await hre.ethers.getContractFactory("VerificationRegistry");
  const registry = await VerificationRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("   VerificationRegistry deployed to:", registryAddress);

  // Step 2: Deploy GovernmentSmartAccount (requires registry address)
  console.log("\n2. Deploying GovernmentSmartAccount...");
  const GovernmentSmartAccount = await hre.ethers.getContractFactory("GovernmentSmartAccount");
  const governmentAccount = await GovernmentSmartAccount.deploy(registryAddress);
  await governmentAccount.waitForDeployment();
  const governmentAccountAddress = await governmentAccount.getAddress();
  console.log("   GovernmentSmartAccount deployed to:", governmentAccountAddress);

  // Step 3: Deploy AttestationNFT (requires registry and government account)
  console.log("\n3. Deploying AttestationNFT...");
  const AttestationNFT = await hre.ethers.getContractFactory("AttestationNFT");
  const attestationNFT = await AttestationNFT.deploy(registryAddress, governmentAccountAddress);
  await attestationNFT.waitForDeployment();
  const attestationNFTAddress = await attestationNFT.getAddress();
  console.log("   AttestationNFT deployed to:", attestationNFTAddress);

  // Step 4: Link contracts
  console.log("\n4. Linking contracts...");
  
  // Set attestation NFT contract in registry
  const setAttestationTx = await registry.setAttestationNFTContract(attestationNFTAddress);
  await setAttestationTx.wait();
  console.log("   ✓ Linked AttestationNFT to VerificationRegistry");

  // Step 5: Deploy FAssetCredentialWrapper
  console.log("\n5. Deploying FAssetCredentialWrapper...");
  const FAssetCredentialWrapper = await hre.ethers.getContractFactory("FAssetCredentialWrapper");
  const fAssetWrapper = await FAssetCredentialWrapper.deploy(attestationNFTAddress);
  await fAssetWrapper.waitForDeployment();
  const fAssetWrapperAddress = await fAssetWrapper.getAddress();
  console.log("   FAssetCredentialWrapper deployed to:", fAssetWrapperAddress);

  // Step 6: Setup initial roles (if needed)
  console.log("\n6. Setting up initial roles...");
  // Add government officials (example - replace with actual addresses)
  if (process.env.GOVERNMENT_OFFICIAL_1) {
    await governmentAccount.addGovernmentOfficial(process.env.GOVERNMENT_OFFICIAL_1);
    console.log(`   ✓ Added government official: ${process.env.GOVERNMENT_OFFICIAL_1}`);
  }
  if (process.env.GOVERNMENT_OFFICIAL_2) {
    await governmentAccount.addGovernmentOfficial(process.env.GOVERNMENT_OFFICIAL_2);
    console.log(`   ✓ Added government official: ${process.env.GOVERNMENT_OFFICIAL_2}`);
  }
  if (process.env.GOVERNMENT_OFFICIAL_3) {
    await governmentAccount.addGovernmentOfficial(process.env.GOVERNMENT_OFFICIAL_3);
    console.log(`   ✓ Added government official: ${process.env.GOVERNMENT_OFFICIAL_3}`);
  }

  // Wait for block confirmations
  console.log("\n7. Waiting for block confirmations...");
  if (network !== "hardhat" && network !== "localhost") {
    await registry.deploymentTransaction().wait(5);
    console.log("   ✓ Contract deployments confirmed");
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log(`Network: ${network}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log("\nContract Addresses:");
  console.log(`  VerificationRegistry:      ${registryAddress}`);
  console.log(`  GovernmentSmartAccount:    ${governmentAccountAddress}`);
  console.log(`  AttestationNFT:            ${attestationNFTAddress}`);
  console.log(`  FAssetCredentialWrapper:   ${fAssetWrapperAddress}`);
  console.log("\n" + "=".repeat(60));

  // Save deployment addresses
  const deploymentInfo = {
    network,
    deployer: deployer.address,
    contracts: {
      VerificationRegistry: registryAddress,
      GovernmentSmartAccount: governmentAccountAddress,
      AttestationNFT: attestationNFTAddress,
      FAssetCredentialWrapper: fAssetWrapperAddress,
    },
    deployedAt: new Date().toISOString(),
  };

  console.log("\n📝 Save these addresses to your .env file:\n");
  console.log(`VERIFICATION_REGISTRY_ADDRESS=${registryAddress}`);
  console.log(`GOVERNMENT_SMART_ACCOUNT_ADDRESS=${governmentAccountAddress}`);
  console.log(`ATTESTATION_NFT_ADDRESS=${attestationNFTAddress}`);
  console.log(`FASSET_WRAPPER_ADDRESS=${fAssetWrapperAddress}`);

  // Optionally save to file
  if (process.env.SAVE_DEPLOYMENT === "true") {
    const fs = require("fs");
    const path = require("path");
    const deploymentDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }
    const deploymentFile = path.join(deploymentDir, `${network}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n✓ Deployment info saved to ${deploymentFile}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

