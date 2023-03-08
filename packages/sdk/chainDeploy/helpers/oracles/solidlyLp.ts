import { constants } from "ethers";

import { MasterPriceOracle } from "../../../typechain/MasterPriceOracle";
import { SolidlyDeployFnParams } from "../../helpers/types";

export const deploySolidlyLpOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  deployConfig,
  solidlyLps,
}: SolidlyDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const lpTokenPriceOralce = await deployments.deploy("SolidlyLpTokenPriceOracle", {
    from: deployer,
    args: [deployConfig.wtoken],
    log: true,
    waitConfirmations: 1,
  });
  console.log("SolidlyLpTokenPriceOracle: ", lpTokenPriceOralce.address);

  const mpo = (await ethers.getContract("MasterPriceOracle", deployer)) as MasterPriceOracle;
  const oracles = [];
  const underlyings = [];
  for (const lpToken of solidlyLps) {
    if ((await mpo.callStatic.oracles(lpToken.lpTokenAddress)) === constants.AddressZero) {
      oracles.push(lpTokenPriceOralce.address);
      underlyings.push(lpToken.lpTokenAddress);
    }
  }

  if (underlyings.length) {
    const tx = await mpo.add(underlyings, oracles);
    await tx.wait();
    console.log(`Master Price Oracle updated for token ${underlyings.join(",")}`);
  }
};
