import { providers, utils, BigNumber } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";

import { ChainDeployConfig, chainDeployConfig } from "../chainDeploy";
import { getCgPrice } from "../chainDeploy/helpers/getCgPrice";
import { logTransaction } from "../chainDeploy/helpers/logging";
import { FeeDistributor } from "../typechain/FeeDistributor.sol/FeeDistributor";

const func: DeployFunction = async ({ run, ethers, getNamedAccounts, deployments, getChainId }) => {
  console.log("RPC URL: ", ethers.provider.connection.url);
  const chainId = parseInt(await getChainId());
  console.log("chainId: ", chainId);

  const MIN_BORROW_USD = 0.1;

  const { deployer, multisig } = await getNamedAccounts();
  console.log("deployer: ", deployer);
  console.log("multisig: ", multisig);
  const balance = await ethers.provider.getBalance(deployer);
  console.log("balance: ", balance.toString());
  const price = await ethers.provider.getGasPrice();
  console.log("gas price: ", ethers.utils.formatUnits(price, "gwei"));
  const feeData = await ethers.provider.getFeeData();

  console.log("fee data: ", {
    lastBaseFeePerGas: feeData.lastBaseFeePerGas?.toString(),
    maxFeePerGas: feeData.maxFeePerGas?.toString(),
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
    gasPrice: feeData.gasPrice?.toString()
  });

  console.log("chainId: ", chainId);
  if (!chainDeployConfig[chainId]) {
    throw new Error(`Config invalid for ${chainId}`);
  }
  const { config: chainDeployParams }: { config: ChainDeployConfig } = chainDeployConfig[chainId];
  console.log("chainDeployParams: ", chainDeployParams);

  const cgPrice = await getCgPrice(chainDeployParams.cgId);
  const minBorrow = utils.parseUnits((MIN_BORROW_USD / cgPrice).toFixed(18));

  ////
  //// COMPOUND CORE CONTRACTS
  let tx: providers.TransactionResponse;
  const maxFeePerGas = feeData.maxFeePerGas || BigNumber.from("1500000000"); // default value if null
  const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || BigNumber.from("1500000000"); // default value if null

  let ffd;
  try {
    ffd = await deployments.deploy("FeeDistributor", {
      from: deployer,
      log: true,
      proxy: {
        proxyContract: "OpenZeppelinTransparentProxy",
        execute: {
          init: {
            methodName: "initialize",
            args: [ethers.utils.parseEther("0.1")]
          }
        },
        owner: multisig
      },
      maxFeePerGas,
      maxPriorityFeePerGas
    });
    if (ffd.transactionHash) await ethers.provider.waitForTransaction(ffd.transactionHash);

    console.log("FeeDistributor: ", ffd.address);
  } catch (error) {
    console.error("Could not deploy:", error);
  }
  const fuseFeeDistributor = (await ethers.getContract("FeeDistributor", deployer)) as FeeDistributor;

  const ffdFee = await fuseFeeDistributor.callStatic.defaultInterestFeeRate();
  console.log(`ffd fee ${ffdFee}`);
  if (ffdFee.isZero()) {
    if ((await fuseFeeDistributor.owner()).toLowerCase() !== deployer.toLowerCase()) {
      logTransaction(
        "Set Default Interest Fee Rate",
        fuseFeeDistributor.interface.encodeFunctionData("_setDefaultInterestFeeRate", [ethers.utils.parseEther("0.1")])
      );
    } else {
      tx = await fuseFeeDistributor._setDefaultInterestFeeRate(ethers.utils.parseEther("0.1"));
      await tx.wait();
      console.log(`updated the FFD fee with tx ${tx.hash}`);
    }

    const feeAfter = await fuseFeeDistributor.callStatic.defaultInterestFeeRate();
    console.log(`ffd fee updated to ${feeAfter}`);
  } else {
    console.log(`not updating the ffd fee`);
  }

  try {
    const currentMinBorrow = await fuseFeeDistributor.callStatic.minBorrowEth();
    const currentMinBorrowPercent = currentMinBorrow.mul(100).div(minBorrow);
    if (currentMinBorrowPercent.gt(102) || currentMinBorrowPercent.lt(98)) {
      if ((await fuseFeeDistributor.owner()).toLowerCase() !== deployer.toLowerCase()) {
        logTransaction(
          "Set Pool Limits",
          fuseFeeDistributor.interface.encodeFunctionData("_setPoolLimits", [minBorrow, ethers.constants.MaxUint256])
        );
      } else {
        tx = await fuseFeeDistributor._setPoolLimits(minBorrow, ethers.constants.MaxUint256);
        await tx.wait();
        console.log("FeeDistributor pool limits set", tx.hash);
      }
    } else {
      console.log(
        `current min borrow ${currentMinBorrow} is within 2% of the actual value ${minBorrow} - not updating it`
      );
    }
  } catch (e) {
    console.log("error setting the pool limits", e);
  }
};

func.tags = ["prod", "fee-distributor"];

export default func;
