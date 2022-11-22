import { ganache } from "@midas-capital/chains";
import { assetSymbols, SupportedAsset } from "@midas-capital/types";
import { ethers } from "ethers";

import { FixedNativePriceOracle } from "@typechain/FixedNativePriceOracle";
import { MasterPriceOracle } from "@typechain/MasterPriceOracle";
import { ChainDeployConfig } from "../helpers";
import { deployFlywheelWithDynamicRewards } from "../helpers/dynamicFlywheels";
import { ChainDeployFnParams } from "../helpers/types";

const assets = ganache.assets;

export const deployConfig: ChainDeployConfig = {
  wtoken: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.WETH)!.underlying,
  nativeTokenName: "Ethereum (Local)",
  nativeTokenSymbol: "ETH",
  stableToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  wBTCToken: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  blocksPerYear: 4 * 24 * 365 * 60,
  uniswap: {
    uniswapV2RouterAddress: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    uniswapV2FactoryAddress: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    pairInitHashCode: ethers.utils.hexlify("0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f"),
    hardcoded: [],
    uniswapData: [],
    uniswapOracleInitialDeployTokens: [],
    flashSwapFee: 0,
  },
  dynamicFlywheels: [
    {
      // 0x681cEEE3d6781394b2ECD7a4b9d5214f537aFeEb
      rewardToken: "0x02Ec29Fd9f0bB212eD2C4926ACe1aeab732ed620", // TOUCH
      cycleLength: 100000,
      name: "TOUCH",
    },
  ],
  cgId: "ethereum",
};

export const deploy = async ({ ethers, getNamedAccounts, deployments, run }: ChainDeployFnParams): Promise<void> => {
  const { deployer, alice, bob } = await getNamedAccounts();

  ////
  //// TOKENS
  const weth = await deployments.deploy("WETH", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });

  console.log("WETH", weth.address);
  const tribe = await deployments.deploy("TRIBEToken", {
    from: deployer,
    args: [ethers.utils.parseEther("1250000000"), deployer],
    log: true,
    waitConfirmations: 1,
  });
  console.log("TRIBEToken: ", tribe.address);
  const tribeToken = await ethers.getContractAt("TRIBEToken", tribe.address, deployer);
  let tx = await tribeToken.transfer(alice, ethers.utils.parseEther("100000"), { from: deployer });
  await tx.wait();

  tx = await tribeToken.transfer(bob, ethers.utils.parseEther("100000"), { from: deployer });
  await tx.wait();
  const touch = await deployments.deploy("TOUCHToken", {
    from: deployer,
    args: [ethers.utils.parseEther("2250000000"), deployer],
    log: true,
    waitConfirmations: 1,
  });
  console.log("TOUCHToken: ", touch.address);
  const touchToken = await ethers.getContractAt("TOUCHToken", touch.address, deployer);
  tx = await touchToken.transfer(alice, ethers.utils.parseEther("100000"), { from: deployer });
  await tx.wait();

  tx = await touchToken.transfer(alice, ethers.utils.parseEther("100000"), { from: deployer });
  await tx.wait();

  tx = await touchToken.transfer(bob, ethers.utils.parseEther("100000"), { from: deployer });
  await tx.wait();
  ////

  // rewards
  deployConfig.dynamicFlywheels[0].rewardToken = touchToken.address;

  ////
  //// ORACLES
  const simplePO = await deployments.deploy("SimplePriceOracle", {
    from: bob,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  console.log("SimplePriceOracle: ", simplePO.address);

  const masterPriceOracle = (await ethers.getContract("MasterPriceOracle", deployer)) as MasterPriceOracle;

  const fixedNativePriceOracle = (await ethers.getContract(
    "FixedNativePriceOracle",
    deployer
  )) as FixedNativePriceOracle;
  const simplePriceOracle = await ethers.getContract("SimplePriceOracle", deployer);

  // get the ERC20 address of deployed cERC20
  const underlyings = [tribe.address, touch.address, weth.address];
  const oracles = [simplePriceOracle.address, simplePriceOracle.address, fixedNativePriceOracle.address];

  tx = await masterPriceOracle.add(underlyings, oracles);
  await tx.wait();
  console.log(`Master Price Oracle updated for tokens ${underlyings.join(", ")}`);

  tx = await masterPriceOracle.setDefaultOracle(simplePriceOracle.address);
  await tx.wait();

  // Plugins & Rewards
  await deployFlywheelWithDynamicRewards({
    ethers,
    getNamedAccounts,
    deployments,
    run,
    deployConfig,
  });
  ////
};
