// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./Keep3rV2Oracle.sol";

contract Keep3rV2OracleFactory {
  mapping(address => Keep3rV2Oracle) public feeds;
}
