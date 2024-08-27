// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

interface IW_NATIVE {
  function deposit() external payable;

  function withdraw(uint256 amount) external;

  function approve(address spender, uint256 amount) external returns (bool);

  function transfer(address to, uint256 amount) external returns (bool);

  function transferFrom(
    address from,
    address to,
    uint256 amount
  ) external returns (bool);

  function balanceOf(address) external view returns (uint256);
}
