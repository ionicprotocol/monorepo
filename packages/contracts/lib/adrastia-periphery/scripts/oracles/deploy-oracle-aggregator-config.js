const hre = require("hardhat");

const ethers = hre.ethers;

async function main() {
    // The address of the aggregation strategy.
    const aggregationStrategy = "";

    // The address of the validation strategy. Can be the zero address to skip validation.
    const validationStrategy = "";

    // The minimum number of underlying oracle responses required to perform an update.
    const minimumResponses = 1;

    // An array of the underlying oracle addresses.
    const oracles = [];

    const factory = await ethers.getContractFactory("OracleAggregatorTokenConfig");
    const config = await factory.deploy(aggregationStrategy, validationStrategy, minimumResponses, oracles);
    await config.deployed();

    console.log("OracleAggregatorTokenConfig deployed to:", config.address);

    console.log("Done");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
