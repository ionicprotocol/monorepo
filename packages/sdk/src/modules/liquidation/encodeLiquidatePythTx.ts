import { BigNumber } from "ethers";

import { PythEncodedLiquidationTx, PoolUserWithAssets } from "./utils";

export default async function encodeLiquidateTx(
  borrower: PoolUserWithAssets,
  liquidationAmount: BigNumber,
  seizeAmount: BigNumber
): Promise<PythEncodedLiquidationTx> {
  return {
    method: "safeLiquidate(address,uint256,address,address,uint256)",
    args: [borrower.account, liquidationAmount, borrower.debt[0].cToken, borrower.collateral[0].cToken, 0],
    value: BigNumber.from(0),
    buyTokenAmount: seizeAmount,
    sellTokenAmount: liquidationAmount,
    buyTokenUnderlying: borrower.collateral[0].underlyingToken,
    sellTokenUnderlying: borrower.debt[0].underlyingToken
  };
}
