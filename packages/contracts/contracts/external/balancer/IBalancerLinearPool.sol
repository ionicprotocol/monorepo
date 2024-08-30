// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.8.0;

import { IBalancerVault } from "./IBalancerVault.sol";

interface IBalancerLinearPool {
  function getActualSupply() external view returns (uint256);

  function getBptIndex() external view returns (uint256);

  function getPoolId() external view returns (bytes32);

  function getVault() external view returns (IBalancerVault);

  function getRate() external view returns (uint256);

  function getScalingFactros() external view returns (uint256[] memory);

  function getTokenRate(address token) external view returns (uint256);

  function getMainToken() external view returns (address);
}
