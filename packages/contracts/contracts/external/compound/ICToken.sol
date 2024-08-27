// SPDX-License-Identifier: BSD-3-Clause
pragma solidity >=0.8.0;

/**
 * @title Compound's CToken Contract
 * @notice Abstract base for CTokens
 * @author Compound
 */
interface ICToken {
  function admin() external view returns (address);

  function adminHasRights() external view returns (bool);

  function ionicAdminHasRights() external view returns (bool);

  function symbol() external view returns (string memory);

  function comptroller() external view returns (address);

  function adminFeeMantissa() external view returns (uint256);

  function ionicFeeMantissa() external view returns (uint256);

  function reserveFactorMantissa() external view returns (uint256);

  function totalReserves() external view returns (uint256);

  function totalAdminFees() external view returns (uint256);

  function totalIonicFees() external view returns (uint256);

  function isCToken() external view returns (bool);

  function isCEther() external view returns (bool);

  function balanceOf(address owner) external view returns (uint256);

  function balanceOfUnderlying(address owner) external returns (uint256);

  function borrowRatePerBlock() external view returns (uint256);

  function supplyRatePerBlock() external view returns (uint256);

  function totalBorrowsCurrent() external returns (uint256);

  function totalBorrows() external view returns (uint256);

  function totalSupply() external view returns (uint256);

  function borrowBalanceStored(address account) external view returns (uint256);

  function borrowBalanceCurrent(address account) external returns (uint256);

  function exchangeRateCurrent() external returns (uint256);

  function exchangeRateStored() external view returns (uint256);

  function accrueInterest() external returns (uint256);

  function getCash() external view returns (uint256);

  function mint(uint256 mintAmount) external returns (uint256);

  function redeem(uint256 redeemTokens) external returns (uint256);

  function redeemUnderlying(uint256 redeemAmount) external returns (uint256);

  function borrow(uint256 borrowAmount) external returns (uint256);

  function repayBorrow(uint256 repayAmount) external returns (uint256);

  function protocolSeizeShareMantissa() external view returns (uint256);

  function feeSeizeShareMantissa() external view returns (uint256);

  function _setReserveFactor(uint256 newReserveFactorMantissa) external returns (uint256);

  function _setAdminFee(uint256 newAdminFeeMantissa) external returns (uint256);
}
