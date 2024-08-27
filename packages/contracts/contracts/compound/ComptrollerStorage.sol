// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "./IFeeDistributor.sol";
import "../oracles/BasePriceOracle.sol";
import { ICErc20 } from "./CTokenInterfaces.sol";
import { PrudentiaLib } from "../adrastia/PrudentiaLib.sol";

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract UnitrollerAdminStorage {
  /*
   * Administrator for Ionic
   */
  address payable public ionicAdmin;

  /**
   * @notice Administrator for this contract
   */
  address public admin;

  /**
   * @notice Pending administrator for this contract
   */
  address public pendingAdmin;

  /**
   * @notice Whether or not the Ionic admin has admin rights
   */
  bool public ionicAdminHasRights = true;

  /**
   * @notice Whether or not the admin has admin rights
   */
  bool public adminHasRights = true;

  /**
   * @notice Returns a boolean indicating if the sender has admin rights
   */
  function hasAdminRights() internal view returns (bool) {
    return (msg.sender == admin && adminHasRights) || (msg.sender == address(ionicAdmin) && ionicAdminHasRights);
  }
}

contract ComptrollerV1Storage is UnitrollerAdminStorage {
  /**
   * @notice Oracle which gives the price of any given asset
   */
  BasePriceOracle public oracle;

  /**
   * @notice Multiplier used to calculate the maximum repayAmount when liquidating a borrow
   */
  uint256 public closeFactorMantissa;

  /**
   * @notice Multiplier representing the discount on collateral that a liquidator receives
   */
  uint256 public liquidationIncentiveMantissa;

  /*
   * UNUSED AFTER UPGRADE: Max number of assets a single account can participate in (borrow or use as collateral)
   */
  uint256 internal maxAssets;

  /**
   * @notice Per-account mapping of "assets you are in", capped by maxAssets
   */
  mapping(address => ICErc20[]) public accountAssets;
}

contract ComptrollerV2Storage is ComptrollerV1Storage {
  struct Market {
    // Whether or not this market is listed
    bool isListed;
    // Multiplier representing the most one can borrow against their collateral in this market.
    // For instance, 0.9 to allow borrowing 90% of collateral value.
    // Must be between 0 and 1, and stored as a mantissa.
    uint256 collateralFactorMantissa;
    // Per-market mapping of "accounts in this asset"
    mapping(address => bool) accountMembership;
  }

  /**
   * @notice Official mapping of cTokens -> Market metadata
   * @dev Used e.g. to determine if a market is supported
   */
  mapping(address => Market) public markets;

  /// @notice A list of all markets
  ICErc20[] public allMarkets;

  /**
   * @dev Maps borrowers to booleans indicating if they have entered any markets
   */
  mapping(address => bool) internal borrowers;

  /// @notice A list of all borrowers who have entered markets
  address[] public allBorrowers;

  // Indexes of borrower account addresses in the `allBorrowers` array
  mapping(address => uint256) internal borrowerIndexes;

  /**
   * @dev Maps suppliers to booleans indicating if they have ever supplied to any markets
   */
  mapping(address => bool) public suppliers;

  /// @notice All cTokens addresses mapped by their underlying token addresses
  mapping(address => ICErc20) public cTokensByUnderlying;

  /// @notice Whether or not the supplier whitelist is enforced
  bool public enforceWhitelist;

  /// @notice Maps addresses to booleans indicating if they are allowed to supply assets (i.e., mint cTokens)
  mapping(address => bool) public whitelist;

  /// @notice An array of all whitelisted accounts
  address[] public whitelistArray;

  // Indexes of account addresses in the `whitelistArray` array
  mapping(address => uint256) internal whitelistIndexes;

  /**
   * @notice The Pause Guardian can pause certain actions as a safety mechanism.
   *  Actions which allow users to remove their own assets cannot be paused.
   *  Liquidation / seizing / transfer can only be paused globally, not by market.
   */
  address public pauseGuardian;
  bool public _mintGuardianPaused;
  bool public _borrowGuardianPaused;
  bool public transferGuardianPaused;
  bool public seizeGuardianPaused;
  mapping(address => bool) public mintGuardianPaused;
  mapping(address => bool) public borrowGuardianPaused;
}

contract ComptrollerV3Storage is ComptrollerV2Storage {
  /// @notice The borrowCapGuardian can set borrowCaps to any number for any market. Lowering the borrow cap could disable borrowing on the given market.
  /// @dev If Adrastia Prudentia is enabled, the values the borrow cap guardian sets are ignored.
  address public borrowCapGuardian;

  /// @notice Borrow caps enforced by borrowAllowed for each cToken address. Defaults to zero which corresponds to unlimited borrowing.
  /// @dev If Adrastia Prudentia is enabled, this value is ignored. Use `effectiveBorrowCaps` instead.
  mapping(address => uint256) public borrowCaps;

  /// @notice Supply caps enforced by mintAllowed for each cToken address. Defaults to zero which corresponds to unlimited supplying.
  /// @dev If Adrastia Prudentia is enabled, this value is ignored. Use `effectiveSupplyCaps` instead.
  mapping(address => uint256) public supplyCaps;

  /// @notice RewardsDistributor contracts to notify of flywheel changes.
  address[] public rewardsDistributors;

  /// @dev Guard variable for pool-wide/cross-asset re-entrancy checks
  bool internal _notEntered;

  /// @dev Whether or not _notEntered has been initialized
  bool internal _notEnteredInitialized;

  /// @notice RewardsDistributor to list for claiming, but not to notify of flywheel changes.
  address[] public nonAccruingRewardsDistributors;

  /// @dev cap for each user's borrows against specific assets - denominated in the borrowed asset
  mapping(address => mapping(address => uint256)) public borrowCapForCollateral;

  /// @dev blacklist to disallow the borrowing of an asset against specific collateral
  mapping(address => mapping(address => bool)) public borrowingAgainstCollateralBlacklist;

  /// @dev set of whitelisted accounts that are allowed to bypass the borrowing against specific collateral cap
  mapping(address => mapping(address => EnumerableSet.AddressSet)) internal borrowCapForCollateralWhitelist;

  /// @dev set of whitelisted accounts that are allowed to bypass the borrow cap
  mapping(address => mapping(address => EnumerableSet.AddressSet))
    internal borrowingAgainstCollateralBlacklistWhitelist;

  /// @dev set of whitelisted accounts that are allowed to bypass the supply cap
  mapping(address => EnumerableSet.AddressSet) internal supplyCapWhitelist;

  /// @dev set of whitelisted accounts that are allowed to bypass the borrow cap
  mapping(address => EnumerableSet.AddressSet) internal borrowCapWhitelist;
}

contract ComptrollerV4Storage is ComptrollerV3Storage {
  /// @dev Adrastia Prudentia config for controlling borrow caps.
  PrudentiaLib.PrudentiaConfig internal borrowCapConfig;

  /// @dev Adrastia Prudentia config for controlling supply caps.
  PrudentiaLib.PrudentiaConfig internal supplyCapConfig;
}
