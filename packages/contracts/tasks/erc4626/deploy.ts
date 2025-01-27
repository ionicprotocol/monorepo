import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("deploy:erc4626", "Deploy ERC4626")
  .addParam("cToken", "The cToken to deploy the ERC4626 for")
  .addOptionalParam("rewardsRecipient", "The rewardsRecipient to deploy the ERC4626 for")
  .setAction(async (taskArgs, { deployments, viem, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    await deployIonicMarketERC4626({ ...taskArgs, deployer, deployments });
  });

export const deployIonicMarketERC4626 = async ({
  cToken,
  rewardsRecipient,
  deployer,
  deployments,
  multisig
}: {
  cToken: string;
  rewardsRecipient?: string;
  deployer: string;
  deployments: HardhatRuntimeEnvironment["deployments"];
  multisig?: string;
}) => {
  const flywheelLensRouter = await deployments.get("IonicFlywheelLensRouter");
  const erc4626 = await deployments.deploy(`IonicMarketERC4626_${cToken}`, {
    contract: "IonicMarketERC4626",
    from: deployer,
    log: true,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        init: {
          methodName: "initialize",
          args: [cToken, flywheelLensRouter.address, rewardsRecipient ?? deployer]
        }
      },
      owner: multisig ?? deployer
    }
  });

  console.log("ERC4626 deployed to:", erc4626.address);
  return erc4626;
};
