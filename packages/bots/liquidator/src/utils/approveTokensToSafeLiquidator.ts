import { TransactionRequest, TransactionResponse } from "@ethersproject/providers";
import { ERC20Abi, IonicSdk } from "@ionicprotocol/sdk";
import { LiquidationStrategy } from "@ionicprotocol/types";
import { BigNumber, constants, Contract, Wallet } from "ethers";

import config from "../config";
import { Liquidator } from "../services";

import { fetchGasLimitForTransaction } from ".";

export default async function approveTokensToSafeLiquidator(liquidator: Liquidator) {
  const { chainLiquidationConfig, logger } = liquidator.sdk;
  if (chainLiquidationConfig.LIQUIDATION_STRATEGY === LiquidationStrategy.DEFAULT) {
    for (const tokenAddress of chainLiquidationConfig.SUPPORTED_OUTPUT_CURRENCIES) {
      if (tokenAddress !== constants.AddressZero) {
        logger.info(`Sending approve transaction for ${tokenAddress}`);
        await approveTokenToSafeLiquidator(liquidator.sdk, tokenAddress);
        logger.info(`Approve transaction for ${tokenAddress} sent`);
      }
    }
  }
}

async function approveTokenToSafeLiquidator(ionicSdk: IonicSdk, erc20Address: string) {
  // Build data
  const signer = new Wallet(config.adminPrivateKey, ionicSdk.provider);
  let token = new Contract(erc20Address, ERC20Abi, signer);

  token = await token.connect(signer);
  const txCount = await ionicSdk.provider.getTransactionCount(config.adminAccount);

  const data = token.interface.encodeFunctionData("approve", [
    ionicSdk.contracts.FuseSafeLiquidator.address,
    constants.MaxUint256,
  ]);

  // Build transaction
  const tx = {
    from: config.adminAccount,
    to: erc20Address,
    value: BigNumber.from(0),
    data: data,
    nonce: txCount,
  };
  const gasLimit = await fetchGasLimitForTransaction(ionicSdk, "approve", tx);
  const txRequest: TransactionRequest = {
    ...tx,
    gasLimit: gasLimit,
  };

  if (process.env.NODE_ENV !== "production")
    ionicSdk.logger.info("Signing and sending approval transaction for: " + erc20Address);

  // send transaction
  let sentTx: TransactionResponse;
  try {
    sentTx = await signer.sendTransaction(txRequest);
    await sentTx.wait();
    const receipt = await sentTx.wait();
    if (receipt.status === 0) {
      throw `Error sending approve transaction for ${erc20Address}`;
    }
  } catch (error) {
    throw "Error sending " + erc20Address + " approval transaction: " + error;
  }
  ionicSdk.logger.info("Successfully sent approval transaction for: " + erc20Address);
  return sentTx;
}
