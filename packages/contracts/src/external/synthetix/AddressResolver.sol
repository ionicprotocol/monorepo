// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface AddressResolver {
  function requireAndGetAddress(bytes32 name, string calldata reason) external view returns (address);
}
