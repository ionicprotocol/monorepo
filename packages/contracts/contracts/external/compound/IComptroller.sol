// SPDX-License-Identifier: BSD-3-Clause
pragma solidity >=0.8.0;

import "./IPriceOracle.sol";
import "./ICToken.sol";
import "./IUnitroller.sol";
import "./IRewardsDistributor.sol";

/**
 * @title Compound's Comptroller Contract
 * @author Compound
 */
interface IComptroller {
  function admin() external view returns (address);

  function adminHasRights() external view returns (bool);

  function ionicAdminHasRights() external view returns (bool);

  function oracle() external view returns (IPriceOracle);

  function pauseGuardian() external view returns (address);

  function closeFactorMantissa() external view returns (uint256);

  function liquidationIncentiveMantissa() external view returns (uint256);

  function markets(address cToken) external view returns (bool, uint256);

  function getAssetsIn(address account) external view returns (ICToken[] memory);

  function checkMembership(address account, ICToken cToken) external view returns (bool);

  function getHypotheticalAccountLiquidity(
    address account,
    address cTokenModify,
    uint256 redeemTokens,
    uint256 borrowAmount,
    uint256 repayAmount
  )
    external
    view
    returns (
      uint256,
      uint256,
      uint256
    );

  function getAccountLiquidity(address account)
    external
    view
    returns (
      uint256,
      uint256,
      uint256
    );

  function _setPriceOracle(IPriceOracle newOracle) external returns (uint256);

  function _setCloseFactor(uint256 newCloseFactorMantissa) external returns (uint256);

  function _setCollateralFactor(ICToken market, uint256 newCollateralFactorMantissa) external returns (uint256);

  function _setLiquidationIncentive(uint256 newLiquidationIncentiveMantissa) external returns (uint256);

  function _become(IUnitroller unitroller) external;

  function borrowGuardianPaused(address cToken) external view returns (bool);

  function mintGuardianPaused(address cToken) external view returns (bool);

  function getRewardsDistributors() external view returns (address[] memory);

  function getAllMarkets() external view returns (ICToken[] memory);

  function getAllBorrowers() external view returns (address[] memory);

  function suppliers(address account) external view returns (bool);

  function supplyCaps(address cToken) external view returns (uint256);

  function borrowCaps(address cToken) external view returns (uint256);

  function enforceWhitelist() external view returns (bool);

  function enterMarkets(address[] memory cTokens) external returns (uint256[] memory);

  function exitMarket(address cTokenAddress) external returns (uint256);

  function autoImplementation() external view returns (bool);

  function isUserOfPool(address user) external view returns (bool);

  function whitelist(address account) external view returns (bool);

  function _setWhitelistEnforcement(bool enforce) external returns (uint256);

  function _setWhitelistStatuses(address[] calldata _suppliers, bool[] calldata statuses) external returns (uint256);

  function _toggleAutoImplementations(bool enabled) external returns (uint256);

  function _deployMarket(
    bool isCEther,
    bytes memory constructorData,
    bytes calldata becomeImplData,
    uint256 collateralFactorMantissa
  ) external returns (uint256);

  function getMaxRedeemOrBorrow(
    address account,
    ICToken cTokenModify,
    bool isBorrow
  ) external view returns (uint256);

  function borrowCapForCollateral(address borrowed, address collateral) external view returns (uint256);

  function borrowingAgainstCollateralBlacklist(address borrowed, address collateral) external view returns (bool);

  function isDeprecated(ICToken cToken) external view returns (bool);

  function getWhitelistedSuppliersSupply(address cToken) external view returns (uint256 supplied);

  function getWhitelistedBorrowersBorrows(address cToken) external view returns (uint256 borrowed);
}
