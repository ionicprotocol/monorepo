// SPDX-License-Identifier: BSD-3-Clause
pragma solidity >=0.8.0;

import "./ICToken.sol";

/**
 * @title Compound's CErc20 Contract
 * @notice CTokens which wrap an EIP-20 underlying
 * @author Compound
 */
interface ICErc20Compound is ICToken {
  function underlying() external view returns (address);

  function liquidateBorrow(
    address borrower,
    uint256 repayAmount,
    ICToken cTokenCollateral
  ) external returns (uint256);

  function getTotalUnderlyingSupplied() external view returns (uint256);
}
