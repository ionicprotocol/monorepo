const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

const DEFAULT_DECIMALS = 0;
const DEFAULT_TOKEN = ethers.constants.AddressZero;
const DEFAULT_DESCRIPTION = "Adrastia Powered Price Oracle";

async function currentBlockTimestamp() {
    const currentBlockNumber = await ethers.provider.getBlockNumber();

    return await blockTimestamp(currentBlockNumber);
}

async function blockTimestamp(blockNum) {
    return (await ethers.provider.getBlock(blockNum)).timestamp;
}

describe("AdrastiaPoweredPriceOracle#constructor", function () {
    var quoteToken;
    var liquidityDecimals;
    var adrastiaOracle;
    var factory;

    beforeEach(async function () {
        factory = await ethers.getContractFactory("AdrastiaPoweredPriceOracle");

        quoteToken = USDC;
        liquidityDecimals = 0;

        const adrastiaOracleFactory = await ethers.getContractFactory("MockOracle");
        adrastiaOracle = await adrastiaOracleFactory.deploy(quoteToken, liquidityDecimals);
        await adrastiaOracle.deployed();
    });

    it("Should deploy with the correct parameters", async function () {
        const token = WETH;
        const decimals = 6;
        const description = "WETH/USDC";

        const oracle = await factory.deploy(adrastiaOracle.address, token, decimals, description);

        expect(await oracle.adrastiaOracle()).to.equal(adrastiaOracle.address);
        expect(await oracle.token()).to.equal(token);
        expect(await oracle.decimals()).to.equal(decimals);
        expect(await oracle.description()).to.equal(description);
        await expect(oracle.version()).to.not.be.reverted;
    });
});

describe("AdrastiaPoweredPriceOracle#getRoundData", function () {
    var quoteToken;
    var liquidityDecimals;
    var adrastiaOracle;
    var oracle;

    beforeEach(async function () {
        factory = await ethers.getContractFactory("AdrastiaPoweredPriceOracle");

        quoteToken = USDC;
        liquidityDecimals = 0;

        const adrastiaOracleFactory = await ethers.getContractFactory("MockOracle");
        adrastiaOracle = await adrastiaOracleFactory.deploy(quoteToken, liquidityDecimals);
        await adrastiaOracle.deployed();

        const adapterFactory = await ethers.getContractFactory("AdrastiaPoweredPriceOracle");
        oracle = await adapterFactory.deploy(
            adrastiaOracle.address,
            DEFAULT_TOKEN,
            DEFAULT_DECIMALS,
            DEFAULT_DESCRIPTION
        );
    });

    it("Should revert with NotSupported", async function () {
        await expect(oracle.getRoundData(0)).to.be.revertedWith("NotSupported");
    });
});

describe("AdrastiaPoweredPriceOracle#latestRoundData", function () {
    var quoteToken;
    var liquidityDecimals;
    var adrastiaOracle;
    var oracle;

    beforeEach(async function () {
        factory = await ethers.getContractFactory("AdrastiaPoweredPriceOracle");

        quoteToken = USDC;
        liquidityDecimals = 0;

        const adrastiaOracleFactory = await ethers.getContractFactory("MockOracle");
        adrastiaOracle = await adrastiaOracleFactory.deploy(quoteToken, liquidityDecimals);
        await adrastiaOracle.deployed();

        const adapterFactory = await ethers.getContractFactory("AdrastiaPoweredPriceOracle");
        oracle = await adapterFactory.deploy(
            adrastiaOracle.address,
            DEFAULT_TOKEN,
            DEFAULT_DECIMALS,
            DEFAULT_DESCRIPTION
        );
    });

    it("Should revert if the underlying oracle has no data", async function () {
        await expect(oracle.latestRoundData()).to.be.reverted;
    });

    it("Should return the correct data", async function () {
        const price = BigNumber.from(123);
        const timestamp = (await currentBlockTimestamp()) - 1235;

        await adrastiaOracle.stubSetObservation(DEFAULT_TOKEN, price, 1, 1, timestamp);

        const roundData = await oracle.latestRoundData();
        expect(roundData.roundId).to.equal(timestamp);
        expect(roundData.answer).to.equal(price);
        expect(roundData.startedAt).to.equal(timestamp);
        expect(roundData.updatedAt).to.equal(timestamp);
        expect(roundData.answeredInRound).to.equal(timestamp);
    });
});

describe("AdrastiaPoweredPriceOracle#supportsInterface(interfaceId)", function () {
    var oracle;
    var interfaceIds;

    beforeEach(async () => {
        const adapterFactory = await ethers.getContractFactory("AdrastiaPoweredPriceOracle");
        oracle = await adapterFactory.deploy(
            ethers.constants.AddressZero,
            DEFAULT_TOKEN,
            DEFAULT_DECIMALS,
            DEFAULT_DESCRIPTION
        );

        const interfaceIdsFactory = await ethers.getContractFactory("InterfaceIds");
        interfaceIds = await interfaceIdsFactory.deploy();
    });

    it("Should support IERC165", async () => {
        const interfaceId = await interfaceIds.iERC165();
        expect(await oracle["supportsInterface(bytes4)"](interfaceId)).to.equal(true);
    });

    it("Should support AggregatorV3Interface", async () => {
        const interfaceId = await interfaceIds.aggregatorV3Interface();
        expect(await oracle["supportsInterface(bytes4)"](interfaceId)).to.equal(true);
    });
});
