import { constants } from "ethers";
import { Erc4626PluginDeployFnParams, FuseFlywheelDeployFnParams, PluginConfig } from "..";
import { FuseFlywheelCore } from "../../lib/contracts/typechain/FuseFlywheelCore";

export const deployFlywheelWithDynamicRewards = async ({
  ethers,
  getNamedAccounts,
  deployments,
  deployConfig,
}: FuseFlywheelDeployFnParams): Promise<Array<string>> => {
  const { deployer } = await getNamedAccounts();

  const dynamicFlywheels = [];

  for (const config of deployConfig.dynamicFlywheels) {
    if (config) {
      console.log(`Deploying FuseFlywheelCore & FuseFlywheelDynamicRewards for ${config.rewardToken} reward token`);
      //// FuseFlyhweelCore with Dynamic Rewards
      const fwc = await deployments.deploy(`FuseFlywheelCore_${config.name}`, {
        contract: "FuseFlywheelCore",
        from: deployer,
        args: [
          config.rewardToken,
          "0x0000000000000000000000000000000000000009", // need to initialize to address that does NOT have balance, otherwise this fails (i.e. AddressZero)
          constants.AddressZero,
          deployer,
          constants.AddressZero,
        ],
        log: true,
        waitConfirmations: 1,
      });
      console.log("FuseFlywheelCore: ", fwc.address);

      const fdr = await deployments.deploy(`FuseFlywheelDynamicRewards_${config.name}`, {
        contract: "FuseFlywheelDynamicRewards",
        from: deployer,
        args: [fwc.address, config.cycleLength],
        log: true,
        waitConfirmations: 1,
      });
      console.log("FuseFlywheelDynamicRewards: ", fdr.address);

      const flywheelCore = (await ethers.getContractAt("FuseFlywheelCore", fwc.address, deployer)) as FuseFlywheelCore;
      const tx = await flywheelCore.setFlywheelRewards(fdr.address, { from: deployer });
      await tx.wait();
      console.log("setFlywheelRewards: ", tx.hash);
      dynamicFlywheels.push(fwc.address);
    } else {
      dynamicFlywheels.push(null);
    }
  }
  return dynamicFlywheels;
};

function getFlywheelAddresses(pluginConfig: PluginConfig, dynamicFlywheels: string[]): string[] {
  return pluginConfig.flywheelIndices
    ? pluginConfig.flywheelIndices.map((index) => dynamicFlywheels[index])
    : pluginConfig.flywheelAddresses;
}

export const deployERC4626Plugin = async ({
  getNamedAccounts,
  deployments,
  deployConfig,
  dynamicFlywheels,
}: Erc4626PluginDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  for (const pluginConfig of deployConfig.plugins) {
    if (pluginConfig) {
      const hasFlywheel = pluginConfig.flywheelIndices || pluginConfig.flywheelAddresses;
      let args = hasFlywheel
        ? [
            pluginConfig.underlying,
            ...getFlywheelAddresses(pluginConfig, dynamicFlywheels),
            ...pluginConfig.otherParams,
          ]
        : [pluginConfig.underlying, ...pluginConfig.otherParams];

      console.log(`Deploying ${pluginConfig.strategy}_${pluginConfig.name}`, args);
      const erc4626 = await deployments.deploy(`${pluginConfig.strategy}_${pluginConfig.name}`, {
        contract: pluginConfig.strategy,
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: 1,
      });
      console.log(`${pluginConfig.strategy}_${pluginConfig.name}: `, erc4626.address);
    }
  }
};

// 1. Deploy Flywheel
// 2. Deploy Plugin
// 3. Deploy Market (CErc20PluginRewardsDelegate) <-- Takes Flywheel + Plugin

// AutofarmERC4626 1 == Address1
// AutofarmERC4626 2 == Address2
// AutofarmERC4626 3 == Address3
// AutofarmERC4626 4 == Address4
