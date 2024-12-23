// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { ERC20 } from "solmate/tokens/ERC20.sol";
import { IERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

import "./config/BaseTest.t.sol";
import { IonicComptroller } from "../compound/ComptrollerInterface.sol";
import { ComptrollerFirstExtension } from "../compound/ComptrollerFirstExtension.sol";
import { CErc20PluginRewardsDelegate } from "../compound/CErc20PluginRewardsDelegate.sol";
import { Unitroller } from "../compound/Unitroller.sol";
import { DiamondExtension, DiamondBase } from "../ionic/DiamondExtension.sol";
import { ICErc20 } from "../compound/CTokenInterfaces.sol";
import { ISwapRouter } from "../external/uniswap/ISwapRouter.sol";
import { RedstoneAdapterPriceOracle } from "../oracles/default/RedstoneAdapterPriceOracle.sol";
import { RedstoneAdapterPriceOracleWrsETH } from "../oracles/default/RedstoneAdapterPriceOracleWrsETH.sol";
import { RedstoneAdapterPriceOracleWeETH } from "../oracles/default/RedstoneAdapterPriceOracleWeETH.sol";
import { MasterPriceOracle, BasePriceOracle } from "../oracles/MasterPriceOracle.sol";
import { PoolLens } from "../PoolLens.sol";
import { PoolLensSecondary } from "../PoolLensSecondary.sol";
import { JumpRateModel } from "../compound/JumpRateModel.sol";
import { LeveredPositionsLens } from "../ionic/levered/LeveredPositionsLens.sol";
import { ILiquidatorsRegistry } from "../liquidators/registry/ILiquidatorsRegistry.sol";
import { ILeveredPositionFactory } from "../ionic/levered/ILeveredPositionFactory.sol";
import { LeveredPositionFactoryFirstExtension } from "../ionic/levered/LeveredPositionFactoryFirstExtension.sol";
import { LeveredPositionFactorySecondExtension } from "../ionic/levered/LeveredPositionFactorySecondExtension.sol";
import { LeveredPositionFactory } from "../ionic/levered/LeveredPositionFactory.sol";
import { LeveredPositionStorage } from "../ionic/levered/LeveredPositionStorage.sol";
import { LeveredPosition } from "../ionic/levered/LeveredPosition.sol";
import { IonicFlywheelLensRouter, IonicComptroller, ICErc20, ERC20, IPriceOracle_IFLR } from "../ionic/strategies/flywheel/IonicFlywheelLensRouter.sol";
import { PoolDirectory } from "../PoolDirectory.sol";
import { AlgebraSwapLiquidator } from "../liquidators/AlgebraSwapLiquidator.sol";
import { AerodromeV2Liquidator } from "../liquidators/AerodromeV2Liquidator.sol";
import { AerodromeCLLiquidator } from "../liquidators/AerodromeCLLiquidator.sol";
import { CurveSwapLiquidator } from "../liquidators/CurveSwapLiquidator.sol";
import { CurveV2LpTokenPriceOracleNoRegistry } from "../oracles/default/CurveV2LpTokenPriceOracleNoRegistry.sol";
import { IRouter_Aerodrome } from "../external/aerodrome/IAerodromeRouter.sol";
import { VelodromeV2Liquidator } from "../liquidators/VelodromeV2Liquidator.sol";
import { IRouter_Velodrome } from "../external/velodrome/IVelodromeRouter.sol";
import { IonicUniV3Liquidator } from "../IonicUniV3Liquidator.sol";
import "forge-std/console.sol";

struct HealthFactorVars {
  uint256 usdcSupplied;
  uint256 wethSupplied;
  uint256 ezEthSuppled;
  uint256 stoneSupplied;
  uint256 wbtcSupplied;
  uint256 weEthSupplied;
  uint256 merlinBTCSupplied;
  uint256 usdcBorrowed;
  uint256 wethBorrowed;
  uint256 ezEthBorrowed;
  uint256 stoneBorrowed;
  uint256 wbtcBorrowed;
  uint256 weEthBorrowed;
  uint256 merlinBTCBorrowed;
  ICErc20 testCToken;
  address testUnderlying;
  uint256 amountBorrow;
}

contract DevTesting is BaseTest {
  IonicComptroller pool = IonicComptroller(0xFB3323E24743Caf4ADD0fDCCFB268565c0685556);
  PoolLensSecondary lens2 = PoolLensSecondary(0x7Ea7BB80F3bBEE9b52e6Ed3775bA06C9C80D4154);
  PoolLens lens = PoolLens(0x70BB19a56BfAEc65aE861E6275A90163AbDF36a6);
  LeveredPositionsLens levPosLens;

  address deployer = 0x1155b614971f16758C92c4890eD338C9e3ede6b7;
  address multisig = 0x8Fba84867Ba458E7c6E2c024D2DE3d0b5C3ea1C2;

  ICErc20 wethMarket;
  ICErc20 usdcMarket;
  ICErc20 usdtMarket;
  ICErc20 wbtcMarket;
  ICErc20 ezEthMarket;
  ICErc20 stoneMarket;
  ICErc20 weEthMarket;
  ICErc20 merlinBTCMarket;

  // mode mainnet assets
  address WETH = 0x4200000000000000000000000000000000000006;
  address USDC = 0xd988097fb8612cc24eeC14542bC03424c656005f;
  address USDT = 0xf0F161fDA2712DB8b566946122a5af183995e2eD;
  address WBTC = 0xcDd475325D6F564d27247D1DddBb0DAc6fA0a5CF;
  address UNI = 0x3e7eF8f50246f725885102E8238CBba33F276747;
  address SNX = 0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3;
  address LINK = 0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb;
  address DAI = 0xE7798f023fC62146e8Aa1b36Da45fb70855a77Ea;
  address BAL = 0xD08a2917653d4E460893203471f0000826fb4034;
  address AAVE = 0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2;
  address weETH = 0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A;
  address merlinBTC = 0x59889b7021243dB5B1e065385F918316cD90D46c;
  IERC20Upgradeable wsuperOETH = IERC20Upgradeable(0x7FcD174E80f264448ebeE8c88a7C4476AAF58Ea6);
  IERC20Upgradeable superOETH = IERC20Upgradeable(0xDBFeFD2e8460a6Ee4955A68582F85708BAEA60A3);

  function afterForkSetUp() internal override {
    super.afterForkSetUp();

    if (block.chainid == MODE_MAINNET) {
      wethMarket = ICErc20(0x71ef7EDa2Be775E5A7aa8afD02C45F059833e9d2);
      usdcMarket = ICErc20(0x2BE717340023C9e14C1Bb12cb3ecBcfd3c3fB038);
      usdtMarket = ICErc20(0x94812F2eEa03A49869f95e1b5868C6f3206ee3D3);
      wbtcMarket = ICErc20(0xd70254C3baD29504789714A7c69d60Ec1127375C);
      ezEthMarket = ICErc20(0x59e710215d45F584f44c0FEe83DA6d43D762D857);
      stoneMarket = ICErc20(0x959FA710CCBb22c7Ce1e59Da82A247e686629310);
      weEthMarket = ICErc20(0xA0D844742B4abbbc43d8931a6Edb00C56325aA18);
      merlinBTCMarket = ICErc20(0x19F245782b1258cf3e11Eda25784A378cC18c108);
      ICErc20[] memory markets = pool.getAllMarkets();
      wethMarket = markets[0];
      usdcMarket = markets[1];
    } else {}
    levPosLens = LeveredPositionsLens(ap.getAddress("LeveredPositionsLens"));
  }

  function testProxyAdmin() public debuggingOnly fork(MODE_MAINNET) {
    TransparentUpgradeableProxy proxy = TransparentUpgradeableProxy(payable(0x4E854cde138495a3eB9CFe48e50F12dC352cD834));
    bytes32 bytesAtSlot = vm.load(address(proxy), _ADMIN_SLOT);
    address admin = address(uint160(uint256(bytesAtSlot)));
    emit log_named_address("admin from slot", admin);
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

  function testRawCall() public debuggingOnly forkAtBlock(BASE_MAINNET, 20569373) {
    address caller = 0xC13110d04f22ed464Cb72A620fF8163585358Ff9;
    address target = 0x180272dDf5767C771b3a8d37A2DC6cA507aaa1d9;

    ILeveredPositionFactory factory = ILeveredPositionFactory(ap.getAddress("LeveredPositionFactory"));
    ILiquidatorsRegistry registry = factory.liquidatorsRegistry();

    AerodromeCLLiquidator aerodomeClLiquidator = new AerodromeCLLiquidator();

    IERC20Upgradeable inputToken = IERC20Upgradeable(WETH);
    IERC20Upgradeable outputToken = wsuperOETH;
    vm.startPrank(registry.owner());
    registry._setRedemptionStrategy(aerodomeClLiquidator, inputToken, outputToken);
    registry._setRedemptionStrategy(aerodomeClLiquidator, outputToken, inputToken);
    vm.stopPrank();

    bytes memory data = hex"c393d0e3";
    vm.prank(caller);
    _functionCall(target, data, "raw call failed");

    uint256 superOETHBalance = superOETH.balanceOf(target);
    emit log_named_uint("balance of levered position", superOETHBalance);
  }
}
