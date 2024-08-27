// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.0;

abstract contract OlympusStaking {
  address public OHM;

  function unstake(uint256 _amount, bool _trigger) external virtual;
}
