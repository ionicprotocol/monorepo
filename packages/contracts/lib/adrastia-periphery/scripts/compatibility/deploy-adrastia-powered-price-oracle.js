const hre = require("hardhat");

const ethers = hre.ethers;

async function main() {
    const adrastiaOracle = "0xFB2a058E07E7aDadDCe98A1d836899b44a6ebD56";
    const token = "0x0000000000000000000000000000000000000001";
    const decimals = 0;
    const description = "Fast Gas / Gwei";

    const factory = await ethers.getContractFactory("AdrastiaPoweredPriceOracle");
    const rateController = await factory.deploy(adrastiaOracle, token, decimals, description);
    await rateController.deployed();

    console.log("AdrastiaPoweredPriceOracle deployed to:", rateController.address);

    console.log("Done");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
