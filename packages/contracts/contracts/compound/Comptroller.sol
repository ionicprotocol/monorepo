// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { ICErc20 } from "./CTokenInterfaces.sol";
import { ComptrollerErrorReporter } from "./ErrorReporter.sol";
import { Exponential } from "./Exponential.sol";
import { BasePriceOracle } from "../oracles/BasePriceOracle.sol";
import { Unitroller } from "./Unitroller.sol";
import { IFeeDistributor } from "./IFeeDistributor.sol";
import { IIonicFlywheel } from "../ionic/strategies/flywheel/IIonicFlywheel.sol";
import { DiamondExtension, DiamondBase, LibDiamond } from "../ionic/DiamondExtension.sol";
import { ComptrollerExtensionInterface, ComptrollerBase, ComptrollerInterface } from "./ComptrollerInterface.sol";

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * @title Compound's Comptroller Contract
 * @author Compound
 * @dev This contract should not to be deployed alone; instead, deploy `Unitroller` (proxy contract) on top of this `Comptroller` (logic/implementation contract).
 */
contract Comptroller is ComptrollerBase, ComptrollerInterface, ComptrollerErrorReporter, Exponential, DiamondExtension {
  using EnumerableSet for EnumerableSet.AddressSet;

  /// @notice Emitted when an admin supports a market
  event MarketListed(ICErc20 cToken);

  /// @notice Emitted when an account enters a market
  event MarketEntered(ICErc20 cToken, address account);

  /// @notice Emitted when an account exits a market
  event MarketExited(ICErc20 cToken, address account);

  /// @notice Emitted when close factor is changed by admin
  event NewCloseFactor(uint256 oldCloseFactorMantissa, uint256 newCloseFactorMantissa);

  /// @notice Emitted when a collateral factor is changed by admin
  event NewCollateralFactor(ICErc20 cToken, uint256 oldCollateralFactorMantissa, uint256 newCollateralFactorMantissa);

  /// @notice Emitted when liquidation incentive is changed by admin
  event NewLiquidationIncentive(uint256 oldLiquidationIncentiveMantissa, uint256 newLiquidationIncentiveMantissa);

  /// @notice Emitted when price oracle is changed
  event NewPriceOracle(BasePriceOracle oldPriceOracle, BasePriceOracle newPriceOracle);

  /// @notice Emitted when the whitelist enforcement is changed
  event WhitelistEnforcementChanged(bool enforce);

  /// @notice Emitted when a new RewardsDistributor contract is added to hooks
  event AddedRewardsDistributor(address rewardsDistributor);

  // closeFactorMantissa must be strictly greater than this value
  uint256 internal constant closeFactorMinMantissa = 0.05e18; // 0.05

  // closeFactorMantissa must not exceed this value
  uint256 internal constant closeFactorMaxMantissa = 0.9e18; // 0.9

  // No collateralFactorMantissa may exceed this value
  uint256 internal constant collateralFactorMaxMantissa = 0.9e18; // 0.9

  // liquidationIncentiveMantissa must be no less than this value
  uint256 internal constant liquidationIncentiveMinMantissa = 1.0e18; // 1.0

  // liquidationIncentiveMantissa must be no greater than this value
  uint256 internal constant liquidationIncentiveMaxMantissa = 1.5e18; // 1.5

  modifier isAuthorized() {
    require(IFeeDistributor(ionicAdmin).canCall(address(this), msg.sender, address(this), msg.sig), "not authorized");
    _;
  }

  /**
   * @notice Gets the supply cap of a cToken in the units of the underlying asset.
   * @param cToken The address of the cToken.
   */
  function effectiveSupplyCaps(
    address cToken
  ) public view override(ComptrollerBase, ComptrollerInterface) returns (uint256 supplyCap) {
    return ComptrollerBase.effectiveSupplyCaps(cToken);
  }

  /**
   * @notice Gets the borrow cap of a cToken in the units of the underlying asset.
   * @param cToken The address of the cToken.
   */
  function effectiveBorrowCaps(
    address cToken
  ) public view override(ComptrollerBase, ComptrollerInterface) returns (uint256 borrowCap) {
    return ComptrollerBase.effectiveBorrowCaps(cToken);
  }

  /*** Assets You Are In ***/

  /**
   * @notice Returns the assets an account has entered
   * @param account The address of the account to pull assets for
   * @return A dynamic list with the assets the account has entered
   */
  function getAssetsIn(address account) external view returns (ICErc20[] memory) {
    ICErc20[] memory assetsIn = accountAssets[account];

    return assetsIn;
  }

  /**
   * @notice Returns whether the given account is entered in the given asset
   * @param account The address of the account to check
   * @param cToken The cToken to check
   * @return True if the account is in the asset, otherwise false.
   */
  function checkMembership(address account, ICErc20 cToken) external view returns (bool) {
    return markets[address(cToken)].accountMembership[account];
  }

  /**
   * @notice Add assets to be included in account liquidity calculation
   * @param cTokens The list of addresses of the cToken markets to be enabled
   * @return Success indicator for whether each corresponding market was entered
   */
  function enterMarkets(address[] memory cTokens) public override isAuthorized returns (uint256[] memory) {
    uint256 len = cTokens.length;

    uint256[] memory results = new uint256[](len);
    for (uint256 i = 0; i < len; i++) {
      ICErc20 cToken = ICErc20(cTokens[i]);

      results[i] = uint256(addToMarketInternal(cToken, msg.sender));
    }

    return results;
  }

  /**
   * @notice Add the market to the borrower's "assets in" for liquidity calculations
   * @param cToken The market to enter
   * @param borrower The address of the account to modify
   * @return Success indicator for whether the market was entered
   */
  function addToMarketInternal(ICErc20 cToken, address borrower) internal returns (Error) {
    Market storage marketToJoin = markets[address(cToken)];

    if (!marketToJoin.isListed) {
      // market is not listed, cannot join
      return Error.MARKET_NOT_LISTED;
    }

    if (marketToJoin.accountMembership[borrower] == true) {
      // already joined
      return Error.NO_ERROR;
    }

    // survived the gauntlet, add to list
    // NOTE: we store these somewhat redundantly as a significant optimization
    //  this avoids having to iterate through the list for the most common use cases
    //  that is, only when we need to perform liquidity checks
    //  and not whenever we want to check if an account is in a particular market
    marketToJoin.accountMembership[borrower] = true;
    accountAssets[borrower].push(cToken);

    // Add to allBorrowers
    if (!borrowers[borrower]) {
      allBorrowers.push(borrower);
      borrowers[borrower] = true;
      borrowerIndexes[borrower] = allBorrowers.length - 1;
    }

    emit MarketEntered(cToken, borrower);

    return Error.NO_ERROR;
  }

  /**
   * @notice Removes asset from sender's account liquidity calculation
   * @dev Sender must not have an outstanding borrow balance in the asset,
   *  or be providing necessary collateral for an outstanding borrow.
   * @param cTokenAddress The address of the asset to be removed
   * @return Whether or not the account successfully exited the market
   */
  function exitMarket(address cTokenAddress) external override isAuthorized returns (uint256) {
    // TODO
    require(markets[cTokenAddress].isListed, "!Comptroller:exitMarket");

    ICErc20 cToken = ICErc20(cTokenAddress);
    /* Get sender tokensHeld and amountOwed underlying from the cToken */
    (uint256 oErr, uint256 tokensHeld, uint256 amountOwed, ) = cToken.getAccountSnapshot(msg.sender);
    require(oErr == 0, "!exitMarket"); // semi-opaque error code

    /* Fail if the sender has a borrow balance */
    if (amountOwed != 0) {
      return fail(Error.NONZERO_BORROW_BALANCE, FailureInfo.EXIT_MARKET_BALANCE_OWED);
    }

    /* Fail if the sender is not permitted to redeem all of their tokens */
    uint256 allowed = redeemAllowedInternal(cTokenAddress, msg.sender, tokensHeld);
    if (allowed != 0) {
      return failOpaque(Error.REJECTION, FailureInfo.EXIT_MARKET_REJECTION, allowed);
    }

    Market storage marketToExit = markets[cTokenAddress];

    /* Return true if the sender is not already ‘in’ the market */
    if (!marketToExit.accountMembership[msg.sender]) {
      return uint256(Error.NO_ERROR);
    }

    /* Set cToken account membership to false */
    delete marketToExit.accountMembership[msg.sender];

    /* Delete cToken from the account’s list of assets */
    // load into memory for faster iteration
    ICErc20[] memory userAssetList = accountAssets[msg.sender];
    uint256 len = userAssetList.length;
    uint256 assetIndex = len;
    for (uint256 i = 0; i < len; i++) {
      if (userAssetList[i] == ICErc20(cTokenAddress)) {
        assetIndex = i;
        break;
      }
    }

    // We *must* have found the asset in the list or our redundant data structure is broken
    assert(assetIndex < len);

    // copy last item in list to location of item to be removed, reduce length by 1
    ICErc20[] storage storedList = accountAssets[msg.sender];
    storedList[assetIndex] = storedList[storedList.length - 1];
    storedList.pop();

    // If the user has exited all markets, remove them from the `allBorrowers` array
    if (storedList.length == 0) {
      allBorrowers[borrowerIndexes[msg.sender]] = allBorrowers[allBorrowers.length - 1]; // Copy last item in list to location of item to be removed
      allBorrowers.pop(); // Reduce length by 1
      borrowerIndexes[allBorrowers[borrowerIndexes[msg.sender]]] = borrowerIndexes[msg.sender]; // Set borrower index of moved item to correct index
      borrowerIndexes[msg.sender] = 0; // Reset sender borrower index to 0 for a gas refund
      borrowers[msg.sender] = false; // Tell the contract that the sender is no longer a borrower (so it knows to add the borrower back if they enter a market in the future)
    }

    emit MarketExited(ICErc20(cTokenAddress), msg.sender);

    return uint256(Error.NO_ERROR);
  }

  /*** Policy Hooks ***/

  /**
   * @notice Checks if the account should be allowed to mint tokens in the given market
   * @param cTokenAddress The market to verify the mint against
   * @param minter The account which would get the minted tokens
   * @param mintAmount The amount of underlying being supplied to the market in exchange for tokens
   * @return 0 if the mint is allowed, otherwise a semi-opaque error code (See ErrorReporter.sol)
   */
  function mintAllowed(address cTokenAddress, address minter, uint256 mintAmount) external override returns (uint256) {
    // Pausing is a very serious situation - we revert to sound the alarms
    require(!mintGuardianPaused[cTokenAddress], "!mint:paused");

    // Make sure market is listed
    if (!markets[cTokenAddress].isListed) {
      return uint256(Error.MARKET_NOT_LISTED);
    }

    // Make sure minter is whitelisted
    if (enforceWhitelist && !whitelist[minter]) {
      return uint256(Error.SUPPLIER_NOT_WHITELISTED);
    }

    uint256 supplyCap = effectiveSupplyCaps(cTokenAddress);

    // Supply cap of 0 corresponds to unlimited supplying
    if (supplyCap != 0 && !supplyCapWhitelist[cTokenAddress].contains(minter)) {
      uint256 totalUnderlyingSupply = ICErc20(cTokenAddress).getTotalUnderlyingSupplied();
      uint256 whitelistedSuppliersSupply = asComptrollerExtension().getWhitelistedSuppliersSupply(cTokenAddress);
      uint256 nonWhitelistedTotalSupply;
      if (whitelistedSuppliersSupply >= totalUnderlyingSupply) nonWhitelistedTotalSupply = 0;
      else nonWhitelistedTotalSupply = totalUnderlyingSupply - whitelistedSuppliersSupply;

      require(nonWhitelistedTotalSupply + mintAmount < supplyCap, "!supply cap");
    }

    // Keep the flywheel moving
    flywheelPreSupplierAction(cTokenAddress, minter);

    return uint256(Error.NO_ERROR);
  }

  /**
   * @notice Checks if the account should be allowed to redeem tokens in the given market
   * @param cToken The market to verify the redeem against
   * @param redeemer The account which would redeem the tokens
   * @param redeemTokens The number of cTokens to exchange for the underlying asset in the market
   * @return 0 if the redeem is allowed, otherwise a semi-opaque error code (See ErrorReporter.sol)
   */
  function redeemAllowed(address cToken, address redeemer, uint256 redeemTokens) external override returns (uint256) {
    uint256 allowed = redeemAllowedInternal(cToken, redeemer, redeemTokens);
    if (allowed != uint256(Error.NO_ERROR)) {
      return allowed;
    }

    // Keep the flywheel moving
    flywheelPreSupplierAction(cToken, redeemer);

    return uint256(Error.NO_ERROR);
  }

  function redeemAllowedInternal(
    address cToken,
    address redeemer,
    uint256 redeemTokens
  ) internal view returns (uint256) {
    if (!markets[cToken].isListed) {
      return uint256(Error.MARKET_NOT_LISTED);
    }

    /* If the redeemer is not 'in' the market, then we can bypass the liquidity check */
    if (!markets[cToken].accountMembership[redeemer]) {
      return uint256(Error.NO_ERROR);
    }

    /* Otherwise, perform a hypothetical liquidity check to guard against shortfall */
    (Error err, , , uint256 shortfall) = getHypotheticalAccountLiquidityInternal(
      redeemer,
      ICErc20(cToken),
      redeemTokens,
      0,
      0
    );
    if (err != Error.NO_ERROR) {
      return uint256(err);
    }
    if (shortfall > 0) {
      return uint256(Error.INSUFFICIENT_LIQUIDITY);
    }

    return uint256(Error.NO_ERROR);
  }

  /**
   * @notice Validates mint and reverts on rejection. May emit logs.
   * @param cToken Asset being minted
   * @param minter The address minting the tokens
   * @param actualMintAmount The amount of the underlying asset being minted
   * @param mintTokens The number of tokens being minted
   */
  function mintVerify(address cToken, address minter, uint256 actualMintAmount, uint256 mintTokens) external {
    // Add minter to suppliers mapping
    suppliers[minter] = true;
  }

  /**
   * @notice Validates redeem and reverts on rejection. May emit logs.
   * @param cToken Asset being redeemed
   * @param redeemer The address redeeming the tokens
   * @param redeemAmount The amount of the underlying asset being redeemed
   * @param redeemTokens The number of tokens being redeemed
   */
  function redeemVerify(
    address cToken,
    address redeemer,
    uint256 redeemAmount,
    uint256 redeemTokens
  ) external override {
    require(markets[msg.sender].isListed, "!market");

    // Require tokens is zero or amount is also zero
    if (redeemTokens == 0 && redeemAmount > 0) {
      revert("!zero");
    }
  }

  function getMaxRedeemOrBorrow(
    address account,
    ICErc20 cTokenModify,
    bool isBorrow
  ) external view override returns (uint256) {
    address cToken = address(cTokenModify);
    // Accrue interest
    uint256 balanceOfUnderlying = cTokenModify.balanceOfUnderlying(account);

    // Get account liquidity
    (Error err, , uint256 liquidity, uint256 shortfall) = getHypotheticalAccountLiquidityInternal(
      account,
      isBorrow ? cTokenModify : ICErc20(address(0)),
      0,
      0,
      0
    );
    require(err == Error.NO_ERROR, "!liquidity");
    if (shortfall > 0) return 0; // Shortfall, so no more borrow/redeem

    // Get max borrow/redeem
    uint256 maxBorrowOrRedeemAmount;

    if (!isBorrow && !markets[cToken].accountMembership[account]) {
      // Max redeem = balance of underlying if not used as collateral
      maxBorrowOrRedeemAmount = balanceOfUnderlying;
    } else {
      // Avoid "stack too deep" error by separating this logic
      maxBorrowOrRedeemAmount = _getMaxRedeemOrBorrow(liquidity, cTokenModify, isBorrow);

      // Redeem only: max out at underlying balance
      if (!isBorrow && balanceOfUnderlying < maxBorrowOrRedeemAmount) maxBorrowOrRedeemAmount = balanceOfUnderlying;
    }

    // Get max borrow or redeem considering cToken liquidity
    uint256 cTokenLiquidity = cTokenModify.getCash();

    // Return the minimum of the two maximums
    return maxBorrowOrRedeemAmount <= cTokenLiquidity ? maxBorrowOrRedeemAmount : cTokenLiquidity;
  }

  /**
   * @dev Portion of the logic in `getMaxRedeemOrBorrow` above separated to avoid "stack too deep" errors.
   */
  function _getMaxRedeemOrBorrow(
    uint256 liquidity,
    ICErc20 cTokenModify,
    bool isBorrow
  ) internal view returns (uint256) {
    if (liquidity == 0) return 0; // No available account liquidity, so no more borrow/redeem

    // Get the normalized price of the asset
    uint256 conversionFactor = oracle.getUnderlyingPrice(cTokenModify);
    require(conversionFactor > 0, "!oracle");

    // Pre-compute a conversion factor from tokens -> ether (normalized price value)
    if (!isBorrow) {
      uint256 collateralFactorMantissa = markets[address(cTokenModify)].collateralFactorMantissa;
      conversionFactor = (collateralFactorMantissa * conversionFactor) / 1e18;
    }

    // Get max borrow or redeem considering excess account liquidity
    return (liquidity * 1e18) / conversionFactor;
  }

  /**
   * @notice Checks if the account should be allowed to borrow the underlying asset of the given market
   * @param cToken The market to verify the borrow against
   * @param borrower The account which would borrow the asset
   * @param borrowAmount The amount of underlying the account would borrow
   * @return 0 if the borrow is allowed, otherwise a semi-opaque error code (See ErrorReporter.sol)
   */
  function borrowAllowed(address cToken, address borrower, uint256 borrowAmount) external override returns (uint256) {
    // Pausing is a very serious situation - we revert to sound the alarms
    require(!borrowGuardianPaused[cToken], "!borrow:paused");

    // Make sure market is listed
    if (!markets[cToken].isListed) {
      return uint256(Error.MARKET_NOT_LISTED);
    }

    if (!markets[cToken].accountMembership[borrower]) {
      // only cTokens may call borrowAllowed if borrower not in market
      require(msg.sender == cToken, "!ctoken");

      // attempt to add borrower to the market
      Error err = addToMarketInternal(ICErc20(msg.sender), borrower);
      if (err != Error.NO_ERROR) {
        return uint256(err);
      }

      // it should be impossible to break the important invariant
      assert(markets[cToken].accountMembership[borrower]);
    }

    // Make sure oracle price is available
    if (oracle.getUnderlyingPrice(ICErc20(cToken)) == 0) {
      return uint256(Error.PRICE_ERROR);
    }

    // Make sure borrower is whitelisted
    if (enforceWhitelist && !whitelist[borrower]) {
      return uint256(Error.SUPPLIER_NOT_WHITELISTED);
    }

    uint256 borrowCap = effectiveBorrowCaps(cToken);

    // Borrow cap of 0 corresponds to unlimited borrowing
    if (borrowCap != 0 && !borrowCapWhitelist[cToken].contains(borrower)) {
      uint256 totalBorrows = ICErc20(cToken).totalBorrowsCurrent();
      uint256 whitelistedBorrowersBorrows = asComptrollerExtension().getWhitelistedBorrowersBorrows(cToken);
      uint256 nonWhitelistedTotalBorrows;
      if (whitelistedBorrowersBorrows >= totalBorrows) nonWhitelistedTotalBorrows = 0;
      else nonWhitelistedTotalBorrows = totalBorrows - whitelistedBorrowersBorrows;

      require(nonWhitelistedTotalBorrows + borrowAmount < borrowCap, "!borrow:cap");
    }

    // Keep the flywheel moving
    flywheelPreBorrowerAction(cToken, borrower);

    // Perform a hypothetical liquidity check to guard against shortfall
    (uint256 err, , , uint256 shortfall) = this.getHypotheticalAccountLiquidity(borrower, cToken, 0, borrowAmount, 0);
    if (err != uint256(Error.NO_ERROR)) {
      return err;
    }
    if (shortfall > 0) {
      return uint256(Error.INSUFFICIENT_LIQUIDITY);
    }

    return uint256(Error.NO_ERROR);
  }

  /**
   * @notice Checks if the account should be allowed to borrow the underlying asset of the given market
   * @param cToken Asset whose underlying is being borrowed
   * @param accountBorrowsNew The user's new borrow balance of the underlying asset
   */
  function borrowWithinLimits(address cToken, uint256 accountBorrowsNew) external view override returns (uint256) {
    // Check if min borrow exists
    uint256 minBorrowEth = IFeeDistributor(ionicAdmin).minBorrowEth();

    if (minBorrowEth > 0) {
      // Get new underlying borrow balance of account for this cToken
      uint256 oraclePriceMantissa = oracle.getUnderlyingPrice(ICErc20(cToken));
      if (oraclePriceMantissa == 0) return uint256(Error.PRICE_ERROR);
      (MathError mathErr, uint256 borrowBalanceEth) = mulScalarTruncate(
        Exp({ mantissa: oraclePriceMantissa }),
        accountBorrowsNew
      );
      if (mathErr != MathError.NO_ERROR) return uint256(Error.MATH_ERROR);

      // Check against min borrow
      if (borrowBalanceEth < minBorrowEth) return uint256(Error.BORROW_BELOW_MIN);
    }

    // Return no error
    return uint256(Error.NO_ERROR);
  }

  /**
   * @notice Checks if the account should be allowed to repay a borrow in the given market
   * @param cToken The market to verify the repay against
   * @param payer The account which would repay the asset
   * @param borrower The account which would borrowed the asset
   * @param repayAmount The amount of the underlying asset the account would repay
   * @return 0 if the repay is allowed, otherwise a semi-opaque error code (See ErrorReporter.sol)
   */
  function repayBorrowAllowed(
    address cToken,
    address payer,
    address borrower,
    uint256 repayAmount
  ) external override returns (uint256) {
    // Make sure market is listed
    if (!markets[cToken].isListed) {
      return uint256(Error.MARKET_NOT_LISTED);
    }

    // Keep the flywheel moving
    flywheelPreBorrowerAction(cToken, borrower);

    return uint256(Error.NO_ERROR);
  }

  /**
   * @notice Checks if the liquidation should be allowed to occur
   * @param cTokenBorrowed Asset which was borrowed by the borrower
   * @param cTokenCollateral Asset which was used as collateral and will be seized
   * @param liquidator The address repaying the borrow and seizing the collateral
   * @param borrower The address of the borrower
   * @param repayAmount The amount of underlying being repaid
   */
  function liquidateBorrowAllowed(
    address cTokenBorrowed,
    address cTokenCollateral,
    address liquidator,
    address borrower,
    uint256 repayAmount
  ) external override returns (uint256) {
    // Make sure markets are listed
    if (!markets[cTokenBorrowed].isListed || !markets[cTokenCollateral].isListed) {
      return uint256(Error.MARKET_NOT_LISTED);
    }

    // Get borrowers' underlying borrow balance
    uint256 borrowBalance = ICErc20(cTokenBorrowed).borrowBalanceCurrent(borrower);

    /* allow accounts to be liquidated if the market is deprecated */
    if (isDeprecated(ICErc20(cTokenBorrowed))) {
      require(borrowBalance >= repayAmount, "!borrow>repay");
    } else {
      /* The borrower must have shortfall in order to be liquidateable */
      (Error err, , , uint256 shortfall) = getHypotheticalAccountLiquidityInternal(
        borrower,
        ICErc20(address(0)),
        0,
        0,
        0
      );
      if (err != Error.NO_ERROR) {
        return uint256(err);
      }

      if (shortfall == 0) {
        return uint256(Error.INSUFFICIENT_SHORTFALL);
      }

      /* The liquidator may not repay more than what is allowed by the closeFactor */
      uint256 maxClose = mul_ScalarTruncate(Exp({ mantissa: closeFactorMantissa }), borrowBalance);
      if (repayAmount > maxClose) {
        return uint256(Error.TOO_MUCH_REPAY);
      }
    }

    return uint256(Error.NO_ERROR);
  }

  /**
   * @notice Checks if the seizing of assets should be allowed to occur
   * @param cTokenCollateral Asset which was used as collateral and will be seized
   * @param cTokenBorrowed Asset which was borrowed by the borrower
   * @param liquidator The address repaying the borrow and seizing the collateral
   * @param borrower The address of the borrower
   * @param seizeTokens The number of collateral tokens to seize
   */
  function seizeAllowed(
    address cTokenCollateral,
    address cTokenBorrowed,
    address liquidator,
    address borrower,
    uint256 seizeTokens
  ) external override returns (uint256) {
    // Pausing is a very serious situation - we revert to sound the alarms
    require(!seizeGuardianPaused, "!seize:paused");

    // Make sure markets are listed
    if (!markets[cTokenCollateral].isListed || !markets[cTokenBorrowed].isListed) {
      return uint256(Error.MARKET_NOT_LISTED);
    }

    // Make sure cToken Comptrollers are identical
    if (ICErc20(cTokenCollateral).comptroller() != ICErc20(cTokenBorrowed).comptroller()) {
      return uint256(Error.COMPTROLLER_MISMATCH);
    }

    // Keep the flywheel moving
    flywheelPreTransferAction(cTokenCollateral, borrower, liquidator);

    return uint256(Error.NO_ERROR);
  }

  /**
   * @notice Checks if the account should be allowed to transfer tokens in the given market
   * @param cToken The market to verify the transfer against
   * @param src The account which sources the tokens
   * @param dst The account which receives the tokens
   * @param transferTokens The number of cTokens to transfer
   * @return 0 if the transfer is allowed, otherwise a semi-opaque error code (See ErrorReporter.sol)
   */
  function transferAllowed(
    address cToken,
    address src,
    address dst,
    uint256 transferTokens
  ) external override returns (uint256) {
    // Pausing is a very serious situation - we revert to sound the alarms
    require(!transferGuardianPaused, "!transfer:paused");

    // Currently the only consideration is whether or not
    //  the src is allowed to redeem this many tokens
    uint256 allowed = redeemAllowedInternal(cToken, src, transferTokens);
    if (allowed != uint256(Error.NO_ERROR)) {
      return allowed;
    }

    // Keep the flywheel moving
    flywheelPreTransferAction(cToken, src, dst);

    return uint256(Error.NO_ERROR);
  }

  /*** Flywheel Hooks ***/

  /**
   * @notice Keeps the flywheel moving pre-mint and pre-redeem
   * @param cToken The relevant market
   * @param supplier The minter/redeemer
   */
  function flywheelPreSupplierAction(address cToken, address supplier) internal {
    for (uint256 i = 0; i < rewardsDistributors.length; i++)
      IIonicFlywheel(rewardsDistributors[i]).flywheelPreSupplierAction(cToken, supplier);
  }

  /**
   * @notice Keeps the flywheel moving pre-borrow and pre-repay
   * @param cToken The relevant market
   * @param borrower The borrower
   */
  function flywheelPreBorrowerAction(address cToken, address borrower) internal {
    for (uint256 i = 0; i < rewardsDistributors.length; i++)
      IIonicFlywheel(rewardsDistributors[i]).flywheelPreBorrowerAction(cToken, borrower);
  }

  /**
   * @notice Keeps the flywheel moving pre-transfer and pre-seize
   * @param cToken The relevant market
   * @param src The account which sources the tokens
   * @param dst The account which receives the tokens
   */
  function flywheelPreTransferAction(address cToken, address src, address dst) internal {
    for (uint256 i = 0; i < rewardsDistributors.length; i++)
      IIonicFlywheel(rewardsDistributors[i]).flywheelPreTransferAction(cToken, src, dst);
  }

  /*** Liquidity/Liquidation Calculations ***/

  /**
   * @dev Local vars for avoiding stack-depth limits in calculating account liquidity.
   *  Note that `cTokenBalance` is the number of cTokens the account owns in the market,
   *  whereas `borrowBalance` is the amount of underlying that the account has borrowed.
   */
  struct AccountLiquidityLocalVars {
    ICErc20 asset;
    uint256 sumCollateral;
    uint256 sumBorrowPlusEffects;
    uint256 cTokenBalance;
    uint256 borrowBalance;
    uint256 exchangeRateMantissa;
    uint256 oraclePriceMantissa;
    Exp collateralFactor;
    Exp exchangeRate;
    Exp oraclePrice;
    Exp tokensToDenom;
    uint256 borrowCapForCollateral;
    uint256 borrowedAssetPrice;
    uint256 assetAsCollateralValueCap;
  }

  function getAccountLiquidity(address account) public view override returns (uint256, uint256, uint256, uint256) {
    (
      Error err,
      uint256 collateralValue,
      uint256 liquidity,
      uint256 shortfall
    ) = getHypotheticalAccountLiquidityInternal(account, ICErc20(address(0)), 0, 0, 0);
    return (uint256(err), collateralValue, liquidity, shortfall);
  }

  /**
     * @notice Determine what the account liquidity would be if the given amounts were redeemed/borrowed
     * @param cTokenModify The market to hypothetically redeem/borrow in
     * @param account The account to determine liquidity for
     * @param redeemTokens The number of tokens to hypothetically redeem
     * @param borrowAmount The amount of underlying to hypothetically borrow
     * @return (possible error code (semi-opaque),
                hypothetical account liquidity in excess of collateral requirements,
     *          hypothetical account shortfall below collateral requirements)
     */
  function getHypotheticalAccountLiquidity(
    address account,
    address cTokenModify,
    uint256 redeemTokens,
    uint256 borrowAmount,
    uint256 repayAmount
  ) public view returns (uint256, uint256, uint256, uint256) {
    (
      Error err,
      uint256 collateralValue,
      uint256 liquidity,
      uint256 shortfall
    ) = getHypotheticalAccountLiquidityInternal(
        account,
        ICErc20(cTokenModify),
        redeemTokens,
        borrowAmount,
        repayAmount
      );
    return (uint256(err), collateralValue, liquidity, shortfall);
  }

  /**
     * @notice Determine what the account liquidity would be if the given amounts were redeemed/borrowed
     * @param cTokenModify The market to hypothetically redeem/borrow in
     * @param account The account to determine liquidity for
     * @param redeemTokens The number of tokens to hypothetically redeem
     * @param borrowAmount The amount of underlying to hypothetically borrow
     * @return (possible error code,
                hypothetical account collateral value,
                hypothetical account liquidity in excess of collateral requirements,
     *          hypothetical account shortfall below collateral requirements)
     */
  function getHypotheticalAccountLiquidityInternal(
    address account,
    ICErc20 cTokenModify,
    uint256 redeemTokens,
    uint256 borrowAmount,
    uint256 repayAmount
  ) internal view returns (Error, uint256, uint256, uint256) {
    AccountLiquidityLocalVars memory vars; // Holds all our calculation results

    if (address(cTokenModify) != address(0)) {
      vars.borrowedAssetPrice = oracle.getUnderlyingPrice(cTokenModify);
    }

    // For each asset the account is in
    for (uint256 i = 0; i < accountAssets[account].length; i++) {
      vars.asset = accountAssets[account][i];

      {
        // Read the balances and exchange rate from the cToken
        uint256 oErr;
        (oErr, vars.cTokenBalance, vars.borrowBalance, vars.exchangeRateMantissa) = vars.asset.getAccountSnapshot(
          account
        );
        if (oErr != 0) {
          // semi-opaque error code, we assume NO_ERROR == 0 is invariant between upgrades
          return (Error.SNAPSHOT_ERROR, 0, 0, 0);
        }
      }
      {
        vars.collateralFactor = Exp({ mantissa: markets[address(vars.asset)].collateralFactorMantissa });
        vars.exchangeRate = Exp({ mantissa: vars.exchangeRateMantissa });

        // Get the normalized price of the asset
        vars.oraclePriceMantissa = oracle.getUnderlyingPrice(vars.asset);
        if (vars.oraclePriceMantissa == 0) {
          return (Error.PRICE_ERROR, 0, 0, 0);
        }
        vars.oraclePrice = Exp({ mantissa: vars.oraclePriceMantissa });

        // Pre-compute a conversion factor from tokens -> ether (normalized price value)
        vars.tokensToDenom = mul_(mul_(vars.collateralFactor, vars.exchangeRate), vars.oraclePrice);
      }
      {
        // Exclude the asset-to-be-borrowed from the liquidity, except for when redeeming
        vars.assetAsCollateralValueCap = asComptrollerExtension().getAssetAsCollateralValueCap(
          vars.asset,
          cTokenModify,
          redeemTokens > 0,
          account
        );

        // accumulate the collateral value to sumCollateral
        uint256 assetCollateralValue = mul_ScalarTruncate(vars.tokensToDenom, vars.cTokenBalance);
        if (assetCollateralValue > vars.assetAsCollateralValueCap)
          assetCollateralValue = vars.assetAsCollateralValueCap;
        vars.sumCollateral += assetCollateralValue;
      }

      // sumBorrowPlusEffects += oraclePrice * borrowBalance
      vars.sumBorrowPlusEffects = mul_ScalarTruncateAddUInt(
        vars.oraclePrice,
        vars.borrowBalance,
        vars.sumBorrowPlusEffects
      );

      // Calculate effects of interacting with cTokenModify
      if (vars.asset == cTokenModify) {
        // redeem effect
        // sumBorrowPlusEffects += tokensToDenom * redeemTokens
        vars.sumBorrowPlusEffects = mul_ScalarTruncateAddUInt(
          vars.tokensToDenom,
          redeemTokens,
          vars.sumBorrowPlusEffects
        );

        // borrow effect
        // sumBorrowPlusEffects += oraclePrice * borrowAmount
        vars.sumBorrowPlusEffects = mul_ScalarTruncateAddUInt(
          vars.oraclePrice,
          borrowAmount,
          vars.sumBorrowPlusEffects
        );

        uint256 repayEffect = mul_ScalarTruncate(vars.oraclePrice, repayAmount);
        if (repayEffect >= vars.sumBorrowPlusEffects) {
          vars.sumBorrowPlusEffects = 0;
        } else {
          vars.sumBorrowPlusEffects -= repayEffect;
        }
      }
    }

    // These are safe, as the underflow condition is checked first
    if (vars.sumCollateral > vars.sumBorrowPlusEffects) {
      return (Error.NO_ERROR, vars.sumCollateral, vars.sumCollateral - vars.sumBorrowPlusEffects, 0);
    } else {
      return (Error.NO_ERROR, vars.sumCollateral, 0, vars.sumBorrowPlusEffects - vars.sumCollateral);
    }
  }

  /**
   * @notice Calculate number of tokens of collateral asset to seize given an underlying amount
   * @dev Used in liquidation (called in cToken.liquidateBorrowFresh)
   * @param cTokenBorrowed The address of the borrowed cToken
   * @param cTokenCollateral The address of the collateral cToken
   * @param actualRepayAmount The amount of cTokenBorrowed underlying to convert into cTokenCollateral tokens
   * @return (errorCode, number of cTokenCollateral tokens to be seized in a liquidation)
   */
  function liquidateCalculateSeizeTokens(
    address cTokenBorrowed,
    address cTokenCollateral,
    uint256 actualRepayAmount
  ) external view override returns (uint256, uint256) {
    /* Read oracle prices for borrowed and collateral markets */
    uint256 priceBorrowedMantissa = oracle.getUnderlyingPrice(ICErc20(cTokenBorrowed));
    uint256 priceCollateralMantissa = oracle.getUnderlyingPrice(ICErc20(cTokenCollateral));
    if (priceBorrowedMantissa == 0 || priceCollateralMantissa == 0) {
      return (uint256(Error.PRICE_ERROR), 0);
    }

    /*
     * Get the exchange rate and calculate the number of collateral tokens to seize:
     *  seizeAmount = actualRepayAmount * liquidationIncentive * priceBorrowed / priceCollateral
     *  seizeTokens = seizeAmount / exchangeRate
     *   = actualRepayAmount * (liquidationIncentive * priceBorrowed) / (priceCollateral * exchangeRate)
     */
    ICErc20 collateralCToken = ICErc20(cTokenCollateral);
    uint256 exchangeRateMantissa = collateralCToken.exchangeRateCurrent();
    uint256 seizeTokens;
    Exp memory numerator;
    Exp memory denominator;
    Exp memory ratio;

    uint256 protocolSeizeShareMantissa = collateralCToken.protocolSeizeShareMantissa();
    uint256 feeSeizeShareMantissa = collateralCToken.feeSeizeShareMantissa();

    /*
     * The liquidation penalty includes
     * - the liquidator incentive
     * - the protocol fees (Ionic admin fees)
     * - the market fee
     */
    Exp memory totalPenaltyMantissa = add_(
      add_(Exp({ mantissa: liquidationIncentiveMantissa }), Exp({ mantissa: protocolSeizeShareMantissa })),
      Exp({ mantissa: feeSeizeShareMantissa })
    );

    numerator = mul_(totalPenaltyMantissa, Exp({ mantissa: priceBorrowedMantissa }));
    denominator = mul_(Exp({ mantissa: priceCollateralMantissa }), Exp({ mantissa: exchangeRateMantissa }));
    ratio = div_(numerator, denominator);

    seizeTokens = mul_ScalarTruncate(ratio, actualRepayAmount);
    return (uint256(Error.NO_ERROR), seizeTokens);
  }

  /*** Admin Functions ***/

  /**
   * @notice Add a RewardsDistributor contracts.
   * @dev Admin function to add a RewardsDistributor contract
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function _addRewardsDistributor(address distributor) external returns (uint256) {
    require(hasAdminRights(), "!admin");

    // Check marker method
    require(IIonicFlywheel(distributor).isRewardsDistributor(), "!isRewardsDistributor");

    // Check for existing RewardsDistributor
    for (uint256 i = 0; i < rewardsDistributors.length; i++) require(distributor != rewardsDistributors[i], "!added");

    // Add RewardsDistributor to array
    rewardsDistributors.push(distributor);
    emit AddedRewardsDistributor(distributor);

    return uint256(Error.NO_ERROR);
  }

  /**
   * @notice Sets the whitelist enforcement for the comptroller
   * @dev Admin function to set a new whitelist enforcement boolean
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function _setWhitelistEnforcement(bool enforce) external returns (uint256) {
    // Check caller is admin
    if (!hasAdminRights()) {
      return fail(Error.UNAUTHORIZED, FailureInfo.SET_WHITELIST_ENFORCEMENT_OWNER_CHECK);
    }

    // Check if `enforceWhitelist` already equals `enforce`
    if (enforceWhitelist == enforce) {
      return uint256(Error.NO_ERROR);
    }

    // Set comptroller's `enforceWhitelist` to `enforce`
    enforceWhitelist = enforce;

    // Emit WhitelistEnforcementChanged(bool enforce);
    emit WhitelistEnforcementChanged(enforce);

    return uint256(Error.NO_ERROR);
  }

  /**
   * @notice Sets the whitelist `statuses` for `suppliers`
   * @dev Admin function to set the whitelist `statuses` for `suppliers`
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function _setWhitelistStatuses(address[] calldata suppliers, bool[] calldata statuses) external returns (uint256) {
    // Check caller is admin
    if (!hasAdminRights()) {
      return fail(Error.UNAUTHORIZED, FailureInfo.SET_WHITELIST_STATUS_OWNER_CHECK);
    }

    // Set whitelist statuses for suppliers
    for (uint256 i = 0; i < suppliers.length; i++) {
      address supplier = suppliers[i];

      if (statuses[i]) {
        // If not already whitelisted, add to whitelist
        if (!whitelist[supplier]) {
          whitelist[supplier] = true;
          whitelistArray.push(supplier);
          whitelistIndexes[supplier] = whitelistArray.length - 1;
        }
      } else {
        // If whitelisted, remove from whitelist
        if (whitelist[supplier]) {
          whitelistArray[whitelistIndexes[supplier]] = whitelistArray[whitelistArray.length - 1]; // Copy last item in list to location of item to be removed
          whitelistArray.pop(); // Reduce length by 1
          whitelistIndexes[whitelistArray[whitelistIndexes[supplier]]] = whitelistIndexes[supplier]; // Set whitelist index of moved item to correct index
          whitelistIndexes[supplier] = 0; // Reset supplier whitelist index to 0 for a gas refund
          whitelist[supplier] = false; // Tell the contract that the supplier is no longer whitelisted
        }
      }
    }

    return uint256(Error.NO_ERROR);
  }

  /**
   * @notice Sets a new price oracle for the comptroller
   * @dev Admin function to set a new price oracle
   * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
   */
  function _setPriceOracle(BasePriceOracle newOracle) public returns (uint256) {
    // Check caller is admin
    if (!hasAdminRights()) {
      return fail(Error.UNAUTHORIZED, FailureInfo.SET_PRICE_ORACLE_OWNER_CHECK);
    }

    // Track the old oracle for the comptroller
    BasePriceOracle oldOracle = oracle;

    // Set comptroller's oracle to newOracle
    oracle = newOracle;

    // Emit NewPriceOracle(oldOracle, newOracle)
    emit NewPriceOracle(oldOracle, newOracle);

    return uint256(Error.NO_ERROR);
  }

  /**
   * @notice Sets the closeFactor used when liquidating borrows
   * @dev Admin function to set closeFactor
   * @param newCloseFactorMantissa New close factor, scaled by 1e18
   * @return uint 0=success, otherwise a failure. (See ErrorReporter for details)
   */
  function _setCloseFactor(uint256 newCloseFactorMantissa) external returns (uint256) {
    // Check caller is admin
    if (!hasAdminRights()) {
      return fail(Error.UNAUTHORIZED, FailureInfo.SET_CLOSE_FACTOR_OWNER_CHECK);
    }

    // Check limits
    Exp memory newCloseFactorExp = Exp({ mantissa: newCloseFactorMantissa });
    Exp memory lowLimit = Exp({ mantissa: closeFactorMinMantissa });
    if (lessThanOrEqualExp(newCloseFactorExp, lowLimit)) {
      return fail(Error.INVALID_CLOSE_FACTOR, FailureInfo.SET_CLOSE_FACTOR_VALIDATION);
    }

    Exp memory highLimit = Exp({ mantissa: closeFactorMaxMantissa });
    if (lessThanExp(highLimit, newCloseFactorExp)) {
      return fail(Error.INVALID_CLOSE_FACTOR, FailureInfo.SET_CLOSE_FACTOR_VALIDATION);
    }

    // Set pool close factor to new close factor, remember old value
    uint256 oldCloseFactorMantissa = closeFactorMantissa;
    closeFactorMantissa = newCloseFactorMantissa;

    // Emit event
    emit NewCloseFactor(oldCloseFactorMantissa, closeFactorMantissa);

    return uint256(Error.NO_ERROR);
  }

  /**
   * @notice Sets the collateralFactor for a market
   * @dev Admin function to set per-market collateralFactor
   * @param cToken The market to set the factor on
   * @param newCollateralFactorMantissa The new collateral factor, scaled by 1e18
   * @return uint 0=success, otherwise a failure. (See ErrorReporter for details)
   */
  function _setCollateralFactor(ICErc20 cToken, uint256 newCollateralFactorMantissa) public returns (uint256) {
    // Check caller is admin
    if (!hasAdminRights()) {
      return fail(Error.UNAUTHORIZED, FailureInfo.SET_COLLATERAL_FACTOR_OWNER_CHECK);
    }

    // Verify market is listed
    Market storage market = markets[address(cToken)];
    if (!market.isListed) {
      return fail(Error.MARKET_NOT_LISTED, FailureInfo.SET_COLLATERAL_FACTOR_NO_EXISTS);
    }

    Exp memory newCollateralFactorExp = Exp({ mantissa: newCollateralFactorMantissa });

    // Check collateral factor <= 0.9
    Exp memory highLimit = Exp({ mantissa: collateralFactorMaxMantissa });
    if (lessThanExp(highLimit, newCollateralFactorExp)) {
      return fail(Error.INVALID_COLLATERAL_FACTOR, FailureInfo.SET_COLLATERAL_FACTOR_VALIDATION);
    }

    // If collateral factor != 0, fail if price == 0
    if (newCollateralFactorMantissa != 0 && oracle.getUnderlyingPrice(cToken) == 0) {
      return fail(Error.PRICE_ERROR, FailureInfo.SET_COLLATERAL_FACTOR_WITHOUT_PRICE);
    }

    // Set market's collateral factor to new collateral factor, remember old value
    uint256 oldCollateralFactorMantissa = market.collateralFactorMantissa;
    market.collateralFactorMantissa = newCollateralFactorMantissa;

    // Emit event with asset, old collateral factor, and new collateral factor
    emit NewCollateralFactor(cToken, oldCollateralFactorMantissa, newCollateralFactorMantissa);

    return uint256(Error.NO_ERROR);
  }

  /**
   * @notice Sets liquidationIncentive
   * @dev Admin function to set liquidationIncentive
   * @param newLiquidationIncentiveMantissa New liquidationIncentive scaled by 1e18
   * @return uint 0=success, otherwise a failure. (See ErrorReporter for details)
   */
  function _setLiquidationIncentive(uint256 newLiquidationIncentiveMantissa) external returns (uint256) {
    // Check caller is admin
    if (!hasAdminRights()) {
      return fail(Error.UNAUTHORIZED, FailureInfo.SET_LIQUIDATION_INCENTIVE_OWNER_CHECK);
    }

    // Check de-scaled min <= newLiquidationIncentive <= max
    Exp memory newLiquidationIncentive = Exp({ mantissa: newLiquidationIncentiveMantissa });
    Exp memory minLiquidationIncentive = Exp({ mantissa: liquidationIncentiveMinMantissa });
    if (lessThanExp(newLiquidationIncentive, minLiquidationIncentive)) {
      return fail(Error.INVALID_LIQUIDATION_INCENTIVE, FailureInfo.SET_LIQUIDATION_INCENTIVE_VALIDATION);
    }

    Exp memory maxLiquidationIncentive = Exp({ mantissa: liquidationIncentiveMaxMantissa });
    if (lessThanExp(maxLiquidationIncentive, newLiquidationIncentive)) {
      return fail(Error.INVALID_LIQUIDATION_INCENTIVE, FailureInfo.SET_LIQUIDATION_INCENTIVE_VALIDATION);
    }

    // Save current value for use in log
    uint256 oldLiquidationIncentiveMantissa = liquidationIncentiveMantissa;

    // Set liquidation incentive to new incentive
    liquidationIncentiveMantissa = newLiquidationIncentiveMantissa;

    // Emit event with old incentive, new incentive
    emit NewLiquidationIncentive(oldLiquidationIncentiveMantissa, newLiquidationIncentiveMantissa);

    return uint256(Error.NO_ERROR);
  }

  /**
   * @notice Add the market to the markets mapping and set it as listed
   * @dev Admin function to set isListed and add support for the market
   * @param cToken The address of the market (token) to list
   * @return uint 0=success, otherwise a failure. (See enum Error for details)
   */
  function _supportMarket(ICErc20 cToken) internal returns (uint256) {
    // Check caller is admin
    if (!hasAdminRights()) {
      return fail(Error.UNAUTHORIZED, FailureInfo.SUPPORT_MARKET_OWNER_CHECK);
    }

    // Is market already listed?
    if (markets[address(cToken)].isListed) {
      return fail(Error.MARKET_ALREADY_LISTED, FailureInfo.SUPPORT_MARKET_EXISTS);
    }

    // Check cToken.comptroller == this
    require(address(cToken.comptroller()) == address(this), "!comptroller");

    // Make sure market is not already listed
    address underlying = ICErc20(address(cToken)).underlying();

    if (address(cTokensByUnderlying[underlying]) != address(0)) {
      return fail(Error.MARKET_ALREADY_LISTED, FailureInfo.SUPPORT_MARKET_EXISTS);
    }

    // List market and emit event
    Market storage market = markets[address(cToken)];
    market.isListed = true;
    market.collateralFactorMantissa = 0;
    allMarkets.push(cToken);
    cTokensByUnderlying[underlying] = cToken;
    emit MarketListed(cToken);

    return uint256(Error.NO_ERROR);
  }

  /**
   * @notice Deploy cToken, add the market to the markets mapping, and set it as listed and set the collateral factor
   * @dev Admin function to deploy cToken, set isListed, and add support for the market and set the collateral factor
   * @return uint 0=success, otherwise a failure. (See enum Error for details)
   */
  function _deployMarket(
    uint8 delegateType,
    bytes calldata constructorData,
    bytes calldata becomeImplData,
    uint256 collateralFactorMantissa
  ) external returns (uint256) {
    // Check caller is admin
    if (!hasAdminRights()) {
      return fail(Error.UNAUTHORIZED, FailureInfo.SUPPORT_MARKET_OWNER_CHECK);
    }

    // Temporarily enable Ionic admin rights for asset deployment (storing the original value)
    bool oldIonicAdminHasRights = ionicAdminHasRights;
    ionicAdminHasRights = true;

    // Deploy via Ionic admin
    ICErc20 cToken = ICErc20(IFeeDistributor(ionicAdmin).deployCErc20(delegateType, constructorData, becomeImplData));
    // Reset Ionic admin rights to the original value
    ionicAdminHasRights = oldIonicAdminHasRights;
    // Support market here in the Comptroller
    uint256 err = _supportMarket(cToken);

    IFeeDistributor(ionicAdmin).authoritiesRegistry().reconfigureAuthority(address(this));

    // Set collateral factor
    return err == uint256(Error.NO_ERROR) ? _setCollateralFactor(cToken, collateralFactorMantissa) : err;
  }

  function _becomeImplementation() external {
    require(msg.sender == address(this), "!self call");

    if (!_notEnteredInitialized) {
      _notEntered = true;
      _notEnteredInitialized = true;
    }
  }

  /*** Helper Functions ***/

  /**
   * @notice Returns true if the given cToken market has been deprecated
   * @dev All borrows in a deprecated cToken market can be immediately liquidated
   * @param cToken The market to check if deprecated
   */
  function isDeprecated(ICErc20 cToken) public view returns (bool) {
    return
      markets[address(cToken)].collateralFactorMantissa == 0 &&
      borrowGuardianPaused[address(cToken)] == true &&
      add_(add_(cToken.reserveFactorMantissa(), cToken.adminFeeMantissa()), cToken.ionicFeeMantissa()) == 1e18;
  }

  function asComptrollerExtension() internal view returns (ComptrollerExtensionInterface) {
    return ComptrollerExtensionInterface(address(this));
  }

  function _getExtensionFunctions() external pure virtual override returns (bytes4[] memory functionSelectors) {
    uint8 fnsCount = 32;

    functionSelectors = new bytes4[](fnsCount);

    functionSelectors[--fnsCount] = this.isDeprecated.selector;
    functionSelectors[--fnsCount] = this._deployMarket.selector;
    functionSelectors[--fnsCount] = this.getAssetsIn.selector;
    functionSelectors[--fnsCount] = this.checkMembership.selector;
    functionSelectors[--fnsCount] = this._setPriceOracle.selector;
    functionSelectors[--fnsCount] = this._setCloseFactor.selector;
    functionSelectors[--fnsCount] = this._setCollateralFactor.selector;
    functionSelectors[--fnsCount] = this._setLiquidationIncentive.selector;
    functionSelectors[--fnsCount] = this._setWhitelistEnforcement.selector;
    functionSelectors[--fnsCount] = this._setWhitelistStatuses.selector;
    functionSelectors[--fnsCount] = this._addRewardsDistributor.selector;
    functionSelectors[--fnsCount] = this.getHypotheticalAccountLiquidity.selector;
    functionSelectors[--fnsCount] = this.getMaxRedeemOrBorrow.selector;
    functionSelectors[--fnsCount] = this.enterMarkets.selector;
    functionSelectors[--fnsCount] = this.exitMarket.selector;
    functionSelectors[--fnsCount] = this.mintAllowed.selector;
    functionSelectors[--fnsCount] = this.redeemAllowed.selector;
    functionSelectors[--fnsCount] = this.redeemVerify.selector;
    functionSelectors[--fnsCount] = this.borrowAllowed.selector;
    functionSelectors[--fnsCount] = this.borrowWithinLimits.selector;
    functionSelectors[--fnsCount] = this.repayBorrowAllowed.selector;
    functionSelectors[--fnsCount] = this.liquidateBorrowAllowed.selector;
    functionSelectors[--fnsCount] = this.seizeAllowed.selector;
    functionSelectors[--fnsCount] = this.transferAllowed.selector;
    functionSelectors[--fnsCount] = this.mintVerify.selector;
    functionSelectors[--fnsCount] = this.getAccountLiquidity.selector;
    functionSelectors[--fnsCount] = this.liquidateCalculateSeizeTokens.selector;
    functionSelectors[--fnsCount] = this._beforeNonReentrant.selector;
    functionSelectors[--fnsCount] = this._afterNonReentrant.selector;
    functionSelectors[--fnsCount] = this._becomeImplementation.selector;
    functionSelectors[--fnsCount] = this.effectiveSupplyCaps.selector;
    functionSelectors[--fnsCount] = this.effectiveBorrowCaps.selector;

    require(fnsCount == 0, "use the correct array length");
  }

  /*** Pool-Wide/Cross-Asset Reentrancy Prevention ***/

  /**
   * @dev Called by cTokens before a non-reentrant function for pool-wide reentrancy prevention.
   * Prevents pool-wide/cross-asset reentrancy exploits like AMP on Cream.
   */
  function _beforeNonReentrant() external override {
    require(markets[msg.sender].isListed, "!Comptroller:_beforeNonReentrant");
    require(_notEntered, "!reentered");
    _notEntered = false;
  }

  /**
   * @dev Called by cTokens after a non-reentrant function for pool-wide reentrancy prevention.
   * Prevents pool-wide/cross-asset reentrancy exploits like AMP on Cream.
   */
  function _afterNonReentrant() external override {
    require(markets[msg.sender].isListed, "!Comptroller:_afterNonReentrant");
    _notEntered = true; // get a gas-refund post-Istanbul
  }
}
