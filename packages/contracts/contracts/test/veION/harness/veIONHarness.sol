// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "../../../veION/veION.sol";

// This harness contract can be used for testing purposes.
contract veIONHarness is veION {
  function exposed_calculateBoost(uint256 _duration) external view returns (uint256) {
    return _calculateBoost(_duration);
  }
}
