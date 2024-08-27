// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { IERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import { ERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";

import { BaseTest } from "../../config/BaseTest.t.sol";
import { ERC4626Oracle } from "../../../oracles/default/ERC4626Oracle.sol";
import { SimplePriceOracle } from "../../../oracles/default/SimplePriceOracle.sol";
import { MasterPriceOracle } from "../../../oracles/MasterPriceOracle.sol";
import { IERC4626 } from "../../../compound/IERC4626.sol";
import { ChainlinkPriceOracleV2 } from "../../../oracles/default/ChainlinkPriceOracleV2.sol";
import { BasePriceOracle } from "../../../oracles/BasePriceOracle.sol";

import { IUniswapV3Factory } from "../../../external/uniswap/IUniswapV3Factory.sol";
import { Quoter } from "../../../external/uniswap/quoter/Quoter.sol";
import { IUniswapV3Pool } from "../../../external/uniswap/IUniswapV3Pool.sol";
import { ISwapRouter } from "../../../external/uniswap/ISwapRouter.sol";
import { ERC4626Liquidator } from "../../../liquidators/ERC4626Liquidator.sol";

contract ERC4626OracleAndLiquidatorTest is BaseTest {
  // TODO: refactor this into oracle and liquidator tests once oracles are deployed
  // TODO: refactor oracle set up using the address provider

  MasterPriceOracle mpo;
  ChainlinkPriceOracleV2 chainlinkOracle;
  ERC4626Oracle erc4626Oracle;

  IERC20Upgradeable wethToken;
  IERC20Upgradeable wbtcToken;
  IERC20Upgradeable daiToken;
  IERC20Upgradeable usdcToken;
  IERC20Upgradeable usdtToken;

  address nativeUsdPriceFeed;
  address usdcEthPriceFeed;
  address wbtcEthPriceFeed;

  IERC4626 erc4626Vault;
  address[] underlyingTokens;
  ERC4626Liquidator liquidator;

  address usdcMarketAddress;
  address univ3SwapRouter;

  uint256 poolFee;

  Quoter quoter;

  address holder;

  function setUpErc4626Oracle() public {
    BasePriceOracle[] memory oracles = new BasePriceOracle[](1);
    erc4626Oracle = new ERC4626Oracle();
    vm.prank(erc4626Oracle.owner());
    erc4626Oracle.initialize();
    oracles[0] = erc4626Oracle;
    vm.prank(mpo.admin());
    mpo.add(asArray(address(erc4626Vault)), oracles);
  }

  function setUpBaseOracles() public {
    setUpMpoAndAddresses();
    BasePriceOracle[] memory oracles = new BasePriceOracle[](2);
    chainlinkOracle = new ChainlinkPriceOracleV2();
    chainlinkOracle.initialize(address(usdcToken), nativeUsdPriceFeed);
    vm.prank(chainlinkOracle.owner());
    chainlinkOracle.setPriceFeeds(
      asArray(address(usdcToken), address(wbtcToken)),
      asArray(usdcEthPriceFeed, wbtcEthPriceFeed),
      ChainlinkPriceOracleV2.FeedBaseCurrency.ETH
    );
    oracles[0] = BasePriceOracle(address(chainlinkOracle));
    oracles[1] = BasePriceOracle(address(chainlinkOracle));

    vm.prank(mpo.admin());
    mpo.add(asArray(address(usdcToken), address(wbtcToken)), oracles);
  }

  function setUpMpoAndAddresses() public {
    if (block.chainid == ETHEREUM_MAINNET) {
      usdcToken = IERC20Upgradeable(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
      daiToken = IERC20Upgradeable(0x6B175474E89094C44Da98b954EedeAC495271d0F);
      usdtToken = IERC20Upgradeable(0xdAC17F958D2ee523a2206206994597C13D831ec7);
      wbtcToken = IERC20Upgradeable(0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599);
      wethToken = IERC20Upgradeable(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);

      nativeUsdPriceFeed = 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419;
      usdcEthPriceFeed = 0x986b5E1e1755e3C2440e960477f25201B0a8bbD4;
      wbtcEthPriceFeed = 0xdeb288F737066589598e9214E782fa5A8eD689e8;

      address[] memory assets = new address[](0);
      BasePriceOracle[] memory oracles = new BasePriceOracle[](0);
      mpo = new MasterPriceOracle();
      mpo.initialize(assets, oracles, BasePriceOracle(address(0)), address(this), true, address(wethToken));
    }
  }

  function setupRealYieldStrategyUsdAddresses() public {
    if (block.chainid == ETHEREUM_MAINNET) {
      underlyingTokens = asArray(address(usdcToken), address(daiToken), address(usdtToken)); // USDC, 6 decimals
      poolFee = 10;
      erc4626Vault = IERC4626(0x97e6E0a40a3D02F12d1cEC30ebfbAE04e37C119E); // USDC-DAI-USDT Real Yield
      quoter = new Quoter(0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6);
      univ3SwapRouter = 0xE592427A0AEce92De3Edee1F18E0157C05861564;
      holder = 0x3541Fda19b09769A938EB2A5f5154b01aE5b0869;
    }
    liquidator = new ERC4626Liquidator();
  }

  function setupEthBtcStrategyAddresses() public {
    if (block.chainid == ETHEREUM_MAINNET) {
      underlyingTokens = asArray(address(usdcToken), address(wbtcToken), address(wethToken));
      poolFee = 500;
      erc4626Vault = IERC4626(0x6b7f87279982d919Bbf85182DDeAB179B366D8f2); // ETH-BTC trend
      quoter = new Quoter(0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6);
      univ3SwapRouter = 0xE592427A0AEce92De3Edee1F18E0157C05861564;
      holder = 0xF955C57f9EA9Dc8781965FEaE0b6A2acE2BAD6f3;
    }
    liquidator = new ERC4626Liquidator();
  }

  function testRealYieldErc4626PriceOracle() public fork(ETHEREUM_MAINNET) {
    setUpBaseOracles();
    setupRealYieldStrategyUsdAddresses();
    setUpErc4626Oracle();

    uint256 priceRealYieldUsdc = mpo.price(address(erc4626Vault));
    uint256 priceUsdc = mpo.price(address(usdcToken));

    // Approximate only -- these should not match.
    assertApproxEqRel(priceRealYieldUsdc, priceUsdc, 3e16, "!diff > 3%");
  }

  function testRealYieldUsdErc4626RedemptionStrategy() public fork(ETHEREUM_MAINNET) {
    setUpBaseOracles();
    setupRealYieldStrategyUsdAddresses();
    setUpErc4626Oracle();
    executeTestRedemptionStrategy(usdcToken);
  }

  function testEthBtcMomementumErc4626RedemptionStrategy() public fork(ETHEREUM_MAINNET) {
    setUpBaseOracles();
    setupEthBtcStrategyAddresses();
    setUpErc4626Oracle();
    executeTestRedemptionStrategy(wethToken);
  }

  function executeTestRedemptionStrategy(IERC20Upgradeable _outputToken) internal {
    uint256 balance = erc4626Vault.balanceOf(holder);
    assertTrue(balance > 0);

    // impersonate the holder
    vm.prank(holder);

    // fund the liquidator so it can redeem the tokens
    erc4626Vault.transfer(address(liquidator), balance);

    bytes memory data = abi.encode(address(_outputToken), poolFee, univ3SwapRouter, underlyingTokens, quoter);

    // redeem the underlying reward token
    (IERC20Upgradeable outputToken, uint256 outputAmount) = liquidator.redeem(
      IERC20Upgradeable(address(erc4626Vault)),
      balance,
      data
    );

    // ensure the output token is the expected token
    assertEq(address(outputToken), address(_outputToken));

    uint256 liquidatorBalance = _outputToken.balanceOf(address(liquidator));
    // get the redeemed value of the erc4626 token
    uint256 redeemValue = (mpo.price(address(erc4626Vault)) * balance) / 1e18;
    // get the redeemed value of the output token
    uint256 redeemOutputTokenValue = (mpo.price(address(_outputToken)) * liquidatorBalance) /
      10**ERC20Upgradeable(address(_outputToken)).decimals();
    // ensure they are approximately equal
    assertApproxEqRel(redeemValue, redeemOutputTokenValue, 3e16, "!diff > 3%");

    uint256 maxVal = redeemValue > redeemOutputTokenValue ? redeemValue : redeemOutputTokenValue;
    uint256 minVal = redeemValue < redeemOutputTokenValue ? redeemValue : redeemOutputTokenValue;

    uint256 absoluteDifference = maxVal - minVal;
    uint256 percentageDifference = (absoluteDifference * 10000) / maxVal; // Multiplied by 10000 for 2 decimal places of precision

    // log the differences
    emit log_named_uint("redeemOutputTokenValue", redeemOutputTokenValue);
    emit log_named_uint("redeemValue", redeemValue);
    emit log_named_uint("base 1000 diff", percentageDifference);
  }
}
