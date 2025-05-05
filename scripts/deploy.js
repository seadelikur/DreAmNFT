// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying DreAmNFT contracts...");

  // Deploy the NFT contract
  const DreAmNFT = await ethers.getContractFactory("DreAmNFT");
  const dreAmNFT = await DreAmNFT.deploy();
  await dreAmNFT.deployed();
  
  console.log(`DreAmNFT deployed to: ${dreAmNFT.address}`);

  // Deploy the marketplace contract
  const DreAmMarketplace = await ethers.getContractFactory("DreAmMarketplace");
  const dreAmMarketplace = await DreAmMarketplace.deploy();
  await dreAmMarketplace.deployed();
  
  console.log(`DreAmMarketplace deployed to: ${dreAmMarketplace.address}`);

  // Output contracts information
  console.log("\nDeployment completed!\n");
  console.log("Contract Addresses:");
  console.log("-------------------");
  console.log(`DreAmNFT: ${dreAmNFT.address}`);
  console.log(`DreAmMarketplace: ${dreAmMarketplace.address}`);
  
  // Verify contracts on Etherscan (if not on a local network)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\nVerifying contracts on Etherscan...");
    
    await run("verify:verify", {
      address: dreAmNFT.address,
      constructorArguments: [],
    });
    
    await run("verify:verify", {
      address: dreAmMarketplace.address,
      constructorArguments: [],
    });
    
    console.log("Verification complete!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });