import { task, types } from "hardhat/config";
import { Address, encodeAbiParameters, parseAbiParameters, zeroAddress, parseEther } from "viem";
import { prepareAndLogTransaction } from "../../chainDeploy/helpers/logging";

export default task("market:upgrade", "Upgrades a market's implementation")
  .addParam("comptroller", "address of comptroller", undefined, types.string) // TODO I would rather use id or comptroller address directly.
  .addParam("underlying", "Underlying asset symbol or address", undefined, types.string)
  .addParam("implementationAddress", "The address of the new implementation", "", types.string)
  .addOptionalParam("signer", "Named account that is an admin of the pool", "deployer", types.string)
  .setAction(async (taskArgs, { viem, deployments }) => {
    const publicClient = await viem.getPublicClient();
    const { implementationAddress, comptroller: comptrollerAddress, underlying, signer: namedSigner } = taskArgs;

    const comptroller = await viem.getContractAt("IonicComptroller", comptrollerAddress as Address);

    const allMarkets = await comptroller.read.getAllMarkets();

    const cTokenInstances = await Promise.all(
      allMarkets.map(async (marketAddress) => {
        return await viem.getContractAt("ICErc20PluginRewards", marketAddress);
      })
    );

    let cTokenInstance;
    for (let index = 0; index < cTokenInstances.length; index++) {
      const thisUnderlying = await cTokenInstances[index].read.underlying();
      if (!cTokenInstance && thisUnderlying.toLowerCase() === underlying.toLowerCase()) {
        cTokenInstance = cTokenInstances[index];
      }
    }
    if (!cTokenInstance) {
      throw Error(`No market corresponds to this underlying: ${underlying}`);
    }

    const implementationData = "0x";

    console.log(`Setting implementation to ${implementationAddress}`);
    const setImplementationTx = await cTokenInstance.write._setImplementationSafe([
      implementationAddress,
      implementationData
    ]);

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: setImplementationTx
    });
    if (receipt.status !== "success") {
      throw `Failed set implementation to ${implementationAddress}`;
    }
    console.log(`Implementation successfully set to ${implementationAddress}: ${setImplementationTx}`);
  });

task("market:upgrade:safe", "Upgrades a market's implementation")
  .addParam("marketAddress", "market", undefined, types.string)
  .addParam("implementationAddress", "The address of the new implementation", "", types.string)
  .addOptionalParam("pluginAddress", "The address of plugin which is supposed to used", "", types.string)
  .addOptionalParam("signer", "Named account that is an admin of the pool", "deployer", types.string)
  .setAction(async (taskArgs, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const walletClient = await viem.getWalletClient(deployer as Address);
    const publicClient = await viem.getPublicClient();
    const { implementationAddress, marketAddress, signer: namedSigner } = taskArgs;
    let { pluginAddress } = taskArgs;

    const cTokenDelegator = await viem.getContractAt("CErc20Delegator", marketAddress);
    const cfe = await viem.getContractAt(
      "CTokenFirstExtension",
      (await deployments.get("CTokenFirstExtension")).address as Address
    );
    const ap = await viem.getContractAt(
      "AddressesProvider",
      (await deployments.get("AddressesProvider")).address as Address
    );

    const impl = await cTokenDelegator.read.implementation();
    const extensions = await cTokenDelegator.read._listExtensions();
    const comptroller = await cTokenDelegator.read.comptroller();
    const comptrollerAsExt = await viem.getContractAt("IonicComptroller", comptroller as Address);
    const ctokenAsExt = await viem.getContractAt("CTokenFirstExtension", marketAddress);

    if (
      impl.toLowerCase() != implementationAddress.toLowerCase() ||
      extensions.length == 0 ||
      extensions[1].toLowerCase() != cfe.address.toLowerCase()
    ) {
      if (!pluginAddress) {
        pluginAddress = zeroAddress;
      }
      const implementationData = encodeAbiParameters(parseAbiParameters("address"), [pluginAddress]);
      console.log(`Setting implementation to ${implementationAddress} with plugin ${pluginAddress}`);

      const comptrollerAdmin = await comptrollerAsExt.read.admin();
      if (comptrollerAdmin.toLowerCase() !== deployer.toLowerCase()) {
        await prepareAndLogTransaction({
          contractInstance: cTokenDelegator,
          functionName: "_setImplementationSafe",
          args: [implementationAddress, implementationData],
          description: `Setting new implementation on ${cTokenDelegator.address}`,
          inputs: [
            { internalType: "address", name: "implementation_", type: "address" },
            { internalType: "bytes", name: "implementationData", type: "bytes" }
          ]
        });
        await prepareAndLogTransaction({
          contractInstance: ctokenAsExt,
          functionName: "_setAddressesProvider",
          args: [ap.address],
          description: `Setting AddressesProvider on ${marketAddress}`,
          inputs: [{ internalType: "address", name: "_ap", type: "address" }]
        });
      } else {
        console.log(`Setting implementation to ${implementationAddress}`);
        const setImplementationTx = await cTokenDelegator.write._setImplementationSafe([
          implementationAddress,
          implementationData
        ]);
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: setImplementationTx
        });
        if (receipt.status !== "success") {
          throw `Failed set implementation to ${implementationAddress}`;
        }
        console.log(`Implementation successfully set to ${implementationAddress}: ${setImplementationTx}`);

        console.log(`Setting AP to to ${ap.address}`);
        const setAPTX = await ctokenAsExt.write._setAddressesProvider([ap.address]);
        const receiptAP = await publicClient.waitForTransactionReceipt({
          hash: setAPTX
        });
        if (receiptAP.status !== "success") {
          throw `Failed set AP to ${ap.address}`;
        }
        console.log(`AP successfully set to ${ap.address}`);
      }

      if (pluginAddress != zeroAddress) {
        const cTokenPluginInstance = await viem.getContractAt("ICErc20Plugin", marketAddress);
        console.log(`with plugin ${await cTokenPluginInstance.read.plugin()}`);
      }
    } else {
      console.log(
        `market ${marketAddress} impl ${impl} already eq ${implementationAddress} and extension ${cfe.address} eq ${extensions[1]}`
      );
    }
  });

task("markets:upgrade-and-setup", "Upgrades all markets and sets addresses provider on them").setAction(
  async (_, { viem, deployments, run, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient();
    const walletClient = await viem.getWalletClient(deployer as Address);

    const poolDirectory = await viem.getContractAt(
      "PoolDirectory",
      (await deployments.get("PoolDirectory")).address as Address
    );
    const feeDistributor = await viem.getContractAt(
      "FeeDistributor",
      (await deployments.get("FeeDistributor")).address as Address
    );
    // const ionicUniV3Liquidator = await viem.getContractAt(
    //   "IonicUniV3Liquidator",
    //   (await deployments.get("IonicUniV3Liquidator")).address as Address
    // );

    // const liquidatorAdmin = await ionicUniV3Liquidator.read.owner();
    // if (liquidatorAdmin.toLowerCase() !== deployer.toLowerCase()) {
    //   await prepareAndLogTransaction({
    //     contractInstance: ionicUniV3Liquidator,
    //     functionName: "setHealthFactorThreshold",
    //     args: [
    //       parseEther("1").toString() // 0.99e18 as a BigInt
    //     ],
    //     description: `Setting Liquidator Health Factor Threshold`,
    //     inputs: [{ internalType: "uint256", name: "_healthFactorThreshold", type: "uint256" }]
    //   });
    // } else {
    //   const tx = await ionicUniV3Liquidator.write.setHealthFactorThreshold([parseEther("1")]);
    //   await publicClient.waitForTransactionReceipt({
    //     hash: tx
    //   });
    //   console.log(`Liquidator Health Factor Threshold set to ${parseEther("1")}`);
    // }

    const [, pools] = await poolDirectory.read.getActivePools();
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      console.log("pool", { name: pool.name, address: pool.comptroller });

      try {
        const comptrollerAsExtension = await viem.getContractAt("IonicComptroller", pool.comptroller);
        const markets = await comptrollerAsExtension.read.getAllMarkets();
        for (let j = 0; j < markets.length; j++) {
          const market = markets[j];
          console.log(`market address ${market}`);
          const cTokenInstance = await viem.getContractAt("ICErc20", market);
          const [latestImpl] = await feeDistributor.read.latestCErc20Delegate([
            await cTokenInstance.read.delegateType()
          ]);
          await run("market:upgrade:safe", {
            marketAddress: market,
            implementationAddress: latestImpl
          });
        }
      } catch (e) {
        console.error(`error while upgrading the pool`, e);
      }
    }
  }
);

task("markets:set-ap", "Sets addresses provider on all markets").setAction(
  async ({}, { viem, getChainId, deployments, run, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient();
    const ap = await viem.getContractAt(
      "AddressesProvider",
      (await deployments.get("AddressesProvider")).address as Address
    );
    const poolDirectory = await viem.getContractAt(
      "PoolDirectory",
      (await deployments.get("PoolDirectory")).address as Address
    );
    const [, pools] = await poolDirectory.read.getActivePools();
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      console.log("pool", { name: pool.name, address: pool.comptroller });
      const comptrollerAsExtension = await viem.getContractAt("IonicComptroller", pool.comptroller);
      const markets = await comptrollerAsExtension.read.getAllMarkets();
      for (let j = 0; j < markets.length; j++) {
        const market = markets[j];
        console.log(`market address ${market}`);
        const ctokenAsExt = await viem.getContractAt("CTokenFirstExtension", market);
        const comptrollerAdmin = await comptrollerAsExtension.read.admin();
        if (comptrollerAdmin.toLowerCase() !== deployer.toLowerCase()) {
          await prepareAndLogTransaction({
            contractInstance: ctokenAsExt,
            functionName: "_setAddressesProvider",
            args: [ap.address],
            description: `Setting AddressesProvider on ${market}`,
            inputs: [{ internalType: "address", name: "_ap", type: "address" }]
          });
        } else {
          console.log(`Setting AP to to ${ap.address}`);
          const setAPTX = await ctokenAsExt.write._setAddressesProvider([ap.address]);
          const receiptAP = await publicClient.waitForTransactionReceipt({
            hash: setAPTX
          });
          if (receiptAP.status !== "success") {
            throw `Failed set AP to ${ap.address}`;
          } else {
            console.log(`AP successfully set to ${ap.address}: ${setAPTX}`);
          }
        }
      }
    }
  }
);
