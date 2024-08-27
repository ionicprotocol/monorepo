const { expect } = require("chai");
const { ethers } = require("hardhat");

const {
    abi: ARITHMETIC_AVERAGING_ABI,
    bytecode: ARITHMETIC_AVERAGING_BYTECODE,
} = require("@adrastia-oracle/adrastia-core/artifacts/contracts/strategies/averaging/ArithmeticAveraging.sol/ArithmeticAveraging.json");

const UPDATER_ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("UPDATER_ADMIN_ROLE"));
const ORACLE_UPDATER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ORACLE_UPDATER_ROLE"));

const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

const MIN_UPDATE_DELAY = 1;
const MAX_UPDATE_DELAY = 2;
const TWO_PERCENT_CHANGE = 2000000;
const PERIOD = 100;
const GRANULARITY = 1;

async function currentBlockTimestamp() {
    const currentBlockNumber = await ethers.provider.getBlockNumber();

    return await blockTimestamp(currentBlockNumber);
}

async function blockTimestamp(blockNum) {
    return (await ethers.provider.getBlock(blockNum)).timestamp;
}

describe("ManagedPeriodicAccumulationOracle#update", function () {
    var oracle;

    beforeEach(async () => {
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

        // Deploy liquidity accumulator
        const liquidityAccumulatorFactory = await ethers.getContractFactory("CurveLiquidityAccumulatorStub");
        const liquidityAccumulator = await liquidityAccumulatorFactory.deploy(
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
        await liquidityAccumulator.deployed();

        const [tokenLiquidity, quoteTokenLiquidity] = await liquidityAccumulator["consultLiquidity(address,uint256)"](
            WETH,
            0
        );

        const laUpdateData = ethers.utils.defaultAbiCoder.encode(
            ["address", "uint", "uint", "uint"],
            [WETH, tokenLiquidity, quoteTokenLiquidity, await currentBlockTimestamp()]
        );

        // Initialize liquidity accumulator
        await liquidityAccumulator.update(laUpdateData);

        // Deploy price accumulator
        const priceAccumulatorFactory = await ethers.getContractFactory("CurvePriceAccumulatorStub");
        const priceAccumulator = await priceAccumulatorFactory.deploy(
            averagingStrategy.address,
            curvePool.address,
            2,
            USDC,
            USDC,
            TWO_PERCENT_CHANGE,
            MIN_UPDATE_DELAY,
            MAX_UPDATE_DELAY
        );
        await priceAccumulator.deployed();

        const price = await priceAccumulator["consultPrice(address,uint256)"](WETH, 0);

        const paUpdateData = ethers.utils.defaultAbiCoder.encode(
            ["address", "uint", "uint"],
            [WETH, price, await currentBlockTimestamp()]
        );

        // Initialize price accumulator
        await priceAccumulator.update(paUpdateData);

        // Deploy oracle
        const oracleFactory = await ethers.getContractFactory("ManagedPeriodicAccumulationOracle");
        oracle = await oracleFactory.deploy(
            liquidityAccumulator.address,
            priceAccumulator.address,
            WETH,
            PERIOD,
            GRANULARITY
        );

        const [owner] = await ethers.getSigners();

        // Grant owner the updater admin role
        await oracle.grantRole(UPDATER_ADMIN_ROLE, owner.address);

        // Grant owner the oracle updater role
        await oracle.grantRole(ORACLE_UPDATER_ROLE, owner.address);

        // Perform initial update so that later updates have enough data to calculate a price
        await oracle.update(ethers.utils.hexZeroPad(WETH, 32));

        const period = await oracle.period();

        // Increase time so that the oracle needs another update
        await hre.timeAndMine.increaseTime(period.add(1));

        // Mine the block so that view functions will use the updated timestamp
        await hre.timeAndMine.mine(1);

        // Update the accumulators so that the oracle is ready and able to update
        await liquidityAccumulator.update(laUpdateData);
        await priceAccumulator.update(paUpdateData);
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

    describe("All accounts can update", function () {
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

            await expect(oracle.connect(addr1).update(ethers.utils.hexZeroPad(WETH, 32))).to.emit(oracle, "Updated");
        });
    });
});

describe("ManagedPeriodicAccumulationOracle#supportsInterface(interfaceId)", function () {
    var oracle;
    var interfaceIds;

    beforeEach(async () => {
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

        // Deploy liquidity accumulator
        const liquidityAccumulatorFactory = await ethers.getContractFactory("CurveLiquidityAccumulatorStub");
        const liquidityAccumulator = await liquidityAccumulatorFactory.deploy(
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
        await liquidityAccumulator.deployed();

        const [tokenLiquidity, quoteTokenLiquidity] = await liquidityAccumulator["consultLiquidity(address,uint256)"](
            WETH,
            0
        );

        const laUpdateData = ethers.utils.defaultAbiCoder.encode(
            ["address", "uint", "uint", "uint"],
            [WETH, tokenLiquidity, quoteTokenLiquidity, await currentBlockTimestamp()]
        );

        // Initialize liquidity accumulator
        await liquidityAccumulator.update(laUpdateData);

        // Deploy price accumulator
        const priceAccumulatorFactory = await ethers.getContractFactory("CurvePriceAccumulatorStub");
        const priceAccumulator = await priceAccumulatorFactory.deploy(
            averagingStrategy.address,
            curvePool.address,
            2,
            USDC,
            USDC,
            TWO_PERCENT_CHANGE,
            MIN_UPDATE_DELAY,
            MAX_UPDATE_DELAY
        );
        await priceAccumulator.deployed();

        const price = await priceAccumulator["consultPrice(address,uint256)"](WETH, 0);

        const paUpdateData = ethers.utils.defaultAbiCoder.encode(
            ["address", "uint", "uint"],
            [WETH, price, await currentBlockTimestamp()]
        );

        // Initialize price accumulator
        await priceAccumulator.update(paUpdateData);

        // Deploy oracle
        const oracleFactory = await ethers.getContractFactory("ManagedPeriodicAccumulationOracle");
        oracle = await oracleFactory.deploy(
            liquidityAccumulator.address,
            priceAccumulator.address,
            WETH,
            PERIOD,
            GRANULARITY
        );

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
});
