// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

interface IHypervisor is IERC20Upgradeable {
  function baseLower() external view returns (int24);

  function baseUpper() external view returns (int24);

  function limitLower() external view returns (int24);

  function limitUpper() external view returns (int24);

  function pool() external view returns (address);

  function token0() external view returns (address);

  function token1() external view returns (address);

  function directDeposit() external view returns (bool);

  function getBasePosition()
    external
    view
    returns (
      uint256 liquidity,
      uint256 total0,
      uint256 total1
    );

  function getTotalAmounts() external view returns (uint256 total0, uint256 total1);

  function setWhitelist(address _address) external;

  function setFee(uint8 newFee) external;

  function removeWhitelisted() external;

  function transferOwnership(address newOwner) external;

  function withdraw(
    uint256 shares,
    address to,
    address from,
    uint256[4] memory minAmounts
  ) external returns (uint256 amount0, uint256 amount1);

  function deposit(
    uint256 deposit0,
    uint256 deposit1,
    address to,
    address from,
    uint256[4] memory inMin
  ) external returns (uint256 shares);
}
