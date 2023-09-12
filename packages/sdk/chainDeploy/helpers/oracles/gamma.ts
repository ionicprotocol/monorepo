import { MasterPriceOracle } from "../../../typechain/MasterPriceOracle";
import { GammaDeployFnParams, GammaUnderlyingSwap } from "../types";

import { addUnderlyingsToMpo } from "./utils";

export const deployGammaPoolOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  deployConfig,
  gammaLps,
  swap
}: GammaDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const contractName =
    swap == GammaUnderlyingSwap.ALGEBRA ? "GammaPoolAlgebraPriceOracle" : "GammaPoolUniswapV3PriceOracle";

  const lpTokenPriceOracle = await deployments.deploy(contractName, {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [deployConfig.wtoken]
        }
      },
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy"
    }
  });
  console.log(`${contractName}: `, lpTokenPriceOracle.address);

  const mpo = (await ethers.getContract("MasterPriceOracle", deployer)) as MasterPriceOracle;
  const underlyings = gammaLps.map((d) => d.lpTokenAddress);

  await addUnderlyingsToMpo(mpo, underlyings, lpTokenPriceOracle.address);
};
