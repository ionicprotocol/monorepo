const hre = require("hardhat");

async function main() {
    // The address of the IHistoricalOracle implementation to use as the source oracle.
    const source = "";

    // The amount of observations to aggregate.
    const observationAmount = 3;

    // The offset of the first observation to aggregate.
    const observationOffset = 0;

    // The increment between observations to aggregate.
    const observationIncrement = 1;

    // Assemble the configuration as a string
    const configuration =
        '["' +
        source.toString() +
        '","' +
        observationAmount.toString() +
        '","' +
        observationOffset.toString() +
        '","' +
        observationIncrement.toString() +
        '"]';

    // Print the configuration
    console.log("Historical aggregator oracle config: " + configuration);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
