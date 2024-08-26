const hre = require("hardhat");

const ethers = hre.ethers;

const ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ADMIN_ROLE"));
const ORACLE_UPDATER_MANAGER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("UPDATER_ADMIN_ROLE"));
const ORACLE_UPDATER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ORACLE_UPDATER_ROLE"));
const RATE_ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("RATE_ADMIN_ROLE"));
const UPDATE_PAUSE_ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("UPDATE_PAUSE_ADMIN_ROLE"));

async function tryGrantRole(contract, account, role) {
    console.log("Granting role", role, "to", account, "on", contract.address);

    const tx = await contract.grantRole(role, account);

    console.log("  - Tx hash", tx.hash);

    const receipt = await tx.wait();

    if (receipt.status === 0) {
        console.error("Failed to grant role", role, "to", account, "on", contract.address);
    }
}

async function tryRevokeRole(contract, account, role) {
    console.log("Revoking role", role, "to", account, "on", contract.address);

    const tx = await contract.revokeRole(role, account);

    console.log("  - Tx hash", tx.hash);

    const receipt = await tx.wait();

    if (receipt.status === 0) {
        console.error("Failed to revoke role", role, "to", account, "on", contract.address);
    }
}

async function main() {
    const period = 1 * 60 * 60; // One hour
    const initialBufferCardinality = 2;
    const updatersMustBeEoa = true;
    const newAdmin = "0xec89a5dd6c179c345EA7996AA879E59cB18c8484"; // Adrastia Admin
    const assignAllRolesToAdmin = true;

    const factory = await ethers.getContractFactory("ManagedRateController");
    const rateController = await factory.deploy(period, initialBufferCardinality, updatersMustBeEoa);
    await rateController.deployed();

    console.log("RateController deployed to:", rateController.address);

    if (newAdmin !== "") {
        await tryGrantRole(rateController, newAdmin, ADMIN_ROLE);

        // Get our address
        const [deployer] = await ethers.getSigners();

        if (assignAllRolesToAdmin) {
            // Grant the deployer the updater admin role
            await tryGrantRole(rateController, deployer.address, ORACLE_UPDATER_MANAGER_ROLE);

            await tryGrantRole(rateController, newAdmin, ORACLE_UPDATER_MANAGER_ROLE);
            await tryGrantRole(rateController, newAdmin, ORACLE_UPDATER_ROLE);
            await tryGrantRole(rateController, newAdmin, RATE_ADMIN_ROLE);
            await tryGrantRole(rateController, newAdmin, UPDATE_PAUSE_ADMIN_ROLE);

            // Revoke the deployer's updater admin role
            await tryRevokeRole(rateController, deployer.address, ORACLE_UPDATER_MANAGER_ROLE);
        }

        // Revoke the deployer's admin role
        await tryRevokeRole(rateController, deployer.address, ADMIN_ROLE);
    }

    console.log("Done");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
