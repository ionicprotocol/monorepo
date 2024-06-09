import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async ({ run, getChainId }) => {
  // upgrade any of the pools if necessary
  // the markets are also autoupgraded with this task
  try {
    await run("pools:all:upgrade");
  } catch (error) {
    console.error("Could not deploy:", error);
  }
};

func.tags = ["prod", "upgrade-pools"];

export default func;
