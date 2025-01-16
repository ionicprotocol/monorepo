// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

interface Bank is IERC20Upgradeable {
  /// @dev Return the total ETH entitled to the token holders. Be careful of unaccrued interests.
  function totalETH() external view returns (uint256);

  /// @dev Add more ETH to the bank. Hope to get some good returns.
  function deposit() external payable;

  /// @dev Withdraw ETH from the bank by burning the share tokens.
  function withdraw(uint256 share) external;
}
