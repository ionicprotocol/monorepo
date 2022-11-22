import { constants } from "ethers";

import { MasterPriceOracle } from "../../../typechain/MasterPriceOracle";
import { UniswapDeployFnParams } from "../../helpers/types";

export const deployUniswapLpOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  deployConfig,
}: UniswapDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const lpTokenPriceOralce = await deployments.deploy("UniswapLpTokenPriceOracle", {
    from: deployer,
    args: [deployConfig.wtoken],
    log: true,
    waitConfirmations: 1,
  });
  console.log("UniswapLpTokenPriceOracle: ", lpTokenPriceOralce.address);

  const mpo = (await ethers.getContract("MasterPriceOracle", deployer)) as MasterPriceOracle;
  const oracles = [];
  const underlyings = [];
  for (const lpToken of deployConfig.uniswap.uniswapOracleLpTokens) {
    if ((await mpo.callStatic.oracles(lpToken)) === constants.AddressZero) {
      oracles.push(lpTokenPriceOralce.address);
      underlyings.push(lpToken);
    }
  }

  if (underlyings.length) {
    const tx = await mpo.add(underlyings, oracles);
    await tx.wait();
    console.log(`Master Price Oracle updated for token ${underlyings.join(",")}`);
  }
};
