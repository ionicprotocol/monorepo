const { expect } = require("chai");
const { ethers } = require("hardhat");

const {
    abi: ARITHMETIC_AVERAGING_ABI,
    bytecode: ARITHMETIC_AVERAGING_BYTECODE,
} = require("@adrastia-oracle/adrastia-core/artifacts/contracts/strategies/averaging/ArithmeticAveraging.sol/ArithmeticAveraging.json");

const {
    abi: DEFAULT_AGGREGATION_STRATEGY_ABI,
    bytecode: DEFAULT_AGGREGATION_STRATEGY_BYTECODE,
} = require("@adrastia-oracle/adrastia-core/artifacts/contracts/strategies/aggregation/QuoteTokenWeightedMeanAggregator.sol/QuoteTokenWeightedMeanAggregator.json");

const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

const DEFAULT_QUOTE_TOKEN_ADDRESS = USDC;
const DEFAULT_LIQUIDITY_DECIMALS = 0;
const DEFAULT_MINIMUM_RESPONSES = 1;

const ERROR_MISSING_ORACLES = 1;
const ERROR_MINIMUM_RESPONSES_TOO_SMALL = 2;
const ERROR_INVALID_AGGREGATION_STRATEGY = 3;
const ERROR_DUPLICATE_ORACLES = 4;
const ERROR_MINIMUM_RESPONSES_TOO_LARGE = 6;
const ERROR_INVALID_ORACLE = 7;
const ERROR_TOO_MANY_ORACLES = 8;

async function deployDefaultTokenConfig(numOracles = 1, constructorOverrides = {}) {
    const quoteTokenAddress = constructorOverrides.quoteTokenAddress ?? DEFAULT_QUOTE_TOKEN_ADDRESS;

    const averagingStrategyFactory = await ethers.getContractFactory(
        ARITHMETIC_AVERAGING_ABI,
        ARITHMETIC_AVERAGING_BYTECODE
    );
    const averagingStrategy = await averagingStrategyFactory.deploy();
    await averagingStrategy.deployed();

    const aggregationStrategyFactory = await ethers.getContractFactory(
        DEFAULT_AGGREGATION_STRATEGY_ABI,
        DEFAULT_AGGREGATION_STRATEGY_BYTECODE
    );
    const aggregationStrategy = await aggregationStrategyFactory.deploy(averagingStrategy.address);
    await aggregationStrategy.deployed();

    const oracleStubFactory = await ethers.getContractFactory("MockOracle");

    var oracles = [];

    for (var i = 0; i < numOracles; i++) {
        const oracleStub = await oracleStubFactory.deploy(
            quoteTokenAddress,
            constructorOverrides.liquidityDecimals ?? DEFAULT_LIQUIDITY_DECIMALS
        );
        await oracleStub.deployed();

        oracles.push(oracleStub.address);
    }

    const params = {
        aggregationStrategy: constructorOverrides.aggregationStrategy ?? aggregationStrategy.address,
        validationStrategy: constructorOverrides.validationStrategy ?? ethers.constants.AddressZero,
        minimumResponses: constructorOverrides.minimumResponses ?? DEFAULT_MINIMUM_RESPONSES,
        oracles: constructorOverrides.oracles ?? oracles,
    };

    const tokenConfigFactory = await ethers.getContractFactory("OracleAggregatorTokenConfig");
    const tokenConfig = await tokenConfigFactory.deploy(
        params.aggregationStrategy,
        params.validationStrategy,
        params.minimumResponses,
        params.oracles
    );

    return {
        tokenConfig: tokenConfig,
        params: params,
    };
}

describe("OracleAggregatorTokenConfig#constructor", function () {
    async function resolveUnderlyingOracles(oracles) {
        var underlyingOracles = [];

        for (var i = 0; i < oracles.length; i++) {
            const oracleContract = await ethers.getContractAt("MockOracle", oracles[i]);

            const quoteTokenDecimals = await oracleContract.quoteTokenDecimals();
            const liquidityDecimals = await oracleContract.liquidityDecimals();

            underlyingOracles.push([oracleContract.address, quoteTokenDecimals, liquidityDecimals]);
        }

        return underlyingOracles;
    }

    async function verifyDeployment(deployment) {
        const config = deployment.tokenConfig;

        expect(await config.aggregationStrategy()).to.equal(deployment.params.aggregationStrategy);
        expect(await config.validationStrategy()).to.equal(deployment.params.validationStrategy);
        expect(await config.minimumResponses()).to.equal(deployment.params.minimumResponses);
        expect(await config.oracles()).to.eql(await resolveUnderlyingOracles(deployment.params.oracles)); // eql = deep equality
    }

    const maxOracles = 8;

    for (var i = 1; i <= maxOracles; i++) {
        const numOracles = i;
        it(`Works with ${numOracles} oracles`, async function () {
            const deployment = await deployDefaultTokenConfig(numOracles);

            await verifyDeployment(deployment);
        });
    }

    it("Reverts if no oracles are provided", async function () {
        await expect(deployDefaultTokenConfig(0)).to.be.revertedWith("InvalidConfig").withArgs(ERROR_MISSING_ORACLES);
    });

    it("Revets if the minimum responses is too small", async function () {
        await expect(
            deployDefaultTokenConfig(1, {
                minimumResponses: 0,
            })
        )
            .to.be.revertedWith("InvalidConfig")
            .withArgs(ERROR_MINIMUM_RESPONSES_TOO_SMALL);
    });

    it("Reverts if the aggregation strategy is invalid", async function () {
        await expect(
            deployDefaultTokenConfig(1, {
                aggregationStrategy: ethers.constants.AddressZero,
            })
        )
            .to.be.revertedWith("InvalidConfig")
            .withArgs(ERROR_INVALID_AGGREGATION_STRATEGY);
    });

    it("Reverts if there are duplicate oracles", async function () {
        const oracleStubFactory = await ethers.getContractFactory("MockOracle");
        const oracleStub = await oracleStubFactory.deploy(DEFAULT_QUOTE_TOKEN_ADDRESS, DEFAULT_LIQUIDITY_DECIMALS);
        await oracleStub.deployed();

        await expect(
            deployDefaultTokenConfig(2, {
                oracles: [oracleStub.address, oracleStub.address],
            })
        )
            .to.be.revertedWith("InvalidConfig")
            .withArgs(ERROR_DUPLICATE_ORACLES);
    });

    it("Reverts if the minimum responses is too large", async function () {
        const numOracles = 1;

        await expect(
            deployDefaultTokenConfig(numOracles, {
                minimumResponses: numOracles + 1,
            })
        )
            .to.be.revertedWith("InvalidConfig")
            .withArgs(ERROR_MINIMUM_RESPONSES_TOO_LARGE);
    });

    it("Reverts if an oracle has a zero address (with one oracle)", async function () {
        await expect(
            deployDefaultTokenConfig(1, {
                oracles: [ethers.constants.AddressZero],
            })
        )
            .to.be.revertedWith("InvalidConfig")
            .withArgs(ERROR_INVALID_ORACLE);
    });

    it("Reverts if an oracle has a zero address (with two oracles and one is valid)", async function () {
        const oracleStubFactory = await ethers.getContractFactory("MockOracle");
        const oracleStub = await oracleStubFactory.deploy(DEFAULT_QUOTE_TOKEN_ADDRESS, DEFAULT_LIQUIDITY_DECIMALS);
        await oracleStub.deployed();

        await expect(
            deployDefaultTokenConfig(1, {
                oracles: [oracleStub.address, ethers.constants.AddressZero],
            })
        )
            .to.be.revertedWith("InvalidConfig")
            .withArgs(ERROR_INVALID_ORACLE);
    });

    it("Reverts if there are too many oracles", async function () {
        const numOracles = maxOracles + 1;

        await expect(deployDefaultTokenConfig(numOracles))
            .to.be.revertedWith("InvalidConfig")
            .withArgs(ERROR_TOO_MANY_ORACLES);
    });
});
