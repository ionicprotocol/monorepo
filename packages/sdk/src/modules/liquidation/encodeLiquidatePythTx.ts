import { PoolUserWithAssets, PythEncodedLiquidationTx } from "./utils";

export default async function encodeLiquidateTx(
  borrower: PoolUserWithAssets,
  liquidationAmount: bigint,
  seizeAmount: bigint
): Promise<PythEncodedLiquidationTx> {
  return {
    method: "safeLiquidatePyth(address,uint256,address,address,uint256)",
    args: [borrower.account, liquidationAmount, borrower.debt[0].cToken, borrower.collateral[0].cToken, 0],
    value: 0n,
    buyTokenAmount: seizeAmount,
    sellTokenAmount: liquidationAmount,
    buyTokenUnderlying: borrower.collateral[0].underlyingToken,
    sellTokenUnderlying: borrower.debt[0].underlyingToken
  };
}
