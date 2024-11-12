// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { BasePriceOracle } from "../oracles/BasePriceOracle.sol";
import { ICErc20 } from "./CTokenInterfaces.sol";
import { DiamondExtension } from "../ionic/DiamondExtension.sol";
import { ComptrollerV4Storage } from "../compound/ComptrollerStorage.sol";
import { PrudentiaLib } from "../adrastia/PrudentiaLib.sol";
import { IHistoricalRates } from "adrastia-periphery/rates/IHistoricalRates.sol";

interface ComptrollerInterface {
  function isDeprecated(ICErc20 cToken) external view returns (bool);

  function _becomeImplementation() external;

  function _deployMarket(
    uint8 delegateType,
    bytes memory constructorData,
    bytes calldata becomeImplData,
    uint256 collateralFactorMantissa
  ) external returns (uint256);

  function getAssetsIn(address account) external view returns (ICErc20[] memory);

  function checkMembership(address account, ICErc20 cToken) external view returns (bool);

  function _setPriceOracle(BasePriceOracle newOracle) external returns (uint256);

  function _setCloseFactor(uint256 newCloseFactorMantissa) external returns (uint256);

  function _setCollateralFactor(ICErc20 market, uint256 newCollateralFactorMantissa) external returns (uint256);

  function _setLiquidationIncentive(uint256 newLiquidationIncentiveMantissa) external returns (uint256);

  function _setWhitelistEnforcement(bool enforce) external returns (uint256);

  function _setWhitelistStatuses(address[] calldata _suppliers, bool[] calldata statuses) external returns (uint256);

  function _addRewardsDistributor(address distributor) external returns (uint256);

  function getHypotheticalAccountLiquidity(
    address account,
    address cTokenModify,
    uint256 redeemTokens,
    uint256 borrowAmount,
    uint256 repayAmount
  ) external view returns (uint256, uint256, uint256, uint256);

  function getMaxRedeemOrBorrow(address account, ICErc20 cToken, bool isBorrow) external view returns (uint256);

  /*** Assets You Are In ***/

  function enterMarkets(address[] calldata cTokens) external returns (uint256[] memory);

  function exitMarket(address cToken) external returns (uint256);

  /*** Policy Hooks ***/

  function mintAllowed(address cToken, address minter, uint256 mintAmount) external returns (uint256);

  function redeemAllowed(address cToken, address redeemer, uint256 redeemTokens) external returns (uint256);

  function redeemVerify(address cToken, address redeemer, uint256 redeemAmount, uint256 redeemTokens) external;

  function borrowAllowed(address cToken, address borrower, uint256 borrowAmount) external returns (uint256);

  function borrowVerify(address cToken, address borrower) external;

  function borrowWithinLimits(address cToken, uint256 accountBorrowsNew) external view returns (uint256);

  function repayBorrowAllowed(
    address cToken,
    address payer,
    address borrower,
    uint256 repayAmount
  ) external returns (uint256);

  function repayBorrowVerify(
    address cToken,
    address payer,
    address borrower,
    uint256 repayAmount
  ) external;

  function liquidateBorrowAllowed(
    address cTokenBorrowed,
    address cTokenCollateral,
    address liquidator,
    address borrower,
    uint256 repayAmount
  ) external returns (uint256);

  function seizeAllowed(
    address cTokenCollateral,
    address cTokenBorrowed,
    address liquidator,
    address borrower,
    uint256 seizeTokens
  ) external returns (uint256);
  
  function seizeVerify(
    address cTokenCollateral,
    address cTokenBorrowed,
    address liquidator,
    address borrower,
    uint256 seizeTokens
  ) external;

  function transferAllowed(address cToken, address src, address dst, uint256 transferTokens) external returns (uint256);
  
  function transferVerify(address cToken, address src, address dst, uint256 transferTokens) external;

  function mintVerify(address cToken, address minter, uint256 actualMintAmount, uint256 mintTokens) external;

  /*** Liquidity/Liquidation Calculations ***/

  function getAccountLiquidity(
    address account
  ) external view returns (uint256 error, uint256 collateralValue, uint256 liquidity, uint256 shortfall);

  function liquidateCalculateSeizeTokens(
    address cTokenBorrowed,
    address cTokenCollateral,
    uint256 repayAmount
  ) external view returns (uint256, uint256);

  /*** Pool-Wide/Cross-Asset Reentrancy Prevention ***/

  function _beforeNonReentrant() external;

  function _afterNonReentrant() external;

  /*** New supply and borrow cap view functions ***/

  /**
   * @notice Gets the supply cap of a cToken in the units of the underlying asset.
   * @param cToken The address of the cToken.
   */
  function effectiveSupplyCaps(address cToken) external view returns (uint256 supplyCap);

  /**
   * @notice Gets the borrow cap of a cToken in the units of the underlying asset.
   * @param cToken The address of the cToken.
   */
  function effectiveBorrowCaps(address cToken) external view returns (uint256 borrowCap);
}

interface ComptrollerStorageInterface {
  function admin() external view returns (address);

  function adminHasRights() external view returns (bool);

  function ionicAdmin() external view returns (address);

  function ionicAdminHasRights() external view returns (bool);

  function pendingAdmin() external view returns (address);

  function oracle() external view returns (BasePriceOracle);

  function pauseGuardian() external view returns (address);

  function closeFactorMantissa() external view returns (uint256);

  function liquidationIncentiveMantissa() external view returns (uint256);

  function isUserOfPool(address user) external view returns (bool);

  function whitelist(address account) external view returns (bool);

  function enforceWhitelist() external view returns (bool);

  function borrowCapForCollateral(address borrowed, address collateral) external view returns (uint256);

  function borrowingAgainstCollateralBlacklist(address borrowed, address collateral) external view returns (bool);

  function suppliers(address account) external view returns (bool);

  function cTokensByUnderlying(address) external view returns (address);

  /**
   * Gets the supply cap of a cToken in the units of the underlying asset.
   * @dev WARNING: This function is misleading if Adrastia Prudentia is being used for the supply cap. Instead, use
   * `effectiveSupplyCaps` to get the correct supply cap.
   * @param cToken The address of the cToken.
   * @return The supply cap in the units of the underlying asset.
   */
  function supplyCaps(address cToken) external view returns (uint256);

  /**
   * Gets the borrow cap of a cToken in the units of the underlying asset.
   * @dev WARNING: This function is misleading if Adrastia Prudentia is being used for the borrow cap. Instead, use
   * `effectiveBorrowCaps` to get the correct borrow cap.
   * @param cToken The address of the cToken.
   * @return The borrow cap in the units of the underlying asset.
   */
  function borrowCaps(address cToken) external view returns (uint256);

  function markets(address cToken) external view returns (bool, uint256);

  function accountAssets(address, uint256) external view returns (address);

  function borrowGuardianPaused(address cToken) external view returns (bool);

  function mintGuardianPaused(address cToken) external view returns (bool);

  function rewardsDistributors(uint256) external view returns (address);
}

interface SFSRegister {
  function register(address _recipient) external returns (uint256 tokenId);
}

interface ComptrollerExtensionInterface {
  function getWhitelistedSuppliersSupply(address cToken) external view returns (uint256 supplied);

  function getWhitelistedBorrowersBorrows(address cToken) external view returns (uint256 borrowed);

  function getAllMarkets() external view returns (ICErc20[] memory);

  function getAllBorrowers() external view returns (address[] memory);

  function getAllBorrowersCount() external view returns (uint256);

  function getPaginatedBorrowers(
    uint256 page,
    uint256 pageSize
  ) external view returns (uint256 _totalPages, address[] memory _pageOfBorrowers);

  function getRewardsDistributors() external view returns (address[] memory);

  function getAccruingFlywheels() external view returns (address[] memory);

  function _supplyCapWhitelist(address cToken, address account, bool whitelisted) external;

  function _setBorrowCapForCollateral(address cTokenBorrow, address cTokenCollateral, uint256 borrowCap) external;

  function _setBorrowCapForCollateralWhitelist(
    address cTokenBorrow,
    address cTokenCollateral,
    address account,
    bool whitelisted
  ) external;

  function isBorrowCapForCollateralWhitelisted(
    address cTokenBorrow,
    address cTokenCollateral,
    address account
  ) external view returns (bool);

  function _blacklistBorrowingAgainstCollateral(
    address cTokenBorrow,
    address cTokenCollateral,
    bool blacklisted
  ) external;

  function _blacklistBorrowingAgainstCollateralWhitelist(
    address cTokenBorrow,
    address cTokenCollateral,
    address account,
    bool whitelisted
  ) external;

  function isBlacklistBorrowingAgainstCollateralWhitelisted(
    address cTokenBorrow,
    address cTokenCollateral,
    address account
  ) external view returns (bool);

  function isSupplyCapWhitelisted(address cToken, address account) external view returns (bool);

  function _borrowCapWhitelist(address cToken, address account, bool whitelisted) external;

  function isBorrowCapWhitelisted(address cToken, address account) external view returns (bool);

  function _removeFlywheel(address flywheelAddress) external returns (bool);

  function getWhitelist() external view returns (address[] memory);

  function addNonAccruingFlywheel(address flywheelAddress) external returns (bool);

  function _setMarketSupplyCaps(ICErc20[] calldata cTokens, uint256[] calldata newSupplyCaps) external;

  function _setMarketBorrowCaps(ICErc20[] calldata cTokens, uint256[] calldata newBorrowCaps) external;

  function _setBorrowCapGuardian(address newBorrowCapGuardian) external;

  function _setPauseGuardian(address newPauseGuardian) external returns (uint256);

  function _setMintPaused(ICErc20 cToken, bool state) external returns (bool);

  function _setBorrowPaused(ICErc20 cToken, bool state) external returns (bool);

  function _setTransferPaused(bool state) external returns (bool);

  function _setSeizePaused(bool state) external returns (bool);

  function _unsupportMarket(ICErc20 cToken) external returns (uint256);

  function getAssetAsCollateralValueCap(
    ICErc20 collateral,
    ICErc20 cTokenModify,
    bool redeeming,
    address account
  ) external view returns (uint256);

  function registerInSFS() external returns (uint256);
}

interface ComptrollerPrudentiaCapsExtInterface {
  /**
   * @notice Retrieves Adrastia Prudentia borrow cap config from storage.
   * @return The config.
   */
  function getBorrowCapConfig() external view returns (PrudentiaLib.PrudentiaConfig memory);

  /**
   * @notice Retrieves Adrastia Prudentia supply cap config from storage.
   * @return The config.
   */
  function getSupplyCapConfig() external view returns (PrudentiaLib.PrudentiaConfig memory);

  /**
   * @notice Sets the Adrastia Prudentia supply cap config.
   * @dev Specifying a zero address for the `controller` parameter will make the Comptroller use the native supply caps.
   * @param newConfig The new config.
   */
  function _setSupplyCapConfig(PrudentiaLib.PrudentiaConfig calldata newConfig) external;

  /**
   * @notice Sets the Adrastia Prudentia supply cap config.
   * @dev Specifying a zero address for the `controller` parameter will make the Comptroller use the native borrow caps.
   * @param newConfig The new config.
   */
  function _setBorrowCapConfig(PrudentiaLib.PrudentiaConfig calldata newConfig) external;
}

interface UnitrollerInterface {
  function comptrollerImplementation() external view returns (address);

  function _upgrade() external;

  function _acceptAdmin() external returns (uint256);

  function _setPendingAdmin(address newPendingAdmin) external returns (uint256);

  function _toggleAdminRights(bool hasRights) external returns (uint256);
}

interface IComptrollerExtension is ComptrollerExtensionInterface, ComptrollerStorageInterface {}

//interface IComptrollerBase is ComptrollerInterface, ComptrollerStorageInterface {}

interface IonicComptroller is
  ComptrollerInterface,
  ComptrollerExtensionInterface,
  UnitrollerInterface,
  ComptrollerStorageInterface
{

}

abstract contract ComptrollerBase is ComptrollerV4Storage {
  /// @notice Indicator that this is a Comptroller contract (for inspection)
  bool public constant isComptroller = true;

  /**
   * @notice Gets the supply cap of a cToken in the units of the underlying asset.
   * @param cToken The address of the cToken.
   */
  function effectiveSupplyCaps(address cToken) public view virtual returns (uint256 supplyCap) {
    PrudentiaLib.PrudentiaConfig memory capConfig = supplyCapConfig;

    // Check if we're using Adrastia Prudentia for the supply cap
    if (capConfig.controller != address(0)) {
      // We have a controller, so we're using Adrastia Prudentia

      address underlyingToken = ICErc20(cToken).underlying();

      // Get the supply cap from Adrastia Prudentia
      supplyCap = IHistoricalRates(capConfig.controller).getRateAt(underlyingToken, capConfig.offset).current;

      // Prudentia trims decimal points from amounts while our code requires the mantissa amount, so we
      // must scale the supply cap to get the correct amount

      int256 scaleByDecimals = 18;
      // Not all ERC20s implement decimals(), so we use a staticcall and check the return data
      (bool success, bytes memory data) = underlyingToken.staticcall(abi.encodeWithSignature("decimals()"));
      if (success && data.length == 32) {
        scaleByDecimals = int256(uint256(abi.decode(data, (uint8))));
      }

      scaleByDecimals += capConfig.decimalShift;

      if (scaleByDecimals >= 0) {
        // We're scaling up, so we need to multiply
        supplyCap *= 10 ** uint256(scaleByDecimals);
      } else {
        // We're scaling down, so we need to divide
        supplyCap /= 10 ** uint256(-scaleByDecimals);
      }
    } else {
      // We don't have a controller, so we're using the local supply cap

      // Get the supply cap from the local supply cap
      supplyCap = supplyCaps[cToken];
    }
  }

  /**
   * @notice Gets the borrow cap of a cToken in the units of the underlying asset.
   * @param cToken The address of the cToken.
   */
  function effectiveBorrowCaps(address cToken) public view virtual returns (uint256 borrowCap) {
    PrudentiaLib.PrudentiaConfig memory capConfig = borrowCapConfig;

    // Check if we're using Adrastia Prudentia for the borrow cap
    if (capConfig.controller != address(0)) {
      // We have a controller, so we're using Adrastia Prudentia

      address underlyingToken = ICErc20(cToken).underlying();

      // Get the borrow cap from Adrastia Prudentia
      borrowCap = IHistoricalRates(capConfig.controller).getRateAt(underlyingToken, capConfig.offset).current;

      // Prudentia trims decimal points from amounts while our code requires the mantissa amount, so we
      // must scale the supply cap to get the correct amount

      int256 scaleByDecimals = 18;
      // Not all ERC20s implement decimals(), so we use a staticcall and check the return data
      (bool success, bytes memory data) = underlyingToken.staticcall(abi.encodeWithSignature("decimals()"));
      if (success && data.length == 32) {
        scaleByDecimals = int256(uint256(abi.decode(data, (uint8))));
      }

      scaleByDecimals += capConfig.decimalShift;

      if (scaleByDecimals >= 0) {
        // We're scaling up, so we need to multiply
        borrowCap *= 10 ** uint256(scaleByDecimals);
      } else {
        // We're scaling down, so we need to divide
        borrowCap /= 10 ** uint256(-scaleByDecimals);
      }
    } else {
      // We don't have a controller, so we're using the local borrow cap
      borrowCap = borrowCaps[cToken];
    }
  }
}
