import { LiquidationStrategy } from "@ionicprotocol/types";
import { BigNumber } from "ethers";

import { MidasBase } from "../../MidasSdk";

import { getUniswapV2Router, StrategiesAndDatas } from "./redemptionStrategy";
import { FusePoolUserWithAssets } from "./utils";

const estimateGas = async (
  fuse: MidasBase,
  borrower: FusePoolUserWithAssets,
  exchangeToTokenAddress: string,
  liquidationAmount: BigNumber,
  strategiesAndDatas: StrategiesAndDatas,
  flashSwapPair: string,
  liquidationStrategy: LiquidationStrategy,
  debtFundingStrategies: any[],
  debtFundingStrategiesData: any[]
) => {
  switch (liquidationStrategy) {
    case LiquidationStrategy.DEFAULT:
      return await fuse.contracts.FuseSafeLiquidator.estimateGas[
        "safeLiquidate(address,uint256,address,address,uint256,address,address,address[],bytes[])"
      ](
        borrower.account,
        liquidationAmount,
        borrower.debt[0].cToken,
        borrower.collateral[0].cToken,
        0,
        exchangeToTokenAddress,
        fuse.chainSpecificAddresses.UNISWAP_V2_ROUTER,
        strategiesAndDatas.strategies,
        strategiesAndDatas.datas,
        {
          gasLimit: 1e9,
          from: process.env.ETHEREUM_ADMIN_ACCOUNT,
        }
      );
    case LiquidationStrategy.UNISWAP:
      return await fuse.contracts.FuseSafeLiquidator.estimateGas.safeLiquidateToTokensWithFlashLoan(
        {
          borrower: borrower.account,
          repayAmount: liquidationAmount,
          cErc20: borrower.debt[0].cToken,
          cTokenCollateral: borrower.collateral[0].cToken,
          minProfitAmount: 0,
          exchangeProfitTo: exchangeToTokenAddress,
          uniswapV2RouterForBorrow: fuse.chainSpecificAddresses.UNISWAP_V2_ROUTER, // TODO ASSET_SPECIFIC_ROUTER
          uniswapV2RouterForCollateral: getUniswapV2Router(fuse, borrower.collateral[0].cToken),
          redemptionStrategies: strategiesAndDatas.strategies,
          strategyData: strategiesAndDatas.datas,
          flashSwapPair,
          ethToCoinbase: 0,
          debtFundingStrategies,
          debtFundingStrategiesData,
        },
        {
          gasLimit: 1e9,
          from: process.env.ETHEREUM_ADMIN_ACCOUNT,
        }
      );
  }
};

export default estimateGas;
