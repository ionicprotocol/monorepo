const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

const ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ADMIN_ROLE"));
const CONFIG_ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("CONFIG_ADMIN_ROLE"));

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

async function currentBlockTimestamp() {
    const currentBlockNumber = await ethers.provider.getBlockNumber();

    return await blockTimestamp(currentBlockNumber);
}

async function blockTimestamp(blockNum) {
    return (await ethers.provider.getBlock(blockNum)).timestamp;
}

describe("PriceManipulationBounty#constructor", function () {
    var bountyToken;
    var rewardToken;
    var oracle;
    var factory;

    beforeEach(async function () {
        bountyToken = WETH;
        rewardToken = USDC;

        factory = await ethers.getContractFactory("PriceManipulationBounty");

        const adrastiaOracleFactory = await ethers.getContractFactory("MockOracle");
        oracle = await adrastiaOracleFactory.deploy(USDC, 0);
        await oracle.deployed();
    });

    it("Should deploy with the correct parameters", async function () {
        const bounty = await factory.deploy(oracle.address, bountyToken, rewardToken);

        expect(await bounty.oracle()).to.equal(oracle.address);
        expect(await bounty.bountyToken()).to.equal(bountyToken);
        expect(await bounty.rewardToken()).to.equal(rewardToken);
        expect(await bounty.claimed()).to.equal(false);
        expect((await bounty.config())["expiration"]).to.equal(0);
    });
});

describe("PriceManipulationBounty#setClaimConditions", function () {
    var bounty;
    var bountyToken;
    var oracle;

    beforeEach(async function () {
        bountyToken = WETH;
        const rewardToken = USDC;

        const oracleFactory = await ethers.getContractFactory("MockOracle");
        oracle = await oracleFactory.deploy(USDC, 0);
        await oracle.deployed();

        const bountyFactory = await ethers.getContractFactory("PriceManipulationBounty");
        bounty = await bountyFactory.deploy(oracle.address, bountyToken, rewardToken);

        const [owner] = await ethers.getSigners();

        // Grant the CONFIG_ADMIN role to the owner
        await bounty.grantRole(CONFIG_ADMIN_ROLE, owner.address);
    });

    it("Should work with normal params", async function () {
        const lowerBound = BigNumber.from(123);
        const upperBound = BigNumber.from(456);
        const expiration = (await currentBlockTimestamp()) + 1234;

        await expect(bounty.setClaimConditions(lowerBound, upperBound, expiration))
            .to.emit(bounty, "BountyConditionsUpdated")
            .withArgs(bountyToken, lowerBound, upperBound, expiration);

        const config = await bounty.config();

        expect(config["lowerBoundPrice"]).to.equal(lowerBound);
        expect(config["upperBoundPrice"]).to.equal(upperBound);
        expect(config["expiration"]).to.equal(expiration);
    });

    it("Should work if the expiration is in the past", async function () {
        const lowerBound = BigNumber.from(123);
        const upperBound = BigNumber.from(456);
        const expiration = (await currentBlockTimestamp()) - 1234;

        await expect(bounty.setClaimConditions(lowerBound, upperBound, expiration))
            .to.emit(bounty, "BountyConditionsUpdated")
            .withArgs(bountyToken, lowerBound, upperBound, expiration);

        const config = await bounty.config();

        expect(config["lowerBoundPrice"]).to.equal(lowerBound);
        expect(config["upperBoundPrice"]).to.equal(upperBound);
        expect(config["expiration"]).to.equal(expiration);
    });

    it("Should revert if the lower bound is greater than the upper bound", async function () {
        const lowerBound = BigNumber.from(456);
        const upperBound = BigNumber.from(455);
        const expiration = (await currentBlockTimestamp()) + 1234;

        await expect(bounty.setClaimConditions(lowerBound, upperBound, expiration)).to.be.revertedWith("InvalidConfig");
    });

    it("Should revert if the caller doesn't have the CONFIG_ADMIN role", async function () {
        const lowerBound = BigNumber.from(123);
        const upperBound = BigNumber.from(456);
        const expiration = (await currentBlockTimestamp()) + 1234;

        const [_, other, otherAdmin] = await ethers.getSigners();

        // Account with no roles
        await expect(
            bounty.connect(other).setClaimConditions(lowerBound, upperBound, expiration),
            "other"
        ).to.be.revertedWith(/AccessControl: .*/);

        // Grant the ADMIN role to the other account
        await bounty.grantRole(ADMIN_ROLE, otherAdmin.address);

        // Account with the ADMIN role
        await expect(
            bounty.connect(otherAdmin).setClaimConditions(lowerBound, upperBound, expiration),
            "otherAdmin"
        ).to.be.revertedWith(/AccessControl: .*/);
    });

    it("Should revert if the bounty has already been claimed", async function () {
        const lowerBound = BigNumber.from(123);
        const upperBound = BigNumber.from(456);
        const expiration = (await currentBlockTimestamp()) + 1234;

        await bounty.setClaimConditions(lowerBound, upperBound, expiration);

        const price = lowerBound.sub(1);

        await oracle.stubSetObservation(bountyToken, price, 1, 1, await currentBlockTimestamp());

        await bounty.claimBounty();

        await expect(bounty.setClaimConditions(lowerBound, upperBound, expiration)).to.be.revertedWith(
            "BountyAlreadyClaimed"
        );
    });
});

describe("PriceManipulationBounty#claimBounty", function () {
    var bounty;
    var bountyToken;
    var rewardToken;
    var rewardAmount;
    var oracle;

    beforeEach(async function () {
        const erc20Factory = await ethers.getContractFactory("FakeERC20");
        const wethFake = await erc20Factory.deploy("WETH Fake", "WETHF", 18);
        const usdcFake = await erc20Factory.deploy("USDC Fake", "USDCF", 6);
        await wethFake.deployed();
        await usdcFake.deployed();

        bountyToken = wethFake.address;
        rewardToken = usdcFake.address;

        const oracleFactory = await ethers.getContractFactory("MockOracle");
        oracle = await oracleFactory.deploy(usdcFake.address, 0);
        await oracle.deployed();

        const bountyFactory = await ethers.getContractFactory("PriceManipulationBounty");
        bounty = await bountyFactory.deploy(oracle.address, bountyToken, rewardToken);

        const [owner] = await ethers.getSigners();

        // Grant the CONFIG_ADMIN role to the owner
        await bounty.grantRole(CONFIG_ADMIN_ROLE, owner.address);

        // Add some reward tokens to the bounty contract
        rewardAmount = BigNumber.from(123456789);
        await usdcFake.mint(bounty.address, rewardAmount);
    });

    it("Works if the price is less than the lower bound", async function () {
        const lowerBound = BigNumber.from(123);
        const upperBound = BigNumber.from(456);
        const expiration = (await currentBlockTimestamp()) + 1234;

        await bounty.setClaimConditions(lowerBound, upperBound, expiration);

        const price = lowerBound.sub(1);

        const [claimer] = await ethers.getSigners();

        await oracle.stubSetObservation(bountyToken, price, 1, 1, await currentBlockTimestamp());

        var tx = await bounty.claimBounty();

        await expect(tx)
            .to.emit(bounty, "BountyClaimed")
            .withArgs(
                claimer.address,
                rewardToken,
                rewardAmount,
                bountyToken,
                price,
                lowerBound,
                upperBound,
                expiration
            );

        const txReceipt = await tx.wait();
        const claimedTime = await blockTimestamp(txReceipt.blockNumber);

        expect(await bounty.claimed()).to.equal(true);
        expect(await bounty.claimer()).to.equal(claimer.address);
        expect(await bounty.claimedPrice()).to.equal(price);
        expect(await bounty.claimedTime()).to.equal(claimedTime);
        expect(await bounty.claimedAmount()).to.equal(rewardAmount);

        // Get our balance of the reward token
        const usdcFake = await ethers.getContractAt("FakeERC20", rewardToken);
        const claimerBalance = await usdcFake.balanceOf(claimer.address);
        expect(claimerBalance).to.equal(rewardAmount);

        const bountyBalance = await usdcFake.balanceOf(bounty.address);
        expect(bountyBalance).to.equal(0);
    });

    it("Works if the price is greater than the upper bound", async function () {
        const lowerBound = BigNumber.from(123);
        const upperBound = BigNumber.from(456);
        const expiration = (await currentBlockTimestamp()) + 1234;

        await bounty.setClaimConditions(lowerBound, upperBound, expiration);

        const price = upperBound.add(1);

        const [claimer] = await ethers.getSigners();

        await oracle.stubSetObservation(bountyToken, price, 1, 1, await currentBlockTimestamp());

        var tx = await bounty.claimBounty();

        await expect(tx)
            .to.emit(bounty, "BountyClaimed")
            .withArgs(
                claimer.address,
                rewardToken,
                rewardAmount,
                bountyToken,
                price,
                lowerBound,
                upperBound,
                expiration
            );

        const txReceipt = await tx.wait();
        const claimedTime = await blockTimestamp(txReceipt.blockNumber);

        expect(await bounty.claimed()).to.equal(true);
        expect(await bounty.claimer()).to.equal(claimer.address);
        expect(await bounty.claimedPrice()).to.equal(price);
        expect(await bounty.claimedTime()).to.equal(claimedTime);
        expect(await bounty.claimedAmount()).to.equal(rewardAmount);

        // Get our balance of the reward token
        const usdcFake = await ethers.getContractAt("FakeERC20", rewardToken);
        const claimerBalance = await usdcFake.balanceOf(claimer.address);
        expect(claimerBalance).to.equal(rewardAmount);

        const bountyBalance = await usdcFake.balanceOf(bounty.address);
        expect(bountyBalance).to.equal(0);
    });

    it("Reverts if the bounty has already been claimed", async function () {
        const lowerBound = BigNumber.from(123);
        const upperBound = BigNumber.from(456);
        const expiration = (await currentBlockTimestamp()) + 1234;

        await bounty.setClaimConditions(lowerBound, upperBound, expiration);

        const price = lowerBound.sub(1);

        await oracle.stubSetObservation(bountyToken, price, 1, 1, await currentBlockTimestamp());

        await bounty.claimBounty();

        await expect(bounty.claimBounty()).to.be.revertedWith("BountyAlreadyClaimed");
    });

    it("Reverts if the bounty has expired", async function () {
        const lowerBound = BigNumber.from(123);
        const upperBound = BigNumber.from(456);
        const expiration = (await currentBlockTimestamp()) - 1234;

        await bounty.setClaimConditions(lowerBound, upperBound, expiration);

        const price = lowerBound.sub(1);

        await oracle.stubSetObservation(bountyToken, price, 1, 1, await currentBlockTimestamp());

        await expect(bounty.claimBounty()).to.be.revertedWith("BountyExpired");
    });

    it("Emits BountyClaimFailed if the price is within the bounds", async function () {
        const lowerBound = BigNumber.from(123);
        const upperBound = BigNumber.from(456);
        const expiration = (await currentBlockTimestamp()) + 1234;

        await bounty.setClaimConditions(lowerBound, upperBound, expiration);

        const price = lowerBound.add(1);

        const [claimer] = await ethers.getSigners();

        await oracle.stubSetObservation(bountyToken, price, 1, 1, await currentBlockTimestamp());

        var tx = await bounty.claimBounty();

        await expect(tx)
            .to.emit(bounty, "BountyClaimFailed")
            .withArgs(claimer.address, bountyToken, price, lowerBound, upperBound);

        // Ensure that the bounty state is unchanged
        expect(await bounty.claimed()).to.equal(false);
        expect(await bounty.claimer()).to.equal(ethers.constants.AddressZero);
        expect(await bounty.claimedPrice()).to.equal(0);
        expect(await bounty.claimedTime()).to.equal(0);
        expect(await bounty.claimedAmount()).to.equal(0);

        // Get our balance of the reward token
        const usdcFake = await ethers.getContractAt("FakeERC20", rewardToken);
        const claimerBalance = await usdcFake.balanceOf(claimer.address);
        expect(claimerBalance).to.equal(0);

        const bountyBalance = await usdcFake.balanceOf(bounty.address);
        expect(bountyBalance).to.equal(rewardAmount);
    });
});

describe("PriceManipulationBounty#removeBounty", function () {
    var bounty;
    var bountyToken;
    var rewardToken;
    var rewardAmount;
    var oracle;

    beforeEach(async function () {
        const erc20Factory = await ethers.getContractFactory("FakeERC20");
        const wethFake = await erc20Factory.deploy("WETH Fake", "WETHF", 18);
        const usdcFake = await erc20Factory.deploy("USDC Fake", "USDCF", 6);
        await wethFake.deployed();
        await usdcFake.deployed();

        bountyToken = wethFake.address;
        rewardToken = usdcFake.address;

        const oracleFactory = await ethers.getContractFactory("MockOracle");
        oracle = await oracleFactory.deploy(usdcFake.address, 0);
        await oracle.deployed();

        const bountyFactory = await ethers.getContractFactory("PriceManipulationBounty");
        bounty = await bountyFactory.deploy(oracle.address, bountyToken, rewardToken);

        const [owner] = await ethers.getSigners();

        // Grant the CONFIG_ADMIN role to the owner
        await bounty.grantRole(CONFIG_ADMIN_ROLE, owner.address);

        // Add some reward tokens to the bounty contract
        rewardAmount = BigNumber.from(123456789);
        await usdcFake.mint(bounty.address, rewardAmount);
    });

    it("Should work", async function () {
        await bounty.removeBounty();

        const [owner] = await ethers.getSigners();

        // Get our balance of the reward token
        const usdcFake = await ethers.getContractAt("FakeERC20", rewardToken);
        const ownerBalance = await usdcFake.balanceOf(owner.address);
        expect(ownerBalance).to.equal(rewardAmount);
        const bountyBalance = await usdcFake.balanceOf(bounty.address);
        expect(bountyBalance).to.equal(0);
    });

    it("Should revert if the caller doesn't have the ADMIN role", async function () {
        const [_, other] = await ethers.getSigners();

        // Account with no roles
        await expect(bounty.connect(other).removeBounty(), "other").to.be.revertedWith(/AccessControl: .*/);
    });
});

describe("PriceManipulationBounty#recoverERC20", function () {
    var bounty;
    var bountyToken;
    var rewardToken;
    var rewardAmount;
    var oracle;

    beforeEach(async function () {
        const erc20Factory = await ethers.getContractFactory("FakeERC20");
        const wethFake = await erc20Factory.deploy("WETH Fake", "WETHF", 18);
        const usdcFake = await erc20Factory.deploy("USDC Fake", "USDCF", 6);
        await wethFake.deployed();
        await usdcFake.deployed();

        bountyToken = wethFake.address;
        rewardToken = usdcFake.address;

        const oracleFactory = await ethers.getContractFactory("MockOracle");
        oracle = await oracleFactory.deploy(usdcFake.address, 0);
        await oracle.deployed();

        const bountyFactory = await ethers.getContractFactory("PriceManipulationBounty");
        bounty = await bountyFactory.deploy(oracle.address, bountyToken, rewardToken);

        const [owner] = await ethers.getSigners();

        // Grant the CONFIG_ADMIN role to the owner
        await bounty.grantRole(CONFIG_ADMIN_ROLE, owner.address);

        // Add some reward tokens to the bounty contract
        rewardAmount = BigNumber.from(123456789);
        await usdcFake.mint(bounty.address, rewardAmount);
    });

    it("Should work", async function () {
        // Deploy a new ERC20
        const erc20Factory = await ethers.getContractFactory("FakeERC20");
        const fakeToken = await erc20Factory.deploy("Fake Token", "FAKE", 6);
        // Mint some tokens to the bounty contract
        const amount = BigNumber.from(66666777788877);
        await fakeToken.mint(bounty.address, amount);

        await bounty.recoverERC20(fakeToken.address, amount);

        const [owner] = await ethers.getSigners();

        const ownerBalance = await fakeToken.balanceOf(owner.address);
        expect(ownerBalance).to.equal(amount);
        const bountyBalance = await fakeToken.balanceOf(bounty.address);
        expect(bountyBalance).to.equal(0);
    });

    it("Should revert if the caller doesn't have the ADMIN role", async function () {
        const [_, other] = await ethers.getSigners();

        // Account with no roles
        await expect(bounty.connect(other).recoverERC20(rewardToken, rewardAmount), "other").to.be.revertedWith(
            /AccessControl: .*/
        );
    });

    it("Should revert if the token is the reward token", async function () {
        await expect(bounty.recoverERC20(rewardToken, rewardAmount)).to.be.revertedWith("CannotRecoverRewardToken");
    });
});
