// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { BaseTest } from "../config/BaseTest.t.sol";
import { UniswapV2LiquidatorFunder } from "../../liquidators/UniswapV2LiquidatorFunder.sol";
import { IERC20Upgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

contract UniswapV2LiquidatorFunderTest is BaseTest {
  address maiAddress;
  address usdcAddress;
  UniswapV2LiquidatorFunder uv2lf;
  address uniswapV2Router;

  function afterForkSetUp() internal override {
    uv2lf = new UniswapV2LiquidatorFunder();
    uniswapV2Router = ap.getAddress("IUniswapV2Router02");
    usdcAddress = 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d;
    maiAddress = 0x3F56e0c36d275367b8C502090EDF38289b3dEa0d;
  }

  function testConvertUsdcMai() public fork(BSC_MAINNET) {
    address[] memory swapPath = new address[](2);
    swapPath[0] = maiAddress;
    swapPath[1] = usdcAddress;
    bytes memory strategyData = abi.encode(uniswapV2Router, swapPath);

    uint256 outputUsdcExpected = 1e10;
    (IERC20Upgradeable inputToken, uint256 inputMaiRequired) = uv2lf.estimateInputAmount(
      outputUsdcExpected,
      strategyData
    );

    assertApproxEqAbs(inputMaiRequired, outputUsdcExpected, 1e9);
    assertEq(address(inputToken), maiAddress, "!mai address");
  }
}
