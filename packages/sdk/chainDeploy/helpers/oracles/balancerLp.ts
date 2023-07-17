import { providers } from "ethers";

import { BalancerLinearPoolFnParams, BalancerLpFnParams, BalancerRateProviderFnParams } from "../types";

import { addUnderlyingsToMpo } from "./utils";

export const deployBalancerLpPriceOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  balancerLpAssets
}: BalancerLpFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);

  const blpo = await deployments.deploy("BalancerLpTokenPriceOracle", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [mpo.address]
        }
      },
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy"
    }
  });
  if (blpo.transactionHash) await ethers.provider.waitForTransaction(blpo.transactionHash);
  console.log("BalancerLpTokenPriceOracle: ", blpo.address);

  const underlyings = balancerLpAssets.map((d) => d.lpTokenAddress);
  await addUnderlyingsToMpo(mpo, underlyings, blpo.address);
};

export const deployBalancerStableLpPriceOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  balancerLpAssets
}: BalancerLpFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  const underlyings = balancerLpAssets.map((d) => d.lpTokenAddress);
  const mpo = await ethers.getContract("MasterPriceOracle", deployer);

  const blpso = await deployments.deploy("BalancerLpStablePoolPriceOracle", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: []
        }
      },
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy"
    }
  });
  if (blpso.transactionHash) await ethers.provider.waitForTransaction(blpso.transactionHash);
  console.log("BalancerLpStablePoolPriceOracle: ", blpso.address);

  const blpOracle = await ethers.getContract("BalancerLpStablePoolPriceOracle", deployer);

  await addUnderlyingsToMpo(mpo, underlyings, blpOracle.address);
};

export const deployBalancerRateProviderPriceOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  balancerRateProviderAssets
}: BalancerRateProviderFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);

  const rateProviders = balancerRateProviderAssets.map((d) => d.rateProviderAddress);
  const baseTokens = balancerRateProviderAssets.map((d) => d.baseToken);
  const tokens = balancerRateProviderAssets.map((d) => d.tokenAddress);

  const brpo = await deployments.deploy("BalancerRateProviderOracle", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [rateProviders, baseTokens, tokens]
        }
      },
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy"
    }
  });
  if (brpo.transactionHash) await ethers.provider.waitForTransaction(brpo.transactionHash);
  console.log("BalancerRateProviderOracle: ", brpo.address);

  const blpOracle = await ethers.getContract("BalancerRateProviderOracle", deployer);
  const registeredUnderlyings = await blpOracle.getAllUnderlyings();

  for (const token of balancerRateProviderAssets) {
    if (!registeredUnderlyings.includes(token.tokenAddress)) {
      const tx: providers.TransactionResponse = await blpOracle.registerToken(
        token.rateProviderAddress,
        token.baseToken,
        token.tokenAddress
      );
      await tx.wait();
      console.log(
        `BalancerRateProviderOracle registered for token ${token.tokenAddress} with base token: ${token.baseToken}`
      );
    }
  }
  await addUnderlyingsToMpo(mpo, tokens, blpOracle.address);
};

export const deployBalancerLinearPoolPriceOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  balancerLinerPoolAssets
}: BalancerLinearPoolFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  const mpo = await ethers.getContract("MasterPriceOracle", deployer);

  const underlyings = balancerLinerPoolAssets.map((d) => d.lpTokenAddress);

  const blpo = await deployments.deploy("BalancerLpLinearPoolPriceOracle", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [underlyings]
        }
      },
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy"
    }
  });
  if (blpo.transactionHash) await ethers.provider.waitForTransaction(blpo.transactionHash);
  console.log("BalancerLpLinearPoolPriceOracle: ", blpo.address);

  const blpOracle = await ethers.getContract("BalancerLpLinearPoolPriceOracle", deployer);
  const registeredUnderlyings = await blpOracle.callStatic.getAllUnderlyings();

  for (const token of balancerLinerPoolAssets) {
    if (!registeredUnderlyings.includes(token.lpTokenAddress)) {
      const tx: providers.TransactionResponse = await blpOracle.registerToken(token.lpTokenAddress);
      await tx.wait();
      console.log(`BalancerLpLinearPoolPriceOracle registered for token ${token.lpTokenAddress}`);
    }
  }
  await addUnderlyingsToMpo(mpo, underlyings, blpOracle.address);
};
