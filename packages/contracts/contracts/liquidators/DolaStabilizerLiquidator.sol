// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/utils/SafeERC20Upgradeable.sol";

import "../external/inverse/Stabilizer.sol";

import "./IRedemptionStrategy.sol";

/**
 * @title DolaStabilizerLiquidator
 * @notice Buys DOLA using DAI and sells DOLA for DAI using the Anchor Stabilizer contract as a step in a liquidation.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract DolaStabilizerLiquidator is IRedemptionStrategy {
  using SafeERC20Upgradeable for IERC20Upgradeable;

  /**
   * @dev Anchor's Stabilizer contract for DOLA.
   */
  Stabilizer public STABILIZER = Stabilizer(0x7eC0D931AFFBa01b77711C2cD07c76B970795CDd);

  /**
   * @dev Stabilizer's fee denominator.
   */
  uint256 public constant FEE_DENOMINATOR = 10000;

  /**
   * @dev Internal function to approve unlimited tokens of `erc20Contract` to `to`.
   */
  function safeApprove(
    IERC20Upgradeable token,
    address to,
    uint256 minAmount
  ) private {
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
    // Approve input token to Stabilizer
    safeApprove(inputToken, address(STABILIZER), inputAmount);

    // Buy or sell depending on if input is synth or reserve
    address synth = STABILIZER.synth();
    address reserve = STABILIZER.reserve();

    if (address(inputToken) == reserve) {
      // Buy DOLA with DAI
      outputAmount = (inputAmount * FEE_DENOMINATOR) / (FEE_DENOMINATOR + STABILIZER.buyFee());
      STABILIZER.buy(outputAmount);
      outputToken = IERC20Upgradeable(synth);
    } else if (address(inputToken) == synth) {
      // Sell DOLA for DAI
      STABILIZER.sell(inputAmount);
      outputToken = IERC20Upgradeable(reserve);
      outputAmount = outputToken.balanceOf(address(this));
    }
  }

  function name() public pure returns (string memory) {
    return "DolaStabilizerLiquidator";
  }
}
