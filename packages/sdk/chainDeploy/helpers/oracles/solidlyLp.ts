import { MasterPriceOracle } from "../../../typechain/MasterPriceOracle";
import { SolidlyDeployFnParams } from "../../helpers/types";

import { addUnderlyingsToMpo } from "./utils";

export const deploySolidlyLpOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  deployConfig,
  solidlyLps,
}: SolidlyDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const lpTokenPriceOracle = await deployments.deploy("SolidlyLpTokenPriceOracle", {
    from: deployer,
    args: [deployConfig.wtoken],
    log: true,
    waitConfirmations: 1,
  });
  console.log("SolidlyLpTokenPriceOracle: ", lpTokenPriceOracle.address);

  const mpo = (await ethers.getContract("MasterPriceOracle", deployer)) as MasterPriceOracle;
  const underlyings = solidlyLps.map((d) => d.lpTokenAddress);

  await addUnderlyingsToMpo(mpo, underlyings, lpTokenPriceOracle.address);
};
