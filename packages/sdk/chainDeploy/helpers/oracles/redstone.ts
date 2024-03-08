import { providers } from "ethers";

import { RedStoneDeployFnParams } from "../types";

import { addUnderlyingsToMpo } from "./utils";

export const deployRedStonePriceOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  redStoneAddress,
  usdToken,
  redStoneAssets,
  nativeTokenUsdFeed
}: RedStoneDeployFnParams): Promise<{ redStoneOracle: any }> => {
  const { deployer } = await getNamedAccounts();

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);

  //// RedStone Oracle
  const redStone = await deployments.deploy("RedStonePriceOracle", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [usdToken, nativeTokenUsdFeed, redStoneAddress]
        },
        onUpgrade: {
          methodName: "reinitialize",
          args: [usdToken, nativeTokenUsdFeed, redStoneAddress]
        }
      },
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy"
    },
    waitConfirmations: 1
  });

  if (redStone.transactionHash) await ethers.provider.waitForTransaction(redStone.transactionHash);
  console.log("RedStonePriceOracle: ", redStone.address);

  const redStoneOracle = (await ethers.getContract("RedStonePriceOracle", deployer)) as any;

  const underlyings = redStoneAssets.map((f) => f.underlying);
  await addUnderlyingsToMpo(mpo, underlyings, redStoneOracle.address);
  return { redStoneOracle };
};
