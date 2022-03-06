// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface ISynth {
  function currencyKey() external view returns (bytes32);
}
