// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

import "../external/alpha/ISafeBox.sol";

import "./IRedemptionStrategy.sol";

/**
 * @title AlphaHomoraV2SafeBoxLiquidator
 * @notice Redeems seized Alpha Homora v2 "ibTokenV2" or SafeBox tokens (e.g., ibDAIv2) for underlying tokens for use as a step in a liquidation.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract AlphaHomoraV2SafeBoxLiquidator is IRedemptionStrategy {
  /**
   * @notice Redeems custom collateral `token` for an underlying token.
   * @param inputToken The input wrapped token to be redeemed for an underlying token.
   * @param inputAmount The amount of the input wrapped token to be redeemed for an underlying token.
   * @param strategyData The ABI-encoded data to be used in the redemption strategy logic.
   * @return outputToken The underlying ERC20 token outputted.
   * @return outputAmount The quantity of underlying tokens outputted.
   */
  function redeem(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    bytes memory strategyData
  ) external override returns (IERC20Upgradeable outputToken, uint256 outputAmount) {
    // Redeem ibTokenV2 for underlying ERC20 token (and store output as new collateral)
    ISafeBox safeBox = ISafeBox(address(inputToken));
    safeBox.withdraw(inputAmount);
    outputToken = IERC20Upgradeable(safeBox.uToken());
    outputAmount = outputToken.balanceOf(address(this));
  }

  function name() public pure returns (string memory) {
    return "AlphaHomoraV2SafeBoxLiquidator";
  }
}
