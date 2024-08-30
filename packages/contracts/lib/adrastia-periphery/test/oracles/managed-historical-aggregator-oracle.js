const { expect } = require("chai");
const { ethers } = require("hardhat");

const {
    abi: VOLATILITY_VIEW_ABI,
    bytecode: VOLATILITY_VIEW_BYTECODE,
} = require("@adrastia-oracle/adrastia-core/artifacts/contracts/oracles/views/VolatilityOracleView.sol/VolatilityOracleView.json");

const UPDATER_ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("UPDATER_ADMIN_ROLE"));
const ORACLE_UPDATER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ORACLE_UPDATER_ROLE"));
const CONFIG_ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("CONFIG_ADMIN_ROLE"));
const UPDATE_PAUSE_ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("UPDATE_PAUSE_ADMIN_ROLE"));

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

const DEFAULT_QUOTE_TOKEN_ADDRESS = USDC;
const DEFAULT_QUOTE_TOKEN_DECIMALS = 6;
const DEFAULT_LIQUIDITY_DECIMALS = 0;

const DEFAULT_OBSERVATION_AMOUNT = 3;
const DEFAULT_OBSERVATION_OFFSET = 0;
const DEFAULT_OBSERVATION_INCREMENT = 1;
const DEFAULT_VOLATILITY_MEAN_TYPE = 1;
const DEFAULT_PRECISION_DECIMALS = 8;

const ERROR_INVALID_AMOUNT = 200;
const ERROR_INVALID_INCREMENT = 201;
const ERROR_INVALID_SOURCE = 202;
const ERROR_INVALID_SOURCE_DECIMAL_MISMATCH = 203;

async function currentBlockTimestamp() {
    const currentBlockNumber = await ethers.provider.getBlockNumber();

    return await blockTimestamp(currentBlockNumber);
}

async function blockTimestamp(blockNum) {
    return (await ethers.provider.getBlock(blockNum)).timestamp;
}

async function deployDefaultMedianFilteringOracle(constructorOverrides = {}) {
    const quoteTokenAddress = constructorOverrides.quoteTokenAddress ?? DEFAULT_QUOTE_TOKEN_ADDRESS;

    var source = constructorOverrides.source;
    if (source === undefined) {
        const sourceFactory = await ethers.getContractFactory("HistoricalOracleStub");
        source = await sourceFactory.deploy(quoteTokenAddress);
        await source.deployed();
    }

    const observationAmount = constructorOverrides.observationAmount ?? DEFAULT_OBSERVATION_AMOUNT;
    const observationOffset = constructorOverrides.observationOffset ?? DEFAULT_OBSERVATION_OFFSET;
    const observationIncrement = constructorOverrides.observationIncrement ?? DEFAULT_OBSERVATION_INCREMENT;

    const factory = await ethers.getContractFactory("ManagedMedianFilteringOracle");
    const oracle = await factory.deploy(source.address, observationAmount, observationOffset, observationIncrement);
    await oracle.deployed();

    return {
        oracle: oracle,
        source: source,
    };
}

async function deployDefaultPriceVolatilityOracle(constructorOverrides = {}) {
    const quoteTokenAddress = constructorOverrides.quoteTokenAddress ?? DEFAULT_QUOTE_TOKEN_ADDRESS;

    var source = constructorOverrides.source;
    if (source === undefined) {
        const sourceFactory = await ethers.getContractFactory("HistoricalOracleStub");
        source = await sourceFactory.deploy(quoteTokenAddress);
        await source.deployed();
    }

    var volatilityView = constructorOverrides.volatilityView;
    if (volatilityView === undefined) {
        const volatilityViewFactory = await ethers.getContractFactory(VOLATILITY_VIEW_ABI, VOLATILITY_VIEW_BYTECODE);
        volatilityView = await volatilityViewFactory.deploy(DEFAULT_PRECISION_DECIMALS);
        await volatilityView.deployed();
    }

    const observationAmount = constructorOverrides.observationAmount ?? DEFAULT_OBSERVATION_AMOUNT;
    const observationOffset = constructorOverrides.observationOffset ?? DEFAULT_OBSERVATION_OFFSET;
    const observationIncrement = constructorOverrides.observationIncrement ?? DEFAULT_OBSERVATION_INCREMENT;
    const meanType = constructorOverrides.meanType ?? DEFAULT_VOLATILITY_MEAN_TYPE;

    const factory = await ethers.getContractFactory("ManagedPriceVolatilityOracle");
    const oracle = await factory.deploy(
        volatilityView.address,
        source.address,
        observationAmount,
        observationOffset,
        observationIncrement,
        meanType
    );
    await oracle.deployed();

    return {
        oracle: oracle,
        source: source,
        volatilityView: volatilityView,
    };
}

describe("ManagedMedianFilteringOracle#constructor", function () {
    it("Works with the default parameters", async function () {
        const deployment = await deployDefaultMedianFilteringOracle();
        const oracle = deployment.oracle;
        const source = deployment.source;

        expect(await oracle.source()).to.equal(source.address);
        expect(await oracle.observationAmount()).to.equal(DEFAULT_OBSERVATION_AMOUNT);
        expect(await oracle.observationOffset()).to.equal(DEFAULT_OBSERVATION_OFFSET);
        expect(await oracle.observationIncrement()).to.equal(DEFAULT_OBSERVATION_INCREMENT);
    });
});

describe("ManagedPriceVolatilityOracle#constructor", function () {
    it("Works with the default parameters", async function () {
        const deployment = await deployDefaultPriceVolatilityOracle();
        const oracle = deployment.oracle;
        const source = deployment.source;
        const volatilityView = deployment.volatilityView;

        expect(await oracle.source()).to.equal(source.address);
        expect(await oracle.observationAmount()).to.equal(DEFAULT_OBSERVATION_AMOUNT);
        expect(await oracle.observationOffset()).to.equal(DEFAULT_OBSERVATION_OFFSET);
        expect(await oracle.observationIncrement()).to.equal(DEFAULT_OBSERVATION_INCREMENT);
        expect(await oracle.volatilityView()).to.equal(volatilityView.address);
    });
});

function describeManagedHistoricalAggregatorOracleTests(contractName, deployFunction) {
    describe(contractName + "#setUpdatesPaused", function () {
        var oracle;
        var source;

        beforeEach(async function () {
            const deployment = await deployFunction();

            oracle = deployment.oracle;
            source = deployment.source;

            const [owner] = await ethers.getSigners();

            // Grant owner the updater admin role
            await oracle.grantRole(UPDATER_ADMIN_ROLE, owner.address);
            // Grant owner the oracle updater role
            await oracle.grantRole(ORACLE_UPDATER_ROLE, owner.address);
            // Grant owner the config admin role
            await oracle.grantRole(CONFIG_ADMIN_ROLE, owner.address);
            // Grant owner the update pause admin role
            await oracle.grantRole(UPDATE_PAUSE_ADMIN_ROLE, owner.address);

            // Push enough data to the source so that the oracle can update
            const amountToPush =
                DEFAULT_OBSERVATION_AMOUNT * DEFAULT_OBSERVATION_INCREMENT + DEFAULT_OBSERVATION_OFFSET + 1;
            for (var i = 0; i < amountToPush; i++) {
                const price = ethers.utils.parseUnits("2.0", DEFAULT_QUOTE_TOKEN_DECIMALS);
                const tokenLiquidity = ethers.utils.parseUnits("3.0", DEFAULT_LIQUIDITY_DECIMALS);
                const quoteTokenLiquidity = ethers.utils.parseUnits("5.0", DEFAULT_LIQUIDITY_DECIMALS);

                await source.stubPushNow(WETH, price, tokenLiquidity, quoteTokenLiquidity);
            }
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

            // Push an observation to the source so that an update is needed
            const price = ethers.utils.parseUnits("2.0", DEFAULT_QUOTE_TOKEN_DECIMALS);
            const tokenLiquidity = ethers.utils.parseUnits("3.0", DEFAULT_LIQUIDITY_DECIMALS);
            const quoteTokenLiquidity = ethers.utils.parseUnits("5.0", DEFAULT_LIQUIDITY_DECIMALS);
            await source.stubPushNow(WETH, price, tokenLiquidity, quoteTokenLiquidity);

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

    describe(contractName + "#setConfig", function () {
        var oracle;
        var source;

        beforeEach(async function () {
            const deployment = await deployFunction();

            oracle = deployment.oracle;
            source = deployment.source;

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
                source: source.address,
                observationAmount: DEFAULT_OBSERVATION_AMOUNT,
                observationOffset: DEFAULT_OBSERVATION_OFFSET,
                observationIncrement: DEFAULT_OBSERVATION_INCREMENT,
            };

            await expect(oracle.connect(notConfigAdmin).setConfig(config)).to.be.revertedWith(/AccessControl: .*/);
        });

        it("Reverts if the caller is not the config admin (with the role being assigned to the zero address)", async function () {
            const [_, notConfigAdmin] = await ethers.getSigners();

            await oracle.grantRole(CONFIG_ADMIN_ROLE, ethers.constants.AddressZero);

            const config = {
                source: source.address,
                observationAmount: DEFAULT_OBSERVATION_AMOUNT,
                observationOffset: DEFAULT_OBSERVATION_OFFSET,
                observationIncrement: DEFAULT_OBSERVATION_INCREMENT,
            };

            await expect(oracle.connect(notConfigAdmin).setConfig(config)).to.be.revertedWith(/AccessControl: .*/);
        });

        it("Works", async function () {
            const oldConfig = {
                source: source.address,
                observationAmount: DEFAULT_OBSERVATION_AMOUNT,
                observationOffset: DEFAULT_OBSERVATION_OFFSET,
                observationIncrement: DEFAULT_OBSERVATION_INCREMENT,
            };

            const sourceFactory = await ethers.getContractFactory("HistoricalOracleStub");
            const newSource = await sourceFactory.deploy(DEFAULT_QUOTE_TOKEN_ADDRESS);
            await newSource.deployed();

            const newConfig = {
                source: newSource.address,
                observationAmount: DEFAULT_OBSERVATION_AMOUNT + 1,
                observationOffset: DEFAULT_OBSERVATION_OFFSET + 1,
                observationIncrement: DEFAULT_OBSERVATION_INCREMENT + 1,
            };

            await expect(oracle.setConfig(newConfig))
                .to.emit(oracle, "ConfigUpdated")
                .withArgs(Object.values(oldConfig), Object.values(newConfig));

            expect(await oracle.source()).to.equal(newConfig.source);
            expect(await oracle.observationAmount()).to.equal(newConfig.observationAmount);
            expect(await oracle.observationOffset()).to.equal(newConfig.observationOffset);
            expect(await oracle.observationIncrement()).to.equal(newConfig.observationIncrement);
        });

        it("Works when setting the config back to default", async function () {
            const oldConfig = {
                source: source.address,
                observationAmount: DEFAULT_OBSERVATION_AMOUNT,
                observationOffset: DEFAULT_OBSERVATION_OFFSET,
                observationIncrement: DEFAULT_OBSERVATION_INCREMENT,
            };

            const sourceFactory = await ethers.getContractFactory("HistoricalOracleStub");
            const newSource = await sourceFactory.deploy(DEFAULT_QUOTE_TOKEN_ADDRESS);
            await newSource.deployed();

            const newConfig = {
                source: newSource.address,
                observationAmount: DEFAULT_OBSERVATION_AMOUNT + 1,
                observationOffset: DEFAULT_OBSERVATION_OFFSET + 1,
                observationIncrement: DEFAULT_OBSERVATION_INCREMENT + 1,
            };

            await oracle.setConfig(newConfig);

            await expect(oracle.setConfig(oldConfig))
                .to.emit(oracle, "ConfigUpdated")
                .withArgs(Object.values(newConfig), Object.values(oldConfig));

            expect(await oracle.source()).to.equal(oldConfig.source);
            expect(await oracle.observationAmount()).to.equal(oldConfig.observationAmount);
            expect(await oracle.observationOffset()).to.equal(oldConfig.observationOffset);
            expect(await oracle.observationIncrement()).to.equal(oldConfig.observationIncrement);
        });

        it("Reverts if the observation amount is zero", async function () {
            const config = {
                source: source.address,
                observationAmount: 0,
                observationOffset: DEFAULT_OBSERVATION_OFFSET,
                observationIncrement: DEFAULT_OBSERVATION_INCREMENT,
            };

            await expect(oracle.setConfig(config))
                .to.be.revertedWith("InvalidConfig")
                .withArgs(Object.values(config), ERROR_INVALID_AMOUNT);
        });

        it("Reverts if the observation increment is zero", async function () {
            const config = {
                source: source.address,
                observationAmount: DEFAULT_OBSERVATION_AMOUNT,
                observationOffset: DEFAULT_OBSERVATION_OFFSET,
                observationIncrement: 0,
            };

            await expect(oracle.setConfig(config))
                .to.be.revertedWith("InvalidConfig")
                .withArgs(Object.values(config), ERROR_INVALID_INCREMENT);
        });

        it("Reverts if the source is the zero address", async function () {
            const config = {
                source: ethers.constants.AddressZero,
                observationAmount: DEFAULT_OBSERVATION_AMOUNT,
                observationOffset: DEFAULT_OBSERVATION_OFFSET,
                observationIncrement: DEFAULT_OBSERVATION_INCREMENT,
            };

            await expect(oracle.setConfig(config))
                .to.be.revertedWith("InvalidConfig")
                .withArgs(Object.values(config), ERROR_INVALID_SOURCE);
        });

        it("Reverts if the quote token decimals of the new source is not the same as the current one", async function () {
            const sourceFactory = await ethers.getContractFactory("HistoricalOracleStub");
            const newSource = await sourceFactory.deploy(WETH);
            await newSource.deployed();

            const config = {
                source: newSource.address,
                observationAmount: DEFAULT_OBSERVATION_AMOUNT,
                observationOffset: DEFAULT_OBSERVATION_OFFSET,
                observationIncrement: DEFAULT_OBSERVATION_INCREMENT,
            };

            await expect(oracle.setConfig(config))
                .to.be.revertedWith("InvalidConfig")
                .withArgs(Object.values(config), ERROR_INVALID_SOURCE_DECIMAL_MISMATCH);
        });

        it("Reverts if the liquidity decimals of the new source is not the same as the current one", async function () {
            const sourceFactory = await ethers.getContractFactory("HistoricalOracleStub");
            const newSource = await sourceFactory.deploy(DEFAULT_QUOTE_TOKEN_ADDRESS);
            await newSource.deployed();

            await newSource.stubSetLiquidityDecimals(17);

            const config = {
                source: newSource.address,
                observationAmount: DEFAULT_OBSERVATION_AMOUNT,
                observationOffset: DEFAULT_OBSERVATION_OFFSET,
                observationIncrement: DEFAULT_OBSERVATION_INCREMENT,
            };

            await expect(oracle.setConfig(config))
                .to.be.revertedWith("InvalidConfig")
                .withArgs(Object.values(config), ERROR_INVALID_SOURCE_DECIMAL_MISMATCH);
        });
    });

    describe(contractName + "#update", function () {
        var oracle;
        var source;

        beforeEach(async function () {
            const deployment = await deployFunction();
            oracle = deployment.oracle;
            source = deployment.source;

            // Push enough data to the source so that the oracle can update
            const amountToPush =
                DEFAULT_OBSERVATION_AMOUNT * DEFAULT_OBSERVATION_INCREMENT + DEFAULT_OBSERVATION_OFFSET + 1;
            for (var i = 0; i < amountToPush; i++) {
                const price = ethers.utils.parseUnits("2.0", DEFAULT_QUOTE_TOKEN_DECIMALS);
                const tokenLiquidity = ethers.utils.parseUnits("3.0", DEFAULT_LIQUIDITY_DECIMALS);
                const quoteTokenLiquidity = ethers.utils.parseUnits("5.0", DEFAULT_LIQUIDITY_DECIMALS);

                await source.stubPushNow(WETH, price, tokenLiquidity, quoteTokenLiquidity);
            }

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
    });

    describe(contractName + "#supportsInterface(interfaceId)", function () {
        var oracle;
        var interfaceIds;

        beforeEach(async () => {
            const deployment = await deployFunction();
            oracle = deployment.oracle;

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

        it("Should support IHistoricalOracle", async () => {
            const interfaceId = await interfaceIds.iHistoricalOracle();
            expect(await oracle["supportsInterface(bytes4)"](interfaceId)).to.equal(true);
        });
    });
}

describeManagedHistoricalAggregatorOracleTests("ManagedMedianFilteringOracle", deployDefaultMedianFilteringOracle);
describeManagedHistoricalAggregatorOracleTests("ManagedPriceVolatilityOracle", deployDefaultPriceVolatilityOracle);
