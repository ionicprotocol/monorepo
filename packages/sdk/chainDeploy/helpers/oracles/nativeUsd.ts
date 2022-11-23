import { NativeUSDPriceOracle } from "../../../lib/contracts/typechain/NativeUSDPriceOracle";
import { NativeUsdDeployFnParams } from "../types";

export const deployNativeUsdPriceFeed = async ({
  ethers,
  getNamedAccounts,
  deployments,
  nativeUsdOracleAddress,
  quoteAddress,
}: NativeUsdDeployFnParams): Promise<{ nativeUsdPriceOracle: NativeUSDPriceOracle }> => {
  const { deployer } = await getNamedAccounts();

  //// NativeUSDPriceOracle
  const nativeUsd = await deployments.deploy("NativeUSDPriceOracle", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [nativeUsdOracleAddress, quoteAddress],
        },
      },
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy",
    },
  });

  if (nativeUsd.transactionHash) await ethers.provider.waitForTransaction(nativeUsd.transactionHash);
  console.log("NativeUSDPriceOracle: ", nativeUsd.address);

  const nativeUsdPriceOracle = (await ethers.getContract("NativeUSDPriceOracle", deployer)) as NativeUSDPriceOracle;
  return { nativeUsdPriceOracle };
};
