// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "./BaseUniswapV2Liquidator.sol";

contract KimUniV2Liquidator is BaseUniswapV2Liquidator {
  function _swap(
    IUniswapV2Router02 uniswapV2Router,
    uint256 inputAmount,
    address[] memory swapPath
  ) internal override {
    uniswapV2Router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
      inputAmount,
      0,
      swapPath,
      address(this),
      address(0), // referrer
      block.timestamp
    );
  }

  function name() public pure virtual returns (string memory) {
    return "KimUniV2Liquidator";
  }
}
