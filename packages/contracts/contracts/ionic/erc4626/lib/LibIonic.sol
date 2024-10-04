// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.13;

import { FixedPointMathLib } from "solmate/utils/FixedPointMathLib.sol";
import { InterestRateModel } from "../../../compound/InterestRateModel.sol";

import { ICErc20 } from "../../../compound/CTokenInterfaces.sol";

/// @notice Get up to date cToken data without mutating state.
/// @author Transmissions11 (https://github.com/transmissions11/libcompound)
library LibIonic {
  using FixedPointMathLib for uint256;

  function viewUnderlyingBalanceOf(ICErc20 cToken, address user) internal view returns (uint256) {
    return cToken.balanceOf(user).mulWadDown(viewExchangeRate(cToken));
  }

  function viewExchangeRate(ICErc20 cToken) internal view returns (uint256) {
    return cToken.exchangeRateCurrent();
  }
}
