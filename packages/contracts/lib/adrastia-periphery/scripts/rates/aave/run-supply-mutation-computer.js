const hre = require("hardhat");

const RATE_ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("RATE_ADMIN_ROLE"));

async function main() {
    // Replace this address with the address of the aToken you want to compute the rate for
    const token = "0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8"; // aEthWETH (v3 mainnet)
    // 1x scalar
    const oneXScalar = ethers.BigNumber.from(10).pow(6);

    // The config to set for the token
    const maxRate = ethers.BigNumber.from(2).pow(64).sub(1);
    const minRate = ethers.BigNumber.from(0);
    const offset = ethers.BigNumber.from(0);
    const scalar = oneXScalar;

    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying ATokenSupplyMutationComputer with account:", deployer.address);

    const ATokenSupplyMutationComputer = await hre.ethers.getContractFactory("ATokenSupplyMutationComputer");
    const aTokenSupplyMutationComputer = await ATokenSupplyMutationComputer.deploy(oneXScalar, 18, 0);

    await aTokenSupplyMutationComputer.deployed();

    console.log("ATokenSupplyMutationComputer deployed to:", aTokenSupplyMutationComputer.address);

    console.log("Granting RATE_ADMIN role to deployer...");

    // Grant the deployer the RATE_ADMIN role
    await aTokenSupplyMutationComputer.grantRole(RATE_ADMIN_ROLE, deployer.address);

    console.log("Setting config...");

    // Set the configuration for the token
    await aTokenSupplyMutationComputer.setConfig(token, maxRate, minRate, offset, scalar);

    // Get the current rate
    const rate = await aTokenSupplyMutationComputer.computeRate(token);

    console.log("Current rate for " + token + ":", ethers.utils.commify(rate.toString()));

    console.log("Done");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
