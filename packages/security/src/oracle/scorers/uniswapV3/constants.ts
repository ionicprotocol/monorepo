import { Decimal } from "decimal.js";
import { BigNumber } from "ethers";

Decimal.set({ precision: 50 });

export const MAX_TICK_PRICE = Decimal.pow(1.0001, 887272);
export const MIN_TICK_PRICE = Decimal.pow(1.0001, -887272);
export const c1e18 = BigNumber.from(10).pow(18);
export const QUOTER_ABI = [
  "function quoteExactInputSingle(tuple(address tokenIn,address tokenOut,uint256 amountIn,uint24 fee,uint160 sqrtPriceLimitX96) params) public returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)",
];
export const UNISWAP_V3_POOL_ABI = [
  "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
];
export const UNISWAP_V3_FACTORY_ABI = [
  "function getPool(address token0, address token1, uint24 fee) public view returns (address)",
];
export const TICK_SPACINGS = {
  100: 1,
  500: 10,
  3000: 60,
  10000: 200,
};

export const amountsUSD = [
  100_000, 200_000, 300_000, 400_000, 500_000, 600_000, 700_000, 800_000, 900_000, 1_000_000, 2_000_000, 3_000_000,
  4_000_000, 5_000_000, 6_000_000, 7_000_000, 8_000_000, 9_000_000, 10_000_000,
];
