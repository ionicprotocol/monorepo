/* eslint-disable no-console, @typescript-eslint/no-non-null-assertion */

import { ethers, providers } from "ethers";

import { SupportedChains } from "../../src";
import { assetSymbols, chainSpecificParams, chainSupportedAssets } from "../../src/chainConfig";
import { SupportedAsset } from "../../src/types";
import { ChainDeployConfig } from "../helpers";
import { ChainDeployFnParams } from "../helpers/types";

const assets = chainSupportedAssets[SupportedChains.moonbase_alpha];

export const deployConfig: ChainDeployConfig = {
  wtoken: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.WDEV)!.underlying,
  nativeTokenName: "Dev (Testnet)",
  nativeTokenSymbol: "DEV",
  blocksPerYear: chainSpecificParams[SupportedChains.moonbase_alpha].blocksPerYear.toNumber(), // 12 second blocks, 5 blocks per minute
  uniswap: {
    hardcoded: [],
    uniswapData: [],
    pairInitHashCode: ethers.utils.hexlify("0xd0d4c4cd0848c93cb4fd1f498d7013ee6bfb25783ea21593d5834f5d250ece66"),
    uniswapV2RouterAddress: "0xAA30eF758139ae4a7f798112902Bf6d65612045f",
    uniswapV2FactoryAddress: "0x049581aEB6Fe262727f290165C29BDAB065a1B68",
    uniswapOracleInitialDeployTokens: [],
  },
  cgId: chainSpecificParams[SupportedChains.moonbeam].cgId,
};

export const deploy = async ({ run, getNamedAccounts, deployments, ethers }: ChainDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  console.log("deployer: ", deployer);
  let tx: providers.TransactionResponse;
  let receipt: providers.TransactionReceipt;
  //// ORACLES
  //// Underlyings use SimplePriceOracle to hardcode the price
  const spo = await deployments.deploy("SimplePriceOracle", {
    from: deployer,
    args: [],
    log: true,
  });
  if (spo.transactionHash) await ethers.provider.waitForTransaction(spo.transactionHash);
  console.log("SimplePriceOracle: ", spo.address);

  const mpoUnderlyings = [];
  const mpoOracles = [];

  for (const asset of assets) {
    if (asset.simplePriceOracleAssetPrice) {
      const spoContract = await ethers.getContract("SimplePriceOracle", deployer);
      tx = await spoContract.setDirectPrice(asset.underlying, asset.simplePriceOracleAssetPrice);
      console.log("set underlying price tx sent: ", asset.underlying, tx.hash);
      receipt = await tx.wait();
      console.log("set underlying price tx mined: ", asset.underlying, receipt.transactionHash);
      mpoUnderlyings.push(asset.underlying);
      mpoOracles.push(spoContract.address);
    }
  }

  const masterPriceOracle = await ethers.getContract("MasterPriceOracle", deployer);

  tx = await masterPriceOracle.add(mpoUnderlyings, mpoOracles);
  await tx.wait();

  console.log(`MasterPriceOracle updated for assets: ${mpoUnderlyings.join(",")}`);
};
