// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IVaultV2 {
  function pricePerShare() external view returns (uint256);

  function token() external view returns (address);

  function decimals() external view returns (uint8);

  function deposit(uint256 _amount) external returns (uint256);

  function withdraw(uint256 maxShares) external returns (uint256);
}
