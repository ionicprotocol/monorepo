import { deployments } from "hardhat";
import { assets as bscAssets } from "../../chainDeploy/mainnets/bsc";
import { constants } from "ethers";

export const setUpPriceOraclePrices = deployments.createFixture(async ({ run, getChainId }, options) => {
  const chainId = parseInt(await getChainId());
  if (chainId === 31337 || chainId === 1337) {
    await setupLocalOraclePrices();
  } else if (chainId === 56) {
    await setUpBscOraclePrices();
  }
});

const setupLocalOraclePrices = deployments.createFixture(async ({ run }, options) => {
  await run("set-price", { token: "ETH", price: "1" });
  await run("set-price", { token: "TOUCH", price: "0.1" });
  await run("set-price", { token: "TRIBE", price: "0.2" });
});

const setUpBscOraclePrices = deployments.createFixture(async ({ run }, options) => {
  for (const asset of bscAssets) {
    await run("set-price", { address: asset.underlying, price: "1" });
  }
  await run("set-price", { address: constants.AddressZero, price: "1" });
});
