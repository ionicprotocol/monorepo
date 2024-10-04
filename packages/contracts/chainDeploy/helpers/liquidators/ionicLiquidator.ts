import { Address, Hash, parseEther, PublicClient, zeroAddress } from "viem";
import { AddressesProviderConfigFnParams, LiquidatorConfigFnParams, LiquidatorDeployFnParams } from "../../types";
import { chainIdToConfig } from "@ionicprotocol/chains";
import { prepareAndLogTransaction } from "../logging";

export const deployIonicLiquidator = async ({
  viem,
  getNamedAccounts,
  deployments,
  deployConfig,
  chainId
}: LiquidatorDeployFnParams): Promise<string> => {
  const { deployer, multisig } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();

  const initializeArgs: [Address, Address, number] = [
    deployConfig.wtoken,
    deployConfig.uniswap.uniswapV2RouterAddress,
    deployConfig.uniswap.flashSwapFee
  ];
  let fsl;
  if (chainId == 34443) {
    fsl = await deployments.deploy("IonicLiquidator", {
      from: deployer,
      log: true,
      args: [],
      waitConfirmations: 1
    });

    const ionicLiquidator = await viem.getContractAt(
      "IonicLiquidator",
      (await deployments.get("IonicLiquidator")).address as Address
    );

    const currentWToken = await ionicLiquidator.read.W_NATIVE_ADDRESS();
    if (currentWToken === zeroAddress) {
      const hash = await ionicLiquidator.write.initialize([...initializeArgs]);
      await publicClient.waitForTransactionReceipt({ hash });
      console.log(`initialized the non-upgradeable Ionic Liquidator ${hash}`);
    }
  } else {
    fsl = await deployments.deploy("IonicLiquidator", {
      from: deployer,

      log: true,
      proxy: {
        execute: {
          init: {
            methodName: "initialize",
            args: initializeArgs
          }
        },
        proxyContract: "OpenZeppelinTransparentProxy"
      }
    });
  }

  if (fsl.transactionHash) await publicClient.waitForTransactionReceipt({ hash: fsl.transactionHash as Hash });
  console.log("IonicLiquidator: ", fsl.address);

  return "IonicLiquidator";
};

export const deployIonicUniV3Liquidator = async ({
  viem,
  getNamedAccounts,
  deployments,
  deployConfig
}: LiquidatorDeployFnParams): Promise<string> => {
  const { deployer, multisig } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();

  const uniV3Liquidator = await deployments.deploy("IonicUniV3Liquidator", {
    from: deployer,
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [deployConfig.wtoken, deployConfig.uniswap.uniswapV3Quoter]
        }
      },
      proxyContract: "OpenZeppelinTransparentProxy",
      owner: multisig
    }
  });
  if (uniV3Liquidator.transactionHash)
    await publicClient.waitForTransactionReceipt({ hash: uniV3Liquidator.transactionHash as Hash });
  console.log("IonicUniV3Liquidator: ", uniV3Liquidator.address);

  const ionicLiquidator = await viem.getContractAt(
    "IonicUniV3Liquidator",
    (await deployments.get("IonicUniV3Liquidator")).address as Address
  );
  const uniV3LiquidatorOwner = await ionicLiquidator.read.owner();
  console.log(`IonicUniV3Liquidator owner is ${uniV3LiquidatorOwner}`);

  return "IonicUniV3Liquidator";
};

export const configureIonicLiquidator = async ({
  contractName,
  viem,
  chainId,
  deployments
}: LiquidatorConfigFnParams): Promise<void> => {
  const publicClient = await viem.getPublicClient();

  const strategies: string[] = [];
  const arrayOfTrue: boolean[] = [];
  const ionicLiquidator = await viem.getContractAt(
    contractName,
    (await deployments.get(contractName)).address as Address
  );

  for (const redemptionStrategyConfig of chainIdToConfig[chainId].redemptionStrategies) {
    const { strategy } = redemptionStrategyConfig;
    const redemptionStrategyContract = await viem.getContractAt(
      strategy as string,
      (await deployments.get(strategy)).address as Address
    );

    const whitelistedAlready = await ionicLiquidator.read.redemptionStrategiesWhitelist([
      redemptionStrategyContract.address
    ]);
    if (!whitelistedAlready) {
      strategies.push(redemptionStrategyContract.address);
      arrayOfTrue.push(true);
    }
  }

  for (const fundingStrategy of chainIdToConfig[chainId].fundingStrategies) {
    const { strategy } = fundingStrategy;
    const fundingStrategyContract = await viem.getContractAt(
      strategy as string,
      (await deployments.get(strategy)).address as Address
    );

    const whitelistedAlready = await ionicLiquidator.read.redemptionStrategiesWhitelist([
      fundingStrategyContract.address
    ]);
    if (!whitelistedAlready) {
      strategies.push(fundingStrategyContract.address);
      arrayOfTrue.push(true);
    }
  }

  if (strategies.length > 0) {
    const hash = await ionicLiquidator.write._whitelistRedemptionStrategies([strategies, arrayOfTrue]);
    await publicClient.waitForTransactionReceipt({ hash });
    console.log("_whitelistRedemptionStrategies: ", hash);
  } else {
    console.log("no redemption strategies for whitelisting");
  }

  const poolLens = await viem.getContractAt("PoolLens", (await deployments.get("PoolLens")).address as Address);
  const healthFactorThreshold = parseEther("1");
  const expressRelay = chainIdToConfig[chainId].chainAddresses.EXPRESS_RELAY;

  const lensTx = await ionicLiquidator.write.setPoolLens([poolLens.address]);
  await publicClient.waitForTransactionReceipt({ hash: lensTx });
  console.log(`Pool Lens Set To ${poolLens.address}, at  ${lensTx}`);

  if (expressRelay) {
    const relayTx = await ionicLiquidator.write.setExpressRelay([expressRelay]);
    await publicClient.waitForTransactionReceipt({ hash: relayTx });
    console.log(`Express Relay Set To ${expressRelay} at ${relayTx}`);
  }

  const hfTx = await ionicLiquidator.write.setHealthFactorThreshold([healthFactorThreshold]);
  await publicClient.waitForTransactionReceipt({ hash: hfTx });
  console.log(`Permissionless Health Factor Threshold Set To ${healthFactorThreshold.toString()}, at ${hfTx}`);
};

export const configureAddressesProviderAddresses = async ({
  viem,
  getNamedAccounts,
  chainId,
  deployConfig,
  deployments
}: AddressesProviderConfigFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();
  const chainConfig = chainIdToConfig[chainId];
  const _ap = await deployments.getOrNull("AddressesProvider");
  if (_ap) {
    const ap = await viem.getContractAt("AddressesProvider", _ap.address as Address);
    /// EXTERNAL ADDRESSES
    await configureAddress(
      ap,
      publicClient,
      deployer,
      "IUniswapV2Factory",
      deployConfig.uniswap.uniswapV2FactoryAddress
    );
    await configureAddress(
      ap,
      publicClient,
      deployer,
      "IUniswapV2Router02",
      deployConfig.uniswap.uniswapV2RouterAddress
    );
    await configureAddress(ap, publicClient, deployer, "wtoken", deployConfig.wtoken);
    await configureAddress(ap, publicClient, deployer, "wBTCToken", deployConfig.wBTCToken);
    await configureAddress(ap, publicClient, deployer, "stableToken", deployConfig.stableToken);
    await configureAddress(
      ap,
      publicClient,
      deployer,
      "UNISWAP_V3_ROUTER",
      chainConfig.chainAddresses.UNISWAP_V3_ROUTER
    );
    await configureAddress(
      ap,
      publicClient,
      deployer,
      "ALGEBRA_SWAP_ROUTER",
      chainConfig.chainAddresses.ALGEBRA_SWAP_ROUTER
    );
    await configureAddress(
      ap,
      publicClient,
      deployer,
      "SOLIDLY_SWAP_ROUTER",
      chainConfig.chainAddresses.SOLIDLY_SWAP_ROUTER
    );

    const uv2l = await deployments.getOrNull("UniswapV2Liquidator");
    await configureAddress(ap, publicClient, deployer, "UniswapV2Liquidator", uv2l?.address);

    const clptlnr = await deployments.getOrNull("CurveLpTokenLiquidatorNoRegistry");
    await configureAddress(ap, publicClient, deployer, "CurveLpTokenLiquidatorNoRegistry", clptlnr?.address);

    /// SYSTEM ADDRESSES
    await configureAddress(ap, publicClient, "deployer", deployer);

    const masterPO = await deployments.getOrNull("MasterPriceOracle");
    await configureAddress(ap, publicClient, deployer, "MasterPriceOracle", masterPO?.address);

    const fpd = await deployments.getOrNull("PoolDirectory");
    await configureAddress(ap, publicClient, deployer, "PoolDirectory", fpd?.address);

    const ffd = await deployments.getOrNull("FeeDistributor");
    await configureAddress(ap, publicClient, deployer, "FeeDistributor", ffd?.address);

    const fsl = await deployments.getOrNull("IonicLiquidator");
    await configureAddress(ap, publicClient, deployer, "IonicLiquidator", fsl?.address);

    const uniV3Liquidator = await deployments.getOrNull("IonicUniV3Liquidator");
    await configureAddress(ap, publicClient, deployer, "IonicUniV3Liquidator", uniV3Liquidator?.address);

    const dpa = await deployments.getOrNull("DefaultProxyAdmin");
    await configureAddress(ap, publicClient, deployer, "DefaultProxyAdmin", dpa?.address);

    const quoter = await deployments.getOrNull("Quoter");
    await configureAddress(ap, publicClient, deployer, "Quoter", quoter?.address);

    const lr = await deployments.getOrNull("LiquidatorsRegistry");
    await configureAddress(ap, publicClient, deployer, "LiquidatorsRegistry", lr?.address);

    const poolLens = await deployments.getOrNull("PoolLens");
    await configureAddress(ap, publicClient, deployer, "PoolLens", poolLens?.address);

    const ovr = await deployments.getOrNull("OptimizedVaultsRegistry");
    await configureAddress(ap, publicClient, deployer, "OptimizedVaultsRegistry", ovr?.address);

    const lpf = await deployments.getOrNull("LeveredPositionFactory");
    await configureAddress(ap, publicClient, deployer, "LeveredPositionFactory", lpf?.address);

    const lpl = await deployments.getOrNull("LeveredPositionsLens");
    await configureAddress(ap, publicClient, deployer, "LeveredPositionsLens", lpl?.address);

    const mflr = await deployments.getOrNull("IonicFlywheelLensRouter");
    await configureAddress(ap, publicClient, deployer, "IonicFlywheelLensRouter", mflr?.address);

    const ar = await deployments.getOrNull("AuthoritiesRegistry");
    await configureAddress(ap, publicClient, deployer, "AuthoritiesRegistry", ar?.address);
  }
};

export async function configureAddress(
  ap: any,
  publicClient: PublicClient,
  deployer: string,
  key: string,
  value?: string
) {
  if (!value || value === "") {
    console.log(`empty value for key ${key}`);
    return;
  }

  const currentValue = await ap.read.getAddress([key]);
  const owner = await ap.read.owner();
  console.log(`current value for key ${key}: ${currentValue}, expected: ${value}`);
  if (currentValue && currentValue !== value) {
    if (deployer.toLowerCase() !== owner.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: ap,
        functionName: "setAddress",
        args: [key, value],
        description: `Set address: ${key}, ${value}`,
        inputs: [
          { internalType: "string", name: "id", type: "address" },
          { internalType: "address", name: "newAddress", type: "address" }
        ]
      });
    } else {
      console.log(`setting address ${key}: ${value}`);
      const hash = await ap.write.setAddress([key, value]);

      await publicClient.waitForTransactionReceipt({ hash });
      console.log(`setAddress ${key}: ${hash}`);
    }
  } else {
    console.log(`${key} already set to ${value}`);
  }
}
