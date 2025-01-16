// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { MasterPriceOracle } from "../../oracles/MasterPriceOracle.sol";
import { UniswapLpTokenPriceOracle } from "../../oracles/default/UniswapLpTokenPriceOracle.sol";
import { SolidlyLpTokenPriceOracle } from "../../oracles/default/SolidlyLpTokenPriceOracle.sol";
import { UniswapLikeLpTokenPriceOracle } from "../../oracles/default/UniswapLikeLpTokenPriceOracle.sol";
import { UniswapLpTokenLiquidator } from "../../liquidators/UniswapLpTokenLiquidator.sol";
import { SolidlyLpTokenLiquidator, SolidlyLpTokenWrapper } from "../../liquidators/SolidlyLpTokenLiquidator.sol";
import { BasePriceOracle } from "../../oracles/BasePriceOracle.sol";
import { IUniswapV2Router02 } from "../../external/uniswap/IUniswapV2Router02.sol";
import { IUniswapV2Pair } from "../../external/uniswap/IUniswapV2Pair.sol";
import { IPair } from "../../external/solidly/IPair.sol";
import { IRouter } from "../../external/solidly/IRouter.sol";

import { IERC20Upgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import { ERC20Upgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";

import { BaseTest } from "../config/BaseTest.t.sol";

contract UniswapLikeLpTokenLiquidatorTest is BaseTest {
  UniswapLpTokenLiquidator private uniLiquidator;
  SolidlyLpTokenLiquidator private solidlyLpTokenLiquidator;
  SolidlyLpTokenWrapper solidlyLpTokenWrapper;
  SolidlyLpTokenPriceOracle private oracleSolidly;
  UniswapLpTokenPriceOracle private oracleUniswap;
  MasterPriceOracle mpo;
  address wtoken;
  address stableToken;
  address uniswapV2Router;
  address solidlyRouter;

  function afterForkSetUp() internal override {
    mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));
    uniswapV2Router = ap.getAddress("IUniswapV2Router02");
    wtoken = ap.getAddress("wtoken");
    stableToken = ap.getAddress("stableToken");
    solidlyRouter = ap.getAddress("SOLIDLY_SWAP_ROUTER");
    emit log_named_address("solidlyRouter", solidlyRouter);
    uniLiquidator = new UniswapLpTokenLiquidator();
    solidlyLpTokenLiquidator = new SolidlyLpTokenLiquidator();
    solidlyLpTokenWrapper = new SolidlyLpTokenWrapper();
    oracleSolidly = new SolidlyLpTokenPriceOracle(wtoken);
    oracleUniswap = new UniswapLpTokenPriceOracle(wtoken);
  }

  function setUpOracles(address lpToken, UniswapLikeLpTokenPriceOracle oracle) internal {
    if (address(mpo.oracles(lpToken)) == address(0)) {
      address[] memory underlyings = new address[](1);
      BasePriceOracle[] memory oracles = new BasePriceOracle[](1);

      underlyings[0] = lpToken;
      oracles[0] = BasePriceOracle(oracle);

      vm.prank(mpo.admin());
      mpo.add(underlyings, oracles);
      emit log("added the oracle");
    } else {
      emit log("found the oracle");
    }
  }

  function testUniswapLpTokenRedeem(address whale, address lpToken, UniswapLikeLpTokenPriceOracle oracle) internal {
    setUpOracles(lpToken, oracle);
    IERC20Upgradeable lpTokenContract = IERC20Upgradeable(lpToken);
    IUniswapV2Pair pool = IUniswapV2Pair(lpToken);

    address token0 = pool.token0();
    address token1 = pool.token1();

    address[] memory swapToken0Path;
    address[] memory swapToken1Path;

    IERC20Upgradeable outputToken = IERC20Upgradeable(wtoken);

    if (token0 != wtoken) {
      swapToken0Path = asArray(token0, wtoken);
      swapToken1Path = new address[](0);
    } else {
      swapToken0Path = new address[](0);
      swapToken1Path = asArray(token1, wtoken);
    }

    uint256 outputBalanceBefore = outputToken.balanceOf(address(uniLiquidator));

    uint256 redeemAmount = 1e18;
    // redeem
    {
      bytes memory data = abi.encode(uniswapV2Router, swapToken0Path, swapToken1Path);

      vm.prank(whale);
      lpTokenContract.transfer(address(uniLiquidator), redeemAmount);

      vm.prank(address(uniLiquidator));
      lpTokenContract.approve(lpToken, redeemAmount);
      uniLiquidator.redeem(lpTokenContract, redeemAmount, data);
    }

    uint256 outputBalanceAfter = outputToken.balanceOf(address(uniLiquidator));
    uint256 outputBalanceDiff = outputBalanceAfter - outputBalanceBefore;
    assertGt(outputBalanceDiff, 0, "!redeem output");

    // compare the value of the input LP tokens and the value of the output tokens
    checkInputOutputValue(redeemAmount, lpToken, outputBalanceDiff, address(outputToken));
  }

  function testSolidlyLpTokenRedeem(
    address whale,
    address lpToken,
    address outputTokenAddress,
    UniswapLikeLpTokenPriceOracle oracle
  ) internal {
    setUpOracles(lpToken, oracle);
    IERC20Upgradeable lpTokenContract = IERC20Upgradeable(lpToken);

    IERC20Upgradeable outputToken = IERC20Upgradeable(outputTokenAddress);

    uint256 outputBalanceBefore = outputToken.balanceOf(address(solidlyLpTokenLiquidator));

    uint256 redeemAmount = 1e18;
    // redeem
    {
      bytes memory data = abi.encode(solidlyRouter, outputTokenAddress);

      vm.prank(whale);
      lpTokenContract.transfer(address(solidlyLpTokenLiquidator), redeemAmount);

      solidlyLpTokenLiquidator.redeem(lpTokenContract, redeemAmount, data);
    }

    uint256 outputBalanceAfter = outputToken.balanceOf(address(solidlyLpTokenLiquidator));
    uint256 outputBalanceDiff = outputBalanceAfter - outputBalanceBefore;
    assertGt(outputBalanceDiff, 0, "!redeem output");

    // compare the value of the input LP tokens and the value of the output tokens
    checkInputOutputValue(redeemAmount, lpToken, outputBalanceDiff, address(outputToken));
  }

  function checkInputOutputValue(
    uint256 inputAmount,
    address inputToken,
    uint256 outputAmount,
    address outputToken
  ) internal {
    uint256 outputTokenPrice = mpo.price(address(outputToken));
    uint256 outputValue = (outputTokenPrice * outputAmount) / 1e18;
    uint256 inputTokenPrice = mpo.price(inputToken);
    uint256 inputValue = (inputAmount * inputTokenPrice) / 1e18;

    assertApproxEqAbs(inputValue, outputValue, 1e15, "value of output does not match the value of the output");
  }

  function testUniswapLpRedeem() public fork(BSC_MAINNET) {
    address lpTokenWhale = 0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652; // pcs main staking contract
    address WBNB_BUSD_Uniswap = 0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16;
    testUniswapLpTokenRedeem(lpTokenWhale, WBNB_BUSD_Uniswap, oracleUniswap);
  }

  function testSolidlyLpRedeem() public fork(BSC_MAINNET) {
    address ankrBNB = 0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827;

    address WBNB_BUSD = 0x483653bcF3a10d9a1c334CE16a19471a614F4385;
    address HAY_BUSD = 0x93B32a8dfE10e9196403dd111974E325219aec24;
    address ANKR_ankrBNB = 0x7ef540f672Cd643B79D2488344944499F7518b1f;

    address WBNB_BUSD_whale = 0x7144851e51523a88EA6BeC9710cC07f3a9B3baa7;
    address HAY_BUSD_whale = 0x5f8a3d4ad41352A8145DDe8dC0aA3159C7B7649D;
    address ANKR_ankrBNB_whale = 0x5FFEAe4E352Bf3789C9152Ef7eAfD9c1B3bfcE26;

    testSolidlyLpTokenRedeem(WBNB_BUSD_whale, WBNB_BUSD, wtoken, oracleSolidly);
    testSolidlyLpTokenRedeem(HAY_BUSD_whale, HAY_BUSD, stableToken, oracleSolidly);
    testSolidlyLpTokenRedeem(ANKR_ankrBNB_whale, ANKR_ankrBNB, ankrBNB, oracleSolidly);
  }

  function _testSolidlyLpTokenWrapper(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    address whale,
    IPair lpToken
  ) internal {
    // TODO get the data from the liquidators registry
    IRouter.Route[] memory swapPath0 = new IRouter.Route[](1);
    IRouter.Route[] memory swapPath1 = new IRouter.Route[](1);
    IERC20Upgradeable otherUnderlying;
    {
      address token0 = lpToken.token0();
      address token1 = lpToken.token1();
      bool isInputToken0 = token0 == address(inputToken);
      bool isInputToken1 = token1 == address(inputToken);
      require(isInputToken0 || isInputToken1, "!input token not underlying");

      if (isInputToken0) otherUnderlying = IERC20Upgradeable(token1);
      else otherUnderlying = IERC20Upgradeable(token0);

      swapPath0[0].stable = lpToken.stable();
      swapPath0[0].from = token0;
      swapPath0[0].to = token1;

      swapPath1[0].stable = lpToken.stable();
      swapPath1[0].from = token1;
      swapPath1[0].to = token0;
    }

    bytes memory data = abi.encode(solidlyRouter, lpToken, swapPath0, swapPath1);

    vm.prank(whale);
    inputToken.transfer(address(solidlyLpTokenWrapper), inputAmount);

    (IERC20Upgradeable outputToken, uint256 outputAmount) = solidlyLpTokenWrapper.redeem(inputToken, inputAmount, data);

    BasePriceOracle[] memory solOracles = new BasePriceOracle[](1);
    solOracles[0] = oracleSolidly;
    if (mpo.oracles(address(outputToken)) == BasePriceOracle(address(0))) {
      vm.prank(mpo.admin());
      mpo.add(asArray(address(outputToken)), solOracles);
    }

    uint256 lpTokensBalance = lpToken.balanceOf(address(solidlyLpTokenWrapper));
    assertGt(lpTokensBalance, 0, "!no lp tokens wrapped");
    uint256 inputTokensAfter = inputToken.balanceOf(address(solidlyLpTokenWrapper));
    assertEq(inputTokensAfter, 0, "!input tokens left after");
    //    uint256 otherTokensAfter = otherUnderlying.balanceOf(address(solidlyLpTokenWrapper));
    //    assertEq(otherTokensAfter, 0, "!other underlying tokens left after");
    //    emit log_named_uint("bps other leftover", (valueOf(otherUnderlying, otherTokensAfter) * 10000) / valueOf(inputToken, inputAmount));
    assertApproxEqRel(valueOf(inputToken, inputAmount), valueOf(outputToken, outputAmount), 5e16, "!slippage too high");
  }

  function valueOf(IERC20Upgradeable token, uint256 amount) internal view returns (uint256) {
    uint256 price = mpo.price(address(token));
    uint256 decimalsScale = 10 ** ERC20Upgradeable(address(token)).decimals();
    return (amount * price) / decimalsScale;
  }

  function testWrapSolidlyLpTokensWbnbBusd() public fork(BSC_MAINNET) {
    IERC20Upgradeable wbnb = IERC20Upgradeable(ap.getAddress("wtoken"));
    address WBNB_BUSD = 0x483653bcF3a10d9a1c334CE16a19471a614F4385;
    address wbnbWhale = 0xF977814e90dA44bFA03b6295A0616a897441aceC;

    _testSolidlyLpTokenWrapper(wbnb, 1e18, wbnbWhale, IPair(WBNB_BUSD));
  }

  function testWrapSolidlyLpTokensHayBusd() public fork(BSC_MAINNET) {
    IERC20Upgradeable busd = IERC20Upgradeable(ap.getAddress("stableToken"));
    address HAY_BUSD = 0x93B32a8dfE10e9196403dd111974E325219aec24;
    address busdWhale = 0xF977814e90dA44bFA03b6295A0616a897441aceC;

    _testSolidlyLpTokenWrapper(busd, 1000e18, busdWhale, IPair(HAY_BUSD));
  }

  function testWrapSolidlyLpTokensjBrlBrz() public fork(BSC_MAINNET) {
    IERC20Upgradeable jBRL = IERC20Upgradeable(0x316622977073BBC3dF32E7d2A9B3c77596a0a603);
    address jBRL_BRZ = 0xA0695f78AF837F570bcc50f53e58Cda300798B65;
    address jBRLWhale = 0xad51e40D8f255dba1Ad08501D6B1a6ACb7C188f3;

    _testSolidlyLpTokenWrapper(jBRL, 1000e18, jBRLWhale, IPair(jBRL_BRZ));
  }

  function testWrapSolidlyLpTokensBrzJBrl() public fork(BSC_MAINNET) {
    IERC20Upgradeable brz = IERC20Upgradeable(0x71be881e9C5d4465B3FfF61e89c6f3651E69B5bb);
    address jBRL_BRZ = 0xA0695f78AF837F570bcc50f53e58Cda300798B65;
    address brzWhale = 0xad51e40D8f255dba1Ad08501D6B1a6ACb7C188f3;

    _testSolidlyLpTokenWrapper(brz, 1000e4, brzWhale, IPair(jBRL_BRZ));
  }

  function testWrapSolidlyLpTokensUsdrUsdc() public fork(POLYGON_MAINNET) {
    IERC20Upgradeable usdc = IERC20Upgradeable(ap.getAddress("stableToken"));
    address USDC_USDR = 0xD17cb0f162f133e339C0BbFc18c36c357E681D6b;
    address USDCWhale = 0xe7804c37c13166fF0b37F5aE0BB07A3aEbb6e245; // binance hot wallet

    _testSolidlyLpTokenWrapper(usdc, 1000e6, USDCWhale, IPair(USDC_USDR));
  }

  function testWrapSolidlyLpTokensUsdrUsdr() public fork(POLYGON_MAINNET) {
    IERC20Upgradeable usdr = IERC20Upgradeable(0x40379a439D4F6795B6fc9aa5687dB461677A2dBa);
    address WUSDR_USDR = 0x8711a1a52c34EDe8E61eF40496ab2618a8F6EA4B;
    address USDRWhale = 0xBD02973b441Aa83c8EecEA158b98B5984bb1036E; // curve lp token

    _testSolidlyLpTokenWrapper(usdr, 1000e9, USDRWhale, IPair(WUSDR_USDR));
  }

  function testWrapSolidlyLpTokensMaticUsdr() public fork(POLYGON_MAINNET) {
    IERC20Upgradeable usdr = IERC20Upgradeable(0x40379a439D4F6795B6fc9aa5687dB461677A2dBa);
    address MATIC_USDR = 0xB4d852b92148eAA16467295975167e640E1FE57A;
    address USDRWhale = 0xBD02973b441Aa83c8EecEA158b98B5984bb1036E; // curve lp token

    _testSolidlyLpTokenWrapper(usdr, 1000e9, USDRWhale, IPair(MATIC_USDR));
  }
}
