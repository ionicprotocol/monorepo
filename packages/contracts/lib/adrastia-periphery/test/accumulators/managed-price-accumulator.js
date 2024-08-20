const { expect } = require("chai");
const { ethers } = require("hardhat");

const BigNumber = ethers.BigNumber;

const {
    abi: ARITHMETIC_AVERAGING_ABI,
    bytecode: ARITHMETIC_AVERAGING_BYTECODE,
} = require("@adrastia-oracle/adrastia-core/artifacts/contracts/strategies/averaging/ArithmeticAveraging.sol/ArithmeticAveraging.json");

const uniswapV2FactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const uniswapV2InitCodeHash = "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f";
const uniswapV3FactoryAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const uniswapV3InitCodeHash = "0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54";

const algebraInitCodeHash = "0x6ec6c9c8091d160c0aa74b2b14ba9c1717e95093bd3ac085cee99a49aab294a4";

const cUSDC = "0x39AA39c021dfbaE8faC545936693aC917d5E7563"; // Compound v2 on mainnet
const cometAddress = "0xc3d688B66703497DAA19211EEdff47f25384cdc3"; // cUSDCv3 on mainnet
const aaveV2Pool = "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9"; // Aave v2 on mainnet
const aaveV3Pool = "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2"; // Aave v3 on mainnet

const balancerV2Vault = "0xBA12222222228d8Ba445958a75a0704d566BF2C8"; // Balancer v2 on mainnet
const balancerV2StablePoolId = "0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080"; // wstETH/WETH on mainnet
const balancerV2WeightedPoolId = "0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014"; // BAL/WETH on mainnet

const UPDATER_ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("UPDATER_ADMIN_ROLE"));
const ORACLE_UPDATER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ORACLE_UPDATER_ROLE"));
const CONFIG_ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("CONFIG_ADMIN_ROLE"));

const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const wstETH = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0";
const BAL = "0xba100000625a3754423978a60c9317c58a424e3D";

const SUPPLY_RATE_TOKEN = "0x0000000000000000000000000000000000000010";

const MIN_UPDATE_DELAY = 1;
const MAX_UPDATE_DELAY = 2;
const TWO_PERCENT_CHANGE = 2000000;

const SECONDS_PER_YEAR = BigNumber.from(365 * 24 * 60 * 60);
const BLOCKS_PER_YEAR = SECONDS_PER_YEAR.div(12); // 12 seconds per block

const DEFAULT_CONFIG = {
    updateThreshold: TWO_PERCENT_CHANGE,
    updateDelay: MIN_UPDATE_DELAY,
    heartbeat: MAX_UPDATE_DELAY,
};

async function currentBlockTimestamp() {
    const currentBlockNumber = await ethers.provider.getBlockNumber();

    return await blockTimestamp(currentBlockNumber);
}

async function blockTimestamp(blockNum) {
    return (await ethers.provider.getBlock(blockNum)).timestamp;
}

function describePriceAccumulatorTests(
    contractName,
    deployFunction,
    generateUpdateDataFunction,
    updaterRoleCanBeOpen,
    smartContractsCanUpdate,
    token
) {
    describe(contractName + "#setConfig", function () {
        var accumulator;

        beforeEach(async function () {
            accumulator = await deployFunction();

            const [owner] = await ethers.getSigners();

            // Grant owner the config admin role
            await accumulator.grantRole(CONFIG_ADMIN_ROLE, owner.address);
        });

        it("Only accounts with config admin role can set config", async function () {
            const [, addr1] = await ethers.getSigners();

            expect(await accumulator.hasRole(CONFIG_ADMIN_ROLE, addr1.address)).to.equal(false);

            await expect(accumulator.connect(addr1).setConfig(DEFAULT_CONFIG)).to.be.revertedWith(/AccessControl: .*/);
        });

        it("Works", async function () {
            const config = {
                updateThreshold: TWO_PERCENT_CHANGE * 2,
                updateDelay: MIN_UPDATE_DELAY + 100,
                heartbeat: MAX_UPDATE_DELAY + 100,
            };

            const tx = await accumulator.setConfig(config);
            const receipt = await tx.wait();

            expect(receipt.events[0].event).to.equal("ConfigUpdated");
            // Expect that the first event parameter is the DEFAULT_CONFIG object
            expect(receipt.events[0].args[0]).to.deep.equal(Object.values(DEFAULT_CONFIG));
            // Expect that the second event parameter is the config object
            expect(receipt.events[0].args[1]).to.deep.equal(Object.values(config));

            expect(await accumulator.updateThreshold()).to.equal(config.updateThreshold);
            expect(await accumulator.updateDelay()).to.equal(config.updateDelay);
            expect(await accumulator.heartbeat()).to.equal(config.heartbeat);
        });

        it("Reverts if updateThreshold is 0", async function () {
            const config = {
                updateThreshold: 0,
                updateDelay: MIN_UPDATE_DELAY + 100,
                heartbeat: MAX_UPDATE_DELAY + 100,
            };

            await expect(accumulator.setConfig(config)).to.be.revertedWith("InvalidConfig");
        });

        it("Reverts if updateDelay is greater than heartbeat", async function () {
            const config = {
                updateThreshold: TWO_PERCENT_CHANGE * 2,
                updateDelay: MAX_UPDATE_DELAY + 100,
                heartbeat: MIN_UPDATE_DELAY + 100,
            };

            await expect(accumulator.setConfig(config)).to.be.revertedWith("InvalidConfig");
        });
    });

    describe(contractName + "#update", function () {
        var accumulator;

        beforeEach(async () => {
            accumulator = await deployFunction();

            const [owner] = await ethers.getSigners();

            // Grant owner the updater admin role
            await accumulator.grantRole(UPDATER_ADMIN_ROLE, owner.address);

            // Grant owner the oracle updater role
            await accumulator.grantRole(ORACLE_UPDATER_ROLE, owner.address);
        });

        describe("Only accounts with oracle updater role can update", function () {
            it("Accounts with oracle updater role can update", async function () {
                const updateData = await generateUpdateDataFunction(accumulator, token);

                expect(await accumulator.canUpdate(updateData)).to.equal(true);

                expect(await accumulator.update(updateData)).to.emit(accumulator, "Updated");

                // Increase time so that the accumulator needs another update
                await hre.timeAndMine.increaseTime(MAX_UPDATE_DELAY + 1);

                // The second call has some different functionality, so ensure that the results are the same for it
                expect(await accumulator.update(updateData)).to.emit(accumulator, "Updated");
            });

            it("Accounts without oracle updater role cannot update", async function () {
                const updateData = await generateUpdateDataFunction(accumulator, token);

                const [, addr1] = await ethers.getSigners();

                expect(await accumulator.connect(addr1).canUpdate(updateData)).to.equal(false);

                const revertReason = updaterRoleCanBeOpen ? "MissingRole" : /AccessControl: .*/;

                await expect(accumulator.connect(addr1).update(updateData)).to.be.revertedWith(revertReason);

                // Increase time so that the accumulator needs another update
                await hre.timeAndMine.increaseTime(MAX_UPDATE_DELAY + 1);

                // The second call has some different functionality, so ensure that the results are the same for it
                await expect(accumulator.connect(addr1).update(updateData)).to.be.revertedWith(revertReason);
            });
        });

        describe("Smart contracts " + (smartContractsCanUpdate ? "can" : "can't") + " update", function () {
            var updateableCallerFactory;

            beforeEach(async function () {
                // Allow every address to update (if the role is open)
                await accumulator.grantRole(ORACLE_UPDATER_ROLE, ethers.constants.AddressZero);

                updateableCallerFactory = await ethers.getContractFactory("UpdateableCaller");
            });

            if (updaterRoleCanBeOpen) {
                // Note: If the updater role is not open, we can't test this because we can't grant the role to the
                // updateable caller before it's deployed
                it((smartContractsCanUpdate ? "Can" : "Can't") + " update in the constructor", async function () {
                    const updateData = await generateUpdateDataFunction(accumulator, token);

                    if (!smartContractsCanUpdate) {
                        await expect(
                            updateableCallerFactory.deploy(accumulator.address, true, updateData)
                        ).to.be.revertedWith("PriceAccumulator: MUST_BE_EOA");
                    } else {
                        await expect(updateableCallerFactory.deploy(accumulator.address, true, updateData)).to.not.be
                            .reverted;
                    }
                });
            }

            it((smartContractsCanUpdate ? "Can" : "Can't") + " update in a function call", async function () {
                const updateData = await generateUpdateDataFunction(accumulator, token);

                const updateableCaller = await updateableCallerFactory.deploy(accumulator.address, false, updateData);
                await updateableCaller.deployed();

                // Grant the updater role to the updateable caller
                await accumulator.grantRole(ORACLE_UPDATER_ROLE, updateableCaller.address);

                if (!smartContractsCanUpdate) {
                    await expect(updateableCaller.callUpdate()).to.be.revertedWith("PriceAccumulator: MUST_BE_EOA");
                } else {
                    await expect(updateableCaller.callUpdate()).to.not.be.reverted;
                }
            });
        });

        describe(
            "All accounts " +
                (updaterRoleCanBeOpen ? "can" : "cannot") +
                " update if the role is assigned to address(0)",
            function () {
                beforeEach(async () => {
                    // Grant everyone the oracle updater role
                    await accumulator.grantRole(ORACLE_UPDATER_ROLE, ethers.constants.AddressZero);
                });

                it("Accounts with oracle updater role can still update", async function () {
                    const updateData = await generateUpdateDataFunction(accumulator, token);

                    expect(await accumulator.canUpdate(updateData)).to.equal(true);

                    expect(await accumulator.update(updateData)).to.emit(accumulator, "Updated");

                    // Increase time so that the accumulator needs another update
                    await hre.timeAndMine.increaseTime(MAX_UPDATE_DELAY + 1);

                    // The second call has some different functionality, so ensure that the results are the same for it
                    expect(await accumulator.update(updateData)).to.emit(accumulator, "Updated");
                });

                it(
                    "Accounts without oracle updater role " + (updaterRoleCanBeOpen ? "can" : "cannot") + " update",
                    async function () {
                        const updateData = await generateUpdateDataFunction(accumulator, token);

                        const [owner, addr1] = await ethers.getSigners();

                        expect(await accumulator.connect(addr1).canUpdate(updateData)).to.equal(updaterRoleCanBeOpen);

                        if (updaterRoleCanBeOpen) {
                            await expect(accumulator.connect(addr1).update(updateData)).to.emit(accumulator, "Updated");

                            // Increase time so that the accumulator needs another update
                            await hre.timeAndMine.increaseTime(MAX_UPDATE_DELAY + 1);

                            // The second call has some different functionality, so ensure that the results are the same for it
                            await expect(accumulator.connect(addr1).update(updateData)).to.emit(accumulator, "Updated");
                        } else {
                            await expect(accumulator.connect(addr1).update(updateData)).to.be.reverted;

                            // The second call has some different functionality, so ensure that the results are the same for it
                            // We first make an update with the owner
                            await expect(accumulator.connect(owner).update(updateData)).to.emit(accumulator, "Updated");

                            // Increase time so that the accumulator needs another update
                            await hre.timeAndMine.increaseTime(MAX_UPDATE_DELAY + 1);

                            // We make sure that the other address still can't update
                            await expect(accumulator.connect(addr1).update(updateData)).to.be.reverted;
                        }
                    }
                );
            }
        );
    });

    describe(contractName + "#supportsInterface(interfaceId)", function () {
        var accumulator;
        var interfaceIds;

        beforeEach(async () => {
            accumulator = await deployFunction();

            const interfaceIdsFactory = await ethers.getContractFactory("InterfaceIds");
            interfaceIds = await interfaceIdsFactory.deploy();
        });

        it("Should support IAccessControl", async () => {
            const interfaceId = await interfaceIds.iAccessControl();
            expect(await accumulator["supportsInterface(bytes4)"](interfaceId)).to.equal(true);
        });

        it("Should support IAccessControlEnumerable", async () => {
            const interfaceId = await interfaceIds.iAccessControlEnumerable();
            expect(await accumulator["supportsInterface(bytes4)"](interfaceId)).to.equal(true);
        });

        it("Should support IAccumulator", async () => {
            const interfaceId = await interfaceIds.iAccumulator();
            expect(await accumulator["supportsInterface(bytes4)"](interfaceId)).to.equal(true);
        });
    });
}

async function deployOffchainPriceAccumulator() {
    // Deploy the averaging strategy
    const averagingStrategyFactory = await ethers.getContractFactory(
        ARITHMETIC_AVERAGING_ABI,
        ARITHMETIC_AVERAGING_BYTECODE
    );
    const averagingStrategy = await averagingStrategyFactory.deploy();
    await averagingStrategy.deployed();

    // Deploy accumulator
    const accumulatorFactory = await ethers.getContractFactory("ManagedOffchainPriceAccumulator");
    return await accumulatorFactory.deploy(
        averagingStrategy.address,
        USDC,
        TWO_PERCENT_CHANGE,
        MIN_UPDATE_DELAY,
        MAX_UPDATE_DELAY
    );
}

async function generateOffchainUpdateData(accumulator, token) {
    const price = ethers.utils.parseUnits("1.2357", 18);

    const updateData = ethers.utils.defaultAbiCoder.encode(
        ["address", "uint", "uint"],
        [token, price, await currentBlockTimestamp()]
    );

    return updateData;
}

async function deployCurvePriceAccumulator() {
    // Deploy the curve pool
    const poolFactory = await ethers.getContractFactory("CurvePoolStub");
    const curvePool = await poolFactory.deploy([WETH, USDC]);
    await curvePool.deployed();

    // Deploy the averaging strategy
    const averagingStrategyFactory = await ethers.getContractFactory(
        ARITHMETIC_AVERAGING_ABI,
        ARITHMETIC_AVERAGING_BYTECODE
    );
    const averagingStrategy = await averagingStrategyFactory.deploy();
    await averagingStrategy.deployed();

    // Deploy accumulator
    const accumulatorFactory = await ethers.getContractFactory("ManagedCurvePriceAccumulator");
    return await accumulatorFactory.deploy(
        averagingStrategy.address,
        curvePool.address,
        2,
        USDC,
        USDC,
        TWO_PERCENT_CHANGE,
        MIN_UPDATE_DELAY,
        MAX_UPDATE_DELAY
    );
}

async function deployUniswapV2PriceAccumulator() {
    // Deploy the averaging strategy
    const averagingStrategyFactory = await ethers.getContractFactory(
        ARITHMETIC_AVERAGING_ABI,
        ARITHMETIC_AVERAGING_BYTECODE
    );
    const averagingStrategy = await averagingStrategyFactory.deploy();
    await averagingStrategy.deployed();

    // Deploy accumulator
    const accumulatorFactory = await ethers.getContractFactory("ManagedUniswapV2PriceAccumulator");
    return await accumulatorFactory.deploy(
        averagingStrategy.address,
        uniswapV2FactoryAddress,
        uniswapV2InitCodeHash,
        USDC,
        TWO_PERCENT_CHANGE,
        MIN_UPDATE_DELAY,
        MAX_UPDATE_DELAY
    );
}

async function deployUniswapV3PriceAccumulator() {
    // Deploy the averaging strategy
    const averagingStrategyFactory = await ethers.getContractFactory(
        ARITHMETIC_AVERAGING_ABI,
        ARITHMETIC_AVERAGING_BYTECODE
    );
    const averagingStrategy = await averagingStrategyFactory.deploy();
    await averagingStrategy.deployed();

    // Deploy accumulator
    const accumulatorFactory = await ethers.getContractFactory("ManagedUniswapV3PriceAccumulator");
    return await accumulatorFactory.deploy(
        averagingStrategy.address,
        uniswapV3FactoryAddress,
        uniswapV3InitCodeHash,
        [3000],
        USDC,
        TWO_PERCENT_CHANGE,
        MIN_UPDATE_DELAY,
        MAX_UPDATE_DELAY
    );
}

async function deployAlgebraPriceAccumulator() {
    // Deploy the averaging strategy
    const averagingStrategyFactory = await ethers.getContractFactory(
        ARITHMETIC_AVERAGING_ABI,
        ARITHMETIC_AVERAGING_BYTECODE
    );
    const averagingStrategy = await averagingStrategyFactory.deploy();
    await averagingStrategy.deployed();

    // Deploy accumulator
    const accumulatorFactory = await ethers.getContractFactory("AlgebraPriceAccumulatorStub");
    return await accumulatorFactory.deploy(
        averagingStrategy.address,
        ethers.constants.AddressZero,
        algebraInitCodeHash,
        USDC,
        TWO_PERCENT_CHANGE,
        MIN_UPDATE_DELAY,
        MAX_UPDATE_DELAY
    );
}

async function deployCompoundV2RateAccumulator() {
    // Deploy the averaging strategy
    const averagingStrategyFactory = await ethers.getContractFactory(
        ARITHMETIC_AVERAGING_ABI,
        ARITHMETIC_AVERAGING_BYTECODE
    );
    const averagingStrategy = await averagingStrategyFactory.deploy();
    await averagingStrategy.deployed();

    // Deploy accumulator
    const accumulatorFactory = await ethers.getContractFactory("ManagedCompoundV2RateAccumulator");
    return await accumulatorFactory.deploy(
        averagingStrategy.address,
        BLOCKS_PER_YEAR,
        cUSDC,
        USDC,
        TWO_PERCENT_CHANGE,
        MIN_UPDATE_DELAY,
        MAX_UPDATE_DELAY
    );
}

async function deployCometRateAccumulator() {
    // Deploy the averaging strategy
    const averagingStrategyFactory = await ethers.getContractFactory(
        ARITHMETIC_AVERAGING_ABI,
        ARITHMETIC_AVERAGING_BYTECODE
    );
    const averagingStrategy = await averagingStrategyFactory.deploy();
    await averagingStrategy.deployed();

    // Deploy accumulator
    const accumulatorFactory = await ethers.getContractFactory("ManagedCometRateAccumulator");
    return await accumulatorFactory.deploy(
        averagingStrategy.address,
        cometAddress,
        TWO_PERCENT_CHANGE,
        MIN_UPDATE_DELAY,
        MAX_UPDATE_DELAY
    );
}

async function deployAaveV2RateAccumulator() {
    // Deploy the averaging strategy
    const averagingStrategyFactory = await ethers.getContractFactory(
        ARITHMETIC_AVERAGING_ABI,
        ARITHMETIC_AVERAGING_BYTECODE
    );
    const averagingStrategy = await averagingStrategyFactory.deploy();
    await averagingStrategy.deployed();

    // Deploy accumulator
    const accumulatorFactory = await ethers.getContractFactory("ManagedAaveV2RateAccumulator");
    return await accumulatorFactory.deploy(
        averagingStrategy.address,
        aaveV2Pool,
        USDC,
        TWO_PERCENT_CHANGE,
        MIN_UPDATE_DELAY,
        MAX_UPDATE_DELAY
    );
}

async function deployAaveV3RateAccumulator() {
    // Deploy the averaging strategy
    const averagingStrategyFactory = await ethers.getContractFactory(
        ARITHMETIC_AVERAGING_ABI,
        ARITHMETIC_AVERAGING_BYTECODE
    );
    const averagingStrategy = await averagingStrategyFactory.deploy();
    await averagingStrategy.deployed();

    // Deploy accumulator
    const accumulatorFactory = await ethers.getContractFactory("ManagedAaveV3RateAccumulator");
    return await accumulatorFactory.deploy(
        averagingStrategy.address,
        aaveV3Pool,
        USDC,
        TWO_PERCENT_CHANGE,
        MIN_UPDATE_DELAY,
        MAX_UPDATE_DELAY
    );
}

async function deployBalancerV2StablePriceAccumulator() {
    // Deploy the averaging strategy
    const averagingStrategyFactory = await ethers.getContractFactory(
        ARITHMETIC_AVERAGING_ABI,
        ARITHMETIC_AVERAGING_BYTECODE
    );
    const averagingStrategy = await averagingStrategyFactory.deploy();
    await averagingStrategy.deployed();

    // Deploy accumulator
    const accumulatorFactory = await ethers.getContractFactory("ManagedBalancerV2StablePriceAccumulator");
    return await accumulatorFactory.deploy(
        averagingStrategy.address,
        balancerV2Vault,
        balancerV2StablePoolId,
        WETH,
        TWO_PERCENT_CHANGE,
        MIN_UPDATE_DELAY,
        MAX_UPDATE_DELAY
    );
}

async function deployBalancerV2WeightedPriceAccumulator() {
    // Deploy the averaging strategy
    const averagingStrategyFactory = await ethers.getContractFactory(
        ARITHMETIC_AVERAGING_ABI,
        ARITHMETIC_AVERAGING_BYTECODE
    );
    const averagingStrategy = await averagingStrategyFactory.deploy();
    await averagingStrategy.deployed();

    // Deploy accumulator
    const accumulatorFactory = await ethers.getContractFactory("ManagedBalancerV2WeightedPriceAccumulator");
    return await accumulatorFactory.deploy(
        averagingStrategy.address,
        balancerV2Vault,
        balancerV2WeightedPoolId,
        WETH,
        TWO_PERCENT_CHANGE,
        MIN_UPDATE_DELAY,
        MAX_UPDATE_DELAY
    );
}

async function generateOnchainUpdateData(accumulator, token) {
    const price = await accumulator["consultPrice(address,uint256)"](token, 0);

    const updateData = ethers.utils.defaultAbiCoder.encode(
        ["address", "uint", "uint"],
        [token, price, await currentBlockTimestamp()]
    );

    return updateData;
}

describePriceAccumulatorTests(
    "ManagedOffchainPriceAccumulator",
    deployOffchainPriceAccumulator,
    generateOffchainUpdateData,
    /*
    The role can't be open because updaters have full control over the data that the accumulator stores. There are
    no cases where it would be beneficial to allow anyone to update the accumulator.
    */
    false,
    /*
    Smart contracts can update the accumulator because there's no extra power that they would gain by being able to
    so. Updaters already have full control over the data that the accumulator stores.
    */
    true,
    WETH
);

describePriceAccumulatorTests(
    "ManagedCurvePriceAccumulator",
    deployCurvePriceAccumulator,
    generateOnchainUpdateData,
    /*
    The role can be open because updaters don't have full control over the data that the accumulator stores. There are
    cases where it would be beneficial to allow anyone to update the accumulator.
    */
    true,
    /*
    Smart contracts can't update the accumulator because it's susceptible to flash loan attack manipulation.
    */
    false,
    WETH
);

describePriceAccumulatorTests(
    "ManagedUniswapV2PriceAccumulator",
    deployUniswapV2PriceAccumulator,
    generateOnchainUpdateData,
    /*
    The role can be open because updaters don't have full control over the data that the accumulator stores. There are
    cases where it would be beneficial to allow anyone to update the accumulator.
    */
    true,
    /*
    Smart contracts can't update the accumulator because it's susceptible to flash loan attack manipulation.
    */
    false,
    WETH
);

describePriceAccumulatorTests(
    "ManagedUniswapV3PriceAccumulator",
    deployUniswapV3PriceAccumulator,
    generateOnchainUpdateData,
    /*
    The role can be open because updaters don't have full control over the data that the accumulator stores. There are
    cases where it would be beneficial to allow anyone to update the accumulator.
    */
    true,
    /*
    Smart contracts can't update the accumulator because it's susceptible to flash loan attack manipulation.
    */
    false,
    WETH
);

describePriceAccumulatorTests(
    "ManagedAlgebraPriceAccumulator",
    deployAlgebraPriceAccumulator,
    generateOnchainUpdateData,
    /*
    The role can be open because updaters don't have full control over the data that the accumulator stores. There are
    cases where it would be beneficial to allow anyone to update the accumulator.
    */
    true,
    /*
    Smart contracts can't update the accumulator because it's susceptible to flash loan attack manipulation.
    */
    false,
    WETH
);

describePriceAccumulatorTests(
    "ManagedCompoundV2RateAccumulator",
    deployCompoundV2RateAccumulator,
    generateOnchainUpdateData,
    /*
    The role can be open because updaters don't have full control over the data that the accumulator stores. There are
    cases where it would be beneficial to allow anyone to update the accumulator.
    */
    true,
    /*
    Smart contracts can't update the accumulator because it's susceptible to flash loan attack manipulation.
    */
    false,
    SUPPLY_RATE_TOKEN
);

describePriceAccumulatorTests(
    "ManagedCometRateAccumulator",
    deployCometRateAccumulator,
    generateOnchainUpdateData,
    /*
    The role can be open because updaters don't have full control over the data that the accumulator stores. There are
    cases where it would be beneficial to allow anyone to update the accumulator.
    */
    true,
    /*
    Smart contracts can't update the accumulator because it's susceptible to flash loan attack manipulation.
    */
    false,
    SUPPLY_RATE_TOKEN
);

describePriceAccumulatorTests(
    "ManagedAaveV2RateAccumulator",
    deployAaveV2RateAccumulator,
    generateOnchainUpdateData,
    /*
    The role can be open because updaters don't have full control over the data that the accumulator stores. There are
    cases where it would be beneficial to allow anyone to update the accumulator.
    */
    true,
    /*
    Smart contracts can't update the accumulator because it's susceptible to flash loan attack manipulation.
    */
    false,
    SUPPLY_RATE_TOKEN
);

describePriceAccumulatorTests(
    "ManagedAaveV3RateAccumulator",
    deployAaveV3RateAccumulator,
    generateOnchainUpdateData,
    /*
    The role can be open because updaters don't have full control over the data that the accumulator stores. There are
    cases where it would be beneficial to allow anyone to update the accumulator.
    */
    true,
    /*
    Smart contracts can't update the accumulator because it's susceptible to flash loan attack manipulation.
    */
    false,
    SUPPLY_RATE_TOKEN
);

describePriceAccumulatorTests(
    "ManagedBalancerV2StablePriceAccumulator",
    deployBalancerV2StablePriceAccumulator,
    generateOnchainUpdateData,
    /*
    The role can be open because updaters don't have full control over the data that the accumulator stores. There are
    cases where it would be beneficial to allow anyone to update the accumulator.
    */
    true,
    /*
    Smart contracts can't update the accumulator because it's susceptible to flash loan attack manipulation.
    */
    false,
    wstETH
);

describePriceAccumulatorTests(
    "ManagedBalancerV2WeightedPriceAccumulator",
    deployBalancerV2WeightedPriceAccumulator,
    generateOnchainUpdateData,
    /*
    The role can be open because updaters don't have full control over the data that the accumulator stores. There are
    cases where it would be beneficial to allow anyone to update the accumulator.
    */
    true,
    /*
    Smart contracts can't update the accumulator because it's susceptible to flash loan attack manipulation.
    */
    false,
    BAL
);
