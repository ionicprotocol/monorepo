// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";

import "../../external/redstone/IRedstoneOracle.sol";
import "../BasePriceOracle.sol";

/**
 * @title RedstoneAdapterPriceOracle
 * @notice Returns prices from Redstone.
 * @dev Implements `BasePriceOracle`.
 * @author Veliko Minkov <v.minkov@dcvx.io> (https://github.com/vminkov)
 */
contract RedstoneAdapterPriceOracleWrsETH is BasePriceOracle {
  /**
   * @notice The Redstone oracle contract
   */
  IRedstoneOracle public REDSTONE_ORACLE;

  /**
   * @dev Constructor to set admin, wtoken address and native token USD price feed address
   * @param redstoneOracle The Redstone oracle contract address
   */
  constructor(address redstoneOracle) {
    REDSTONE_ORACLE = IRedstoneOracle(redstoneOracle);
  }

  /**
   * @notice Internal function returning the price in of `underlying`.
   * @dev will return a price denominated in the native token
   */
  function _price(address underlying) internal view returns (uint256) {
    // special case for wrsETH
    // if input is wrsETH, we need to get the price of rsETH
    if (underlying == 0xe7903B1F75C534Dd8159b313d92cDCfbC62cB3Cd) {
      underlying = 0x4186BFC76E2E237523CBC30FD220FE055156b41F;
    }
    uint256 priceInUsd = REDSTONE_ORACLE.priceOf(underlying);
    uint256 priceOfNativeInUsd = REDSTONE_ORACLE.priceOfETH();
    return (priceInUsd * 1e18) / priceOfNativeInUsd;
  }

  /**
   * @notice Returns the price in of `underlying` either in the
   * native token (implements `BasePriceOracle`).
   */
  function price(address underlying) external view override returns (uint256) {
    return _price(underlying);
  }

  /**
   * @notice Returns the price in WNATIVE of the token underlying `cToken`.
   * @dev Implements the `BasePriceOracle` interface for Ionic pools (and Compound v2).
   * @return Price in WNATIVE of the token underlying `cToken`, scaled by `10 ** (36 - underlyingDecimals)`.
   */
  function getUnderlyingPrice(ICErc20 cToken) external view override returns (uint256) {
    // Get underlying token address
    address underlying = cToken.underlying();

    uint256 oraclePrice = _price(underlying);

    uint256 underlyingDecimals = uint256(ERC20Upgradeable(underlying).decimals());
    return
      underlyingDecimals <= 18
        ? uint256(oraclePrice) * (10**(18 - underlyingDecimals))
        : uint256(oraclePrice) / (10**(underlyingDecimals - 18));
  }
}
