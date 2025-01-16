// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin-contracts-upgradeable/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";

import { IonicComptroller } from "./compound/ComptrollerInterface.sol";
import { BasePriceOracle } from "./oracles/BasePriceOracle.sol";
import { ICErc20 } from "./compound/CTokenInterfaces.sol";

import { PoolDirectory } from "./PoolDirectory.sol";
import { MasterPriceOracle } from "./oracles/MasterPriceOracle.sol";

/**
 * @title PoolLens
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 * @notice PoolLens returns data on Ionic interest rate pools in mass for viewing by dApps, bots, etc.
 */
contract PoolLens is Initializable {
  error ComptrollerError(uint256 errCode);

  /**
   * @notice Initialize the `PoolDirectory` contract object.
   * @param _directory The PoolDirectory
   * @param _name Name for the nativeToken
   * @param _symbol Symbol for the nativeToken
   * @param _hardcodedAddresses Underlying token addresses for a token like maker which are DSToken and/or use bytes32 for `symbol`
   * @param _hardcodedNames Harcoded name for these tokens
   * @param _hardcodedSymbols Harcoded symbol for these tokens
   * @param _uniswapLPTokenNames Harcoded names for underlying uniswap LpToken
   * @param _uniswapLPTokenSymbols Harcoded symbols for underlying uniswap LpToken
   * @param _uniswapLPTokenDisplayNames Harcoded display names for underlying uniswap LpToken
   */
  function initialize(
    PoolDirectory _directory,
    string memory _name,
    string memory _symbol,
    address[] memory _hardcodedAddresses,
    string[] memory _hardcodedNames,
    string[] memory _hardcodedSymbols,
    string[] memory _uniswapLPTokenNames,
    string[] memory _uniswapLPTokenSymbols,
    string[] memory _uniswapLPTokenDisplayNames
  ) public initializer {
    require(address(_directory) != address(0), "PoolDirectory instance cannot be the zero address.");
    require(
      _hardcodedAddresses.length == _hardcodedNames.length && _hardcodedAddresses.length == _hardcodedSymbols.length,
      "Hardcoded addresses lengths not equal."
    );
    require(
      _uniswapLPTokenNames.length == _uniswapLPTokenSymbols.length &&
        _uniswapLPTokenNames.length == _uniswapLPTokenDisplayNames.length,
      "Uniswap LP token names lengths not equal."
    );

    directory = _directory;
    name = _name;
    symbol = _symbol;
    for (uint256 i = 0; i < _hardcodedAddresses.length; i++) {
      hardcoded[_hardcodedAddresses[i]] = TokenData({ name: _hardcodedNames[i], symbol: _hardcodedSymbols[i] });
    }

    for (uint256 i = 0; i < _uniswapLPTokenNames.length; i++) {
      uniswapData.push(
        UniswapData({
          name: _uniswapLPTokenNames[i],
          symbol: _uniswapLPTokenSymbols[i],
          displayName: _uniswapLPTokenDisplayNames[i]
        })
      );
    }
  }

  string public name;
  string public symbol;

  struct TokenData {
    string name;
    string symbol;
  }
  mapping(address => TokenData) hardcoded;

  struct UniswapData {
    string name; // ie "Uniswap V2" or "SushiSwap LP Token"
    string symbol; // ie "UNI-V2" or "SLP"
    string displayName; // ie "SushiSwap" or "Uniswap"
  }
  UniswapData[] uniswapData;

  /**
   * @notice `PoolDirectory` contract object.
   */
  PoolDirectory public directory;

  /**
   * @dev Struct for Ionic pool summary data.
   */
  struct IonicPoolData {
    uint256 totalSupply;
    uint256 totalBorrow;
    address[] underlyingTokens;
    string[] underlyingSymbols;
    bool whitelistedAdmin;
  }

  /**
   * @notice Returns arrays of all public Ionic pool indexes, data, total supply balances (in ETH), total borrow balances (in ETH), arrays of underlying token addresses, arrays of underlying asset symbols, and booleans indicating if retrieving each pool's data failed.
   * @dev This function is not designed to be called in a transaction: it is too gas-intensive.
   * Ideally, we can add the `view` modifier, but many cToken functions potentially modify the state.
   */
  function getPublicPoolsWithData()
    external
    returns (uint256[] memory, PoolDirectory.Pool[] memory, IonicPoolData[] memory, bool[] memory)
  {
    (uint256[] memory indexes, PoolDirectory.Pool[] memory publicPools) = directory.getPublicPools();
    (IonicPoolData[] memory data, bool[] memory errored) = getPoolsData(publicPools);
    return (indexes, publicPools, data, errored);
  }

  /**
   * @notice Returns arrays of all whitelisted public Ionic pool indexes, data, total supply balances (in ETH), total borrow balances (in ETH), arrays of underlying token addresses, arrays of underlying asset symbols, and booleans indicating if retrieving each pool's data failed.
   * @dev This function is not designed to be called in a transaction: it is too gas-intensive.
   * Ideally, we can add the `view` modifier, but many cToken functions potentially modify the state.
   */
  function getPublicPoolsByVerificationWithData(
    bool whitelistedAdmin
  ) external returns (uint256[] memory, PoolDirectory.Pool[] memory, IonicPoolData[] memory, bool[] memory) {
    (uint256[] memory indexes, PoolDirectory.Pool[] memory publicPools) = directory.getPublicPoolsByVerification(
      whitelistedAdmin
    );
    (IonicPoolData[] memory data, bool[] memory errored) = getPoolsData(publicPools);
    return (indexes, publicPools, data, errored);
  }

  /**
   * @notice Returns arrays of the indexes of Ionic pools created by `account`, data, total supply balances (in ETH), total borrow balances (in ETH), arrays of underlying token addresses, arrays of underlying asset symbols, and booleans indicating if retrieving each pool's data failed.
   * @dev This function is not designed to be called in a transaction: it is too gas-intensive.
   * Ideally, we can add the `view` modifier, but many cToken functions potentially modify the state.
   */
  function getPoolsByAccountWithData(
    address account
  ) external returns (uint256[] memory, PoolDirectory.Pool[] memory, IonicPoolData[] memory, bool[] memory) {
    (uint256[] memory indexes, PoolDirectory.Pool[] memory accountPools) = directory.getPoolsByAccount(account);
    (IonicPoolData[] memory data, bool[] memory errored) = getPoolsData(accountPools);
    return (indexes, accountPools, data, errored);
  }

  /**
   * @notice Returns arrays of the indexes of Ionic pools used by `user`, data, total supply balances (in ETH), total borrow balances (in ETH), arrays of underlying token addresses, arrays of underlying asset symbols, and booleans indicating if retrieving each pool's data failed.
   * @dev This function is not designed to be called in a transaction: it is too gas-intensive.
   * Ideally, we can add the `view` modifier, but many cToken functions potentially modify the state.
   */
  function getPoolsOIonicrWithData(
    address user
  ) external returns (uint256[] memory, PoolDirectory.Pool[] memory, IonicPoolData[] memory, bool[] memory) {
    (uint256[] memory indexes, PoolDirectory.Pool[] memory userPools) = directory.getPoolsOfUser(user);
    (IonicPoolData[] memory data, bool[] memory errored) = getPoolsData(userPools);
    return (indexes, userPools, data, errored);
  }

  /**
   * @notice Internal function returning arrays of requested Ionic pool indexes, data, total supply balances (in ETH), total borrow balances (in ETH), arrays of underlying token addresses, arrays of underlying asset symbols, and booleans indicating if retrieving each pool's data failed.
   * @dev This function is not designed to be called in a transaction: it is too gas-intensive.
   * Ideally, we can add the `view` modifier, but many cToken functions potentially modify the state.
   */
  function getPoolsData(PoolDirectory.Pool[] memory pools) internal returns (IonicPoolData[] memory, bool[] memory) {
    IonicPoolData[] memory data = new IonicPoolData[](pools.length);
    bool[] memory errored = new bool[](pools.length);

    for (uint256 i = 0; i < pools.length; i++) {
      try this.getPoolSummary(IonicComptroller(pools[i].comptroller)) returns (
        uint256 _totalSupply,
        uint256 _totalBorrow,
        address[] memory _underlyingTokens,
        string[] memory _underlyingSymbols,
        bool _whitelistedAdmin
      ) {
        data[i] = IonicPoolData(_totalSupply, _totalBorrow, _underlyingTokens, _underlyingSymbols, _whitelistedAdmin);
      } catch {
        errored[i] = true;
      }
    }

    return (data, errored);
  }

  /**
   * @notice Returns total supply balance (in ETH), total borrow balance (in ETH), underlying token addresses, and underlying token symbols of a Ionic pool.
   */
  function getPoolSummary(
    IonicComptroller comptroller
  ) external returns (uint256, uint256, address[] memory, string[] memory, bool) {
    uint256 totalBorrow = 0;
    uint256 totalSupply = 0;
    ICErc20[] memory cTokens = comptroller.getAllMarkets();
    address[] memory underlyingTokens = new address[](cTokens.length);
    string[] memory underlyingSymbols = new string[](cTokens.length);
    BasePriceOracle oracle = comptroller.oracle();

    for (uint256 i = 0; i < cTokens.length; i++) {
      ICErc20 cToken = cTokens[i];
      (bool isListed, ) = comptroller.markets(address(cToken));
      if (!isListed) continue;
      cToken.accrueInterest();
      uint256 assetTotalBorrow = cToken.totalBorrowsCurrent();
      uint256 assetTotalSupply = cToken.getCash() +
        assetTotalBorrow -
        (cToken.totalReserves() + cToken.totalAdminFees() + cToken.totalIonicFees());
      uint256 underlyingPrice = oracle.getUnderlyingPrice(cToken);
      totalBorrow = totalBorrow + (assetTotalBorrow * underlyingPrice) / 1e18;
      totalSupply = totalSupply + (assetTotalSupply * underlyingPrice) / 1e18;

      underlyingTokens[i] = ICErc20(address(cToken)).underlying();
      (, underlyingSymbols[i]) = getTokenNameAndSymbol(underlyingTokens[i]);
    }

    bool whitelistedAdmin = directory.adminWhitelist(comptroller.admin());
    return (totalSupply, totalBorrow, underlyingTokens, underlyingSymbols, whitelistedAdmin);
  }

  /**
   * @dev Struct for a Ionic pool asset.
   */
  struct PoolAsset {
    address cToken;
    address underlyingToken;
    string underlyingName;
    string underlyingSymbol;
    uint256 underlyingDecimals;
    uint256 underlyingBalance;
    uint256 supplyRatePerBlock;
    uint256 borrowRatePerBlock;
    uint256 totalSupply;
    uint256 totalBorrow;
    uint256 supplyBalance;
    uint256 borrowBalance;
    uint256 liquidity;
    bool membership;
    uint256 exchangeRate; // Price of cTokens in terms of underlying tokens
    uint256 underlyingPrice; // Price of underlying tokens in ETH (scaled by 1e18)
    address oracle;
    uint256 collateralFactor;
    uint256 reserveFactor;
    uint256 adminFee;
    uint256 ionicFee;
    bool borrowGuardianPaused;
    bool mintGuardianPaused;
  }

  /**
   * @notice Returns data on the specified assets of the specified Ionic pool.
   * @dev This function is not designed to be called in a transaction: it is too gas-intensive.
   * Ideally, we can add the `view` modifier, but many cToken functions potentially modify the state.
   * @param comptroller The Comptroller proxy contract address of the Ionic pool.
   * @param cTokens The cToken contract addresses of the assets to query.
   * @param user The user for which to get account data.
   * @return An array of Ionic pool assets.
   */
  function getPoolAssetsWithData(
    IonicComptroller comptroller,
    ICErc20[] memory cTokens,
    address user
  ) internal returns (PoolAsset[] memory) {
    uint256 arrayLength = 0;

    for (uint256 i = 0; i < cTokens.length; i++) {
      (bool isListed, ) = comptroller.markets(address(cTokens[i]));
      if (isListed) arrayLength++;
    }

    PoolAsset[] memory detailedAssets = new PoolAsset[](arrayLength);
    uint256 index = 0;
    BasePriceOracle oracle = BasePriceOracle(address(comptroller.oracle()));

    for (uint256 i = 0; i < cTokens.length; i++) {
      // Check if market is listed and get collateral factor
      (bool isListed, uint256 collateralFactorMantissa) = comptroller.markets(address(cTokens[i]));
      if (!isListed) continue;

      // Start adding data to PoolAsset
      PoolAsset memory asset;
      ICErc20 cToken = cTokens[i];
      asset.cToken = address(cToken);

      cToken.accrueInterest();

      // Get underlying asset data
      asset.underlyingToken = ICErc20(address(cToken)).underlying();
      ERC20Upgradeable underlying = ERC20Upgradeable(asset.underlyingToken);
      (asset.underlyingName, asset.underlyingSymbol) = getTokenNameAndSymbol(asset.underlyingToken);
      asset.underlyingDecimals = underlying.decimals();
      asset.underlyingBalance = underlying.balanceOf(user);

      // Get cToken data
      asset.supplyRatePerBlock = cToken.supplyRatePerBlock();
      asset.borrowRatePerBlock = cToken.borrowRatePerBlock();
      asset.liquidity = cToken.getCash();
      asset.totalBorrow = cToken.totalBorrowsCurrent();
      asset.totalSupply =
        asset.liquidity +
        asset.totalBorrow -
        (cToken.totalReserves() + cToken.totalAdminFees() + cToken.totalIonicFees());
      asset.supplyBalance = cToken.balanceOfUnderlying(user);
      asset.borrowBalance = cToken.borrowBalanceCurrent(user);
      asset.membership = comptroller.checkMembership(user, cToken);
      asset.exchangeRate = cToken.exchangeRateCurrent(); // We would use exchangeRateCurrent but we already accrue interest above
      asset.underlyingPrice = oracle.price(asset.underlyingToken);

      // Get oracle for this cToken
      asset.oracle = address(oracle);

      try MasterPriceOracle(asset.oracle).oracles(asset.underlyingToken) returns (BasePriceOracle _oracle) {
        asset.oracle = address(_oracle);
      } catch {}

      // More cToken data
      asset.collateralFactor = collateralFactorMantissa;
      asset.reserveFactor = cToken.reserveFactorMantissa();
      asset.adminFee = cToken.adminFeeMantissa();
      asset.ionicFee = cToken.ionicFeeMantissa();
      asset.borrowGuardianPaused = comptroller.borrowGuardianPaused(address(cToken));
      asset.mintGuardianPaused = comptroller.mintGuardianPaused(address(cToken));

      // Add to assets array and increment index
      detailedAssets[index] = asset;
      index++;
    }

    return (detailedAssets);
  }

  function getBorrowCapsPerCollateral(
    ICErc20 borrowedAsset,
    IonicComptroller comptroller
  )
    internal
    view
    returns (
      address[] memory collateral,
      uint256[] memory borrowCapsAgainstCollateral,
      bool[] memory borrowingBlacklistedAgainstCollateral
    )
  {
    ICErc20[] memory poolMarkets = comptroller.getAllMarkets();

    collateral = new address[](poolMarkets.length);
    borrowCapsAgainstCollateral = new uint256[](poolMarkets.length);
    borrowingBlacklistedAgainstCollateral = new bool[](poolMarkets.length);

    for (uint256 i = 0; i < poolMarkets.length; i++) {
      address collateralAddress = address(poolMarkets[i]);
      if (collateralAddress != address(borrowedAsset)) {
        collateral[i] = collateralAddress;
        borrowCapsAgainstCollateral[i] = comptroller.borrowCapForCollateral(address(borrowedAsset), collateralAddress);
        borrowingBlacklistedAgainstCollateral[i] = comptroller.borrowingAgainstCollateralBlacklist(
          address(borrowedAsset),
          collateralAddress
        );
      }
    }
  }

  /**
   * @notice Returns the `name` and `symbol` of `token`.
   * Supports Uniswap V2 and SushiSwap LP tokens as well as MKR.
   * @param token An ERC20 token contract object.
   * @return The `name` and `symbol`.
   */
  function getTokenNameAndSymbol(address token) internal view returns (string memory, string memory) {
    // i.e. MKR is a DSToken and uses bytes32
    if (bytes(hardcoded[token].symbol).length != 0) {
      return (hardcoded[token].name, hardcoded[token].symbol);
    }

    // Get name and symbol from token contract
    ERC20Upgradeable tokenContract = ERC20Upgradeable(token);
    string memory _name = tokenContract.name();
    string memory _symbol = tokenContract.symbol();

    return (_name, _symbol);
  }

  /**
   * @notice Returns the assets of the specified Ionic pool.
   * @dev This function is not designed to be called in a transaction: it is too gas-intensive.
   * Ideally, we can add the `view` modifier, but many cToken functions potentially modify the state.
   * @param comptroller The Comptroller proxy contract of the Ionic pool.
   * @return An array of Ionic pool assets.
   */
  function getPoolAssetsWithData(IonicComptroller comptroller) external returns (PoolAsset[] memory) {
    return getPoolAssetsWithData(comptroller, comptroller.getAllMarkets(), msg.sender);
  }

  /**
   * @dev Struct for a Ionic pool user.
   */
  struct IonicPoolUser {
    address account;
    uint256 totalBorrow;
    uint256 totalCollateral;
    uint256 health;
  }

  /**
   * @notice Returns arrays of PoolAsset for a specific user
   * @dev This function is not designed to be called in a transaction: it is too gas-intensive.
   */
  function getPoolAssetsByUser(IonicComptroller comptroller, address user) public returns (PoolAsset[] memory) {
    PoolAsset[] memory assets = getPoolAssetsWithData(comptroller, comptroller.getAssetsIn(user), user);
    return assets;
  }

  /**
   * @notice returns the total supply cap for each asset in the pool
   * @dev This function is not designed to be called in a transaction: it is too gas-intensive.
   */
  function getSupplyCapsForPool(IonicComptroller comptroller) public view returns (address[] memory, uint256[] memory) {
    ICErc20[] memory poolMarkets = comptroller.getAllMarkets();

    address[] memory assets = new address[](poolMarkets.length);
    uint256[] memory supplyCapsPerAsset = new uint256[](poolMarkets.length);
    for (uint256 i = 0; i < poolMarkets.length; i++) {
      assets[i] = address(poolMarkets[i]);
      supplyCapsPerAsset[i] = comptroller.effectiveSupplyCaps(assets[i]);
    }

    return (assets, supplyCapsPerAsset);
  }

  /**
   * @notice returns the total supply cap for each asset in the pool and the total non-whitelist supplied assets
   * @dev This function is not designed to be called in a transaction: it is too gas-intensive.
   */
  function getSupplyCapsDataForPool(
    IonicComptroller comptroller
  ) public view returns (address[] memory, uint256[] memory, uint256[] memory) {
    ICErc20[] memory poolMarkets = comptroller.getAllMarkets();

    address[] memory assets = new address[](poolMarkets.length);
    uint256[] memory supplyCapsPerAsset = new uint256[](poolMarkets.length);
    uint256[] memory nonWhitelistedTotalSupply = new uint256[](poolMarkets.length);
    for (uint256 i = 0; i < poolMarkets.length; i++) {
      assets[i] = address(poolMarkets[i]);
      supplyCapsPerAsset[i] = comptroller.effectiveSupplyCaps(assets[i]);
      uint256 assetTotalSupplied = poolMarkets[i].getTotalUnderlyingSupplied();
      uint256 whitelistedSuppliersSupply = comptroller.getWhitelistedSuppliersSupply(assets[i]);
      if (whitelistedSuppliersSupply >= assetTotalSupplied) nonWhitelistedTotalSupply[i] = 0;
      else nonWhitelistedTotalSupply[i] = assetTotalSupplied - whitelistedSuppliersSupply;
    }

    return (assets, supplyCapsPerAsset, nonWhitelistedTotalSupply);
  }

  /**
   * @notice returns the total borrow cap and the per collateral borrowing cap/blacklist for the asset
   * @dev This function is not designed to be called in a transaction: it is too gas-intensive.
   */
  function getBorrowCapsForAsset(
    ICErc20 asset
  )
    public
    view
    returns (
      address[] memory collateral,
      uint256[] memory borrowCapsPerCollateral,
      bool[] memory collateralBlacklisted,
      uint256 totalBorrowCap
    )
  {
    IonicComptroller comptroller = IonicComptroller(asset.comptroller());
    (collateral, borrowCapsPerCollateral, collateralBlacklisted) = getBorrowCapsPerCollateral(asset, comptroller);
    totalBorrowCap = comptroller.effectiveBorrowCaps(address(asset));
  }

  /**
   * @notice returns the total borrow cap, the per collateral borrowing cap/blacklist for the asset and the total non-whitelist borrows
   * @dev This function is not designed to be called in a transaction: it is too gas-intensive.
   */
  function getBorrowCapsDataForAsset(
    ICErc20 asset
  )
    public
    view
    returns (
      address[] memory collateral,
      uint256[] memory borrowCapsPerCollateral,
      bool[] memory collateralBlacklisted,
      uint256 totalBorrowCap,
      uint256 nonWhitelistedTotalBorrows
    )
  {
    IonicComptroller comptroller = IonicComptroller(asset.comptroller());
    (collateral, borrowCapsPerCollateral, collateralBlacklisted) = getBorrowCapsPerCollateral(asset, comptroller);
    totalBorrowCap = comptroller.effectiveBorrowCaps(address(asset));
    uint256 totalBorrows = asset.totalBorrowsCurrent();
    uint256 whitelistedBorrowersBorrows = comptroller.getWhitelistedBorrowersBorrows(address(asset));
    if (whitelistedBorrowersBorrows >= totalBorrows) nonWhitelistedTotalBorrows = 0;
    else nonWhitelistedTotalBorrows = totalBorrows - whitelistedBorrowersBorrows;
  }

  /**
   * @notice Returns arrays of Ionic pool indexes and data with a whitelist containing `account`.
   * Note that the whitelist does not have to be enforced.
   * @dev This function is not designed to be called in a transaction: it is too gas-intensive.
   */
  function getWhitelistedPoolsByAccount(
    address account
  ) public view returns (uint256[] memory, PoolDirectory.Pool[] memory) {
    (, PoolDirectory.Pool[] memory pools) = directory.getActivePools();
    uint256 arrayLength = 0;

    for (uint256 i = 0; i < pools.length; i++) {
      IonicComptroller comptroller = IonicComptroller(pools[i].comptroller);

      if (comptroller.whitelist(account)) arrayLength++;
    }

    uint256[] memory indexes = new uint256[](arrayLength);
    PoolDirectory.Pool[] memory accountPools = new PoolDirectory.Pool[](arrayLength);
    uint256 index = 0;

    for (uint256 i = 0; i < pools.length; i++) {
      IonicComptroller comptroller = IonicComptroller(pools[i].comptroller);

      if (comptroller.whitelist(account)) {
        indexes[index] = i;
        accountPools[index] = pools[i];
        index++;
        break;
      }
    }

    return (indexes, accountPools);
  }

  /**
   * @notice Returns arrays of the indexes of Ionic pools with a whitelist containing `account`, data, total supply balances (in ETH), total borrow balances (in ETH), arrays of underlying token addresses, arrays of underlying asset symbols, and booleans indicating if retrieving each pool's data failed.
   * @dev This function is not designed to be called in a transaction: it is too gas-intensive.
   * Ideally, we can add the `view` modifier, but many cToken functions potentially modify the state.
   */
  function getWhitelistedPoolsByAccountWithData(
    address account
  ) external returns (uint256[] memory, PoolDirectory.Pool[] memory, IonicPoolData[] memory, bool[] memory) {
    (uint256[] memory indexes, PoolDirectory.Pool[] memory accountPools) = getWhitelistedPoolsByAccount(account);
    (IonicPoolData[] memory data, bool[] memory errored) = getPoolsData(accountPools);
    return (indexes, accountPools, data, errored);
  }

  function getHealthFactor(address user, IonicComptroller pool) external view returns (uint256) {
    return getHealthFactorHypothetical(pool, user, address(0), 0, 0, 0);
  }

  function getHealthFactorHypothetical(
    IonicComptroller pool,
    address account,
    address cTokenModify,
    uint256 redeemTokens,
    uint256 borrowAmount,
    uint256 repayAmount
  ) public view returns (uint256) {
    (uint256 err, uint256 collateralValue, uint256 liquidity, uint256 shortfall) = pool.getHypotheticalAccountLiquidity(
      account,
      cTokenModify,
      redeemTokens,
      borrowAmount,
      repayAmount
    );

    if (err != 0) revert ComptrollerError(err);

    if (shortfall > 0) {
      // HF < 1.0
      return (collateralValue * 1e18) / (collateralValue + shortfall);
    } else {
      // HF >= 1.0
      if (collateralValue <= liquidity) return type(uint256).max;
      else return (collateralValue * 1e18) / (collateralValue - liquidity);
    }
  }
}
