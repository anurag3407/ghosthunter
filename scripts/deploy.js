const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Deploying EquityToken contract to Sepolia...\n");

    // Get the deployer's account
    const signers = await ethers.getSigners();

    if (signers.length === 0) {
        console.error("❌ Error: No deployer account configured.");
        console.error("   Please add DEPLOYER_PRIVATE_KEY to your .env file:");
        console.error("   DEPLOYER_PRIVATE_KEY=0x...");
        console.error("\n   To get a private key:");
        console.error("   1. Open MetaMask");
        console.error("   2. Click on the three dots next to your account");
        console.error("   3. Select 'Account details' > 'Show private key'");
        console.error("   4. Copy and paste it to your .env file");
        process.exit(1);
    }

    const [deployer] = signers;
    console.log("📍 Deployer address:", deployer.address);

    // Get and display balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Deployer balance:", ethers.formatEther(balance), "ETH\n");

    if (balance === 0n) {
        console.error("❌ Error: Deployer has no ETH. Get some from a Sepolia faucet:");
        console.error("   - https://sepoliafaucet.com/");
        console.error("   - https://cloud.google.com/application/web3/faucet/ethereum/sepolia");
        process.exit(1);
    }

    // Deploy the contract
    console.log("📦 Deploying EquityToken...");
    const EquityToken = await ethers.getContractFactory("EquityToken");
    const equityToken = await EquityToken.deploy();

    await equityToken.waitForDeployment();

    const contractAddress = await equityToken.getAddress();

    console.log("\n✅ EquityToken deployed successfully!");
    console.log("📍 Contract address:", contractAddress);
    console.log("\n🔗 View on Etherscan:");
    console.log(`   https://sepolia.etherscan.io/address/${contractAddress}\n`);

    // Save the contract address
    const deploymentInfo = {
        network: "sepolia",
        contractAddress: contractAddress,
        deployedAt: new Date().toISOString(),
        deployer: deployer.address,
    };

    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    fs.writeFileSync(
        path.join(deploymentsDir, "sepolia.json"),
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("📄 Deployment info saved to deployments/sepolia.json");
    console.log("\n⚙️  Add this to your .env file:");
    console.log(`   NEXT_PUBLIC_EQUITY_CONTRACT_ADDRESS=${contractAddress}\n`);

    console.log("🔍 To verify the contract on Etherscan, run:");
    console.log(`   npx hardhat verify --network sepolia ${contractAddress}\n`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
