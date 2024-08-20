// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { ICurvePool } from "./ICurvePool.sol";

interface ICurveV2Pool is ICurvePool {
  function price_oracle() external view returns (uint256);

  function lp_price() external view returns (uint256);

  function coins(uint256 arg0) external view returns (address);
}
