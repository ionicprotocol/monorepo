// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// 1 stkBNB = (totalWei / poolTokenSupply) BNB
// 1 BNB = (poolTokenSupply / totalWei) stkBNB
// Over time, stkBNB appreciates in value as compared to BNB.
struct ExchangeRateData {
  uint256 totalWei; // total amount of BNB managed by the pool
  uint256 poolTokenSupply; // total amount of stkBNB managed by the pool
}

// External protocols (eg: Wombat Exchange) that integrate with us, rely on this interface.
// We must always ensure that StakePool conforms to this interface.
interface IStakePool {
  function exchangeRate() external view returns (ExchangeRateData memory);
}
