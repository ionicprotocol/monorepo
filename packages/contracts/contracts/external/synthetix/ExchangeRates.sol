// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface ExchangeRates {
  function effectiveValue(
    bytes32 sourceCurrencyKey,
    uint256 sourceAmount,
    bytes32 destinationCurrencyKey
  ) external view returns (uint256 value);
}
