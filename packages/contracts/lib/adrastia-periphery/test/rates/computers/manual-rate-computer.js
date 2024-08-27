const { expect } = require("chai");
const { ethers } = require("hardhat");

const BigNumber = ethers.BigNumber;
const AddressZero = ethers.constants.AddressZero;

const ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ADMIN_ROLE"));
const ORACLE_UPDATER_MANAGER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("UPDATER_ADMIN_ROLE"));
const ORACLE_UPDATER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ORACLE_UPDATER_ROLE"));
const RATE_ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("RATE_ADMIN_ROLE"));
const UPDATE_PAUSE_ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("UPDATE_PAUSE_ADMIN_ROLE"));

const GRT = "0xc944E90C64B2c07662A292be6244BDf05Cda44a7";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

const A_GOOD_RATE = ethers.utils.parseUnits("1.0", 18);

async function currentBlockTimestamp() {
    const currentBlockNumber = await ethers.provider.getBlockNumber();

    return await blockTimestamp(currentBlockNumber);
}

async function blockTimestamp(blockNum) {
    return (await ethers.provider.getBlock(blockNum)).timestamp;
}

describe("ManualRateComputer#computeRate", function () {
    var computer;

    beforeEach(async function () {
        const [deployer] = await ethers.getSigners();

        const computerFactory = await ethers.getContractFactory("ManagedManualRateComputer");
        computer = await computerFactory.deploy();

        await computer.deployed();

        // Grant the deployer the RATE_ADMIN role
        await computer.grantRole(RATE_ADMIN_ROLE, deployer.address);
    });

    it("Reverts if the token is not configured", async function () {
        await expect(computer.computeRate(GRT)).to.be.revertedWith("RateNotSet");
    });

    const tests = [
        ethers.utils.parseUnits("1.0", 18),
        ethers.utils.parseUnits("1.0", 6),
        BigNumber.from(2),
        BigNumber.from(1),
        BigNumber.from(0),
    ];

    for (const test of tests) {
        it(`Returns the configured rate = ${test.toString()}`, async function () {
            await computer.setRate(GRT, test);

            expect(await computer.computeRate(GRT)).to.equal(test);
        });
    }
});

describe("ManagedManualRateComputer#setRate", function () {
    var computer;

    beforeEach(async function () {
        const [deployer] = await ethers.getSigners();

        const computerFactory = await ethers.getContractFactory("ManagedManualRateComputer");
        computer = await computerFactory.deploy();

        await computer.deployed();

        // Grant the deployer the RATE_ADMIN role
        await computer.grantRole(RATE_ADMIN_ROLE, deployer.address);
    });

    it("Reverts if the caller is not the RATE_ADMIN nor ADMIN", async function () {
        const [, other] = await ethers.getSigners();

        // Sanity check that other doesn't have any roles
        expect(await computer.hasRole(ADMIN_ROLE, other.address)).to.be.false;
        expect(await computer.hasRole(RATE_ADMIN_ROLE, other.address)).to.be.false;

        // Format others's address to be lowercase
        const otherAddress = other.address.toLowerCase();

        await expect(computer.connect(other).setRate(GRT, 1)).to.be.revertedWith(
            "AccessControl: account " + otherAddress + " is missing role " + RATE_ADMIN_ROLE
        );
    });

    it("Reverts if the caller is not the RATE_ADMIN but is the ADMIN", async function () {
        const [, other] = await ethers.getSigners();

        await computer.grantRole(ADMIN_ROLE, other.address);

        // Sanity check that other doesn't have the RATE_ADMIN role
        expect(await computer.hasRole(RATE_ADMIN_ROLE, other.address)).to.be.false;

        // Format others's address to be lowercase
        const otherAddress = other.address.toLowerCase();

        await expect(computer.connect(other).setRate(GRT, 1)).to.be.revertedWith(
            "AccessControl: account " + otherAddress + " is missing role " + RATE_ADMIN_ROLE
        );
    });

    it("Works if the caller is the RATE_ADMIN", async function () {
        const [, other] = await ethers.getSigners();

        // Grant the RATE_ADMIN role
        await computer.grantRole(RATE_ADMIN_ROLE, other.address);

        // Sanity check that other doesn't have the ADMIN role
        expect(await computer.hasRole(ADMIN_ROLE, other.address)).to.be.false;

        expect(await computer.setRate(GRT, A_GOOD_RATE))
            .to.emit(computer, "RateUpdated")
            .withArgs(GRT, A_GOOD_RATE);

        // Sanity check that the rate was set
        expect(await computer.computeRate(GRT)).to.equal(A_GOOD_RATE);
    });

    it("Works if the caller is both RATE_ADMIN and ADMIN", async function () {
        const [deployer] = await ethers.getSigners();

        // Sanity check that the deployer has the roles
        expect(await computer.hasRole(RATE_ADMIN_ROLE, deployer.address)).to.be.true;
        expect(await computer.hasRole(ADMIN_ROLE, deployer.address)).to.be.true;

        expect(await computer.setRate(GRT, A_GOOD_RATE))
            .to.emit(computer, "RateUpdated")
            .withArgs(GRT, A_GOOD_RATE);

        // Sanity check that the rate was set
        expect(await computer.computeRate(GRT)).to.equal(A_GOOD_RATE);
    });
});

describe("ManagedManualRateComputer#supportsInterface", function () {
    var interfaceIds;
    var computer;

    beforeEach(async function () {
        const [deployer] = await ethers.getSigners();

        const computerFactory = await ethers.getContractFactory("ManagedManualRateComputer");
        computer = await computerFactory.deploy();

        const interfaceIdsFactory = await ethers.getContractFactory("InterfaceIds");
        interfaceIds = await interfaceIdsFactory.deploy();
    });

    it("Should support IERC165", async () => {
        const interfaceId = await interfaceIds.iERC165();
        expect(await computer["supportsInterface(bytes4)"](interfaceId)).to.equal(true);
    });

    it("Should support IRateComputer", async () => {
        const interfaceId = await interfaceIds.iRateComputer();
        expect(await computer["supportsInterface(bytes4)"](interfaceId)).to.equal(true);
    });

    it("Should support IAccessControlEnumerable", async () => {
        const interfaceId = await interfaceIds.iAccessControlEnumerable();
        expect(await computer["supportsInterface(bytes4)"](interfaceId)).to.equal(true);
    });

    it("Should support IAccessControl", async () => {
        const interfaceId = await interfaceIds.iAccessControl();
        expect(await computer["supportsInterface(bytes4)"](interfaceId)).to.equal(true);
    });
});
