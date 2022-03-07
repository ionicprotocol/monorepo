// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface ISynthetix {
  function exchange(
    bytes32 sourceCurrencyKey,
    uint256 sourceAmount,
    bytes32 destinationCurrencyKey
  ) external returns (uint256 amountReceived);
}
