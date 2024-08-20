// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

interface ISafeBoxETH is IERC20Upgradeable {
  function cToken() external view returns (address);

  function deposit() external payable;

  function withdraw(uint256 amount) external;
}
