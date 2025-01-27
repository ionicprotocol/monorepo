// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { ICErc20 } from "../../compound/CTokenInterfaces.sol";
import { MasterPriceOracle } from "../../oracles/MasterPriceOracle.sol";
import { UniswapV3LiquidatorFunder } from "../../liquidators/UniswapV3LiquidatorFunder.sol";
import { IonicLiquidator } from "../../IonicLiquidator.sol";
import { IUniswapV2Pair } from "../../external/uniswap/IUniswapV2Pair.sol";
import { IUniswapV2Factory } from "../../external/uniswap/IUniswapV2Factory.sol";
import { IUniswapV3Factory } from "../../external/uniswap/IUniswapV3Factory.sol";
import { Quoter } from "../../external/uniswap/quoter/Quoter.sol";
import { IUniswapV3Pool } from "../../external/uniswap/IUniswapV3Pool.sol";
import { ISwapRouter } from "../../external/uniswap/ISwapRouter.sol";
import { IComptroller } from "../../external/compound/IComptroller.sol";
import { IUniswapV2Router02 } from "../../external/uniswap/IUniswapV2Router02.sol";
import { IERC20Upgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import { IRedemptionStrategy } from "../../liquidators/IRedemptionStrategy.sol";
import { IFundsConversionStrategy } from "../../liquidators/IFundsConversionStrategy.sol";

import { BaseTest } from "../config/BaseTest.t.sol";

contract UniswapV3LiquidatorFunderTest is BaseTest {
  UniswapV3LiquidatorFunder private uniswapv3Liquidator;

  IERC20Upgradeable parToken;
  IERC20Upgradeable usdcToken;
  address univ3SwapRouter;
  uint256 poolFee;
  Quoter quoter;
  MasterPriceOracle mpo;

  function afterForkSetUp() internal override {
    mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));

    if (block.chainid == POLYGON_MAINNET) {
      quoter = new Quoter(0x1F98431c8aD98523631AE4a59f267346ea31F984);
      univ3SwapRouter = 0xE592427A0AEce92De3Edee1F18E0157C05861564;
      parToken = IERC20Upgradeable(0xE2Aa7db6dA1dAE97C5f5C6914d285fBfCC32A128); // PAR, 18 decimals
      usdcToken = IERC20Upgradeable(0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174); // USDC, 6 decimals
      poolFee = 500;
    }
    uniswapv3Liquidator = new UniswapV3LiquidatorFunder();
  }

  function testUniV3ParUsdcRedeem() public fork(POLYGON_MAINNET) {
    uint256 parInputAmount = 10000e18;
    address parTokenWhale = 0xBA12222222228d8Ba445958a75a0704d566BF2C8; // Balancer V2

    vm.prank(parTokenWhale);
    parToken.transfer(address(uniswapv3Liquidator), parInputAmount);

    bytes memory data = abi.encode(parToken, usdcToken, poolFee, ISwapRouter(univ3SwapRouter), quoter);
    (IERC20Upgradeable outputToken, uint256 outputAmount) = uniswapv3Liquidator.redeem(parToken, parInputAmount, data);

    uint256 inputValue = (parInputAmount * mpo.price(address(parToken))) / 1e18;
    uint256 outputValue = (outputAmount * mpo.price(address(usdcToken))) / 1e6;

    assertEq(address(outputToken), address(usdcToken), "!out tok");
    assertApproxEqRel(inputValue, outputValue, 1e16, "!out amount");
  }
}
