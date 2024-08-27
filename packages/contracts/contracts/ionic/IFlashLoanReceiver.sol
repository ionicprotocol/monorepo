// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

interface IFlashLoanReceiver {
  function receiveFlashLoan(
    address borrowedAsset,
    uint256 borrowedAmount,
    bytes calldata data
  ) external;
}
