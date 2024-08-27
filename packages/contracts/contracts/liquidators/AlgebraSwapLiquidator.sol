// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "./IRedemptionStrategy.sol";
import "../external/algebra/ISwapRouter.sol";

/**
 * @title AlgebraSwapLiquidator
 * @notice Exchanges seized token collateral for underlying tokens via a Algebra router for use as a step in a liquidation.
 * @author Veliko Minkov <veliko@midascapital.xyz> (https://github.com/vminkov)
 */
contract AlgebraSwapLiquidator is IRedemptionStrategy {
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
  ) external returns (IERC20Upgradeable outputToken, uint256 outputAmount) {
    (address _outputToken, IAlgebraSwapRouter swapRouter) = abi.decode(strategyData, (address, IAlgebraSwapRouter));
    outputToken = IERC20Upgradeable(_outputToken);

    inputToken.approve(address(swapRouter), inputAmount);

    IAlgebraSwapRouter.ExactInputSingleParams memory params = IAlgebraSwapRouter.ExactInputSingleParams(
      address(inputToken),
      _outputToken,
      address(this),
      block.timestamp,
      inputAmount,
      0, // amountOutMinimum
      0 // limitSqrtPrice
    );

    outputAmount = swapRouter.exactInputSingle(params);
  }

  function name() public pure returns (string memory) {
    return "AlgebraSwapLiquidator";
  }
}
