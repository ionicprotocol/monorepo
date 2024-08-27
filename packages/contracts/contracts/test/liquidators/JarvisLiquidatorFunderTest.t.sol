// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { ICErc20 } from "../../compound/CTokenInterfaces.sol";
import { MasterPriceOracle } from "../../oracles/MasterPriceOracle.sol";
import { JarvisLiquidatorFunder } from "../../liquidators/JarvisLiquidatorFunder.sol";
import { IonicLiquidator, ILiquidator } from "../../IonicLiquidator.sol";
import { IUniswapV2Pair } from "../../external/uniswap/IUniswapV2Pair.sol";
import { IUniswapV2Factory } from "../../external/uniswap/IUniswapV2Factory.sol";
import { IComptroller } from "../../external/compound/IComptroller.sol";
import { IERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import { ISynthereumLiquidityPool } from "../../external/jarvis/ISynthereumLiquidityPool.sol";
import { IRedemptionStrategy } from "../../liquidators/IRedemptionStrategy.sol";
import { IFundsConversionStrategy } from "../../liquidators/IFundsConversionStrategy.sol";
import { IUniswapV2Router02 } from "../../external/uniswap/IUniswapV2Router02.sol";

import { BaseTest } from "../config/BaseTest.t.sol";

interface IMockERC20 is IERC20Upgradeable {
  function mint(address _address, uint256 amount) external;
}

contract JarvisLiquidatorFunderTest is BaseTest {
  JarvisLiquidatorFunder private jarvisLiquidator;

  ISynthereumLiquidityPool synthereumLiquidityPool =
    ISynthereumLiquidityPool(0x0fD8170Dc284CD558325029f6AEc1538c7d99f49);

  address minter = 0x0fD8170Dc284CD558325029f6AEc1538c7d99f49;
  IMockERC20 jBRLToken = IMockERC20(0x316622977073BBC3dF32E7d2A9B3c77596a0a603);

  IERC20Upgradeable bUSD;

  function afterForkSetUp() internal override {
    uint64 expirationPeriod = 60 * 40; // 40 mins
    bUSD = IERC20Upgradeable(ap.getAddress("bUSD")); // TODO check if bUSD == stableToken at AP

    ISynthereumLiquidityPool[] memory pools = new ISynthereumLiquidityPool[](1);
    pools[0] = synthereumLiquidityPool;
    uint256[] memory times = new uint256[](1);
    times[0] = expirationPeriod;

    jarvisLiquidator = new JarvisLiquidatorFunder();
  }

  function testRedeemToken() public fork(BSC_MAINNET) {
    vm.prank(minter);
    jBRLToken.mint(address(jarvisLiquidator), 10e18);

    bytes memory data = abi.encode(address(jBRLToken), address(synthereumLiquidityPool), 60 * 40);
    (uint256 redeemableAmount, ) = synthereumLiquidityPool.getRedeemTradeInfo(10e18);
    (IERC20Upgradeable outputToken, uint256 outputAmount) = jarvisLiquidator.redeem(jBRLToken, 10e18, data);

    // should be BUSD
    assertEq(address(outputToken), address(bUSD));
    assertEq(outputAmount, redeemableAmount);
  }

  function testEmergencyRedeemToken() public fork(BSC_MAINNET) {
    ISynthereumLiquidityPool pool = synthereumLiquidityPool;
    address manager = pool.synthereumFinder().getImplementationAddress("Manager");
    vm.prank(manager);
    pool.emergencyShutdown();

    vm.prank(minter);
    jBRLToken.mint(address(jarvisLiquidator), 10e18);

    bytes memory data = abi.encode(address(jBRLToken), address(synthereumLiquidityPool), 60 * 40);
    (uint256 redeemableAmount, uint256 fee) = synthereumLiquidityPool.getRedeemTradeInfo(10e18);
    (IERC20Upgradeable outputToken, uint256 outputAmount) = jarvisLiquidator.redeem(jBRLToken, 10e18, data);

    // should be BUSD
    assertEq(address(outputToken), address(bUSD));
    assertEq(outputAmount, redeemableAmount + fee);
  }

  struct LiquidationData {
    address[] cTokens;
    IRedemptionStrategy[] strategies;
    bytes[] abis;
    IonicLiquidator liquidator;
    IFundsConversionStrategy[] fundingStrategies;
    bytes[] data;
  }

  // TODO test with the latest block and contracts and/or without the FSL
  function testJbrlLiquidation() public debuggingOnly forkAtBlock(BSC_MAINNET, 21700285) {
    LiquidationData memory vars;
    IUniswapV2Router02 uniswapRouter = IUniswapV2Router02(0x10ED43C718714eb63d5aA57B78B54704E256024E);

    // setting up a new liquidator
    //    vars.liquidator = IonicLiquidator(payable(0xc9C3D317E89f4390A564D56180bBB1842CF3c99C));
    vars.liquidator = new IonicLiquidator();
    vars.liquidator.initialize(ap.getAddress("wtoken"), address(uniswapRouter), 25);

    IComptroller comptroller = IComptroller(0x31d76A64Bc8BbEffb601fac5884372DEF910F044);

    ICErc20 cTokenJBRL = ICErc20(0x82A3103bc306293227B756f7554AfAeE82F8ab7a);
    ICErc20 cTokenBUSD = ICErc20(0xa7213deB44f570646Ea955771Cc7f39B58841363);

    uint256 borrowAmount = 1e21;
    address accountOne = address(10001);
    address accountTwo = address(20002);

    // Account One supply JBRL
    dealJBRL(accountOne, 10e12);
    // Account One supply BUSD
    dealBUSD(accountOne, 10e21);

    // Account One deposit BUSD
    vm.startPrank(accountOne);
    {
      vars.cTokens = new address[](2);
      vars.cTokens[0] = address(cTokenJBRL);
      vars.cTokens[1] = address(cTokenBUSD);
      comptroller.enterMarkets(vars.cTokens);
    }
    bUSD.approve(address(cTokenBUSD), 1e36);
    require(cTokenBUSD.mint(5e21) == 0, "mint failed");
    vm.stopPrank();

    // Account One borrow jBRL
    vm.prank(accountOne);
    require(cTokenJBRL.borrow(borrowAmount) == 0, "borrow failed");

    // some time passes, interest accrues and prices change
    {
      vm.roll(block.number + 100);
      cTokenBUSD.accrueInterest();
      cTokenJBRL.accrueInterest();

      MasterPriceOracle mpo = MasterPriceOracle(address(comptroller.oracle()));
      uint256 priceBUSD = mpo.getUnderlyingPrice(cTokenBUSD);
      vm.mockCall(
        address(mpo),
        abi.encodeWithSelector(mpo.getUnderlyingPrice.selector, cTokenBUSD),
        abi.encode(priceBUSD / 100)
      );
    }

    // prepare the liquidation
    vars.strategies = new IRedemptionStrategy[](0);
    vars.abis = new bytes[](0);

    vars.fundingStrategies = new IFundsConversionStrategy[](1);
    vars.data = new bytes[](1);
    vars.data[0] = abi.encode(ap.getAddress("bUSD"), address(synthereumLiquidityPool), 60 * 40);
    vars.fundingStrategies[0] = jarvisLiquidator;

    // all strategies need to be whitelisted
    vm.prank(vars.liquidator.owner());
    vars.liquidator._whitelistRedemptionStrategy(vars.fundingStrategies[0], true);

    address pairAddress = IUniswapV2Factory(uniswapRouter.factory()).getPair(address(bUSD), ap.getAddress("wtoken"));
    IUniswapV2Pair flashSwapPair = IUniswapV2Pair(pairAddress);

    uint256 repayAmount = borrowAmount / 10;
    // liquidate
    vm.prank(accountTwo);
    vars.liquidator.safeLiquidateToTokensWithFlashLoan(
      ILiquidator.LiquidateToTokensWithFlashSwapVars(
        accountOne,
        repayAmount,
        ICErc20(address(cTokenJBRL)),
        ICErc20(address(cTokenBUSD)),
        address(flashSwapPair),
        0,
        vars.strategies,
        vars.abis,
        vars.fundingStrategies,
        vars.data
      )
    );
  }

  function dealBUSD(address to, uint256 amount) internal {
    vm.prank(0x0000000000000000000000000000000000001004); // whale
    bUSD.transfer(to, amount);
  }

  function dealJBRL(address to, uint256 amount) internal {
    vm.prank(0xad51e40D8f255dba1Ad08501D6B1a6ACb7C188f3); // whale
    jBRLToken.transfer(to, amount);
  }
}
