// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;
import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

import { IRouter_Aerodrome } from "../external/aerodrome/IAerodromeRouter.sol";

/**
 * @title AerodromeV2Liquidator
 * @notice Exchanges seized token collateral for underlying tokens via a Aerodrome V2 router for use as a step in a liquidation.
 */
contract AerodromeV2Liquidator {
  function _swap(IRouter_Aerodrome router, uint256 inputAmount, IRouter_Aerodrome.Route[] memory swapPath) internal {
    router.swapExactTokensForTokens(inputAmount, 0, swapPath, address(this), block.timestamp);
  }

  function name() public pure virtual returns (string memory) {
    return "AerodromeV2Liquidator";
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
  ) external returns (IERC20Upgradeable outputToken, uint256 outputAmount) {
    return _convert(inputToken, inputAmount, strategyData);
  }

  function _convert(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    bytes memory strategyData
  ) internal returns (IERC20Upgradeable outputToken, uint256 outputAmount) {
    // Get Uniswap router and path
    (IRouter_Aerodrome router, IRouter_Aerodrome.Route[] memory swapPath) = abi.decode(
      strategyData,
      (IRouter_Aerodrome, IRouter_Aerodrome.Route[])
    );
    require(
      swapPath.length >= 1 && swapPath[0].from == address(inputToken),
      "Invalid AerodromeV2Liquidator swap path."
    );

    // Swap underlying tokens
    inputToken.approve(address(router), inputAmount);

    // call the relevant fn depending on the uni v2 fork specifics
    _swap(router, inputAmount, swapPath);

    // Get new collateral
    outputToken = IERC20Upgradeable(swapPath[swapPath.length - 1].to);
    outputAmount = outputToken.balanceOf(address(this));
  }
}
