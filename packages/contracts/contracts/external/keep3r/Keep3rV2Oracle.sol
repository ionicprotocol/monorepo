// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

contract Keep3rV2Oracle {
  struct Observation {
    uint32 timestamp;
    uint112 price0Cumulative;
    uint112 price1Cumulative;
  }

  Observation[65535] public observations;
  uint16 public length;
}
