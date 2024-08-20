// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { DiamondExtension } from "../ionic/DiamondExtension.sol";
import { ComptrollerErrorReporter } from "../compound/ErrorReporter.sol";
import { ICErc20 } from "./CTokenInterfaces.sol";
import { ComptrollerExtensionInterface, ComptrollerBase, SFSRegister } from "./ComptrollerInterface.sol";

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract ComptrollerFirstExtension is
  DiamondExtension,
  ComptrollerBase,
  ComptrollerExtensionInterface,
  ComptrollerErrorReporter
{
  using EnumerableSet for EnumerableSet.AddressSet;

  /// @notice Emitted when supply cap for a cToken is changed
  event NewSupplyCap(ICErc20 indexed cToken, uint256 newSupplyCap);

  /// @notice Emitted when borrow cap for a cToken is changed
  event NewBorrowCap(ICErc20 indexed cToken, uint256 newBorrowCap);

  /// @notice Emitted when borrow cap guardian is changed
  event NewBorrowCapGuardian(address oldBorrowCapGuardian, address newBorrowCapGuardian);

  /// @notice Emitted when pause guardian is changed
  event NewPauseGuardian(address oldPauseGuardian, address newPauseGuardian);

  /// @notice Emitted when an action is paused globally
  event ActionPaused(string action, bool pauseState);

  /// @notice Emitted when an action is paused on a market
  event MarketActionPaused(ICErc20 cToken, string action, bool pauseState);

  /// @notice Emitted when an admin unsupports a market
  event MarketUnlisted(ICErc20 cToken);

  function _getExtensionFunctions() external pure virtual override returns (bytes4[] memory) {
    uint8 fnsCount = 33;
    bytes4[] memory functionSelectors = new bytes4[](fnsCount);
    functionSelectors[--fnsCount] = this.addNonAccruingFlywheel.selector;
    functionSelectors[--fnsCount] = this._setMarketSupplyCaps.selector;
    functionSelectors[--fnsCount] = this._setMarketBorrowCaps.selector;
    functionSelectors[--fnsCount] = this._setBorrowCapForCollateralWhitelist.selector;
    functionSelectors[--fnsCount] = this._blacklistBorrowingAgainstCollateralWhitelist.selector;
    functionSelectors[--fnsCount] = this._supplyCapWhitelist.selector;
    functionSelectors[--fnsCount] = this._borrowCapWhitelist.selector;
    functionSelectors[--fnsCount] = this._setBorrowCapGuardian.selector;
    functionSelectors[--fnsCount] = this._setPauseGuardian.selector;
    functionSelectors[--fnsCount] = this._setMintPaused.selector;
    functionSelectors[--fnsCount] = this._setBorrowPaused.selector;
    functionSelectors[--fnsCount] = this._setTransferPaused.selector;
    functionSelectors[--fnsCount] = this._setSeizePaused.selector;
    functionSelectors[--fnsCount] = this._unsupportMarket.selector;
    functionSelectors[--fnsCount] = this.getAllMarkets.selector;
    functionSelectors[--fnsCount] = this.getAllBorrowers.selector;
    functionSelectors[--fnsCount] = this.getAllBorrowersCount.selector;
    functionSelectors[--fnsCount] = this.getPaginatedBorrowers.selector;
    functionSelectors[--fnsCount] = this.getWhitelist.selector;
    functionSelectors[--fnsCount] = this.getRewardsDistributors.selector;
    functionSelectors[--fnsCount] = this.isUserOfPool.selector;
    functionSelectors[--fnsCount] = this.getAccruingFlywheels.selector;
    functionSelectors[--fnsCount] = this._removeFlywheel.selector;
    functionSelectors[--fnsCount] = this._setBorrowCapForCollateral.selector;
    functionSelectors[--fnsCount] = this._blacklistBorrowingAgainstCollateral.selector;
    functionSelectors[--fnsCount] = this.isBorrowCapForCollateralWhitelisted.selector;
    functionSelectors[--fnsCount] = this.isBlacklistBorrowingAgainstCollateralWhitelisted.selector;
    functionSelectors[--fnsCount] = this.isSupplyCapWhitelisted.selector;
    functionSelectors[--fnsCount] = this.isBorrowCapWhitelisted.selector;
    functionSelectors[--fnsCount] = this.getWhitelistedSuppliersSupply.selector;
    functionSelectors[--fnsCount] = this.getWhitelistedBorrowersBorrows.selector;
    functionSelectors[--fnsCount] = this.getAssetAsCollateralValueCap.selector;
    functionSelectors[--fnsCount] = this.registerInSFS.selector;
    require(fnsCount == 0, "use the correct array length");
    return functionSelectors;
  }

  /**
   * @notice Returns true if the accruing flyhwheel was found and replaced
   * @dev Adds a flywheel to the non-accruing list and if already in the accruing, removes it from that list
   * @param flywheelAddress The address of the flywheel to add to the non-accruing
   */
  function addNonAccruingFlywheel(address flywheelAddress) external returns (bool) {
    require(hasAdminRights(), "!admin");
    require(flywheelAddress != address(0), "!flywheel");

    for (uint256 i = 0; i < nonAccruingRewardsDistributors.length; i++) {
      require(flywheelAddress != nonAccruingRewardsDistributors[i], "!alreadyadded");
    }

    // add it to the non-accruing
    nonAccruingRewardsDistributors.push(flywheelAddress);

    // remove it from the accruing
    for (uint256 i = 0; i < rewardsDistributors.length; i++) {
      if (flywheelAddress == rewardsDistributors[i]) {
        rewardsDistributors[i] = rewardsDistributors[rewardsDistributors.length - 1];
        rewardsDistributors.pop();
        return true;
      }
    }

    return false;
  }

  function getAssetAsCollateralValueCap(
    ICErc20 collateral,
    ICErc20 cTokenModify,
    bool redeeming,
    address account
  ) external view returns (uint256) {
    if (address(collateral) == address(cTokenModify) && !redeeming) {
      // the collateral asset counts as 0 liquidity when borrowed
      return 0;
    }

    uint256 assetAsCollateralValueCap = type(uint256).max;
    if (address(cTokenModify) != address(0)) {
      // if the borrowed asset is blacklisted against this collateral & account is not whitelisted
      if (
        borrowingAgainstCollateralBlacklist[address(cTokenModify)][address(collateral)] &&
        !borrowingAgainstCollateralBlacklistWhitelist[address(cTokenModify)][address(collateral)].contains(account)
      ) {
        assetAsCollateralValueCap = 0;
      } else {
        // for each user the value of this kind of collateral is capped regardless of the amount borrowed
        // denominated in the borrowed asset
        uint256 borrowCapForCollateral = borrowCapForCollateral[address(cTokenModify)][address(collateral)];
        // check if set to any value & account is not whitelisted
        if (
          borrowCapForCollateral != 0 &&
          !borrowCapForCollateralWhitelist[address(cTokenModify)][address(collateral)].contains(account)
        ) {
          uint256 borrowedAssetPrice = oracle.getUnderlyingPrice(cTokenModify);
          // this asset usage as collateral is capped at the native value of the borrow cap
          assetAsCollateralValueCap = (borrowCapForCollateral * borrowedAssetPrice) / 1e18;
        }
      }
    }

    uint256 supplyCap = effectiveSupplyCaps(address(collateral));

    // if there is any supply cap, don't allow donations to the market/plugin to go around it
    if (supplyCap > 0 && !supplyCapWhitelist[address(collateral)].contains(account)) {
      uint256 collateralAssetPrice = oracle.getUnderlyingPrice(collateral);
      uint256 supplyCapValue = (supplyCap * collateralAssetPrice) / 1e18;
      supplyCapValue = (supplyCapValue * markets[address(collateral)].collateralFactorMantissa) / 1e18;
      if (supplyCapValue < assetAsCollateralValueCap) assetAsCollateralValueCap = supplyCapValue;
    }

    return assetAsCollateralValueCap;
  }

  /**
   * @notice Set the given supply caps for the given cToken markets. Supplying that brings total underlying supply to or above supply cap will revert.
   * @dev Admin or borrowCapGuardian function to set the supply caps. A supply cap of 0 corresponds to unlimited supplying.
   * @param cTokens The addresses of the markets (tokens) to change the supply caps for
   * @param newSupplyCaps The new supply cap values in underlying to be set. A value of 0 corresponds to unlimited supplying.
   */
  function _setMarketSupplyCaps(ICErc20[] calldata cTokens, uint256[] calldata newSupplyCaps) external {
    require(msg.sender == admin || msg.sender == borrowCapGuardian, "!admin");

    uint256 numMarkets = cTokens.length;
    uint256 numSupplyCaps = newSupplyCaps.length;

    require(numMarkets != 0 && numMarkets == numSupplyCaps, "!input");

    for (uint256 i = 0; i < numMarkets; i++) {
      supplyCaps[address(cTokens[i])] = newSupplyCaps[i];
      emit NewSupplyCap(cTokens[i], newSupplyCaps[i]);
    }
  }

  /**
   * @notice Set the given borrow caps for the given cToken markets. Borrowing that brings total borrows to or above borrow cap will revert.
   * @dev Admin or borrowCapGuardian function to set the borrow caps. A borrow cap of 0 corresponds to unlimited borrowing.
   * @param cTokens The addresses of the markets (tokens) to change the borrow caps for
   * @param newBorrowCaps The new borrow cap values in underlying to be set. A value of 0 corresponds to unlimited borrowing.
   */
  function _setMarketBorrowCaps(ICErc20[] calldata cTokens, uint256[] calldata newBorrowCaps) external {
    require(msg.sender == admin || msg.sender == borrowCapGuardian, "!admin");

    uint256 numMarkets = cTokens.length;
    uint256 numBorrowCaps = newBorrowCaps.length;

    require(numMarkets != 0 && numMarkets == numBorrowCaps, "!input");

    for (uint256 i = 0; i < numMarkets; i++) {
      borrowCaps[address(cTokens[i])] = newBorrowCaps[i];
      emit NewBorrowCap(cTokens[i], newBorrowCaps[i]);
    }
  }

  /**
   * @notice Admin function to change the Borrow Cap Guardian
   * @param newBorrowCapGuardian The address of the new Borrow Cap Guardian
   */
  function _setBorrowCapGuardian(address newBorrowCapGuardian) external {
    require(msg.sender == admin, "!admin");

    // Save current value for inclusion in log
    address oldBorrowCapGuardian = borrowCapGuardian;

    // Store borrowCapGuardian with value newBorrowCapGuardian
    borrowCapGuardian = newBorrowCapGuardian;

    // Emit NewBorrowCapGuardian(OldBorrowCapGuardian, NewBorrowCapGuardian)
    emit NewBorrowCapGuardian(oldBorrowCapGuardian, newBorrowCapGuardian);
  }

  /**
   * @notice Admin function to change the Pause Guardian
   * @param newPauseGuardian The address of the new Pause Guardian
   * @return uint 0=success, otherwise a failure. (See enum Error for details)
   */
  function _setPauseGuardian(address newPauseGuardian) public returns (uint256) {
    if (!hasAdminRights()) {
      return fail(Error.UNAUTHORIZED, FailureInfo.SET_PAUSE_GUARDIAN_OWNER_CHECK);
    }

    // Save current value for inclusion in log
    address oldPauseGuardian = pauseGuardian;

    // Store pauseGuardian with value newPauseGuardian
    pauseGuardian = newPauseGuardian;

    // Emit NewPauseGuardian(OldPauseGuardian, NewPauseGuardian)
    emit NewPauseGuardian(oldPauseGuardian, pauseGuardian);

    return uint256(Error.NO_ERROR);
  }

  function _setMintPaused(ICErc20 cToken, bool state) public returns (bool) {
    require(markets[address(cToken)].isListed, "!market");
    require(msg.sender == pauseGuardian || hasAdminRights(), "!guardian");
    require(hasAdminRights() || state == true, "!admin");

    mintGuardianPaused[address(cToken)] = state;
    emit MarketActionPaused(cToken, "Mint", state);
    return state;
  }

  function _setBorrowPaused(ICErc20 cToken, bool state) public returns (bool) {
    require(markets[address(cToken)].isListed, "!market");
    require(msg.sender == pauseGuardian || hasAdminRights(), "!guardian");
    require(hasAdminRights() || state == true, "!admin");

    borrowGuardianPaused[address(cToken)] = state;
    emit MarketActionPaused(cToken, "Borrow", state);
    return state;
  }

  function _setTransferPaused(bool state) public returns (bool) {
    require(msg.sender == pauseGuardian || hasAdminRights(), "!guardian");
    require(hasAdminRights() || state == true, "!admin");

    transferGuardianPaused = state;
    emit ActionPaused("Transfer", state);
    return state;
  }

  function _setSeizePaused(bool state) public returns (bool) {
    require(msg.sender == pauseGuardian || hasAdminRights(), "!guardian");
    require(hasAdminRights() || state == true, "!admin");

    seizeGuardianPaused = state;
    emit ActionPaused("Seize", state);
    return state;
  }

  /**
   * @notice Removed a market from the markets mapping and sets it as unlisted
   * @dev Admin function unset isListed and collateralFactorMantissa and unadd support for the market
   * @param cToken The address of the market (token) to unlist
   * @return uint 0=success, otherwise a failure. (See enum Error for details)
   */
  function _unsupportMarket(ICErc20 cToken) external returns (uint256) {
    // Check admin rights
    if (!hasAdminRights()) return fail(Error.UNAUTHORIZED, FailureInfo.UNSUPPORT_MARKET_OWNER_CHECK);

    // Check if market is already unlisted
    if (!markets[address(cToken)].isListed)
      return fail(Error.MARKET_NOT_LISTED, FailureInfo.UNSUPPORT_MARKET_DOES_NOT_EXIST);

    // Check if market is in use
    if (cToken.totalSupply() > 0) return fail(Error.NONZERO_TOTAL_SUPPLY, FailureInfo.UNSUPPORT_MARKET_IN_USE);

    // Unlist market
    delete markets[address(cToken)];

    /* Delete cToken from allMarkets */
    // load into memory for faster iteration
    ICErc20[] memory _allMarkets = allMarkets;
    uint256 len = _allMarkets.length;
    uint256 assetIndex = len;
    for (uint256 i = 0; i < len; i++) {
      if (_allMarkets[i] == cToken) {
        assetIndex = i;
        break;
      }
    }

    // We *must* have found the asset in the list or our redundant data structure is broken
    assert(assetIndex < len);

    // copy last item in list to location of item to be removed, reduce length by 1
    allMarkets[assetIndex] = allMarkets[allMarkets.length - 1];
    allMarkets.pop();

    cTokensByUnderlying[ICErc20(address(cToken)).underlying()] = ICErc20(address(0));
    emit MarketUnlisted(cToken);

    return uint256(Error.NO_ERROR);
  }

  function _setBorrowCapForCollateral(address cTokenBorrow, address cTokenCollateral, uint256 borrowCap) public {
    require(hasAdminRights(), "!admin");
    borrowCapForCollateral[cTokenBorrow][cTokenCollateral] = borrowCap;
  }

  function _setBorrowCapForCollateralWhitelist(
    address cTokenBorrow,
    address cTokenCollateral,
    address account,
    bool whitelisted
  ) public {
    require(hasAdminRights(), "!admin");

    if (whitelisted) borrowCapForCollateralWhitelist[cTokenBorrow][cTokenCollateral].add(account);
    else borrowCapForCollateralWhitelist[cTokenBorrow][cTokenCollateral].remove(account);
  }

  function isBorrowCapForCollateralWhitelisted(
    address cTokenBorrow,
    address cTokenCollateral,
    address account
  ) public view returns (bool) {
    return borrowCapForCollateralWhitelist[cTokenBorrow][cTokenCollateral].contains(account);
  }

  function _blacklistBorrowingAgainstCollateral(
    address cTokenBorrow,
    address cTokenCollateral,
    bool blacklisted
  ) public {
    require(hasAdminRights(), "!admin");
    borrowingAgainstCollateralBlacklist[cTokenBorrow][cTokenCollateral] = blacklisted;
  }

  function _blacklistBorrowingAgainstCollateralWhitelist(
    address cTokenBorrow,
    address cTokenCollateral,
    address account,
    bool whitelisted
  ) public {
    require(hasAdminRights(), "!admin");

    if (whitelisted) borrowingAgainstCollateralBlacklistWhitelist[cTokenBorrow][cTokenCollateral].add(account);
    else borrowingAgainstCollateralBlacklistWhitelist[cTokenBorrow][cTokenCollateral].remove(account);
  }

  function isBlacklistBorrowingAgainstCollateralWhitelisted(
    address cTokenBorrow,
    address cTokenCollateral,
    address account
  ) public view returns (bool) {
    return borrowingAgainstCollateralBlacklistWhitelist[cTokenBorrow][cTokenCollateral].contains(account);
  }

  function _supplyCapWhitelist(address cToken, address account, bool whitelisted) public {
    require(hasAdminRights(), "!admin");

    if (whitelisted) supplyCapWhitelist[cToken].add(account);
    else supplyCapWhitelist[cToken].remove(account);
  }

  function isSupplyCapWhitelisted(address cToken, address account) public view returns (bool) {
    return supplyCapWhitelist[cToken].contains(account);
  }

  function getWhitelistedSuppliersSupply(address cToken) public view returns (uint256 supplied) {
    address[] memory whitelistedSuppliers = supplyCapWhitelist[cToken].values();
    for (uint256 i = 0; i < whitelistedSuppliers.length; i++) {
      supplied += ICErc20(cToken).balanceOfUnderlying(whitelistedSuppliers[i]);
    }
  }

  function _borrowCapWhitelist(address cToken, address account, bool whitelisted) public {
    require(hasAdminRights(), "!admin");

    if (whitelisted) borrowCapWhitelist[cToken].add(account);
    else borrowCapWhitelist[cToken].remove(account);
  }

  function isBorrowCapWhitelisted(address cToken, address account) public view returns (bool) {
    return borrowCapWhitelist[cToken].contains(account);
  }

  function getWhitelistedBorrowersBorrows(address cToken) public view returns (uint256 borrowed) {
    address[] memory whitelistedBorrowers = borrowCapWhitelist[cToken].values();
    for (uint256 i = 0; i < whitelistedBorrowers.length; i++) {
      borrowed += ICErc20(cToken).borrowBalanceCurrent(whitelistedBorrowers[i]);
    }
  }

  /**
   * @notice Return all of the markets
   * @dev The automatic getter may be used to access an individual market.
   * @return The list of market addresses
   */
  function getAllMarkets() public view returns (ICErc20[] memory) {
    return allMarkets;
  }

  /**
   * @notice Return all of the borrowers
   * @dev The automatic getter may be used to access an individual borrower.
   * @return The list of borrower account addresses
   */
  function getAllBorrowers() public view returns (address[] memory) {
    return allBorrowers;
  }

  function getAllBorrowersCount() public view returns (uint256) {
    return allBorrowers.length;
  }

  function getPaginatedBorrowers(
    uint256 page,
    uint256 pageSize
  ) public view returns (uint256 _totalPages, address[] memory _pageOfBorrowers) {
    uint256 allBorrowersCount = allBorrowers.length;
    if (allBorrowersCount == 0) {
      return (0, new address[](0));
    }

    if (pageSize == 0) pageSize = 300;
    uint256 currentPageSize = pageSize;
    uint256 sizeOfPageFromRemainder = allBorrowersCount % pageSize;

    _totalPages = allBorrowersCount / pageSize;
    if (sizeOfPageFromRemainder > 0) {
      _totalPages++;
      if (page + 1 == _totalPages) {
        currentPageSize = sizeOfPageFromRemainder;
      }
    }

    if (page + 1 > _totalPages) {
      return (_totalPages, new address[](0));
    }

    uint256 offset = page * pageSize;
    _pageOfBorrowers = new address[](currentPageSize);
    for (uint256 i = 0; i < currentPageSize; i++) {
      _pageOfBorrowers[i] = allBorrowers[i + offset];
    }
  }

  /**
   * @notice Return all of the whitelist
   * @dev The automatic getter may be used to access an individual whitelist status.
   * @return The list of borrower account addresses
   */
  function getWhitelist() external view returns (address[] memory) {
    return whitelistArray;
  }

  /**
   * @notice Returns an array of all accruing and non-accruing flywheels
   */
  function getRewardsDistributors() external view returns (address[] memory) {
    address[] memory allFlywheels = new address[](rewardsDistributors.length + nonAccruingRewardsDistributors.length);

    uint8 i = 0;
    while (i < rewardsDistributors.length) {
      allFlywheels[i] = rewardsDistributors[i];
      i++;
    }
    uint8 j = 0;
    while (j < nonAccruingRewardsDistributors.length) {
      allFlywheels[i + j] = nonAccruingRewardsDistributors[j];
      j++;
    }

    return allFlywheels;
  }

  function getAccruingFlywheels() external view returns (address[] memory) {
    return rewardsDistributors;
  }

  /**
   * @dev Removes a flywheel from the accruing or non-accruing array
   * @param flywheelAddress The address of the flywheel to remove from the accruing or non-accruing array
   * @return true if the flywheel was found and removed
   */
  function _removeFlywheel(address flywheelAddress) external returns (bool) {
    require(hasAdminRights(), "!admin");
    require(flywheelAddress != address(0), "!flywheel");

    // remove it from the accruing
    for (uint256 i = 0; i < rewardsDistributors.length; i++) {
      if (flywheelAddress == rewardsDistributors[i]) {
        rewardsDistributors[i] = rewardsDistributors[rewardsDistributors.length - 1];
        rewardsDistributors.pop();
        return true;
      }
    }

    // or remove it from the non-accruing
    for (uint256 i = 0; i < nonAccruingRewardsDistributors.length; i++) {
      if (flywheelAddress == nonAccruingRewardsDistributors[i]) {
        nonAccruingRewardsDistributors[i] = nonAccruingRewardsDistributors[nonAccruingRewardsDistributors.length - 1];
        nonAccruingRewardsDistributors.pop();
        return true;
      }
    }

    return false;
  }

  function isUserOfPool(address user) external view returns (bool) {
    for (uint256 i = 0; i < allMarkets.length; i++) {
      address marketAddress = address(allMarkets[i]);
      if (markets[marketAddress].accountMembership[user]) {
        return true;
      }
    }

    return false;
  }

  function registerInSFS() external returns (uint256) {
    require(hasAdminRights(), "!admin");
    SFSRegister sfsContract = SFSRegister(0x8680CEaBcb9b56913c519c069Add6Bc3494B7020);

    for (uint256 i = 0; i < allMarkets.length; i++) {
      allMarkets[i].registerInSFS();
    }

    return sfsContract.register(0x8Fba84867Ba458E7c6E2c024D2DE3d0b5C3ea1C2);
  }
}
