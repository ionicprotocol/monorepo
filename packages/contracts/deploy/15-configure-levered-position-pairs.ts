import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async ({ run }) => {
  // configure levered position pairs
  await run("levered-positions:configure-pairs");
};

func.tags = ["prod", "configure-pairs"];

export default func;
