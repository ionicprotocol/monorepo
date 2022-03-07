// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.11;

interface InterestRateModel {
  function getBorrowRate(
    uint256,
    uint256,
    uint256
  ) external view returns (uint256);

  function getSupplyRate(
    uint256,
    uint256,
    uint256,
    uint256
  ) external view returns (uint256);
}
