// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.10;

import { LiquidatorsRegistry } from "../liquidators/registry/LiquidatorsRegistry.sol";
import { LiquidatorsRegistryExtension } from "../liquidators/registry/LiquidatorsRegistryExtension.sol";
import { LiquidatorsRegistrySecondExtension } from "../liquidators/registry/LiquidatorsRegistrySecondExtension.sol";
import { ILiquidatorsRegistry } from "../liquidators/registry/ILiquidatorsRegistry.sol";
import { IRedemptionStrategy } from "../liquidators/IRedemptionStrategy.sol";
import { MasterPriceOracle } from "../oracles/MasterPriceOracle.sol";

import { IERC20Upgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

import { BaseTest } from "./config/BaseTest.t.sol";
import "../ionic/DiamondExtension.sol";
import { SafeOwnable } from "../ionic/SafeOwnable.sol";

contract LiquidatorsRegistryTest is BaseTest {
  ILiquidatorsRegistry registry;

  // all-chains
  IERC20Upgradeable stable;
  IERC20Upgradeable wtoken;
  MasterPriceOracle mpo;

  // chapel
  IERC20Upgradeable chapelBomb = IERC20Upgradeable(0xe45589fBad3A1FB90F5b2A8A3E8958a8BAB5f768);
  IERC20Upgradeable chapelTUsd = IERC20Upgradeable(0x4f1885D25eF219D3D4Fa064809D6D4985FAb9A0b);
  IERC20Upgradeable chapelTDai = IERC20Upgradeable(0x8870f7102F1DcB1c35b01af10f1baF1B00aD6805);

  // bsc
  IERC20Upgradeable wbnbBusdLpToken = IERC20Upgradeable(0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16);
  IERC20Upgradeable usdcBusdCakeLpToken = IERC20Upgradeable(0x2354ef4DF11afacb85a5C7f98B624072ECcddbB1);
  IERC20Upgradeable ankrAnkrBnbGammaLpToken = IERC20Upgradeable(0x3f8f3caefF393B1994a9968E835Fd38eCba6C1be);

  // polygon
  IERC20Upgradeable usdr3CrvCurveLpToken = IERC20Upgradeable(0xa138341185a9D0429B0021A11FB717B225e13e1F);
  IERC20Upgradeable maticxBbaBalancerStableLpToken = IERC20Upgradeable(0xb20fC01D21A50d2C734C4a1262B4404d41fA7BF0);
  IERC20Upgradeable stMaticBbaBalancerStableLpToken = IERC20Upgradeable(0x216690738Aac4aa0C4770253CA26a28f0115c595);
  IERC20Upgradeable mimoParBalancerWeightedLpToken = IERC20Upgradeable(0x82d7f08026e21c7713CfAd1071df7C8271B17Eae);

  function afterForkSetUp() internal override {
    registry = ILiquidatorsRegistry(ap.getAddress("LiquidatorsRegistry"));
    stable = IERC20Upgradeable(ap.getAddress("stableToken"));
    wtoken = IERC20Upgradeable(ap.getAddress("wtoken"));
    mpo = MasterPriceOracle(ap.getAddress("MasterPriceOracle"));
  }

  function upgradeRegistry() internal {
    DiamondBase asBase = DiamondBase(address(registry));
    address[] memory exts = asBase._listExtensions();
    LiquidatorsRegistryExtension newExt1 = new LiquidatorsRegistryExtension();
    LiquidatorsRegistrySecondExtension newExt2 = new LiquidatorsRegistrySecondExtension();
    vm.prank(SafeOwnable(address(registry)).owner());
    asBase._registerExtension(newExt1, DiamondExtension(exts[0]));
    vm.prank(SafeOwnable(address(registry)).owner());
    asBase._registerExtension(newExt2, DiamondExtension(exts[1]));
  }

  function _functionCall(
    address target,
    bytes memory data,
    string memory errorMessage
  ) internal returns (bytes memory) {
    (bool success, bytes memory returndata) = target.call(data);

    if (!success) {
      // Look for revert reason and bubble it up if present
      if (returndata.length > 0) {
        // The easiest way to bubble the revert reason is using memory via assembly

        // solhint-disable-next-line no-inline-assembly
        assembly {
          let returndata_size := mload(returndata)
          revert(add(32, returndata), returndata_size)
        }
      } else {
        revert(errorMessage);
      }
    }

    return returndata;
  }

  function testResetStrategies() public debuggingOnly fork(BSC_CHAPEL) {
    upgradeRegistry();

    IRedemptionStrategy[] memory strategiesConfig = new IRedemptionStrategy[](3);
    IERC20Upgradeable[] memory inputTokensConfig = new IERC20Upgradeable[](3);
    IERC20Upgradeable[] memory outputTokensConfig = new IERC20Upgradeable[](3);
    {
      strategiesConfig[0] = IRedemptionStrategy(0xC875a8D8E8a593953115131697a788faEAa37109);
      strategiesConfig[1] = IRedemptionStrategy(0xC875a8D8E8a593953115131697a788faEAa37109);
      strategiesConfig[2] = IRedemptionStrategy(0xC875a8D8E8a593953115131697a788faEAa37109);
      inputTokensConfig[0] = IERC20Upgradeable(chapelBomb);
      inputTokensConfig[1] = IERC20Upgradeable(chapelTUsd);
      inputTokensConfig[2] = IERC20Upgradeable(chapelTDai);
      outputTokensConfig[0] = IERC20Upgradeable(chapelTUsd);
      outputTokensConfig[1] = IERC20Upgradeable(chapelBomb);
      outputTokensConfig[2] = IERC20Upgradeable(chapelBomb);
    }

    bool matchingBefore = registry.pairsStrategiesMatch(strategiesConfig, inputTokensConfig, outputTokensConfig);
    assertEq(matchingBefore, false, "should not match prior");

    vm.prank(ap.getAddress("deployer"));
    registry._resetRedemptionStrategies(strategiesConfig, inputTokensConfig, outputTokensConfig);

    bool matchingAfter = registry.pairsStrategiesMatch(strategiesConfig, inputTokensConfig, outputTokensConfig);
    assertEq(matchingAfter, true, "should match after");
  }

  function testResetDuplicatingStrategies() public debuggingOnly fork(BSC_CHAPEL) {
    upgradeRegistry();

    IRedemptionStrategy[] memory strategiesConfig = new IRedemptionStrategy[](4);
    IERC20Upgradeable[] memory inputTokensConfig = new IERC20Upgradeable[](4);
    IERC20Upgradeable[] memory outputTokensConfig = new IERC20Upgradeable[](4);
    {
      strategiesConfig[0] = IRedemptionStrategy(0xC875a8D8E8a593953115131697a788faEAa37109);
      strategiesConfig[1] = IRedemptionStrategy(0xC875a8D8E8a593953115131697a788faEAa37109);
      strategiesConfig[2] = IRedemptionStrategy(0xC875a8D8E8a593953115131697a788faEAa37109);
      strategiesConfig[3] = IRedemptionStrategy(0xC875a8D8E8a593953115131697a788faEAa37109);
      inputTokensConfig[0] = IERC20Upgradeable(chapelBomb);
      inputTokensConfig[1] = IERC20Upgradeable(chapelTUsd);
      inputTokensConfig[2] = IERC20Upgradeable(chapelTDai);
      inputTokensConfig[3] = IERC20Upgradeable(chapelTDai);
      outputTokensConfig[0] = IERC20Upgradeable(chapelTUsd);
      outputTokensConfig[1] = IERC20Upgradeable(chapelBomb);
      outputTokensConfig[2] = IERC20Upgradeable(chapelBomb);
      outputTokensConfig[3] = IERC20Upgradeable(chapelBomb);
    }

    bool matchingBefore = registry.pairsStrategiesMatch(strategiesConfig, inputTokensConfig, outputTokensConfig);
    assertEq(matchingBefore, false, "should not match prior");

    vm.prank(ap.getAddress("deployer"));
    registry._resetRedemptionStrategies(strategiesConfig, inputTokensConfig, outputTokensConfig);

    bool matchingAfter = registry.pairsStrategiesMatch(strategiesConfig, inputTokensConfig, outputTokensConfig);
    assertEq(matchingAfter, true, "should match after");
  }

  function testRedemptionPathChapel() public debuggingOnly fork(BSC_CHAPEL) {
    emit log("bomb tusd");
    emit log(registry.redemptionStrategiesByTokens(chapelBomb, chapelTDai).name());
    emit log("tusd bomb");
    emit log(registry.redemptionStrategiesByTokens(chapelTDai, chapelBomb).name());

    (IRedemptionStrategy strategy, bytes memory strategyData) = registry.getRedemptionStrategy(chapelBomb, chapelTDai);
  }

  function testInputTokensChapel() public debuggingOnly fork(BSC_CHAPEL) {
    address[] memory inputTokens = registry.getInputTokensByOutputToken(chapelBomb);

    emit log_named_array("inputs", inputTokens);
  }

  function testInputTokensBsc() public debuggingOnly fork(BSC_MAINNET) {
    address[] memory inputTokens = registry.getInputTokensByOutputToken(stable);

    emit log_named_array("inputs", inputTokens);
  }

  function _swap(
    address whale,
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    IERC20Upgradeable outputToken,
    uint256 tolerance
  ) internal {
    vm.startPrank(whale);
    inputToken.approve(address(registry), inputAmount);
    (uint256 swappedAmountOut, uint256 slippage) = registry.amountOutAndSlippageOfSwap(
      inputToken,
      inputAmount,
      outputToken
    );
    vm.stopPrank();

    emit log_named_uint("received", swappedAmountOut);
    assertLt(slippage, tolerance, "slippage too high");
  }

  function testSwappingUniLpBsc() public fork(BSC_MAINNET) {
    address lpTokenWhale = 0x14B2e8329b8e06BCD524eb114E23fAbD21910109;

    IERC20Upgradeable inputToken = usdcBusdCakeLpToken;
    uint256 inputAmount = 1e18;
    IERC20Upgradeable outputToken = stable;

    _swap(lpTokenWhale, inputToken, inputAmount, outputToken, 1e16);
  }

  function testSwappingGammaLpBsc() public fork(BSC_MAINNET) {
    address lpTokenWhale = 0xd44ad81474d075c3Bf0307830977A5804BfC0bc7; // thena gauge

    IERC20Upgradeable inputToken = ankrAnkrBnbGammaLpToken;
    uint256 inputAmount = 1e18;
    IERC20Upgradeable outputToken = wtoken;

    _swap(lpTokenWhale, inputToken, inputAmount, outputToken, 1e16);
  }

  function testSwappingBalancerStableLpPolygon() public fork(POLYGON_MAINNET) {
    // TODO: run deployment to fix the liquidation path and set the balancer liquidator data
    address lpTokenWhale = 0xBA12222222228d8Ba445958a75a0704d566BF2C8; // balancer gauge

    // maticx-wmatic aave boosted
    uint256 inputAmount = 1e18;
    IERC20Upgradeable outputToken = wtoken;

    _swap(lpTokenWhale, maticxBbaBalancerStableLpToken, inputAmount, outputToken, 1e16);

    // stmatic-wmatic aave boosted
    _swap(lpTokenWhale, stMaticBbaBalancerStableLpToken, inputAmount, outputToken, 1e16);
  }

  function testSwappingBalancerWeightedLpPolygon() public fork(POLYGON_MAINNET) {
    address lpTokenWhale = 0xbB60ADbe38B4e6ab7fb0f9546C2C1b665B86af11; // mimo staker

    IERC20Upgradeable inputToken = mimoParBalancerWeightedLpToken;
    uint256 inputAmount = 1e18;
    IERC20Upgradeable outputToken = IERC20Upgradeable(0xE2Aa7db6dA1dAE97C5f5C6914d285fBfCC32A128); // PAR

    _swap(lpTokenWhale, inputToken, inputAmount, outputToken, 5e16);
  }

  address tusdWhale = 0x161FbE0943Af4A39a50262026A81a243B635982d; // old XBombSwap
  address tdaiWhale = 0xd816eb4660615BBF080ddf425F28ea4AF30d04D5; // old XBombSwap
  address bombWhale = 0xd816eb4660615BBF080ddf425F28ea4AF30d04D5; // old XBombSwap

  function testSwappingBombTDaiChapel() public debuggingOnly fork(BSC_CHAPEL) {
    IERC20Upgradeable inputToken = chapelBomb;
    uint256 inputAmount = 1e18;
    IERC20Upgradeable outputToken = chapelTDai;

    _swap(bombWhale, inputToken, inputAmount, outputToken, 5e16);
  }

  function testSwappingTUsdBombChapel() public debuggingOnly fork(BSC_CHAPEL) {
    IERC20Upgradeable inputToken = chapelTUsd;
    uint256 inputAmount = 1e18;
    IERC20Upgradeable outputToken = chapelBomb;

    _swap(tusdWhale, inputToken, inputAmount, outputToken, 5e16);
  }

  function testUpdateLiquidator() public debuggingOnly fork(MODE_MAINNET) {
    LiquidatorsRegistry registry = LiquidatorsRegistry(0xc71B968C6C23e2723Bae32957D815C9bE3ca1b34);
    address multisig = 0x8Fba84867Ba458E7c6E2c024D2DE3d0b5C3ea1C2;
    vm.prank(multisig);
    registry._registerExtension(
      DiamondExtension(0x3FA4BC2FCAc5515d5b758D4D580bbD626c93D621),
      DiamondExtension(0xac409691b385Fdbb66752Ff2D97e50BC23fF2295)
    );
  }
}
