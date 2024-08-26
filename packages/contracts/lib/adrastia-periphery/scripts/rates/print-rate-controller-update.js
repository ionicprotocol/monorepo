const hre = require("hardhat");

const ethers = hre.ethers;

async function main() {
    const token = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";

    const updateData = ethers.utils.defaultAbiCoder.encode(["address"], [token]);

    // Print the configuration
    console.log("RateController update data for " + token + ": " + updateData);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
