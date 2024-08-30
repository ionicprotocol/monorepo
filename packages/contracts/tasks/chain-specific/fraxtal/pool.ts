import { task } from "hardhat/config";

task("pool:create:fraxtal").setAction(async ({}, { run, deployments }) => {
  const oracle = await deployments.get("MasterPriceOracle");
  console.log("oracle: ", oracle.address);
  await run("pool:create", {
    name: "Fraxtal Market",
    creator: "deployer",
    priceOracle: oracle.address, // MPO
    closeFactor: "50",
    liquidationIncentive: "8",
    enforceWhitelist: "false"
  });
});
