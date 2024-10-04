import { task } from "hardhat/config";

task("pool:create:lisk:main").setAction(async ({}, { run, deployments }) => {
  const mpo = await deployments.get("MasterPriceOracle");
  await run("pool:create", {
    name: "Lisk Main Market",
    creator: "deployer",
    priceOracle: mpo.address, // MPO
    closeFactor: "50",
    liquidationIncentive: "8",
    enforceWhitelist: "false"
  });
});
