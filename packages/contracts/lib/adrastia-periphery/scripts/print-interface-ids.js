const { BigNumber } = require("ethers");
const hre = require("hardhat");

const ethers = hre.ethers;

async function main() {
    const interfaceIdsFactory = await ethers.getContractFactory("InterfaceIds");
    const interfaceIds = await interfaceIdsFactory.deploy();

    var ids = [];

    ids["IPeriodic"] = await interfaceIds.iPeriodic();
    ids["IUpdateable"] = await interfaceIds.iUpdateable();
    ids["IHistoricalRates"] = await interfaceIds.iHistoricalRates();
    ids["IRateComputer"] = await interfaceIds.iRateComputer();
    ids["IAccumulator"] = await interfaceIds.iAccumulator();
    ids["IOracle"] = await interfaceIds.iOracle();
    ids["AggregatorV3Interface"] = await interfaceIds.aggregatorV3Interface();
    ids["IOracleAggregator"] = await interfaceIds.iOracleAggregator();

    console.log(ids);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
