// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

import "../../external/compound/IPriceOracle.sol";
import "../../external/compound/ICErc20.sol";

import "../../external/synthetix/AddressResolver.sol";
import "../../external/synthetix/ExchangeRates.sol";
import "../../external/synthetix/ISynth.sol";
import "../../external/synthetix/MixinResolver.sol";
import "../../external/synthetix/Proxy.sol";

/**
 * @title SynthetixPriceOracle
 * @notice Returns prices for Synths from Synthetix's official `ExchangeRates` contract.
 * @dev Implements `PriceOracle`.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract SynthetixPriceOracle is IPriceOracle {
  /**
   * @notice Returns the price in ETH of the token underlying `cToken`.
   * @dev Implements the `PriceOracle` interface for Fuse pools (and Compound v2).
   * @return Price in ETH of the token underlying `cToken`, scaled by `10 ** (36 - underlyingDecimals)`.
   */
  function getUnderlyingPrice(ICToken cToken) external view override returns (uint256) {
    address underlying = ICErc20(address(cToken)).underlying();
    uint256 baseUnit = 10**uint256(ERC20Upgradeable(underlying).decimals());
    underlying = Proxy(underlying).target(); // For some reason we have to use the logic contract instead of the proxy contract to get `resolver` and `currencyKey`
    ExchangeRates exchangeRates = ExchangeRates(
      MixinResolver(underlying).resolver().requireAndGetAddress(
        "ExchangeRates",
        "Failed to get Synthetix's ExchangeRates contract address."
      )
    );
    return (exchangeRates.effectiveValue(ISynth(underlying).currencyKey(), baseUnit, "ETH") * 1e18) / baseUnit;
  }
}
