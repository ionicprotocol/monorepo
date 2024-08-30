import { DeployFunction } from "hardhat-deploy/types";
import { Address, formatUnits, parseEther, maxUint256, Hash } from "viem";

import { ChainDeployConfig, chainDeployConfig } from "../chainDeploy";
import { getCgPrice } from "../chainDeploy/helpers/getCgPrice";

const func: DeployFunction = async ({ viem, getNamedAccounts, deployments, getChainId }) => {
  const chainId = parseInt(await getChainId());
  console.log("chainId: ", chainId);

  const MIN_BORROW_USD = 0.1;
  const publicClient = await viem.getPublicClient();

  const { deployer, multisig } = await getNamedAccounts();
  console.log("deployer: ", deployer);
  console.log("multisig: ", multisig);
  const balance = await publicClient.getBalance({ address: deployer as Address });
  console.log("balance: ", balance.toString());
  const price = await publicClient.getGasPrice();
  console.log("gas price: ", formatUnits(price, 9));

  console.log("chainId: ", chainId);
  if (!chainDeployConfig[chainId]) {
    throw new Error(`Config invalid for ${chainId}`);
  }
  const { config: chainDeployParams }: { config: ChainDeployConfig } = chainDeployConfig[chainId];
  console.log("chainDeployParams: ", chainDeployParams);

  const cgPrice = await getCgPrice(chainDeployParams.cgId);
  const minBorrow = parseEther((MIN_BORROW_USD / cgPrice).toFixed(18));

  ////
  //// COMPOUND CORE CONTRACTS
  let hash;

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
            args: [parseEther("0.1")]
          }
        },
        owner: multisig
      }
    });
    if (ffd.transactionHash) await publicClient.waitForTransactionReceipt({ hash: ffd.transactionHash as Hash });

    console.log("FeeDistributor: ", ffd.address);
  } catch (error) {
    console.error("Could not deploy:", error);
  }
  const fuseFeeDistributor = await viem.getContractAt(
    "FeeDistributor",
    (await deployments.get("FeeDistributor")).address as Address
  );
  const ffdFee = await fuseFeeDistributor.read.defaultInterestFeeRate();
  console.log(`ffd fee ${ffdFee}`);
  if (ffdFee === 0n) {
    const owner = (await fuseFeeDistributor.read.owner()) as Address;
    if (owner.toLowerCase() !== deployer.toLowerCase()) {
      // logTransaction(
      //   "Set Default Interest Fee Rate",
      //   encodeFunctionData({
      //     abi: feeDistributorAbi,
      //     functionName: "_setDefaultInterestFeeRate",
      //     args: [parseEther("1.0")]
      //   })
      // );
    } else {
      hash = await fuseFeeDistributor.write._setDefaultInterestFeeRate([parseEther("0.1")], {});
      await publicClient.waitForTransactionReceipt({ hash });
      console.log(`updated the FFD fee with tx ${hash}`);
    }

    const feeAfter = await fuseFeeDistributor.read.defaultInterestFeeRate();
    console.log(`ffd fee updated to ${feeAfter}`);
  } else {
    console.log(`not updating the ffd fee`);
  }

  try {
    const currentMinBorrow = (await fuseFeeDistributor.read.minBorrowEth()) as bigint;
    const currentMinBorrowPercent = (currentMinBorrow * 100n) / minBorrow;
    if (currentMinBorrowPercent > 102n || currentMinBorrowPercent < 98n) {
      if (((await fuseFeeDistributor.read.owner()) as Address).toLowerCase() !== deployer.toLowerCase()) {
        // logTransaction(
        //   "Set Pool Limits",
        //   fuseFeeDistributor.interface.encodeFunctionData("_setPoolLimits", [minBorrow, ethers.constants.MaxUint256])
        // );
      } else {
        hash = await fuseFeeDistributor.write._setPoolLimits([minBorrow, maxUint256]);
        await publicClient.waitForTransactionReceipt({ hash });
        console.log("FeeDistributor pool limits set", hash);
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
