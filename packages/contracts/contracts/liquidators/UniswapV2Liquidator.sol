// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "./BaseUniswapV2Liquidator.sol";

/**
 * @title UniswapV2Liquidator
 * @notice Exchanges seized token collateral for underlying tokens via a Uniswap V2 router for use as a step in a liquidation.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract UniswapV2Liquidator is BaseUniswapV2Liquidator {
  function _swap(
    IUniswapV2Router02 uniswapV2Router,
    uint256 inputAmount,
    address[] memory swapPath
  ) internal override {
    uniswapV2Router.swapExactTokensForTokens(inputAmount, 0, swapPath, address(this), block.timestamp);
  }

  function name() public pure virtual returns (string memory) {
    return "UniswapV2Liquidator";
  }
}
