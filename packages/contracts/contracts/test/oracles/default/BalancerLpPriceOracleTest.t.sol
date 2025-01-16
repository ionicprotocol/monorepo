// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { BaseTest } from "../../config/BaseTest.t.sol";
import { BalancerLpTokenPriceOracle } from "../../../oracles/default/BalancerLpTokenPriceOracle.sol";
import { BalancerLpTokenPriceOracleNTokens } from "../../../oracles/default/BalancerLpTokenPriceOracleNTokens.sol";
import { MasterPriceOracle } from "../../../oracles/MasterPriceOracle.sol";
import { ICErc20 } from "../../../compound/CTokenInterfaces.sol";

import "../../../external/balancer/IBalancerPool.sol";
import "../../../external/balancer/IBalancerVault.sol";
import "../../../external/balancer/BNum.sol";
import "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";

contract BalancerLpTokenPriceOracleTest is BaseTest, BNum {
  BalancerLpTokenPriceOracle oracle;
  BalancerLpTokenPriceOracleNTokens oracleNTokens;

  MasterPriceOracle mpo;

  address wbtc = 0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6;
  address weth = 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619;

  address balWeth2080 = 0x3d468AB2329F296e1b9d8476Bb54Dd77D8c2320f;
  address wbtcWeth5050 = 0xCF354603A9AEbD2Ff9f33E1B04246d8Ea204ae95;
  address wmaticUsdcWethBal25252525 = 0x0297e37f1873D2DAb4487Aa67cD56B58E2F27875;
  address threeBrl333333 = 0x5A5E4Fa45Be4c9cb214cD4EC2f2eB7053F9b4F6D;

  address mimoPar8020 = 0x82d7f08026e21c7713CfAd1071df7C8271B17Eae;
  address mimoPar8020_c = 0xcb67Bd2aE0597eDb2426802CdF34bb4085d9483A;

  function afterForkSetUp() internal override {
    mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));
    oracle = new BalancerLpTokenPriceOracle();
    oracleNTokens = new BalancerLpTokenPriceOracleNTokens();
    oracle.initialize(mpo);
    oracleNTokens.initialize(mpo);
  }

  // TODO: add test for mimo / par pair, when we deploy the MIMO DIA price oracle
  // See: https://github.com/Midas-Protocol/monorepo/issues/476
  function testPriceBalancer() public forkAtBlock(POLYGON_MAINNET, 46024675) {
    // 2-token pools
    uint256 priceWbtcEth = oracle.price(wbtcWeth5050);
    uint256 priceNTokensWbtEth = oracleNTokens.price(wbtcWeth5050);

    uint256 priceMimoPar = oracle.price(mimoPar8020);
    uint256 priceNTokensMimoPar = oracleNTokens.price(mimoPar8020);
    uint256 underlyingPriceMimoPar = mpo.getUnderlyingPrice(ICErc20(mimoPar8020_c));

    // Based on this tx: https://polygonscan.com/tx/0x206f359e35b49265c7b3cb28691e1ca547ae79475af8e479331dc936fcbf0dd0
    // 1220 USD$ worth of liquidity was removed for 0,197227836914 wbtcWeth5050 tokens

    // (1220 / 0,19722783691) = 6.185,7 USD / wbtcWeth5050
    // 6.185,7 / 1.00 =  6.185,7 wbtcWeth5050 / MATIC   [1 MATIC ~= 1 USD$]
    // 6.185,7 * 1e18 ~ 6.185e21
    // Updated: 07/07/2023
    assertEq(priceWbtcEth, 11262839540893715595453);
    // Max deviation of 1e17, or 0.1%
    assertApproxEqRel(priceWbtcEth, priceNTokensWbtEth, 1e17);

    // Based on this tx: https://polygonscan.com/tx/0x38eda84addb9392a1bd15b1fe518de6d9e4a6dc3df7a611aba5d4ddf5cc83b47
    // 0,03 USD$ worth of liquidity was removed for 0,92153 mimoPar8020 tokens

    // (0,03 / 0,92153) = 0,03255 USD / mimoPar8020
    // 0,03255 / 1.00 = 0,03255 mimoPar8020 / MATIC   [1 MATIC ~= 1 USD$]
    // 0,03255 * 1e18 ~ 3,255e16

    assertEq(priceMimoPar, 55237961865401672);
    assertEq(priceMimoPar, underlyingPriceMimoPar);
    // Max deviation of 1e17, or 0.1%
    assertApproxEqRel(priceMimoPar, priceNTokensMimoPar, 1e17);

    // 4-token pools
    uint256 priceNTokenswmaticUsdcWethBal = oracleNTokens.price(wmaticUsdcWethBal25252525);

    // Based on this tx: https://polygonscan.com/tx/0x206f359e35b49265c7b3cb28691e1ca547ae79475af8e479331dc936fcbf0dd0
    // 5390 USD$ worth of liquidity was removed for 440,3219429 wmaticUsdcWethBal25252525 tokens

    // (5390 / 440,321) = 12,2410 USD / wmaticUsdcWethBal25252525
    // 12,2410 / 1.00 = 12,2410 wmaticUsdcWethBal25252525 / MATIC   [1 MATIC ~= 1 USD$]
    // 12,2410 * 1e18 ~ 1,2241e19
    // Updated: 07/07/2023
    assertEq(priceNTokenswmaticUsdcWethBal, 15468228316697206187);
  }
}
