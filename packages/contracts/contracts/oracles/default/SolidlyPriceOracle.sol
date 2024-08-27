// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { BasePriceOracle } from "../BasePriceOracle.sol";
import { IPair } from "../../external/solidly/IPair.sol";
import { ICErc20 } from "../../compound/CTokenInterfaces.sol";
import { ERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";

import "../../ionic/SafeOwnableUpgradeable.sol";

/**
 * @title SolidlyOracle
 * @author Carlo Mazzaferro <carlo@midascapital.xyz> (https://github.com/carlomazzaferro)
 * @notice SolidlyOracle is a price oracle for Solidly-style pairs.
 * @dev Implements the `BasePriceOracle` interface used by Ionic pools (and Compound v2).
 */
contract SolidlyPriceOracle is BasePriceOracle, SafeOwnableUpgradeable {
  /**
   * @notice Maps ERC20 token addresses to UniswapV3Pool addresses.
   */
  mapping(address => AssetConfig) public poolFeeds;

  /**
   * @dev Controls if `admin` can overwrite existing assignments of oracles to underlying tokens.
   */
  bool public canAdminOverwrite;

  struct AssetConfig {
    address poolAddress;
    address baseToken;
  }

  address public WTOKEN;
  address[] public SUPPORTED_BASE_TOKENS;

  function initialize(address _wtoken, address[] memory _supportedBaseTokens) public initializer {
    __SafeOwnable_init(msg.sender);
    WTOKEN = _wtoken;
    SUPPORTED_BASE_TOKENS = _supportedBaseTokens;
  }

  /**
   * @dev Admin-only function to set price feeds.
   * @param underlyings Underlying token addresses for which to set price feeds.
   * @param assetConfig The asset configuration which includes pool address and twap window.
   */
  function setPoolFeeds(address[] memory underlyings, AssetConfig[] memory assetConfig) external onlyOwner {
    // Input validation
    require(
      underlyings.length > 0 && underlyings.length == assetConfig.length,
      "Lengths of both arrays must be equal and greater than 0."
    );

    // For each token/config
    for (uint256 i = 0; i < underlyings.length; i++) {
      address underlying = underlyings[i];
      // Set asset config for underlying
      require(
        assetConfig[i].baseToken == WTOKEN || _isBaseTokenSupported(assetConfig[i].baseToken),
        "Underlying token must be supported"
      );
      poolFeeds[underlying] = assetConfig[i];
    }
  }

  /**
   * @notice Get the token price price for an underlying token address.
   * @param underlying The underlying token address for which to get the price (set to zero address for WTOKEN)
   * @return Price denominated in NATIVE (scaled by 1e18)
   */
  function price(address underlying) external view returns (uint256) {
    return _price(underlying);
  }

  /**
   * @notice Returns the price in NATIVE of the token underlying `cToken`.
   * @dev Implements the `BasePriceOracle` interface for Ionic pools (and Compound v2).
   * @return Price in NATIVE of the token underlying `cToken`, scaled by `10 ** (36 - underlyingDecimals)`.
   */
  function getUnderlyingPrice(ICErc20 cToken) public view override returns (uint256) {
    address underlying = cToken.underlying();
    // Comptroller needs prices to be scaled by 1e(36 - decimals)
    // Since `_price` returns prices scaled by 18 decimals, we must scale them by 1e(36 - 18 - decimals)
    return (_price(underlying) * 1e18) / (10**uint256(ERC20Upgradeable(underlying).decimals()));
  }

  /**
   * @dev Fetches the price for a token from Solidly Pair
   */
  function _price(address token) internal view virtual returns (uint256) {
    address baseToken = poolFeeds[token].baseToken;
    IPair pair = IPair(poolFeeds[token].poolAddress);

    address token0 = pair.token0();
    address token1 = pair.token1();

    address quoteToken;

    baseToken == token0 ? quoteToken = token1 : quoteToken = token0;

    // get how many baseTokens (WNATIVE or STABLE) are needed to get us 1 quote token
    // i.e: the ration X/WNATIVE or X/STABLE
    uint256 baseTokensPerQuoteToken = pair.current(quoteToken, 10**uint256(ERC20Upgradeable(quoteToken).decimals()));
    if (baseToken == WTOKEN) {
      // No need to scale either, because WNATIVE is always 1e18
      return baseTokensPerQuoteToken;
    } else {
      // base token is USD or another token
      uint256 baseTokenNativePrice = BasePriceOracle(msg.sender).price(baseToken);
      // scale tokenPrice by 1e18
      uint256 baseTokenDecimals = uint256(ERC20Upgradeable(baseToken).decimals());
      uint256 tokenPriceScaled;

      if (baseTokenDecimals > 18) {
        tokenPriceScaled = baseTokensPerQuoteToken / (10**(baseTokenDecimals - 18));
      } else {
        tokenPriceScaled = baseTokensPerQuoteToken * (10**(18 - baseTokenDecimals));
      }

      return (tokenPriceScaled * baseTokenNativePrice) / 1e18;
    }
  }

  function _isBaseTokenSupported(address token) internal view returns (bool) {
    for (uint256 i = 0; i < SUPPORTED_BASE_TOKENS.length; i++) {
      if (SUPPORTED_BASE_TOKENS[i] == token) {
        return true;
      }
    }
    return false;
  }

  function _setSupportedBaseTokens(address[] memory _supportedBaseTokens) external onlyOwner {
    SUPPORTED_BASE_TOKENS = _supportedBaseTokens;
  }

  function getSupportedBaseTokens() external view returns (address[] memory) {
    return SUPPORTED_BASE_TOKENS;
  }
}
