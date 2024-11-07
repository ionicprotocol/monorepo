import { chainIdToConfig } from "@ionicprotocol/chains";
import { config as dotenvConfig } from "dotenv";
import { createPublicClient, createWalletClient, Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, mode } from "viem/chains";

import { cErc20Abi, ionicUniV3LiquidatorAbi, IonicSdk } from "../src";

dotenvConfig();

const run = async () => {
  const account = privateKeyToAccount(process.env.DEPLOYER as Hex);
  const walletClient = createWalletClient({
    account,
    chain: mode,
    transport: http()
  });

  const publicClient = createPublicClient({ transport: http(), chain: mode });
  const borrower = "0x05c9C6417F246600f8f5f49fcA9Ee991bfF73D13";
  const cErc20 = "0xA0D844742B4abbbc43d8931a6Edb00C56325aA18";
  const cTokenCollateral = "0x94812F2eEa03A49869f95e1b5868C6f3206ee3D3";
  const repayAmount = 872137278429660n;

  const borrowedUnderlying = await publicClient.readContract({
    address: cErc20,
    abi: cErc20Abi,
    functionName: "underlying"
  });

  const collateralUnderlying = await publicClient.readContract({
    address: cTokenCollateral,
    abi: cErc20Abi,
    functionName: "underlying"
  });

  const ionicLiquidator = "0x50F13EC4B68c9522260d3ccd4F19826679B3Ce5C";

  const url = `https://li.quest/v1/quote/toAmount?fromChain=34443&toChain=34443&fromToken=${collateralUnderlying}&toToken=${borrowedUnderlying}&fromAddress=${ionicLiquidator}&toAddress=${ionicLiquidator}&toAmount=${repayAmount}&fee=0`;
  const options = { method: "GET", headers: { accept: "application/json" } };

  const data = await fetch(url, options);
  const json = await data.json();
  console.log(json);

  const tx = await walletClient.writeContract({
    address: ionicLiquidator,
    abi: ionicUniV3LiquidatorAbi,
    functionName: "safeLiquidateWithAggregator",
    args: [borrower, repayAmount, cErc20, cTokenCollateral, json.transactionRequest.to, json.transactionRequest.data]
  });
  console.log(tx);
};

run();
