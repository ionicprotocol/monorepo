// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IProxy {
  function read() external view returns (int224 value, uint32 timestamp);

  function api3ServerV1() external view returns (address);
}
