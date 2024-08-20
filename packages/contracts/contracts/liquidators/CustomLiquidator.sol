// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/utils/AddressUpgradeable.sol";
import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

import "../utils/IW_NATIVE.sol";

import "./IRedemptionStrategy.sol";

/**
 * @title CustomLiquidator
 * @notice Redeems seized collateral tokens for the specified output token by calling the specified contract for use as a step in a liquidation.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract CustomLiquidator is IRedemptionStrategy {
  using AddressUpgradeable for address;

  /**
   * @dev W_NATIVE contract object.
   */
  IW_NATIVE private constant W_NATIVE = IW_NATIVE(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);

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
    // Call arbitrary contract
    address target;
    bytes memory data;
    (target, data, outputToken) = abi.decode(strategyData, (address, bytes, IERC20Upgradeable));
    target.functionCall(data);
    outputAmount = address(outputToken) == address(0) ? address(this).balance : outputToken.balanceOf(address(this));

    // Convert to W_NATIVE if ETH because `IonicLiquidator.repayTokenFlashLoan` only supports tokens (not ETH) as output from redemptions (reverts on line 24 because `underlyingCollateral` is the zero address)
    if (address(outputToken) == address(0)) {
      W_NATIVE.deposit{ value: outputAmount }();
      return (IERC20Upgradeable(address(W_NATIVE)), outputAmount);
    }
  }

  function name() public pure returns (string memory) {
    return "CustomLiquidator";
  }
}
