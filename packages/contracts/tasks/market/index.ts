import "./set-plugin";
import "./admin";
import "./risk";
import "./upgrade";
import "./upgrade-all";
import "./deploy-dynamic-rewards-market";
import "./deploy-static-rewards-market";
import "./deploy";
import "./borrow";
import { Address } from "viem";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export const getMarketInfo = async (viem: HardhatRuntimeEnvironment["viem"], _comptroller: Address) => {
  const comptroller = await viem.getContractAt("IonicComptroller", _comptroller);
  const cTokens = await comptroller.read.getAllMarkets();
  for (const cToken of cTokens) {
    const cTokenContract = await viem.getContractAt("ICErc20", cToken);
    const symbol = await cTokenContract.read.symbol();
    const underlying = await cTokenContract.read.underlying();
    const underlyingContract = await viem.getContractAt("ICErc20", underlying);
    const underlyingSymbol = await underlyingContract.read.symbol();
    const underlyingDecimals = await underlyingContract.read.decimals();
    console.log(`${symbol},${cToken},${underlying},${underlyingSymbol},${underlyingDecimals}`);
  }
};
