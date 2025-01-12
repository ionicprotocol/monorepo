// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { IonicComptroller } from "./ComptrollerInterface.sol";
import { InterestRateModel } from "./InterestRateModel.sol";
import { ComptrollerV3Storage } from "./ComptrollerStorage.sol";
import { AddressesProvider } from "../ionic/AddressesProvider.sol";

abstract contract CTokenAdminStorage {
  /*
   * Administrator for Ionic
   */
  address payable public ionicAdmin;
}

abstract contract CErc20Storage is CTokenAdminStorage {
  /**
   * @dev Guard variable for re-entrancy checks
   */
  bool internal _notEntered;

  /**
   * @notice EIP-20 token name for this token
   */
  string public name;

  /**
   * @notice EIP-20 token symbol for this token
   */
  string public symbol;

  /**
   * @notice EIP-20 token decimals for this token
   */
  uint8 public decimals;

  /*
   * Maximum borrow rate that can ever be applied (.0005% / block)
   */
  uint256 internal constant borrowRateMaxMantissa = 0.0005e16;

  /*
   * Maximum fraction of interest that can be set aside for reserves + fees
   */
  uint256 internal constant reserveFactorPlusFeesMaxMantissa = 1e18;

  /**
   * @notice Contract which oversees inter-cToken operations
   */
  IonicComptroller public comptroller;

  /**
   * @notice Model which tells what the current interest rate should be
   */
  InterestRateModel public interestRateModel;

  /*
   * Initial exchange rate used when minting the first CTokens (used when totalSupply = 0)
   */
  uint256 internal initialExchangeRateMantissa;

  /**
   * @notice Fraction of interest currently set aside for admin fees
   */
  uint256 public adminFeeMantissa;

  /**
   * @notice Fraction of interest currently set aside for Ionic fees
   */
  uint256 public ionicFeeMantissa;

  /**
   * @notice Fraction of interest currently set aside for reserves
   */
  uint256 public reserveFactorMantissa;

  /**
   * @notice Block number that interest was last accrued at
   */
  uint256 public accrualBlockNumber;

  /**
   * @notice Accumulator of the total earned interest rate since the opening of the market
   */
  uint256 public borrowIndex;

  /**
   * @notice Total amount of outstanding borrows of the underlying in this market
   */
  uint256 public totalBorrows;

  /**
   * @notice Total amount of reserves of the underlying held in this market
   */
  uint256 public totalReserves;

  /**
   * @notice Total amount of admin fees of the underlying held in this market
   */
  uint256 public totalAdminFees;

  /**
   * @notice Total amount of Ionic fees of the underlying held in this market
   */
  uint256 public totalIonicFees;

  /**
   * @notice Total number of tokens in circulation
   */
  uint256 public totalSupply;

  /*
   * Official record of token balances for each account
   */
  mapping(address => uint256) internal accountTokens;

  /*
   * Approved token transfer amounts on behalf of others
   */
  mapping(address => mapping(address => uint256)) internal transferAllowances;

  /**
   * @notice Container for borrow balance information
   * @member principal Total balance (with accrued interest), after applying the most recent balance-changing action
   * @member interestIndex Global borrowIndex as of the most recent balance-changing action
   */
  struct BorrowSnapshot {
    uint256 principal;
    uint256 interestIndex;
  }

  /*
   * Mapping of account addresses to outstanding borrow balances
   */
  mapping(address => BorrowSnapshot) internal accountBorrows;

  /*
   * Share of seized collateral that is added to reserves
   */
  uint256 public constant protocolSeizeShareMantissa = 2.8e16; //2.8%

  /*
   * Share of seized collateral taken as fees
   */
  uint256 public constant feeSeizeShareMantissa = 1e17; //10%

  /**
   * @notice Underlying asset for this CToken
   */
  address public underlying;

  /**
   * @notice Addresses Provider
   */
  AddressesProvider public ap;

  /**
   * @notice Morpho Universal Rewards Distributor
   */
  address public morphoURD;

  /**
   * @notice Permissioned cTokenMinter
   */
  address public cTokenMinter;
}

abstract contract CTokenBaseEvents {
  /* ERC20 */

  /**
   * @notice EIP20 Transfer event
   */
  event Transfer(address indexed from, address indexed to, uint256 amount);

  /*** Admin Events ***/

  /**
   * @notice Event emitted when interestRateModel is changed
   */
  event NewMarketInterestRateModel(InterestRateModel oldInterestRateModel, InterestRateModel newInterestRateModel);

  /**
   * @notice Event emitted when the reserve factor is changed
   */
  event NewReserveFactor(uint256 oldReserveFactorMantissa, uint256 newReserveFactorMantissa);

  /**
   * @notice Event emitted when the admin fee is changed
   */
  event NewAdminFee(uint256 oldAdminFeeMantissa, uint256 newAdminFeeMantissa);

  /**
   * @notice Event emitted when the Ionic fee is changed
   */
  event NewIonicFee(uint256 oldIonicFeeMantissa, uint256 newIonicFeeMantissa);

  /**
   * @notice EIP20 Approval event
   */
  event Approval(address indexed owner, address indexed spender, uint256 amount);

  /**
   * @notice Event emitted when interest is accrued
   */
  event AccrueInterest(uint256 cashPrior, uint256 interestAccumulated, uint256 borrowIndex, uint256 totalBorrows);
}

abstract contract CTokenFirstExtensionEvents is CTokenBaseEvents {
  event Flash(address receiver, uint256 amount);
}

abstract contract CTokenSecondExtensionEvents is CTokenBaseEvents {
  /*** Market Events ***/

  /**
   * @notice Event emitted when tokens are minted
   */
  event Mint(address minter, uint256 mintAmount, uint256 mintTokens);

  /**
   * @notice Event emitted when tokens are redeemed
   */
  event Redeem(address redeemer, uint256 redeemAmount, uint256 redeemTokens);

  /**
   * @notice Event emitted when underlying is borrowed
   */
  event Borrow(address borrower, uint256 borrowAmount, uint256 accountBorrows, uint256 totalBorrows);

  /**
   * @notice Event emitted when a borrow is repaid
   */
  event RepayBorrow(address payer, address borrower, uint256 repayAmount, uint256 accountBorrows, uint256 totalBorrows);

  /**
   * @notice Event emitted when a borrow is liquidated
   */
  event LiquidateBorrow(
    address liquidator,
    address borrower,
    uint256 repayAmount,
    address cTokenCollateral,
    uint256 seizeTokens
  );

  /**
   * @notice Event emitted when the reserves are added
   */
  event ReservesAdded(address benefactor, uint256 addAmount, uint256 newTotalReserves);

  /**
   * @notice Event emitted when the reserves are reduced
   */
  event ReservesReduced(address admin, uint256 reduceAmount, uint256 newTotalReserves);
}

interface CTokenFirstExtensionInterface {
  /*** User Interface ***/

  function transfer(address dst, uint256 amount) external returns (bool);

  function transferFrom(address src, address dst, uint256 amount) external returns (bool);

  function approve(address spender, uint256 amount) external returns (bool);

  function allowance(address owner, address spender) external view returns (uint256);

  function balanceOf(address owner) external view returns (uint256);

  /*** Admin Functions ***/

  function _setReserveFactor(uint256 newReserveFactorMantissa) external returns (uint256);

  function _setAdminFee(uint256 newAdminFeeMantissa) external returns (uint256);

  function _setInterestRateModel(InterestRateModel newInterestRateModel) external returns (uint256);

  function getAccountSnapshot(address account) external view returns (uint256, uint256, uint256, uint256);

  function borrowRatePerBlock() external view returns (uint256);

  function supplyRatePerBlock() external view returns (uint256);

  function exchangeRateCurrent() external view returns (uint256);

  function accrueInterest() external returns (uint256);

  function totalBorrowsCurrent() external view returns (uint256);

  function borrowBalanceCurrent(address account) external view returns (uint256);

  function getTotalUnderlyingSupplied() external view returns (uint256);

  function balanceOfUnderlying(address owner) external view returns (uint256);

  function multicall(bytes[] calldata data) external payable returns (bytes[] memory results);

  function flash(uint256 amount, bytes calldata data) external;

  function supplyRatePerBlockAfterDeposit(uint256 mintAmount) external view returns (uint256);

  function supplyRatePerBlockAfterWithdraw(uint256 withdrawAmount) external view returns (uint256);

  function borrowRatePerBlockAfterBorrow(uint256 borrowAmount) external view returns (uint256);

  function registerInSFS() external returns (uint256);
}

interface CTokenSecondExtensionInterface {
  function mint(uint256 mintAmount) external returns (uint256);

  function redeem(uint256 redeemTokens) external returns (uint256);

  function redeemUnderlying(uint256 redeemAmount) external returns (uint256);

  function borrow(uint256 borrowAmount) external returns (uint256);

  function repayBorrow(uint256 repayAmount) external returns (uint256);

  function repayBorrowBehalf(address borrower, uint256 repayAmount) external returns (uint256);

  function liquidateBorrow(address borrower, uint256 repayAmount, address cTokenCollateral) external returns (uint256);

  function getCash() external view returns (uint256);

  function seize(address liquidator, address borrower, uint256 seizeTokens) external returns (uint256);

  /*** Admin Functions ***/

  function _withdrawAdminFees(uint256 withdrawAmount) external returns (uint256);

  function _withdrawIonicFees(uint256 withdrawAmount) external returns (uint256);

  function selfTransferOut(address to, uint256 amount) external;

  function selfTransferIn(address from, uint256 amount) external returns (uint256);
}

interface CDelegatorInterface {
  function implementation() external view returns (address);

  /**
   * @notice Called by the admin to update the implementation of the delegator
   * @param implementation_ The address of the new implementation for delegation
   * @param becomeImplementationData The encoded bytes data to be passed to _becomeImplementation
   */
  function _setImplementationSafe(address implementation_, bytes calldata becomeImplementationData) external;

  /**
   * @dev upgrades the implementation if necessary
   */
  function _upgrade() external;
}

interface CDelegateInterface {
  /**
   * @notice Called by the delegator on a delegate to initialize it for duty
   * @dev Should revert if any issues arise which make it unfit for delegation
   * @param data The encoded bytes data for any initialization
   */
  function _becomeImplementation(bytes calldata data) external;

  function delegateType() external pure returns (uint8);

  function contractType() external pure returns (string memory);
}

abstract contract CErc20AdminBase is CErc20Storage {
  /**
   * @notice Returns a boolean indicating if the sender has admin rights
   */
  function hasAdminRights() internal view returns (bool) {
    ComptrollerV3Storage comptrollerStorage = ComptrollerV3Storage(address(comptroller));
    return
      (msg.sender == comptrollerStorage.admin() && comptrollerStorage.adminHasRights()) ||
      (msg.sender == address(ionicAdmin) && comptrollerStorage.ionicAdminHasRights());
  }
}

abstract contract CErc20FirstExtensionBase is
  CErc20AdminBase,
  CTokenFirstExtensionEvents,
  CTokenFirstExtensionInterface
{}

abstract contract CTokenSecondExtensionBase is
  CErc20AdminBase,
  CTokenSecondExtensionEvents,
  CTokenSecondExtensionInterface,
  CDelegateInterface
{}

abstract contract CErc20DelegatorBase is CErc20AdminBase, CTokenSecondExtensionEvents, CDelegatorInterface {}

interface CErc20StorageInterface {
  function admin() external view returns (address);

  function adminHasRights() external view returns (bool);

  function ionicAdmin() external view returns (address);

  function ionicAdminHasRights() external view returns (bool);

  function comptroller() external view returns (IonicComptroller);

  function name() external view returns (string memory);

  function symbol() external view returns (string memory);

  function decimals() external view returns (uint8);

  function totalSupply() external view returns (uint256);

  function adminFeeMantissa() external view returns (uint256);

  function ionicFeeMantissa() external view returns (uint256);

  function reserveFactorMantissa() external view returns (uint256);

  function protocolSeizeShareMantissa() external view returns (uint256);

  function feeSeizeShareMantissa() external view returns (uint256);

  function totalReserves() external view returns (uint256);

  function totalAdminFees() external view returns (uint256);

  function totalIonicFees() external view returns (uint256);

  function totalBorrows() external view returns (uint256);

  function accrualBlockNumber() external view returns (uint256);

  function underlying() external view returns (address);

  function borrowIndex() external view returns (uint256);

  function interestRateModel() external view returns (address);
}

interface CErc20PluginStorageInterface is CErc20StorageInterface {
  function plugin() external view returns (address);
}

interface CErc20PluginRewardsInterface is CErc20PluginStorageInterface {
  function approve(address, address) external;
}

interface ICErc20 is
  CErc20StorageInterface,
  CTokenSecondExtensionInterface,
  CTokenFirstExtensionInterface,
  CDelegatorInterface,
  CDelegateInterface
{}

interface ICErc20Plugin is CErc20PluginStorageInterface, ICErc20 {
  function _updatePlugin(address _plugin) external;
}

interface ICErc20PluginRewards is CErc20PluginRewardsInterface, ICErc20 {}
