const hre = require("hardhat");

const RATE_ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("RATE_ADMIN_ROLE"));

const eWETH = "0x1b808F49ADD4b8C6b5117d9681cF7312Fcf0dC1D";
const dWETH = "0x62e28f054efc24b26A794F5C1249B6349454352C";

async function main() {
    // Replace this address with the address the cToken you want to compute the rate for
    const token = dWETH;
    // 1x scalar
    const oneXScalar = ethers.BigNumber.from(10).pow(6);

    // The config to set for the token
    const maxRate = ethers.BigNumber.from(2).pow(64).sub(1);
    const minRate = ethers.BigNumber.from(0);
    const offset = ethers.BigNumber.from(0);
    const scalar = oneXScalar;

    const availableContracts = [
        "ETokenSupplyMutationComputer", // [0] (collateral, eToken)
        "DTokenSupplyMutationComputer", // [1] (debt, dToken)
    ];

    // Replace this with the contract that you want to deploy
    const contractName = availableContracts[1];

    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying " + contractName + " with account:", deployer.address);

    const computerFactory = await hre.ethers.getContractFactory(contractName);
    const computer = await computerFactory.deploy(oneXScalar, 18, 0);

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
