// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

abstract contract Keep3rV1Oracle {
  struct Observation {
    uint256 timestamp;
    uint256 price0Cumulative;
    uint256 price1Cumulative;
  }

  function factory() external pure virtual returns (address);

  mapping(address => Observation[]) public observations;

  function observationLength(address pair) external view virtual returns (uint256);
}
