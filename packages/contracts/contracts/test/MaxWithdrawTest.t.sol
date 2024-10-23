// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

// import "./helpers/WithPool.sol";
// import { BaseTest } from "./config/BaseTest.t.sol";
// import "forge-std/Test.sol";

// import { ERC20 } from "solmate/tokens/ERC20.sol";
// import { FuseFlywheelDynamicRewards } from "fuse-flywheel/rewards/FuseFlywheelDynamicRewards.sol";
// import { MockERC20 } from "solmate/test/utils/mocks/MockERC20.sol";
// import { MasterPriceOracle } from "../oracles/MasterPriceOracle.sol";
// import { IRedemptionStrategy } from "../liquidators/IRedemptionStrategy.sol";
// import { IFundsConversionStrategy } from "../liquidators/IFundsConversionStrategy.sol";
// import { IUniswapV2Router02 } from "../external/uniswap/IUniswapV2Router02.sol";
// import { PoolLensSecondary } from "../PoolLensSecondary.sol";
// import { UniswapLpTokenLiquidator } from "../liquidators/UniswapLpTokenLiquidator.sol";
// import { IUniswapV2Pair } from "../external/uniswap/IUniswapV2Pair.sol";
// import { IUniswapV2Factory } from "../external/uniswap/IUniswapV2Factory.sol";
// import { ICErc20 } from "../compound/CTokenInterfaces.sol";

// contract MockAsset is MockERC20 {
//   constructor() MockERC20("test", "test", 8) {}

//   function deposit() external payable {}
// }

// contract MaxWithdrawTest is WithPool {
//   struct LiquidationData {
//     address[] cTokens;
//     ICErc20[] allMarkets;
//     MockAsset bnb;
//     MockAsset mimo;
//     MockAsset usdc;
//   }

//   function afterForkSetUp() internal override {
//     super.setUpWithPool(
//       MasterPriceOracle(ap.getAddress("MasterPriceOracle")),
//       ERC20Upgradeable(ap.getAddress("wtoken"))
//     );

//     deal(address(underlyingToken), address(this), 100e18);
//     setUpPool("bsc-test", false, 0.1e18, 1.1e18);
//   }

//   function testMaxWithdrawBsc() public fork(BSC_MAINNET) {
//     PoolLensSecondary poolLensSecondary = new PoolLensSecondary();
//     poolLensSecondary.initialize(poolDirectory);

//     LiquidationData memory vars;
//     vm.roll(1);
//     vars.bnb = MockAsset(0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c);
//     vars.usdc = MockAsset(0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d);

//     deployCErc20Delegate(address(vars.bnb), "BNB", "bnb", 0.9e18);
//     deployCErc20Delegate(address(vars.usdc), "USDC", "usdc", 0.9e18);

//     // TODO no need to upgrade after the next deploy
//     upgradePool(address(comptroller));

//     vars.allMarkets = comptroller.getAllMarkets();
//     CErc20Delegate cBnbToken = CErc20Delegate(address(vars.allMarkets[0]));

//     CErc20Delegate cUSDC = CErc20Delegate(address(vars.allMarkets[1]));

//     vars.cTokens = new address[](1);
//     vars.cTokens[0] = address(cBnbToken);

//     address accountOne = address(1);
//     address accountTwo = address(2);
//     address accountThree = address(3);

//     {
//       address comptrollerAddress = address(comptroller);
//       AuthoritiesRegistry ar = ionicAdmin.authoritiesRegistry();
//       PoolRolesAuthority poolAuth = ar.poolsAuthorities(comptrollerAddress);
//       ar.setUserRole(comptrollerAddress, accountOne, poolAuth.BORROWER_ROLE(), true);
//       ar.setUserRole(comptrollerAddress, accountTwo, poolAuth.BORROWER_ROLE(), true);
//       ar.setUserRole(comptrollerAddress, accountThree, poolAuth.BORROWER_ROLE(), true);
//     }

//     // Account One Supply
//     deal(address(vars.bnb), accountOne, 5000000000e18);
//     deal(address(vars.bnb), accountThree, 5000000000e18);
//     deal(address(vars.usdc), accountTwo, 10000e18);

//     // Account One Supply
//     {
//       emit log("Account One Supply");
//       vm.startPrank(accountOne);
//       vars.bnb.approve(address(cBnbToken), 1e36);
//       assertEq(cBnbToken.mint(1e18), 0, "!cbnb mint acc 1");
//       comptroller.enterMarkets(vars.cTokens);
//       vm.stopPrank();
//     }

//     // Account Three Supply
//     {
//       emit log("Account Three Supply");
//       vm.startPrank(accountThree);
//       vars.bnb.approve(address(cBnbToken), 1e36);
//       assertEq(cBnbToken.mint(1e18), 0, "!cbnb mint acc 3");
//       comptroller.enterMarkets(vars.cTokens);
//       vm.stopPrank();
//     }

//     // Account Two Supply
//     {
//       emit log("Account Two Supply");
//       vm.startPrank(accountTwo);
//       vars.usdc.approve(address(cUSDC), 1e36);
//       assertEq(cUSDC.mint(1000e18), 0, "!cusdc mint acc 2");
//       vars.cTokens[0] = address(cUSDC);
//       comptroller.enterMarkets(vars.cTokens);
//       vm.stopPrank();
//       assertEq(cUSDC.totalSupply(), 1000e18 * 5, "!cUSDC total supply");
//       assertEq(cBnbToken.totalSupply(), 1e18 * 5 * 2, "!cBNB total supply");
//     }

//     // Account Two Borrow
//     {
//       emit log("Account Two Borrow");
//       vm.startPrank(accountTwo);
//       assertEq(cBnbToken.borrow(0.5e18), 0, "!cbnb borrow acc 2");
//       vm.stopPrank();
//     }

//     // Account One Borrow
//     {
//       emit log("Account One Borrow");
//       vm.startPrank(accountOne);
//       assertEq(cUSDC.borrow(110e18), 0, "!cusdc borrow acc 1");
//       assertEq(cUSDC.totalBorrows(), 110e18, "!total borrows");

//       uint256 maxWithdraw = poolLensSecondary.getMaxRedeem(accountOne, ICErc20(address(cBnbToken)));

//       uint256 beforeBnbBalance = vars.bnb.balanceOf(accountOne);
//       cBnbToken.redeemUnderlying(type(uint256).max);
//       uint256 afterBnbBalance = vars.bnb.balanceOf(accountOne);

//       assertEq(afterBnbBalance - beforeBnbBalance, maxWithdraw, "!bnb diff");
//       vm.stopPrank();
//     }
//   }

//   function testMIIMOMaxWithdraw() public fork(POLYGON_MAINNET) {
//     PoolLensSecondary poolLensSecondary = new PoolLensSecondary();
//     poolLensSecondary.initialize(poolDirectory);

//     LiquidationData memory vars;
//     vm.roll(1);
//     vars.mimo = MockAsset(0xADAC33f543267c4D59a8c299cF804c303BC3e4aC);
//     vars.usdc = MockAsset(0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174);

//     deployCErc20Delegate(address(vars.mimo), "MIMO", "mimo", 0.9e18);
//     deployCErc20Delegate(address(vars.usdc), "USDC", "usdc", 0.9e18);

//     vars.allMarkets = comptroller.getAllMarkets();
//     CErc20Delegate cMimoToken = CErc20Delegate(address(vars.allMarkets[0]));

//     CErc20Delegate cUSDC = CErc20Delegate(address(vars.allMarkets[1]));

//     vars.cTokens = new address[](1);

//     address accountOne = address(1);
//     address accountTwo = address(2);
//     address accountThree = address(3);

//     {
//       address comptrollerAddress = address(comptroller);
//       AuthoritiesRegistry ar = ionicAdmin.authoritiesRegistry();
//       PoolRolesAuthority poolAuth = ar.poolsAuthorities(comptrollerAddress);
//       ar.setUserRole(comptrollerAddress, accountOne, poolAuth.BORROWER_ROLE(), true);
//       ar.setUserRole(comptrollerAddress, accountTwo, poolAuth.BORROWER_ROLE(), true);
//       ar.setUserRole(comptrollerAddress, accountThree, poolAuth.BORROWER_ROLE(), true);
//     }

//     deal(address(vars.mimo), accountOne, 5e27);
//     deal(address(vars.mimo), accountThree, 5e27);
//     deal(address(vars.usdc), accountTwo, 10000e6);

//     // Account One Supply
//     {
//       emit log("Account One Supply");
//       vm.startPrank(accountOne);
//       vars.mimo.approve(address(cMimoToken), 1e36);
//       assertEq(cMimoToken.mint(10e24), 0, "!cmimo mint acc 1");
//       vars.cTokens[0] = address(cMimoToken);
//       comptroller.enterMarkets(vars.cTokens);
//       vm.stopPrank();
//     }

//     // Account Three Supply
//     {
//       emit log("Account Three Supply");
//       vm.startPrank(accountThree);
//       vars.mimo.approve(address(cMimoToken), 1e36);
//       assertEq(cMimoToken.mint(10e24), 0, "!cmimo mint acc 3");
//       vars.cTokens[0] = address(cMimoToken);
//       comptroller.enterMarkets(vars.cTokens);
//       vm.stopPrank();
//     }

//     // Account Two Supply
//     {
//       emit log("Account Two Supply");
//       vm.startPrank(accountTwo);
//       vars.usdc.approve(address(cUSDC), 1e36);
//       assertEq(cUSDC.mint(1000e6), 0, "!cusdc mint acc 2");
//       vars.cTokens[0] = address(cUSDC);
//       comptroller.enterMarkets(vars.cTokens);
//       vm.stopPrank();
//       assertEq(cUSDC.totalSupply(), 1000e6 * 5, "!cUSDC total supply");
//       assertEq(cMimoToken.totalSupply(), 10000000e18 * 5 * 2, "!cMimo total supply");
//     }

//     // Account Two Borrow
//     {
//       emit log("Account Two Borrow");
//       vm.startPrank(accountTwo);
//       uint256 maxBorrow = poolLensSecondary.getMaxBorrow(accountTwo, ICErc20(address(cMimoToken)));
//       emit log_uint(maxBorrow);
//       assertEq(cMimoToken.borrow(maxBorrow), 0, "!cmimo borrow acc 2");
//       assertEq(cMimoToken.totalBorrows(), maxBorrow, "!cMimo total borrows");

//       vm.stopPrank();
//     }

//     // Account One Borrow
//     {
//       emit log("Account One Borrow");
//       vm.startPrank(accountOne);
//       vars.usdc.approve(address(cUSDC), 1e36);
//       assertEq(cUSDC.borrow(150e6), 0, "!cusdc borrow acc 1");
//       assertEq(cUSDC.totalBorrows(), 150e6, "!cUSDC total borrows");

//       uint256 maxWithdraw = poolLensSecondary.getMaxRedeem(accountOne, ICErc20(address(cMimoToken)));

//       uint256 beforeMimoBalance = vars.mimo.balanceOf(accountOne);
//       cMimoToken.redeemUnderlying(type(uint256).max);
//       uint256 afterMimoBalance = vars.mimo.balanceOf(accountOne);

//       assertEq(afterMimoBalance - beforeMimoBalance, maxWithdraw, "!mimo diff");
//       vm.stopPrank();
//     }
//   }
// }
