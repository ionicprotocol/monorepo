const hre = require("hardhat");

const ethers = hre.ethers;

const UPDATE_THRESHOLD_0_1_PERCENT = ethers.utils.parseUnits("0.001", 8); // 0.1%
const UPDATE_THRESHOLD_0_5_PERCENT = ethers.utils.parseUnits("0.005", 8); // 0.5%
const UPDATE_THRESHOLD_1_PERCENT = ethers.utils.parseUnits("0.01", 8); // 1%
const UPDATE_THRESHOLD_10_PERCENT = ethers.utils.parseUnits("0.1", 8); // 10%

async function main() {
    const updateThreshold = UPDATE_THRESHOLD_10_PERCENT;
    const updateDelay = 10; // 10 seconds
    const heartbeat = 60 * 60 * 4; // 4 hours

    // Assemble the configuration as a string
    const configuration =
        '["' + updateThreshold.toString() + '","' + updateDelay.toString() + '","' + heartbeat.toString() + '"]';

    // Print the configuration
    console.log("Accumulator config: " + configuration);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
