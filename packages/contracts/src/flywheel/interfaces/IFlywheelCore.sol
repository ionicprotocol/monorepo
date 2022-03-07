// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.11;

import { ERC20 } from "@rari-capital/solmate/src/tokens/ERC20.sol";

interface IFlywheelCore {
  function flywheelRewards() external view returns (address);

  function accrue(ERC20 market, address user) external returns (uint256);

  function accrue(
    ERC20 market,
    address src,
    address dest
  ) external returns (uint256);
}
