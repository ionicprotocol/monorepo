// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

interface ISafeBox is IERC20Upgradeable {
  function cToken() external view returns (address);

  function uToken() external view returns (address);

  function deposit(uint256 amount) external;

  function withdraw(uint256 amount) external;
}
