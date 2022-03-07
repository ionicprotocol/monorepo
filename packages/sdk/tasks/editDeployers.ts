import { task } from "hardhat/config";

export default task("edit-deployers", "Edit deployers")
  .addParam("deployers", "Comma-separated deployers")
  .addOptionalParam("status", "Add or remove deployer")
  .setAction(async ({ deployers: _deployers, status: _status }, { getNamedAccounts, ethers }) => {
    const status = _status ?? true;
    console.log("status: ", status);
    const deployers = _deployers.split(",");
    console.log("deployers: ", deployers);
    const { deployer } = await getNamedAccounts();

    const fpd = await ethers.getContract("FusePoolDirectory", deployer);
    const tx = await fpd._editDeployerWhitelist(deployers, status);

    console.log("_editDeployerWhitelist tx: ", tx);
    const receipt = await tx.wait();
    console.log("_editDeployerWhitelist tx mined: ", receipt.transactionHash);
  });
