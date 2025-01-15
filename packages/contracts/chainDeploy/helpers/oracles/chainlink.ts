import { prepareAndLogTransaction } from "../logging";

import { addUnderlyingsToMpo } from "./utils";
import { Address, Hex, zeroAddress } from "viem";
import { underlying } from "../utils";
import { ChainlinkFeedBaseCurrency } from "@ionicprotocol/types";
import { ChainlinkDeployFnParams } from "../../types";
import { chainIdtoChain } from "@ionicprotocol/chains";

export const deployChainlinkOracle = async ({
  viem,
  getNamedAccounts,
  deployments,
  deployConfig,
  assets,
  chainlinkAssets,
  namePostfix,
  chainId
}: ChainlinkDeployFnParams): Promise<{ cpo: any; chainLinkv2: any }> => {
  const { deployer, multisig } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient({ chain: chainIdtoChain[chainId] });
  const walletClient = await viem.getWalletClient(deployer as Address, { chain: chainIdtoChain[chainId] });
  let tx: Hex;

  //// Chainlink Oracle

  let contractName: string;
  if (namePostfix) {
    contractName = ["ChainlinkPriceOracleV2", namePostfix].join("_");
  } else {
    contractName = "ChainlinkPriceOracleV2";
  }

  console.log("deployConfig.stableToken: ", deployConfig.stableToken);
  console.log("deployConfig.nativeTokenUsdChainlinkFeed: ", deployConfig.nativeTokenUsdChainlinkFeed);
  const cpo = await deployments.deploy(contractName, {
    contract: "ChainlinkPriceOracleV2",
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
      proxyContract: "OpenZeppelinTransparentProxy",
      owner: multisig ?? deployer
    },
    waitConfirmations: 1,
    skipIfAlreadyDeployed: true
  });
  if (cpo.transactionHash) await publicClient.waitForTransactionReceipt({ hash: cpo.transactionHash as Address });
  console.log("ChainlinkPriceOracleV2: ", cpo.address);

  const chainLinkv2 = await viem.getContractAt(
    "ChainlinkPriceOracleV2",
    (await deployments.get(contractName)).address as Address,
    { client: { public: publicClient, wallet: walletClient } }
  );

  const chainlinkAssetsToChange = [];
  for (const asset of chainlinkAssets) {
    const underlyingAsset = underlying(assets, asset.symbol);
    const currentPriceFeed = await chainLinkv2.read.priceFeeds([underlyingAsset]);
    if (currentPriceFeed !== asset.aggregator) {
      chainlinkAssetsToChange.push(asset);
    }
  }

  const usdBasedFeeds = chainlinkAssetsToChange.filter(
    (asset) => asset.feedBaseCurrency === ChainlinkFeedBaseCurrency.USD
  );
  const ethBasedFeeds = chainlinkAssetsToChange.filter(
    (asset) => asset.feedBaseCurrency === ChainlinkFeedBaseCurrency.ETH
  );

  if (usdBasedFeeds.length > 0) {
    const feedCurrency = ChainlinkFeedBaseCurrency.USD;

    if (((await chainLinkv2.read.owner()) as Address).toLowerCase() === deployer.toLowerCase()) {
      tx = await chainLinkv2.write.setPriceFeeds([
        usdBasedFeeds.map((c) => underlying(assets, c.symbol)),
        usdBasedFeeds.map((c) => c.aggregator),
        feedCurrency
      ]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`Set ${usdBasedFeeds.length} USD price feeds for ChainlinkPriceOracleV2 at ${tx}`);
    } else {
      await prepareAndLogTransaction({
        contractInstance: chainLinkv2,
        description: `Set ${usdBasedFeeds.length} USD price feeds for ChainlinkPriceOracleV2`,
        functionName: "setPriceFeeds",
        args: [
          usdBasedFeeds.map((c) => underlying(assets, c.symbol)),
          usdBasedFeeds.map((c) => c.aggregator),
          feedCurrency
        ],
        inputs: [
          { internalType: "address[]", name: "underlyings", type: "address[]" },
          { internalType: "address[]", name: "feeds", type: "address[]" },
          { internalType: "uint8", name: "baseCurrency", type: "uint8" }
        ]
      });
      console.log(`Logged Transaction to set ${usdBasedFeeds.length} USD price feeds for ChainlinkPriceOracleV2`);
    }
  }
  if (ethBasedFeeds.length > 0) {
    const feedCurrency = ChainlinkFeedBaseCurrency.ETH;
    if (((await chainLinkv2.read.owner()) as Address).toLowerCase() === deployer.toLowerCase()) {
      tx = await chainLinkv2.write.setPriceFeeds([
        ethBasedFeeds.map((c) => underlying(assets, c.symbol)),
        ethBasedFeeds.map((c) => c.aggregator),
        feedCurrency
      ]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`Set ${ethBasedFeeds.length} native price feeds for ChainlinkPriceOracleV2`);
    } else {
      await prepareAndLogTransaction({
        contractInstance: chainLinkv2,
        description: `Set ${ethBasedFeeds.length} USD price feeds for ChainlinkPriceOracleV2`,
        functionName: "setPriceFeeds",
        args: [
          ethBasedFeeds.map((c) => underlying(assets, c.symbol)),
          ethBasedFeeds.map((c) => c.aggregator),
          feedCurrency
        ],
        inputs: [
          { internalType: "address[]", name: "underlyings", type: "address[]" },
          { internalType: "address[]", name: "feeds", type: "address[]" },
          { internalType: "uint8", name: "baseCurrency", type: "uint8" }
        ]
      });
      console.log(`Logged Transaction to set ${ethBasedFeeds.length} ETH price feeds for ChainlinkPriceOracleV2`);
    }
  }

  const underlyings = chainlinkAssets.map((c) => underlying(assets, c.symbol));

  const mpo = await viem.getContractAt(
    "MasterPriceOracle",
    (await deployments.get("MasterPriceOracle")).address as Address,
    { client: { public: publicClient, wallet: walletClient } }
  );
  await addUnderlyingsToMpo(mpo as any, underlyings, chainLinkv2.address, deployer, publicClient);

  const addressesProvider = await viem.getContractAt(
    "AddressesProvider",
    (await deployments.get("AddressesProvider")).address as Address,
    { client: { public: publicClient, wallet: walletClient } }
  );
  const chainLinkv2Address = await addressesProvider.read.getAddress([contractName]);
  if (chainLinkv2Address !== chainLinkv2.address) {
    if (((await addressesProvider.read.owner()) as Address).toLowerCase() === deployer.toLowerCase()) {
      tx = await addressesProvider.write.setAddress([contractName, chainLinkv2.address]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`setAddress ${contractName} at ${tx}`);
    } else {
      await prepareAndLogTransaction({
        contractInstance: addressesProvider,
        description: `setAddress ${contractName}`,
        functionName: "setAddress",
        args: [contractName, chainLinkv2.address],
        inputs: [
          { internalType: "string", name: "id", type: "string" },
          { internalType: "address", name: "newAddress", type: "address" }
        ]
      });
      console.log("Logged Transaction to setAddress ChainlinkPriceOracleV2 on AddressProvider");
    }
  }

  return { cpo: cpo, chainLinkv2: chainLinkv2 };
};
