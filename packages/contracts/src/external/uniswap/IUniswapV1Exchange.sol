// SPDX-License-Identifier: GPL-3.0-only
pragma solidity >=0.8.0;

interface IUniswapV1Exchange {
  function tokenToEthSwapInput(
    uint256 tokens_sold,
    uint256 min_eth,
    uint256 deadline
  ) external returns (uint256);
}
