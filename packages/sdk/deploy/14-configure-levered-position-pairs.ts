import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async ({ run, getChainId }) => {
  const chainId = parseInt(await getChainId());

  // configure levered position pairs
  if (chainId === 137 || chainId === 97) {
    await run("levered-positions:configure-pairs");
  }
};

func.tags = ["prod", "configure-pairs"];

export default func;
