import { Address, Hash, parseEther } from "viem";
import { mode } from "viem/chains";

import { assetSymbols } from "@ionicprotocol/types";
import { mode as iMode } from "@ionicprotocol/chains";
import { IrmDeployFnParams } from "../types";

import { underlying } from "./utils";

const PRUDENTIA_RATE_CONTROLLER_MODE = "0x09D7EC8d023859b48a634d425bfEf29622272aFa";

type PrudentiaConfig = {
  blocksPerYear: number;
  underlying: Address;
  rateController: Address;
  symbol: string;
};

const assets = iMode.assets;

const prudentiaParams: Record<number, PrudentiaConfig[]> = {
  [mode.id]: [
    {
      symbol: assetSymbols.USDC,
      blocksPerYear: 15768000,
      underlying: underlying(assets, assetSymbols.USDC),
      rateController: PRUDENTIA_RATE_CONTROLLER_MODE
    },
    {
      symbol: assetSymbols.USDT,
      blocksPerYear: 15768000,
      underlying: underlying(assets, assetSymbols.USDT),
      rateController: PRUDENTIA_RATE_CONTROLLER_MODE
    },
    {
      symbol: assetSymbols.WETH,
      blocksPerYear: 15768000,
      underlying: underlying(assets, assetSymbols.WETH),
      rateController: PRUDENTIA_RATE_CONTROLLER_MODE
    }
  ]
};

export const deployIRMs = async ({
  deployConfig,
  deployments,
  getNamedAccounts,
  viem,
  chainId
}: IrmDeployFnParams): Promise<void> => {
  const publicClient = await viem.getPublicClient();
  const { deployer } = await getNamedAccounts();
  //// IRM MODELS|
  const jrm = await deployments.deploy("JumpRateModel", {
    from: deployer,
    args: [
      deployConfig.blocksPerYear,
      parseEther("0").toString(), // baseRatePerYear   0
      parseEther("0.18").toString(), // multiplierPerYear 0.18
      parseEther("4").toString(), //jumpMultiplierPerYear 4
      parseEther("0.8").toString() // kink               0.8
    ],
    log: true
  });
  if (jrm.transactionHash) await publicClient.waitForTransactionReceipt({ hash: jrm.transactionHash as Hash });
  console.log("JumpRateModel: ", jrm.address);

  const prudentiaConfig = prudentiaParams[+chainId] ?? [];
  for (const config of prudentiaConfig) {
    const irm = await deployments.deploy(`PrudentiaInterestRateModel_${config.symbol}`, {
      contract: "PrudentiaInterestRateModel",
      from: deployer,
      args: [config.blocksPerYear, config.underlying, config.rateController],
      log: true
    });
    if (irm.transactionHash) await publicClient.waitForTransactionReceipt({ hash: irm.transactionHash as Hash });
    console.log("PrudentiaInterestRateModel: ", config.symbol, irm.address);
  }
};
