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

const {
    abi: DEFAULT_VALIDATION_STRATEGY_ABI,
    bytecode: DEFAULT_VALIDATION_STRATEGY_BYTECODE,
} = require("@adrastia-oracle/adrastia-core/artifacts/contracts/strategies/validation/DefaultValidation.sol/DefaultValidation.json");
const { BigNumber } = require("ethers");

const UPDATER_ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("UPDATER_ADMIN_ROLE"));
const ORACLE_UPDATER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ORACLE_UPDATER_ROLE"));
const CONFIG_ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("CONFIG_ADMIN_ROLE"));
const UPDATE_PAUSE_ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("UPDATE_PAUSE_ADMIN_ROLE"));

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const GRT = "0xc944E90C64B2c07662A292be6244BDf05Cda44a7";

const DEFAULT_QUOTE_TOKEN_NAME = "USD Coin";
const DEFAULT_QUOTE_TOKEN_ADDRESS = USDC;
const DEFAULT_QUOTE_TOKEN_SYMBOL = "USDC";
const DEFAULT_QUOTE_TOKEN_DECIMALS = 6;
const DEFAULT_LIQUIDITY_DECIMALS = 0;

const DEFAULT_PERIOD = 100;
const DEFAULT_GRANULARITY = 1;

const DEFAULT_UPDATE_DELAY = 1;
const DEFAULT_HEARTBEAT = 2;
const DEFAULT_UPDATE_THRESHOLD = 2000000; // 2% change

const ERROR_MISSING_ORACLES = 1;
const ERROR_INVALID_MINIMUM_RESPONSES = 2;
const ERROR_INVALID_AGGREGATION_STRATEGY = 3;
const ERROR_DUPLICATE_ORACLES = 4;
const ERROR_QUOTE_TOKEN_DECIMALS_MISMATCH = 5;
const ERROR_MINIMUM_RESPONSES_TOO_LARGE = 6;
const ERROR_INVALID_ORACLE = 7;

async function currentBlockTimestamp() {
    const currentBlockNumber = await ethers.provider.getBlockNumber();

    return await blockTimestamp(currentBlockNumber);
}

async function blockTimestamp(blockNum) {
    return (await ethers.provider.getBlock(blockNum)).timestamp;
}

async function deployDefaultPeriodicAggregator(constructorOverrides = {}) {
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
    const oracleStub = await oracleStubFactory.deploy(
        quoteTokenAddress,
        constructorOverrides.liquidityDecimals ?? DEFAULT_LIQUIDITY_DECIMALS
    );
    await oracleStub.deployed();

    const aggregatorParams = {
        aggregationStrategy: constructorOverrides.aggregationStrategy ?? aggregationStrategy.address,
        validationStrategy: constructorOverrides.validationStrategy ?? ethers.constants.AddressZero,
        quoteTokenName: constructorOverrides.quoteTokenName ?? DEFAULT_QUOTE_TOKEN_NAME,
        quoteTokenAddress: quoteTokenAddress,
        quoteTokenSymbol: constructorOverrides.quoteTokenSymbol ?? DEFAULT_QUOTE_TOKEN_SYMBOL,
        quoteTokenDecimals: constructorOverrides.quoteTokenDecimals ?? DEFAULT_QUOTE_TOKEN_DECIMALS,
        liquidityDecimals: constructorOverrides.liquidityDecimals ?? DEFAULT_LIQUIDITY_DECIMALS,
        oracles: constructorOverrides.oracles ?? [oracleStub.address],
        tokenSpecificOracles: constructorOverrides.tokenSpecificOracles ?? [],
    };

    const aggregatorFactory = await ethers.getContractFactory("ManagedPeriodicAggregatorOracle");
    const aggregator = await aggregatorFactory.deploy(aggregatorParams, DEFAULT_PERIOD, DEFAULT_GRANULARITY);

    return {
        aggregator: aggregator,
        oracles: [oracleStub],
        aggregationStrategy: aggregatorParams.aggregationStrategy,
        validationStrategy: aggregatorParams.validationStrategy,
    };
}

async function deployDefaultCurrentAggregator(constructorOverrides = {}) {
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
    const oracleStub = await oracleStubFactory.deploy(
        quoteTokenAddress,
        constructorOverrides.liquidityDecimals ?? DEFAULT_LIQUIDITY_DECIMALS
    );
    await oracleStub.deployed();

    const aggregatorParams = {
        aggregationStrategy: constructorOverrides.aggregationStrategy ?? aggregationStrategy.address,
        validationStrategy: constructorOverrides.validationStrategy ?? ethers.constants.AddressZero,
        quoteTokenName: constructorOverrides.quoteTokenName ?? DEFAULT_QUOTE_TOKEN_NAME,
        quoteTokenAddress: quoteTokenAddress,
        quoteTokenSymbol: constructorOverrides.quoteTokenSymbol ?? DEFAULT_QUOTE_TOKEN_SYMBOL,
        quoteTokenDecimals: constructorOverrides.quoteTokenDecimals ?? DEFAULT_QUOTE_TOKEN_DECIMALS,
        liquidityDecimals: constructorOverrides.liquidityDecimals ?? DEFAULT_LIQUIDITY_DECIMALS,
        oracles: constructorOverrides.oracles ?? [oracleStub.address],
        tokenSpecificOracles: constructorOverrides.tokenSpecificOracles ?? [],
    };

    const aggregatorFactory = await ethers.getContractFactory("ManagedCurrentAggregatorOracle");
    const aggregator = await aggregatorFactory.deploy(
        aggregatorParams,
        DEFAULT_UPDATE_THRESHOLD,
        DEFAULT_UPDATE_DELAY,
        DEFAULT_HEARTBEAT
    );

    return {
        aggregator: aggregator,
        oracles: [oracleStub],
        aggregationStrategy: aggregatorParams.aggregationStrategy,
        validationStrategy: aggregatorParams.validationStrategy,
    };
}

describe("ManagedPeriodicAggregatorOracle#constructor", function () {
    it("Works with the default parameters", async function () {
        const aggregatorDeployment = await deployDefaultPeriodicAggregator();

        const oracle = aggregatorDeployment.aggregator;

        const underlyingOracles = aggregatorDeployment.oracles.map((oracle) => {
            return [oracle.address, DEFAULT_QUOTE_TOKEN_DECIMALS, DEFAULT_LIQUIDITY_DECIMALS];
        });

        expect(await oracle.aggregationStrategy(WETH)).to.equal(aggregatorDeployment.aggregationStrategy);
        expect(await oracle.validationStrategy(WETH)).to.equal(aggregatorDeployment.validationStrategy);
        expect(await oracle.quoteTokenName()).to.equal(DEFAULT_QUOTE_TOKEN_NAME);
        expect(await oracle.quoteTokenAddress()).to.equal(DEFAULT_QUOTE_TOKEN_ADDRESS);
        expect(await oracle.quoteTokenSymbol()).to.equal(DEFAULT_QUOTE_TOKEN_SYMBOL);
        expect(await oracle.quoteTokenDecimals()).to.equal(DEFAULT_QUOTE_TOKEN_DECIMALS);
        expect(await oracle.liquidityDecimals()).to.equal(DEFAULT_LIQUIDITY_DECIMALS);
        expect(await oracle.period()).to.equal(DEFAULT_PERIOD);
        expect(await oracle.granularity()).to.equal(DEFAULT_GRANULARITY);
        expect(await oracle.getOracles(WETH)).to.eql(underlyingOracles); // eql = deep equality
    });
});

describe("ManagedCurrentAggregatorOracle#constructor", function () {
    it("Works with the default parameters", async function () {
        const aggregatorDeployment = await deployDefaultCurrentAggregator();

        const oracle = aggregatorDeployment.aggregator;

        const underlyingOracles = aggregatorDeployment.oracles.map((oracle) => {
            return [oracle.address, DEFAULT_QUOTE_TOKEN_DECIMALS, DEFAULT_LIQUIDITY_DECIMALS];
        });

        expect(await oracle.aggregationStrategy(WETH)).to.equal(aggregatorDeployment.aggregationStrategy);
        expect(await oracle.validationStrategy(WETH)).to.equal(aggregatorDeployment.validationStrategy);
        expect(await oracle.quoteTokenName()).to.equal(DEFAULT_QUOTE_TOKEN_NAME);
        expect(await oracle.quoteTokenAddress()).to.equal(DEFAULT_QUOTE_TOKEN_ADDRESS);
        expect(await oracle.quoteTokenSymbol()).to.equal(DEFAULT_QUOTE_TOKEN_SYMBOL);
        expect(await oracle.quoteTokenDecimals()).to.equal(DEFAULT_QUOTE_TOKEN_DECIMALS);
        expect(await oracle.liquidityDecimals()).to.equal(DEFAULT_LIQUIDITY_DECIMALS);
        expect(await oracle.getOracles(WETH)).to.eql(underlyingOracles); // eql = deep equality
        expect(await oracle.updateThreshold()).to.equal(DEFAULT_UPDATE_THRESHOLD);
        expect(await oracle.updateDelay()).to.equal(DEFAULT_UPDATE_DELAY);
        expect(await oracle.heartbeat()).to.equal(DEFAULT_HEARTBEAT);
    });
});

describe("ManagedCurrentAggregatorOracle#setConfig", function () {
    var oracle;

    beforeEach(async function () {
        const aggregatorDeployment = await deployDefaultCurrentAggregator();

        oracle = aggregatorDeployment.aggregator;

        const [owner] = await ethers.getSigners();

        // Grant owner the updater admin role
        await oracle.grantRole(UPDATER_ADMIN_ROLE, owner.address);
        // Grant owner the oracle updater role
        await oracle.grantRole(ORACLE_UPDATER_ROLE, owner.address);
        // Grant owner the config admin role
        await oracle.grantRole(CONFIG_ADMIN_ROLE, owner.address);
    });

    it("Reverts if the caller is not the config admin", async function () {
        const [_, notConfigAdmin] = await ethers.getSigners();

        const config = {
            updateThreshold: DEFAULT_UPDATE_THRESHOLD,
            updateDelay: DEFAULT_UPDATE_DELAY,
            heartbeat: DEFAULT_HEARTBEAT,
        };

        await expect(oracle.connect(notConfigAdmin).setConfig(config)).to.be.revertedWith(/AccessControl: .*/);
    });

    it("Reverts if the caller is not the config admin (with the role being assigned to the zero address)", async function () {
        const [_, notConfigAdmin] = await ethers.getSigners();

        await oracle.grantRole(CONFIG_ADMIN_ROLE, ethers.constants.AddressZero);

        const config = {
            updateThreshold: DEFAULT_UPDATE_THRESHOLD,
            updateDelay: DEFAULT_UPDATE_DELAY,
            heartbeat: DEFAULT_HEARTBEAT,
        };

        await expect(oracle.connect(notConfigAdmin).setConfig(config)).to.be.revertedWith(/AccessControl: .*/);
    });

    it("Works", async function () {
        const oldConfig = {
            updateThreshold: DEFAULT_UPDATE_THRESHOLD,
            updateDelay: DEFAULT_UPDATE_DELAY,
            heartbeat: DEFAULT_HEARTBEAT,
        };

        const newConfig = {
            updateThreshold: DEFAULT_UPDATE_THRESHOLD * 2,
            updateDelay: DEFAULT_UPDATE_DELAY * 2,
            heartbeat: DEFAULT_HEARTBEAT * 2,
        };

        await expect(oracle.setConfig(newConfig))
            .to.emit(oracle, "ConfigUpdated")
            .withArgs(Object.values(oldConfig), Object.values(newConfig));

        expect(await oracle.updateThreshold()).to.equal(newConfig.updateThreshold);
        expect(await oracle.updateDelay()).to.equal(newConfig.updateDelay);
        expect(await oracle.heartbeat()).to.equal(newConfig.heartbeat);
    });

    it("Works when setting the config back to default", async function () {
        const oldConfig = {
            updateThreshold: DEFAULT_UPDATE_THRESHOLD,
            updateDelay: DEFAULT_UPDATE_DELAY,
            heartbeat: DEFAULT_HEARTBEAT,
        };

        const newConfig = {
            updateThreshold: DEFAULT_UPDATE_THRESHOLD * 2,
            updateDelay: DEFAULT_UPDATE_DELAY * 2,
            heartbeat: DEFAULT_HEARTBEAT * 2,
        };

        await oracle.setConfig(newConfig);

        await expect(oracle.setConfig(oldConfig))
            .to.emit(oracle, "ConfigUpdated")
            .withArgs(Object.values(newConfig), Object.values(oldConfig));

        expect(await oracle.updateThreshold()).to.equal(oldConfig.updateThreshold);
        expect(await oracle.updateDelay()).to.equal(oldConfig.updateDelay);
        expect(await oracle.heartbeat()).to.equal(oldConfig.heartbeat);
    });

    it("Reverts if the update delay is greater than the heartbeat", async function () {
        const newConfig = {
            updateThreshold: DEFAULT_UPDATE_THRESHOLD,
            updateDelay: DEFAULT_HEARTBEAT + 1,
            heartbeat: DEFAULT_HEARTBEAT,
        };

        await expect(oracle.setConfig(newConfig)).to.be.revertedWith("InvalidConfig");
    });

    it("Reverts if the update threshold is zero", async function () {
        const newConfig = {
            updateThreshold: 0,
            updateDelay: DEFAULT_UPDATE_DELAY,
            heartbeat: DEFAULT_HEARTBEAT,
        };

        await expect(oracle.setConfig(newConfig)).to.be.revertedWith("InvalidConfig");
    });

    it("Reverts if the heartbeat is zero", async function () {
        const newConfig = {
            updateThreshold: DEFAULT_UPDATE_THRESHOLD,
            updateDelay: 0,
            heartbeat: 0,
        };

        await expect(oracle.setConfig(newConfig)).to.be.revertedWith("InvalidConfig");
    });
});

function describeManagedAggregatorOracleTests(contractName, deployFunction) {
    describe(contractName + "#setUpdatesPaused", function () {
        var oracle;
        var underlyingOracle;

        beforeEach(async function () {
            const aggregatorDeployment = await deployFunction();

            oracle = aggregatorDeployment.aggregator;
            const underlyingOracles = aggregatorDeployment.oracles;

            const [owner] = await ethers.getSigners();

            // Grant owner the updater admin role
            await oracle.grantRole(UPDATER_ADMIN_ROLE, owner.address);
            // Grant owner the oracle updater role
            await oracle.grantRole(ORACLE_UPDATER_ROLE, owner.address);
            // Grant owner the config admin role
            await oracle.grantRole(CONFIG_ADMIN_ROLE, owner.address);
            // Grant owner the update pause admin role
            await oracle.grantRole(UPDATE_PAUSE_ADMIN_ROLE, owner.address);

            // Update the underlying oracle so that the aggregator can update
            await underlyingOracles[0].stubSetObservation(
                WETH,
                ethers.utils.parseUnits("1.0", 6),
                ethers.utils.parseUnits("2.0", 0),
                ethers.utils.parseUnits("3.0", 0),
                await currentBlockTimestamp()
            );

            underlyingOracle = underlyingOracles[0];
        });

        it("Updates are not paused by default (before any updates occur)", async function () {
            expect(await oracle.areUpdatesPaused(WETH)).to.equal(false);
        });

        it("Updates are not paused by default (after an initial update)", async function () {
            await expect(oracle.update(ethers.utils.hexZeroPad(WETH, 32))).to.emit(oracle, "Updated");

            expect(await oracle.areUpdatesPaused(WETH)).to.equal(false);
        });

        it("Accounts with the update pause admin role can pause updates", async function () {
            await expect(oracle.setUpdatesPaused(WETH, true))
                .to.emit(oracle, "PauseStatusChanged")
                .withArgs(WETH, true);

            expect(await oracle.areUpdatesPaused(WETH)).to.equal(true);
        });

        it("Accounts with the update pause admin role can unpause updates", async function () {
            await expect(oracle.setUpdatesPaused(WETH, true))
                .to.emit(oracle, "PauseStatusChanged")
                .withArgs(WETH, true);

            expect(await oracle.areUpdatesPaused(WETH)).to.equal(true);

            await expect(oracle.setUpdatesPaused(WETH, false))
                .to.emit(oracle, "PauseStatusChanged")
                .withArgs(WETH, false);

            expect(await oracle.areUpdatesPaused(WETH)).to.equal(false);
        });

        it("Accounts without the update pause admin role cannot pause updates", async function () {
            const [, other] = await ethers.getSigners();

            await expect(oracle.connect(other).setUpdatesPaused(WETH, true)).to.be.revertedWith(/AccessControl: .*/);
        });

        it("Accounts without the update pause admin role cannot unpause updates", async function () {
            await oracle.setUpdatesPaused(WETH, true);
            expect(await oracle.areUpdatesPaused(WETH)).to.equal(true);

            const [, other] = await ethers.getSigners();

            await expect(oracle.connect(other).setUpdatesPaused(WETH, true)).to.be.revertedWith(/AccessControl: .*/);
        });

        it("Accounts without the update pause admin role cannot pause updates (with the role being granted to the zero address)", async function () {
            await oracle.grantRole(UPDATE_PAUSE_ADMIN_ROLE, ethers.constants.AddressZero);

            const [, other] = await ethers.getSigners();

            await expect(oracle.connect(other).setUpdatesPaused(WETH, true)).to.be.revertedWith(/AccessControl: .*/);
        });

        it("Accounts without the update pause admin role cannot unpause updates (with the role being granted to the zero address)", async function () {
            await oracle.grantRole(UPDATE_PAUSE_ADMIN_ROLE, ethers.constants.AddressZero);
            await oracle.setUpdatesPaused(WETH, true);
            expect(await oracle.areUpdatesPaused(WETH)).to.equal(true);

            const [, other] = await ethers.getSigners();

            await expect(oracle.connect(other).setUpdatesPaused(WETH, true)).to.be.revertedWith(/AccessControl: .*/);
        });

        it("Reverts on initial update if updates are paused", async function () {
            await oracle.setUpdatesPaused(WETH, true);

            await expect(oracle.update(ethers.utils.hexZeroPad(WETH, 32)))
                .to.be.revertedWith("UpdatesArePaused")
                .withArgs(WETH);
        });

        it("Reverts on second update if updates are paused", async function () {
            await expect(oracle.update(ethers.utils.hexZeroPad(WETH, 32))).to.emit(oracle, "Updated");

            await oracle.setUpdatesPaused(WETH, true);

            // Advance time by 7 days so that the next update can occur
            await hre.timeAndMine.increaseTime(60 * 60 * 24 * 7);
            await hre.timeAndMine.mine(1);
            // Update the timestamp of the underlying oracle
            await underlyingOracle.stubSetObservation(
                WETH,
                ethers.utils.parseUnits("1.0", 6),
                ethers.utils.parseUnits("2.0", 0),
                ethers.utils.parseUnits("3.0", 0),
                await currentBlockTimestamp()
            );

            await expect(oracle.update(ethers.utils.hexZeroPad(WETH, 32)))
                .to.be.revertedWith("UpdatesArePaused")
                .withArgs(WETH);

            // Sanity check that an update can be performed after unpausing
            await oracle.setUpdatesPaused(WETH, false);
            await expect(oracle.update(ethers.utils.hexZeroPad(WETH, 32))).to.emit(oracle, "Updated");
        });

        it("Can't update if updates are paused", async function () {
            await oracle.setUpdatesPaused(WETH, true);

            expect(await oracle.canUpdate(ethers.utils.hexZeroPad(WETH, 32))).to.equal(false);

            // Sanity check that we can update if unpaused
            await oracle.setUpdatesPaused(WETH, false);
            expect(await oracle.canUpdate(ethers.utils.hexZeroPad(WETH, 32))).to.equal(true);
        });
    });

    describe(contractName + "#setTokenConfig", function () {
        var oracle;
        var underlyingOracles;
        var aggregationStrategy;
        var validationStrategy;

        var tokenConfigFactory;

        var alternativeTokenConfig;

        var oracleStub1;
        var oracleStub2;
        var oracleStub3;
        var oracleStub4;
        var oracleStub5;
        var oracleStub6;
        var oracleStub7;
        var oracleStub8;

        var newAggregationStrategy;
        var newValidationStrategy;

        beforeEach(async function () {
            const aggregatorDeployment = await deployFunction();

            oracle = aggregatorDeployment.aggregator;
            underlyingOracles = aggregatorDeployment.oracles;
            aggregationStrategy = aggregatorDeployment.aggregationStrategy;
            validationStrategy = aggregatorDeployment.validationStrategy;

            const [owner] = await ethers.getSigners();

            // Grant owner the updater admin role
            await oracle.grantRole(UPDATER_ADMIN_ROLE, owner.address);
            // Grant owner the oracle updater role
            await oracle.grantRole(ORACLE_UPDATER_ROLE, owner.address);
            // Grant owner the config admin role
            await oracle.grantRole(CONFIG_ADMIN_ROLE, owner.address);

            const averagingStrategyFactory = await ethers.getContractFactory(
                ARITHMETIC_AVERAGING_ABI,
                ARITHMETIC_AVERAGING_BYTECODE
            );
            const newAveragingStrategy = await averagingStrategyFactory.deploy();
            await newAveragingStrategy.deployed();

            const aggregationStrategyFactory = await ethers.getContractFactory(
                DEFAULT_AGGREGATION_STRATEGY_ABI,
                DEFAULT_AGGREGATION_STRATEGY_BYTECODE
            );
            newAggregationStrategy = await aggregationStrategyFactory.deploy(newAveragingStrategy.address);
            await newAggregationStrategy.deployed();

            const validationStrategyFactory = await ethers.getContractFactory(
                DEFAULT_VALIDATION_STRATEGY_ABI,
                DEFAULT_VALIDATION_STRATEGY_BYTECODE
            );
            newValidationStrategy = await validationStrategyFactory.deploy(
                DEFAULT_QUOTE_TOKEN_DECIMALS,
                0,
                0,
                1,
                100000
            );
            await newValidationStrategy.deployed();

            const oracleStubFactory = await ethers.getContractFactory("MockOracle");
            oracleStub1 = await oracleStubFactory.deploy(DEFAULT_QUOTE_TOKEN_ADDRESS, DEFAULT_LIQUIDITY_DECIMALS);
            oracleStub2 = await oracleStubFactory.deploy(DEFAULT_QUOTE_TOKEN_ADDRESS, DEFAULT_LIQUIDITY_DECIMALS);
            oracleStub3 = await oracleStubFactory.deploy(DEFAULT_QUOTE_TOKEN_ADDRESS, DEFAULT_LIQUIDITY_DECIMALS);
            oracleStub4 = await oracleStubFactory.deploy(DEFAULT_QUOTE_TOKEN_ADDRESS, DEFAULT_LIQUIDITY_DECIMALS);
            oracleStub5 = await oracleStubFactory.deploy(DEFAULT_QUOTE_TOKEN_ADDRESS, DEFAULT_LIQUIDITY_DECIMALS);
            oracleStub6 = await oracleStubFactory.deploy(DEFAULT_QUOTE_TOKEN_ADDRESS, DEFAULT_LIQUIDITY_DECIMALS);
            oracleStub7 = await oracleStubFactory.deploy(DEFAULT_QUOTE_TOKEN_ADDRESS, DEFAULT_LIQUIDITY_DECIMALS);
            oracleStub8 = await oracleStubFactory.deploy(DEFAULT_QUOTE_TOKEN_ADDRESS, DEFAULT_LIQUIDITY_DECIMALS);
            await oracleStub1.deployed();
            await oracleStub2.deployed();
            await oracleStub3.deployed();
            await oracleStub4.deployed();
            await oracleStub5.deployed();
            await oracleStub6.deployed();
            await oracleStub7.deployed();
            await oracleStub8.deployed();

            tokenConfigFactory = await ethers.getContractFactory("NoCheckOracleAggregatorTokenConfig");
            alternativeTokenConfig = await tokenConfigFactory.deploy(
                newAggregationStrategy.address,
                newValidationStrategy.address,
                2,
                [oracleStub1.address, oracleStub2.address]
            );
        });

        it("Overrides the default config", async function () {
            const tx = await oracle.setTokenConfig(GRT, alternativeTokenConfig.address);
            const receipt = await tx.wait();

            expect(receipt)
                .to.emit(oracle, "TokenConfigUpdated")
                .withArgs(GRT, ethers.constants.AddressZero, alternativeTokenConfig.address);

            // Check that the functions return the new values
            expect(await oracle.aggregationStrategy(GRT)).to.equal(await alternativeTokenConfig.aggregationStrategy());
            expect(await oracle.validationStrategy(GRT)).to.equal(await alternativeTokenConfig.validationStrategy());
            expect(await oracle.minimumResponses(GRT)).to.equal(await alternativeTokenConfig.minimumResponses());
            expect(await oracle.getOracles(GRT)).to.eql(await alternativeTokenConfig.oracles()); // eql = deep equality

            // Sanity check that the functions return values other than the default
            expect(await oracle.aggregationStrategy(GRT)).to.not.equal(aggregationStrategy);
            expect(await oracle.validationStrategy(GRT)).to.not.equal(validationStrategy);
            expect(await oracle.minimumResponses(GRT)).to.not.equal(1);
            expect(await oracle.getOracles(GRT)).to.not.have.lengthOf(1);
        });

        it("Works with 8 oracles", async function () {
            const alternativeTokenConfigWith8Oracles = await tokenConfigFactory.deploy(
                newAggregationStrategy.address,
                ethers.constants.AddressZero,
                3,
                [
                    oracleStub1.address,
                    oracleStub2.address,
                    oracleStub3.address,
                    oracleStub4.address,
                    oracleStub5.address,
                    oracleStub6.address,
                    oracleStub7.address,
                    oracleStub8.address,
                ]
            );

            const tx = await oracle.setTokenConfig(GRT, alternativeTokenConfigWith8Oracles.address);
            const receipt = await tx.wait();

            expect(receipt)
                .to.emit(oracle, "TokenConfigUpdated")
                .withArgs(GRT, ethers.constants.AddressZero, alternativeTokenConfigWith8Oracles.address);

            // Check that the functions return the new values
            expect(await oracle.aggregationStrategy(GRT)).to.equal(
                await alternativeTokenConfigWith8Oracles.aggregationStrategy()
            );
            expect(await oracle.validationStrategy(GRT)).to.equal(
                await alternativeTokenConfigWith8Oracles.validationStrategy()
            );
            expect(await oracle.minimumResponses(GRT)).to.equal(
                await alternativeTokenConfigWith8Oracles.minimumResponses()
            );
            expect(await oracle.getOracles(GRT)).to.eql(await alternativeTokenConfigWith8Oracles.oracles()); // eql = deep equality

            // Sanity check that the functions return values other than the default
            expect(await oracle.aggregationStrategy(GRT)).to.not.equal(aggregationStrategy);
            expect(await oracle.validationStrategy(GRT)).to.equal(validationStrategy);
            expect(await oracle.minimumResponses(GRT)).to.not.equal(1);
            expect(await oracle.getOracles(GRT)).to.not.have.lengthOf(1);
        });

        it("Reverts if the caller is not the config admin", async function () {
            const [_, notConfigAdmin] = await ethers.getSigners();

            await expect(
                oracle.connect(notConfigAdmin).setTokenConfig(WETH, alternativeTokenConfig.address)
            ).to.be.revertedWith(/AccessControl: .*/);
        });

        it("Reverts if the caller is not the config admin (with the role being assigned to the zero address)", async function () {
            const [_, notConfigAdmin] = await ethers.getSigners();

            await oracle.grantRole(CONFIG_ADMIN_ROLE, ethers.constants.AddressZero);

            await expect(
                oracle.connect(notConfigAdmin).setTokenConfig(WETH, alternativeTokenConfig.address)
            ).to.be.revertedWith(/AccessControl: .*/);
        });

        it("Only sets the config for the specified token", async function () {
            const tx = await oracle.setTokenConfig(GRT, alternativeTokenConfig.address);
            const receipt = await tx.wait();

            expect(receipt)
                .to.emit(oracle, "TokenConfigUpdated")
                .withArgs(GRT, ethers.constants.AddressZero, alternativeTokenConfig.address);

            expect(await oracle.aggregationStrategy(WETH)).to.equal(aggregationStrategy);
            expect(await oracle.validationStrategy(WETH)).to.equal(validationStrategy);
            expect(await oracle.minimumResponses(WETH)).to.equal(1);
            expect(await oracle.getOracles(WETH)).to.have.lengthOf(1);
        });

        it("Falls back to the default config if the new config is the zero address", async function () {
            // First set the config to something other than the default
            const tx = await oracle.setTokenConfig(GRT, alternativeTokenConfig.address);
            const receipt = await tx.wait();
            expect(receipt)
                .to.emit(oracle, "TokenConfigUpdated")
                .withArgs(GRT, ethers.constants.AddressZero, alternativeTokenConfig.address);

            // Then set the config to the zero address
            const tx2 = await oracle.setTokenConfig(GRT, ethers.constants.AddressZero);
            const receipt2 = await tx2.wait();
            expect(receipt2)
                .to.emit(oracle, "TokenConfigUpdated")
                .withArgs(GRT, alternativeTokenConfig.address, ethers.constants.AddressZero);

            expect(await oracle.aggregationStrategy(GRT)).to.equal(aggregationStrategy);
            expect(await oracle.validationStrategy(GRT)).to.equal(validationStrategy);
            expect(await oracle.minimumResponses(GRT)).to.equal(1);
            expect(await oracle.getOracles(GRT)).to.have.lengthOf(1);
        });

        it("Reverts if the new config is missing oracles", async function () {
            const alternativeTokenConfigWith0Oracles = await tokenConfigFactory.deploy(
                newAggregationStrategy.address,
                newValidationStrategy.address,
                1,
                []
            );

            await expect(oracle.setTokenConfig(GRT, alternativeTokenConfigWith0Oracles.address))
                .to.be.revertedWith("InvalidTokenConfig")
                .withArgs(alternativeTokenConfigWith0Oracles.address, ERROR_MISSING_ORACLES);
        });

        it("Reverts if the new config has duplicate oracles", async function () {
            const alternativeTokenConfigWithDuplicateOracles = await tokenConfigFactory.deploy(
                newAggregationStrategy.address,
                newValidationStrategy.address,
                1,
                [oracleStub1.address, oracleStub1.address]
            );

            await expect(oracle.setTokenConfig(GRT, alternativeTokenConfigWithDuplicateOracles.address))
                .to.be.revertedWith("InvalidTokenConfig")
                .withArgs(alternativeTokenConfigWithDuplicateOracles.address, ERROR_DUPLICATE_ORACLES);
        });

        it("Reverts if the new config has a minimum responses value of zero", async function () {
            const alternativeTokenConfigWith0MinimumResponses = await tokenConfigFactory.deploy(
                newAggregationStrategy.address,
                newValidationStrategy.address,
                0,
                [oracleStub1.address]
            );

            await expect(oracle.setTokenConfig(GRT, alternativeTokenConfigWith0MinimumResponses.address))
                .to.be.revertedWith("InvalidTokenConfig")
                .withArgs(alternativeTokenConfigWith0MinimumResponses.address, ERROR_INVALID_MINIMUM_RESPONSES);
        });

        it("Reverts if the new config has a minimum responses value greater than the number of oracles", async function () {
            const alternativeTokenConfigWithMinimumResponsesTooLarge = await tokenConfigFactory.deploy(
                newAggregationStrategy.address,
                newValidationStrategy.address,
                2,
                [oracleStub1.address]
            );

            await expect(oracle.setTokenConfig(GRT, alternativeTokenConfigWithMinimumResponsesTooLarge.address))
                .to.be.revertedWith("InvalidTokenConfig")
                .withArgs(
                    alternativeTokenConfigWithMinimumResponsesTooLarge.address,
                    ERROR_MINIMUM_RESPONSES_TOO_LARGE
                );
        });

        it("Reverts if the new config has an invalid aggregation strategy", async function () {
            const alternativeTokenConfigWithAnInvalidAggregationStrategy = await tokenConfigFactory.deploy(
                ethers.constants.AddressZero,
                newValidationStrategy.address,
                1,
                [oracleStub1.address]
            );

            await expect(oracle.setTokenConfig(GRT, alternativeTokenConfigWithAnInvalidAggregationStrategy.address))
                .to.be.revertedWith("InvalidTokenConfig")
                .withArgs(
                    alternativeTokenConfigWithAnInvalidAggregationStrategy.address,
                    ERROR_INVALID_AGGREGATION_STRATEGY
                );
        });

        it("Reverts if the new config has a quote token decimal mismatch with the validation strategy", async function () {
            const validationStrategyFactory = await ethers.getContractFactory(
                DEFAULT_VALIDATION_STRATEGY_ABI,
                DEFAULT_VALIDATION_STRATEGY_BYTECODE
            );
            const newValidationStrategy2 = await validationStrategyFactory.deploy(
                DEFAULT_QUOTE_TOKEN_DECIMALS + 1,
                0,
                0,
                1,
                100000
            );
            await newValidationStrategy2.deployed();

            const alternativeTokenConfigWithQuoteTokenDecimalsMismatch = await tokenConfigFactory.deploy(
                newAggregationStrategy.address,
                newValidationStrategy2.address,
                1,
                [oracleStub1.address]
            );

            await expect(oracle.setTokenConfig(GRT, alternativeTokenConfigWithQuoteTokenDecimalsMismatch.address))
                .to.be.revertedWith("InvalidTokenConfig")
                .withArgs(
                    alternativeTokenConfigWithQuoteTokenDecimalsMismatch.address,
                    ERROR_QUOTE_TOKEN_DECIMALS_MISMATCH
                );
        });

        it("Reverts if the new config contains an oracle with the zero address", async function () {
            const invalidTokenConfigFactory = await ethers.getContractFactory("InvalidOracleAggregatorTokenConfig");
            const invalidTokenConfig = await invalidTokenConfigFactory.deploy(
                newAggregationStrategy.address,
                newValidationStrategy.address,
                1,
                [oracleStub1.address] // This is not returned by the oracles() function
            );

            await expect(oracle.setTokenConfig(GRT, invalidTokenConfig.address))
                .to.be.revertedWith("InvalidTokenConfig")
                .withArgs(invalidTokenConfig.address, ERROR_INVALID_ORACLE);
        });
    });

    describe(contractName + "#update", function () {
        var oracle;
        var aggregationStrategy;
        var validationStrategy;
        var underlyingOracle1;

        var underlyingPrice1;
        var underlyingTokenLiquidity1;
        var underlyingQuoteTokenLiquidity1;

        beforeEach(async function () {
            const aggregatorDeployment = await deployFunction();

            oracle = aggregatorDeployment.aggregator;
            aggregationStrategy = aggregatorDeployment.aggregationStrategy;
            validationStrategy = aggregatorDeployment.validationStrategy;

            underlyingOracle1 = aggregatorDeployment.oracles[0];

            underlyingPrice1 = ethers.utils.parseUnits("1", 6);
            underlyingTokenLiquidity1 = ethers.utils.parseUnits("2", 0);
            underlyingQuoteTokenLiquidity1 = ethers.utils.parseUnits("3", 0);

            // Set the observation on the underlying oracle so that the aggregator can update
            await underlyingOracle1.stubSetObservation(
                WETH,
                underlyingPrice1,
                underlyingTokenLiquidity1,
                underlyingQuoteTokenLiquidity1,
                await currentBlockTimestamp()
            );

            const [owner] = await ethers.getSigners();

            // Grant owner the updater admin role
            await oracle.grantRole(UPDATER_ADMIN_ROLE, owner.address);
            // Grant owner the oracle updater role
            await oracle.grantRole(ORACLE_UPDATER_ROLE, owner.address);
            // Grant owner the config admin role
            await oracle.grantRole(CONFIG_ADMIN_ROLE, owner.address);
        });

        describe("Only accounts with oracle updater role can update", function () {
            it("Accounts with oracle updater role can update", async function () {
                expect(await oracle.canUpdate(ethers.utils.hexZeroPad(WETH, 32))).to.equal(true);

                expect(await oracle.update(ethers.utils.hexZeroPad(WETH, 32))).to.emit(oracle, "Updated");
            });

            it("Accounts without oracle updater role cannot update", async function () {
                const [, addr1] = await ethers.getSigners();

                expect(await oracle.connect(addr1).canUpdate(ethers.utils.hexZeroPad(WETH, 32))).to.equal(false);

                await expect(oracle.connect(addr1).update(ethers.utils.hexZeroPad(WETH, 32))).to.be.reverted;
            });
        });

        describe("All accounts can update when the updater role is open", function () {
            beforeEach(async () => {
                // Grant everyone the oracle updater role
                await oracle.grantRole(ORACLE_UPDATER_ROLE, ethers.constants.AddressZero);
            });

            it("Accounts with oracle updater role can update", async function () {
                expect(await oracle.canUpdate(ethers.utils.hexZeroPad(WETH, 32))).to.equal(true);

                expect(await oracle.update(ethers.utils.hexZeroPad(WETH, 32))).to.emit(oracle, "Updated");
            });

            it("Accounts without oracle updater role can update", async function () {
                const [, addr1] = await ethers.getSigners();

                expect(await oracle.connect(addr1).canUpdate(ethers.utils.hexZeroPad(WETH, 32))).to.equal(true);

                await expect(oracle.connect(addr1).update(ethers.utils.hexZeroPad(WETH, 32))).to.emit(
                    oracle,
                    "Updated"
                );
            });
        });

        it("Uses the new token config's aggregation strategy", async function () {
            // Deploy a new aggregation strategy
            const aggregationStrategyFactory = await ethers.getContractFactory("AggregationStrategyStub");
            const newAggregationStrategy = await aggregationStrategyFactory.deploy();

            // Set the aggregation result
            const aPrice = ethers.utils.parseUnits("8888", 6);
            const aTokenLiquidity = ethers.utils.parseUnits("9999", 0);
            const aQuoteTokenLiquidity = ethers.utils.parseUnits("7777", 0);
            const aTimestamp = BigNumber.from(17);
            await newAggregationStrategy.stubSetResult(aPrice, aTokenLiquidity, aQuoteTokenLiquidity, aTimestamp);

            // Deploy a new token config with the new aggregation strategy
            const tokenConfigFactory = await ethers.getContractFactory("OracleAggregatorTokenConfig");
            const newTokenConfig = await tokenConfigFactory.deploy(
                newAggregationStrategy.address,
                ethers.constants.AddressZero,
                1,
                [underlyingOracle1.address]
            );
            await newTokenConfig.deployed();

            // Set the new token config
            await oracle.setTokenConfig(WETH, newTokenConfig.address);

            // Update the aggregator
            const tx = await oracle.update(ethers.utils.hexZeroPad(WETH, 32));
            const receipt = await tx.wait();

            const event = receipt.events?.find((e) => e.event === "Updated");
            // Verify that the new aggregation strategy was used
            expect(event?.args?.price).to.equal(aPrice);
            expect(event?.args?.tokenLiquidity).to.equal(aTokenLiquidity);
            expect(event?.args?.quoteTokenLiquidity).to.equal(aQuoteTokenLiquidity);
        });

        it("Uses the new token config's validation strategy", async function () {
            // Deploy a new validation strategy
            const validationStrategyFactory = await ethers.getContractFactory("ValidationStrategyStub");
            const newValidationStrategy = await validationStrategyFactory.deploy(DEFAULT_QUOTE_TOKEN_DECIMALS);

            // Set the validation result
            await newValidationStrategy.stubSetResult(false);

            // Deploy a new token config with the new validation strategy
            const tokenConfigFactory = await ethers.getContractFactory("OracleAggregatorTokenConfig");
            const newTokenConfig = await tokenConfigFactory.deploy(
                aggregationStrategy,
                newValidationStrategy.address,
                1,
                [underlyingOracle1.address]
            );

            // Set the new token config
            await oracle.setTokenConfig(WETH, newTokenConfig.address);

            // Update the aggregator
            await expect(oracle.update(ethers.utils.hexZeroPad(WETH, 32)), "Update").to.not.emit(oracle, "Updated");

            // Sanity check that the update doesn't revert if we set the validation result to true
            await newValidationStrategy.stubSetResult(true);
            await expect(oracle.update(ethers.utils.hexZeroPad(WETH, 32)), "Sanity check").to.emit(oracle, "Updated");
        });

        it("Uses the new minimum responses", async function () {
            // Deploy a new oracle stub
            const oracleStubFactory = await ethers.getContractFactory("MockOracle");
            const oracleStub2 = await oracleStubFactory.deploy(DEFAULT_QUOTE_TOKEN_ADDRESS, DEFAULT_LIQUIDITY_DECIMALS);
            await oracleStub2.deployed();

            // Deploy a new token config with the new minimum responses
            const tokenConfigFactory = await ethers.getContractFactory("OracleAggregatorTokenConfig");
            const newTokenConfig = await tokenConfigFactory.deploy(aggregationStrategy, validationStrategy, 2, [
                underlyingOracle1.address,
                oracleStub2.address,
            ]);

            // Set the new token config
            await oracle.setTokenConfig(WETH, newTokenConfig.address);

            // Update the aggregator
            // No update should occur because the minimum responses is 2 and only 1 oracle is reporting valid data
            await expect(oracle.update(ethers.utils.hexZeroPad(WETH, 32)), "Update").to.not.emit(oracle, "Updated");

            // Sanity check that the update doesn't revert all of the oracles report valid data
            await oracleStub2.stubSetObservation(
                WETH,
                ethers.utils.parseUnits("1", 6),
                ethers.utils.parseUnits("2", 0),
                ethers.utils.parseUnits("3", 0),
                await currentBlockTimestamp()
            );
            await expect(oracle.update(ethers.utils.hexZeroPad(WETH, 32)), "Sanity check").to.emit(oracle, "Updated");
        });

        it("Uses the new underlying oracles", async function () {
            // Deploy a new oracle stub
            const oracleStubFactory = await ethers.getContractFactory("MockOracle");
            const oracleStub2 = await oracleStubFactory.deploy(DEFAULT_QUOTE_TOKEN_ADDRESS, DEFAULT_LIQUIDITY_DECIMALS);
            await oracleStub2.deployed();

            // Deploy a new token config with the new minimum responses
            const tokenConfigFactory = await ethers.getContractFactory("OracleAggregatorTokenConfig");
            const newTokenConfig = await tokenConfigFactory.deploy(aggregationStrategy, validationStrategy, 2, [
                underlyingOracle1.address,
                oracleStub2.address,
            ]);

            // Set the new token config
            await oracle.setTokenConfig(WETH, newTokenConfig.address);

            const price2 = ethers.utils.parseUnits("10000000", 6);
            const tokenLiquidity2 = ethers.utils.parseUnits("20000000", 0);
            const quoteTokenLiquidity2 = ethers.utils.parseUnits("30000000", 0);

            // Set the observation on the new oracle stub
            await oracleStub2.stubSetObservation(
                WETH,
                price2,
                tokenLiquidity2,
                quoteTokenLiquidity2,
                await currentBlockTimestamp()
            );

            const tx = await oracle.update(ethers.utils.hexZeroPad(WETH, 32));

            // Update the aggregator
            await expect(tx, "Update").to.emit(oracle, "Updated");

            // Get the Updated event to verify the values
            const receipt = await tx.wait();
            const event = receipt.events?.find((e) => e.event === "Updated");

            expect(event?.args?.price).to.not.equal(underlyingPrice1);
            expect(event?.args?.tokenLiquidity).to.not.equal(underlyingTokenLiquidity1);
            expect(event?.args?.quoteTokenLiquidity).to.not.equal(underlyingQuoteTokenLiquidity1);
        });
    });

    describe(contractName + "#supportsInterface(interfaceId)", function () {
        var oracle;
        var interfaceIds;

        beforeEach(async () => {
            const aggregatorDeployment = await deployFunction();

            oracle = aggregatorDeployment.aggregator;

            const interfaceIdsFactory = await ethers.getContractFactory("InterfaceIds");
            interfaceIds = await interfaceIdsFactory.deploy();
        });

        it("Should support IAccessControl", async () => {
            const interfaceId = await interfaceIds.iAccessControl();
            expect(await oracle["supportsInterface(bytes4)"](interfaceId)).to.equal(true);
        });

        it("Should support IAccessControlEnumerable", async () => {
            const interfaceId = await interfaceIds.iAccessControlEnumerable();
            expect(await oracle["supportsInterface(bytes4)"](interfaceId)).to.equal(true);
        });

        it("Should support IOracle", async () => {
            const interfaceId = await interfaceIds.iOracle();
            expect(await oracle["supportsInterface(bytes4)"](interfaceId)).to.equal(true);
        });

        it("Should support IOracleAggregator", async () => {
            const interfaceId = await interfaceIds.iOracleAggregator();
            expect(await oracle["supportsInterface(bytes4)"](interfaceId)).to.equal(true);
        });
    });
}

describeManagedAggregatorOracleTests("ManagedPeriodicAggregatorOracle", deployDefaultPeriodicAggregator);
describeManagedAggregatorOracleTests("ManagedCurrentAggregatorOracle", deployDefaultCurrentAggregator);
