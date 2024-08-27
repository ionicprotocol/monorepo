// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.0 <0.9.0;

interface IQuoter {
  function estimateMaxSwapUniswapV3(
    address _fromToken,
    address _toToken,
    uint256 _amount,
    uint24 _poolFee
  ) external view returns (uint256);

  function estimateMinSwapUniswapV3(
    address _fromToken,
    address _toToken,
    uint256 _amount,
    uint24 _poolFee
  ) external view returns (uint256);
}
