import { MasterPriceOracle } from "../../../typechain/MasterPriceOracle";
import { GammaDeployFnParams } from "../types";

import { addUnderlyingsToMpo } from "./utils";

export const deployGammaPoolOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  deployConfig,
  gammaLps,
}: GammaDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const lpTokenPriceOracle = await deployments.deploy("GammaPoolPriceOracle", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [deployConfig.wtoken],
        },
      },
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy",
    },
  });
  console.log("GammaPoolPriceOracle: ", lpTokenPriceOracle.address);

  const mpo = (await ethers.getContract("MasterPriceOracle", deployer)) as MasterPriceOracle;
  const underlyings = gammaLps.map((d) => d.lpTokenAddress);

  await addUnderlyingsToMpo(mpo, underlyings, lpTokenPriceOracle.address);
};
