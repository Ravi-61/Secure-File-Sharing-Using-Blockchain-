const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("[DEPLOYMENT] Deploying FileRegistry Smart Contract...");

  const FileRegistry = await hre.ethers.getContractFactory("FileRegistry");
  const fileRegistry = await FileRegistry.deploy();

  await fileRegistry.waitForDeployment();

  const contractAddress = await fileRegistry.getAddress();

  console.log(`[DEPLOYMENT SUCCESS] FileRegistry deployed to address: ${contractAddress}`);

  // Save deployed address and ABI to backend config directory
  const contractInfo = {
    address: contractAddress,
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
  };

  const configPath = path.join(__dirname, "../../backend/config/contractInfo.json");
  fs.writeFileSync(configPath, JSON.stringify(contractInfo, null, 2));

  console.log(`[CONFIG] Saved contract information to ${configPath}`);
}

main().catch((error) => {
  console.error("[DEPLOYMENT ERROR]", error);
  process.exitCode = 1;
});
