const { expect } = require("chai");
const { ethers } = require("hardhat");

const {
    abi: ARITHMETIC_AVERAGING_ABI,
    bytecode: ARITHMETIC_AVERAGING_BYTECODE,
} = require("@adrastia-oracle/adrastia-core/artifacts/contracts/strategies/averaging/ArithmeticAveraging.sol/ArithmeticAveraging.json");

const uniswapV2FactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const uniswapV2InitCodeHash = "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f";
const uniswapV3FactoryAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const uniswapV3InitCodeHash = "0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54";

const algebraInitCodeHash = "0x6ec6c9c8091d160c0aa74b2b14ba9c1717e95093bd3ac085cee99a49aab294a4";

const balancerV2Vault = "0xBA12222222228d8Ba445958a75a0704d566BF2C8"; // Balancer v2 on mainnet
const balancerV2WeightedPoolId = "0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014"; // BAL/WETH on mainnet

const UPDATER_ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("UPDATER_ADMIN_ROLE"));
const ORACLE_UPDATER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ORACLE_UPDATER_ROLE"));
const CONFIG_ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("CONFIG_ADMIN_ROLE"));

const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const BAL = "0xba100000625a3754423978a60c9317c58a424e3D";

const MIN_UPDATE_DELAY = 1;
const MAX_UPDATE_DELAY = 2;
const TWO_PERCENT_CHANGE = 2000000;

const DEFAULT_CONFIG = {
    updateThreshold: TWO_PERCENT_CHANGE,
    updateDelay: MIN_UPDATE_DELAY,
    heartbeat: MAX_UPDATE_DELAY,
};

const DEFAULT_DECIMALS = 18;

async function currentBlockTimestamp() {
    const currentBlockNumber = await ethers.provider.getBlockNumber();

    return await blockTimestamp(currentBlockNumber);
}

async function blockTimestamp(blockNum) {
    return (await ethers.provider.getBlock(blockNum)).timestamp;
}

function describeLiquidityAccumulatorTests(
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
                        ).to.be.revertedWith("LiquidityAccumulator: MUST_BE_EOA");
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
                    await expect(updateableCaller.callUpdate()).to.be.revertedWith("LiquidityAccumulator: MUST_BE_EOA");
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

async function deployOffchainLiquidityAccumulator() {
    // Deploy the averaging strategy
    const averagingStrategyFactory = await ethers.getContractFactory(
        ARITHMETIC_AVERAGING_ABI,
        ARITHMETIC_AVERAGING_BYTECODE
    );
    const averagingStrategy = await averagingStrategyFactory.deploy();
    await averagingStrategy.deployed();

    // Deploy accumulator
    const accumulatorFactory = await ethers.getContractFactory("ManagedOffchainLiquidityAccumulator");
    return await accumulatorFactory.deploy(
        averagingStrategy.address,
        USDC,
        DEFAULT_DECIMALS,
        TWO_PERCENT_CHANGE,
        MIN_UPDATE_DELAY,
        MAX_UPDATE_DELAY
    );
}

async function generateOffchainUpdateData(accumulator, token) {
    const tokenLiquidity = ethers.utils.parseUnits("2.35", 18);
    const quoteTokenLiquidity = ethers.utils.parseUnits("3.5711", 18);

    const updateData = ethers.utils.defaultAbiCoder.encode(
        ["address", "uint", "uint", "uint"],
        [token, tokenLiquidity, quoteTokenLiquidity, await currentBlockTimestamp()]
    );

    return updateData;
}

async function deployCurveLiquidityAccumulator() {
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
    const accumulatorFactory = await ethers.getContractFactory("ManagedCurveLiquidityAccumulator");
    return await accumulatorFactory.deploy(
        averagingStrategy.address,
        curvePool.address,
        2,
        USDC,
        USDC,
        0, // Liquidity decimals
        TWO_PERCENT_CHANGE,
        MIN_UPDATE_DELAY,
        MAX_UPDATE_DELAY
    );
}

async function deployUniswapV2LiquidityAccumulator() {
    // Deploy the averaging strategy
    const averagingStrategyFactory = await ethers.getContractFactory(
        ARITHMETIC_AVERAGING_ABI,
        ARITHMETIC_AVERAGING_BYTECODE
    );
    const averagingStrategy = await averagingStrategyFactory.deploy();
    await averagingStrategy.deployed();

    // Deploy accumulator
    const accumulatorFactory = await ethers.getContractFactory("ManagedUniswapV2LiquidityAccumulator");
    return await accumulatorFactory.deploy(
        averagingStrategy.address,
        uniswapV2FactoryAddress,
        uniswapV2InitCodeHash,
        USDC,
        0, // Liquidity decimals
        TWO_PERCENT_CHANGE,
        MIN_UPDATE_DELAY,
        MAX_UPDATE_DELAY
    );
}

async function deployUniswapV3LiquidityAccumulator() {
    // Deploy the averaging strategy
    const averagingStrategyFactory = await ethers.getContractFactory(
        ARITHMETIC_AVERAGING_ABI,
        ARITHMETIC_AVERAGING_BYTECODE
    );
    const averagingStrategy = await averagingStrategyFactory.deploy();
    await averagingStrategy.deployed();

    // Deploy accumulator
    const accumulatorFactory = await ethers.getContractFactory("ManagedUniswapV3LiquidityAccumulator");
    return await accumulatorFactory.deploy(
        averagingStrategy.address,
        uniswapV3FactoryAddress,
        uniswapV3InitCodeHash,
        [3000],
        USDC,
        0, // Liquidity decimals
        TWO_PERCENT_CHANGE,
        MIN_UPDATE_DELAY,
        MAX_UPDATE_DELAY
    );
}

async function deployAlgebraLiquidityAccumulator() {
    // Deploy the averaging strategy
    const averagingStrategyFactory = await ethers.getContractFactory(
        ARITHMETIC_AVERAGING_ABI,
        ARITHMETIC_AVERAGING_BYTECODE
    );
    const averagingStrategy = await averagingStrategyFactory.deploy();
    await averagingStrategy.deployed();

    // Deploy accumulator
    const accumulatorFactory = await ethers.getContractFactory("AlgebraLiquidityAccumulatorStub");
    return await accumulatorFactory.deploy(
        averagingStrategy.address,
        ethers.constants.AddressZero,
        algebraInitCodeHash,
        USDC,
        0, // Liquidity decimals
        TWO_PERCENT_CHANGE,
        MIN_UPDATE_DELAY,
        MAX_UPDATE_DELAY
    );
}

async function deployBalancerV2LiquidityAccumulator() {
    // Deploy the averaging strategy
    const averagingStrategyFactory = await ethers.getContractFactory(
        ARITHMETIC_AVERAGING_ABI,
        ARITHMETIC_AVERAGING_BYTECODE
    );
    const averagingStrategy = await averagingStrategyFactory.deploy();
    await averagingStrategy.deployed();

    // Deploy accumulator
    const accumulatorFactory = await ethers.getContractFactory("ManagedBalancerV2LiquidityAccumulator");
    return await accumulatorFactory.deploy(
        averagingStrategy.address,
        balancerV2Vault,
        balancerV2WeightedPoolId,
        WETH,
        0, // Liquidity decimals
        TWO_PERCENT_CHANGE,
        MIN_UPDATE_DELAY,
        MAX_UPDATE_DELAY
    );
}

async function generateDexBasedUpdateData(accumulator, token) {
    const liquidity = await accumulator["consultLiquidity(address,uint256)"](token, 0);

    const updateData = ethers.utils.defaultAbiCoder.encode(
        ["address", "uint", "uint", "uint"],
        [token, liquidity["tokenLiquidity"], liquidity["quoteTokenLiquidity"], await currentBlockTimestamp()]
    );

    return updateData;
}

describeLiquidityAccumulatorTests(
    "ManagedOffchainLiquidityAccumulator",
    deployOffchainLiquidityAccumulator,
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

describeLiquidityAccumulatorTests(
    "ManagedCurveLiquidityAccumulator",
    deployCurveLiquidityAccumulator,
    generateDexBasedUpdateData,
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

describeLiquidityAccumulatorTests(
    "ManagedUniswapV2LiquidityAccumulator",
    deployUniswapV2LiquidityAccumulator,
    generateDexBasedUpdateData,
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

describeLiquidityAccumulatorTests(
    "ManagedUniswapV3LiquidityAccumulator",
    deployUniswapV3LiquidityAccumulator,
    generateDexBasedUpdateData,
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

describeLiquidityAccumulatorTests(
    "ManagedAlgebraLiquidityAccumulator",
    deployAlgebraLiquidityAccumulator,
    generateDexBasedUpdateData,
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

describeLiquidityAccumulatorTests(
    "ManagedBalancerV2LiquidityAccumulator",
    deployBalancerV2LiquidityAccumulator,
    generateDexBasedUpdateData,
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
