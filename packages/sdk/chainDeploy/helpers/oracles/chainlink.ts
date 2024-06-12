import { underlying } from "@ionicprotocol/types";
import { providers } from "ethers";

import { AddressesProvider } from "../../../typechain/AddressesProvider";
import { ChainlinkDeployFnParams, ChainlinkFeedBaseCurrency } from "../types";

import { addUnderlyingsToMpo } from "./utils";
import { addTransaction } from "../logging";

// deployer vs multisig?
const multisig = "0x8Fba84867Ba458E7c6E2c024D2DE3d0b5C3ea1C2";
export const deployChainlinkOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  deployConfig,
  assets,
  chainlinkAssets
}: ChainlinkDeployFnParams): Promise<{ cpo: any; chainLinkv2: any }> => {
  const { deployer } = await getNamedAccounts();
  let tx;

  //// Chainlink Oracle

  console.log("deployConfig.stableToken: ", deployConfig.stableToken);
  console.log("deployConfig.nativeTokenUsdChainlinkFeed: ", deployConfig.nativeTokenUsdChainlinkFeed);
  const cpo = await deployments.deploy("ChainlinkPriceOracleV2", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [deployConfig.stableToken, deployConfig.nativeTokenUsdChainlinkFeed]
        }
      },
      owner: multisig,
      proxyContract: "OpenZeppelinTransparentProxy"
    },
    waitConfirmations: 1
  });
  if (cpo.transactionHash) await ethers.provider.waitForTransaction(cpo.transactionHash);
  console.log("ChainlinkPriceOracleV2: ", cpo.address);

  const usdBasedFeeds = chainlinkAssets.filter((asset) => asset.feedBaseCurrency === ChainlinkFeedBaseCurrency.USD);
  const ethBasedFeeds = chainlinkAssets.filter((asset) => asset.feedBaseCurrency === ChainlinkFeedBaseCurrency.ETH);

  const chainLinkv2 = await ethers.getContract("ChainlinkPriceOracleV2", deployer);
  if (usdBasedFeeds.length > 0) {
    const feedCurrency = ChainlinkFeedBaseCurrency.USD;

    if ((await chainLinkv2.owner()).toLowerCase() === deployer.address) {
      tx = await chainLinkv2.setPriceFeeds(
        usdBasedFeeds.map((c) => underlying(assets, c.symbol)),
        usdBasedFeeds.map((c) => c.aggregator),
        feedCurrency
      );
      await tx.wait();
      console.log(`Set ${usdBasedFeeds.length} USD price feeds for ChainlinkPriceOracleV2 at ${tx.hash}`);
    } else {
      tx = await chainLinkv2.populateTransaction.setPriceFeeds(
        usdBasedFeeds.map((c) => underlying(assets, c.symbol)),
        usdBasedFeeds.map((c) => c.aggregator),
        feedCurrency
      );
      addTransaction({
        to: tx.to,
        value: tx.value ? tx.value.toString() : "0",
        data: null,
        contractMethod: {
          inputs: [
            { internalType: "address[]", name: "underlyings", type: "address[]" },
            { internalType: "address[]", name: "feeds", type: "address[]" },
            { internalType: "uint8", name: "baseCurrency", type: "uint8" }
          ],
          name: "setPriceFeeds",
          payable: false
        },
        contractInputsValues: {
          underlyings: usdBasedFeeds.map((c) => underlying(assets, c.symbol)),
          feeds: usdBasedFeeds.map((c) => c.aggregator),
          baseCurrency: feedCurrency
        }
      });
      console.log(`Logged Transaction to set ${usdBasedFeeds.length} USD price feeds for ChainlinkPriceOracleV2`);
    }
  }
  if (ethBasedFeeds.length > 0) {
    const feedCurrency = ChainlinkFeedBaseCurrency.ETH;
    if ((await chainLinkv2.owner()).toLowerCase() === deployer.address) {
      tx = await chainLinkv2.setPriceFeeds(
        ethBasedFeeds.map((c) => underlying(assets, c.symbol)),
        ethBasedFeeds.map((c) => c.aggregator),
        feedCurrency
      );
      await tx.wait();
      console.log(`Set ${ethBasedFeeds.length} native price feeds for ChainlinkPriceOracleV2`);
    } else {
      tx = await chainLinkv2.populateTransaction.setPriceFeeds(
        ethBasedFeeds.map((c) => underlying(assets, c.symbol)),
        ethBasedFeeds.map((c) => c.aggregator),
        feedCurrency
      );
      addTransaction({
        to: tx.to,
        value: tx.value ? tx.value.toString() : "0",
        data: null,
        contractMethod: {
          inputs: [
            { internalType: "address[]", name: "underlyings", type: "address[]" },
            { internalType: "address[]", name: "feeds", type: "address[]" },
            { internalType: "uint8", name: "baseCurrency", type: "uint8" }
          ],
          name: "setPriceFeeds",
          payable: false
        },
        contractInputsValues: {
          underlyings: ethBasedFeeds.map((c) => underlying(assets, c.symbol)),
          feeds: ethBasedFeeds.map((c) => c.aggregator),
          baseCurrency: feedCurrency
        }
      });
      console.log(`Logged Transaction to set ${ethBasedFeeds.length} ETH price feeds for ChainlinkPriceOracleV2`);
    }
  }

  const underlyings = chainlinkAssets.map((c) => underlying(assets, c.symbol));

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);
  await addUnderlyingsToMpo(mpo, underlyings, chainLinkv2.address);

  const addressesProvider = (await ethers.getContract("AddressesProvider", deployer)) as AddressesProvider;
  const chainLinkv2Address = await addressesProvider.callStatic.getAddress("ChainlinkPriceOracleV2");
  if (chainLinkv2Address !== chainLinkv2.address) {
    if ((await addressesProvider.owner()).toLowerCase() === deployer.address) {
      tx = await addressesProvider.setAddress("ChainlinkPriceOracleV2", chainLinkv2.address);
      await tx.wait();
      console.log(`setAddress ChainlinkPriceOracleV2 at ${tx.hash}`);
    } else {
      tx = await addressesProvider.populateTransaction.setAddress("ChainlinkPriceOracleV2", chainLinkv2.address);
      addTransaction({
        to: tx.to,
        value: tx.value ? tx.value.toString() : "0",
        data: null,
        contractMethod: {
          inputs: [
            { internalType: "string", name: "id", type: "string" },
            { internalType: "address", name: "newAddress", type: "address" }
          ],
          name: "setAddress",
          payable: false
        },
        contractInputsValues: {
          id: "ChainlinkPriceOracleV2",
          newAddress: chainLinkv2.address
        }
      });
      console.log("Logged Transaction to setAddress ChainlinkPriceOracleV2 on AddressProvider");
    }
  }

  return { cpo: cpo, chainLinkv2: chainLinkv2 };
};
