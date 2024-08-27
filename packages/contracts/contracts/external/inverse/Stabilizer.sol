// SPDX-License-Identifier: BSD-3-Clause
pragma solidity >=0.8.0;

interface Stabilizer {
  function buyFee() external view returns (uint256);

  function synth() external view returns (address);

  function reserve() external view returns (address);

  function buy(uint256 amount) external;

  function sell(uint256 amount) external;
}
