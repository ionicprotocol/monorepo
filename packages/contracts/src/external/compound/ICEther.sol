// SPDX-License-Identifier: BSD-3-Clause
pragma solidity >=0.8.0;

import "./ICToken.sol";

/**
 * @title Compound's CEther Contract
 * @notice CTokens which wrap an EIP-20 underlying
 * @author Compound
 */
interface ICEther is ICToken {
  function liquidateBorrow(address borrower, ICToken cTokenCollateral) external payable;
}
