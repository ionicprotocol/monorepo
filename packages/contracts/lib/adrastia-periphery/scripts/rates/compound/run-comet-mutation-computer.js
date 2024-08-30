const hre = require("hardhat");

const RATE_ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("RATE_ADMIN_ROLE"));

async function main() {
    // Replace this address with the address of the Compound III Lending Pool on your desired network
    const lendingPoolAddress = "0xc3d688B66703497DAA19211EEdff47f25384cdc3"; // cUSDCv3 (mainnet)
    // Replace this address with the address the token you want to compute the rate for
    const token = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC
    // 1x scalar
    const oneXScalar = ethers.BigNumber.from(10).pow(6);

    // The config to set for the token
    const maxRate = ethers.BigNumber.from(2).pow(64).sub(1);
    const minRate = ethers.BigNumber.from(0);
    const offset = ethers.BigNumber.from(0);
    const scalar = oneXScalar;

    const availableContracts = [
        "CometSupplyMutationComputer", // [0]
        "CometBorrowMutationComputer", // [1]
        "CometCollateralMutationComputer", // [2]
    ];

    // Replace this with the contract that you want to deploy
    const contractName = availableContracts[0];

    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying " + contractName + " with account:", deployer.address);

    const computerFactory = await hre.ethers.getContractFactory(contractName);
    const computer = await computerFactory.deploy(oneXScalar, 18, 0, lendingPoolAddress);

    await computer.deployed();

    console.log(contractName + " deployed to:", computer.address);

    console.log("Granting RATE_ADMIN role to deployer...");

    // Grant the deployer the RATE_ADMIN role
    await computer.grantRole(RATE_ADMIN_ROLE, deployer.address);

    console.log("Setting config...");

    // Set the configuration for the token
    await computer.setConfig(token, maxRate, minRate, offset, scalar);

    // Get the current rate
    const rate = await computer.computeRate(token);

    console.log("Current rate for " + token + ":", ethers.utils.commify(rate.toString()));

    console.log("Done");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
