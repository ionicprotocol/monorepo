// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/utils/SafeERC20Upgradeable.sol";

import "../external/olympus/sOlympus.sol";
import "../external/olympus/OlympusStaking.sol";

import "./IRedemptionStrategy.sol";

/**
 * @title SOhmLiquidator
 * @notice Redeems sOHM for underlying assets for use as a step in a liquidation.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract SOhmLiquidator is IRedemptionStrategy {
  using SafeERC20Upgradeable for IERC20Upgradeable;

  /**
   * @dev Internal function to approve unlimited tokens of `erc20Contract` to `to`.
   */
  function safeApprove(IERC20Upgradeable token, address to, uint256 minAmount) private {
    uint256 allowance = token.allowance(address(this), to);

    if (allowance < minAmount) {
      if (allowance > 0) token.safeApprove(to, 0);
      token.safeApprove(to, type(uint256).max);
    }
  }

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
    // Unstake sOHM (and store output OHM as new collateral)
    sOlympus token = sOlympus(address(inputToken));
    OlympusStaking staking = OlympusStaking(token.stakingContract());
    safeApprove(inputToken, address(staking), inputAmount);
    staking.unstake(inputAmount, false);
    outputToken = IERC20Upgradeable(staking.OHM());
    outputAmount = inputAmount;
  }

  function name() public pure returns (string memory) {
    return "SOhmLiquidator";
  }
}
