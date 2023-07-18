import { constants } from "ethers";

import { MasterPriceOracle } from "../../../typechain/MasterPriceOracle";
import { UniswapDeployFnParams } from "../../helpers/types";

import { addUnderlyingsToMpo } from "./utils";

export const deployUniswapLpOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  deployConfig
}: UniswapDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const lpTokenPriceOralce = await deployments.deploy("UniswapLpTokenPriceOracle", {
    from: deployer,
    args: [deployConfig.wtoken],
    log: true,
    waitConfirmations: 1
  });
  console.log("UniswapLpTokenPriceOracle: ", lpTokenPriceOralce.address);

  const mpo = (await ethers.getContract("MasterPriceOracle", deployer)) as MasterPriceOracle;
  const underlyings = [];
  for (const lpToken of deployConfig.uniswap.uniswapOracleLpTokens!) {
    if ((await mpo.callStatic.oracles(lpToken)) === constants.AddressZero) {
      underlyings.push(lpToken);
    }
  }
  await addUnderlyingsToMpo(mpo, underlyings, lpTokenPriceOralce.address);
};
