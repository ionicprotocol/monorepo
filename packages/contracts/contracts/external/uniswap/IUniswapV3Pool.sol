// SPDX-License-Identifier: GPL-3.0-only
pragma solidity >=0.8.0;

import "./IUniswapV3PoolActions.sol";

interface IUniswapV3Pool is IUniswapV3PoolActions {
  function token0() external view returns (address);

  function token1() external view returns (address);

  function fee() external view returns (uint24);

  function slot0()
    external
    view
    returns (
      uint160 sqrtPriceX96,
      int24 tick,
      uint16 observationIndex,
      uint16 observationCardinality,
      uint16 observationCardinalityNext,
      uint8 feeProtocol,
      bool unlocked
    );

  function liquidity() external view returns (uint128);

  function observe(uint32[] calldata secondsAgos)
    external
    view
    returns (int56[] memory tickCumulatives, uint160[] memory liquidityCumulatives);

  function observations(uint256 index)
    external
    view
    returns (
      uint32 blockTimestamp,
      int56 tickCumulative,
      uint160 liquidityCumulative,
      bool initialized
    );

  function tickBitmap(int16 wordPosition) external view returns (uint256);

  function ticks(int24 tick)
    external
    view
    returns (
      uint128 liquidityGross,
      int128 liquidityNet,
      uint256 feeGrowthOutside0X128,
      uint256 feeGrowthOutside1X128,
      int56 tickCumulativeOutside,
      uint160 secondsPerLiquidityOutsideX128,
      uint32 secondsOutside,
      bool initialized
    );

  function increaseObservationCardinalityNext(uint16 observationCardinalityNext) external;

  function positions(bytes32 key)
    external
    view
    returns (
      uint128 _liquidity,
      uint256 feeGrowthInside0LastX128,
      uint256 feeGrowthInside1LastX128,
      uint128 tokensOwed0,
      uint128 tokensOwed1
    );
}
