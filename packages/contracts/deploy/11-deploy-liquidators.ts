import { DeployFunction } from "hardhat-deploy/types";

import { ChainDeployConfig, chainDeployConfig } from "../chainDeploy";
import {
  configureIonicLiquidator,
  deployIonicLiquidator,
  deployIonicUniV3Liquidator
} from "../chainDeploy/helpers/liquidators/ionicLiquidator";
import { base, bob, lisk, mode } from "viem/chains";

const func: DeployFunction = async ({ run, viem, getNamedAccounts, deployments, getChainId }) => {
  const chainId = parseInt(await getChainId());

  if (!chainDeployConfig[chainId]) {
    throw new Error(`Config invalid for ${chainId}`);
  }
  const { config: chainDeployParams }: { config: ChainDeployConfig } = chainDeployConfig[chainId];

  //// Liquidator
  let liquidatorContractName: string | undefined;
  if (chainId === bob.id) {
    // TODO
  } else if (chainId === lisk.id) {
    liquidatorContractName = await deployIonicUniV3Liquidator({
      run,
      viem,
      getNamedAccounts,
      deployments,
      deployConfig: chainDeployParams,
      chainId
    });

    await configureIonicLiquidator({
      contractName: liquidatorContractName,
      viem,
      getNamedAccounts,
      chainId,
      deployments
    });
  } else {
    liquidatorContractName = await deployIonicUniV3Liquidator({
      run,
      viem,
      getNamedAccounts,
      deployments,
      deployConfig: chainDeployParams,
      chainId
    });

    await configureIonicLiquidator({
      contractName: liquidatorContractName,
      viem,
      getNamedAccounts,
      chainId,
      deployments
    });

    liquidatorContractName = await deployIonicLiquidator({
      run,
      viem,
      getNamedAccounts,
      deployments,
      deployConfig: chainDeployParams,
      chainId
    });

    await configureIonicLiquidator({
      contractName: liquidatorContractName,
      viem,
      getNamedAccounts,
      chainId,
      deployments
    });
  }
};

func.tags = ["prod", "deploy-liquidators"];

export default func;
