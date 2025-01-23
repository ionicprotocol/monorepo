// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { MarketsTest } from "./config/MarketsTest.t.sol";

import { DiamondExtension, DiamondBase } from "../ionic/DiamondExtension.sol";
import { ComptrollerFirstExtension } from "../compound/ComptrollerFirstExtension.sol";
import { PoolDirectory } from "../PoolDirectory.sol";
import { Comptroller } from "../compound/Comptroller.sol";
import { ICErc20 } from "../compound/CTokenInterfaces.sol";
import { CErc20Delegate } from "../compound/CErc20Delegate.sol";
import { CErc20PluginDelegate } from "../compound/CErc20PluginDelegate.sol";
import { CErc20Delegator } from "../compound/CErc20Delegator.sol";
import { FeeDistributor } from "../FeeDistributor.sol";
import { CTokenFirstExtension } from "../compound/CTokenFirstExtension.sol";
import { ComptrollerV3Storage } from "../compound/ComptrollerStorage.sol";
import { IonicComptroller } from "../compound/ComptrollerInterface.sol";

import { IERC20Upgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/extensions/IERC20MetadataUpgradeable.sol";
import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract MockComptrollerExtension is DiamondExtension, ComptrollerV3Storage {
  function getFirstMarketSymbol() public view returns (string memory) {
    return allMarkets[0].symbol();
  }

  function _setTransferPaused(bool) public returns (bool) {
    return false;
  }

  function _setSeizePaused(bool) public returns (bool) {
    return false;
  }

  // a dummy fn to test if the replacement of extension fns works
  function getSecondMarketSymbol() public view returns (string memory) {
    return allMarkets[1].symbol();
  }

  function _getExtensionFunctions() external pure virtual override returns (bytes4[] memory) {
    uint8 fnsCount = 4;
    bytes4[] memory functionSelectors = new bytes4[](fnsCount);
    functionSelectors[--fnsCount] = this._setTransferPaused.selector;
    functionSelectors[--fnsCount] = this._setSeizePaused.selector;
    functionSelectors[--fnsCount] = this.getFirstMarketSymbol.selector;
    functionSelectors[--fnsCount] = this.getSecondMarketSymbol.selector;
    require(fnsCount == 0, "use the correct array length");
    return functionSelectors;
  }
}

contract MockSecondComptrollerExtension is DiamondExtension, ComptrollerV3Storage {
  function getThirdMarketSymbol() public view returns (string memory) {
    return allMarkets[2].symbol();
  }

  function _getExtensionFunctions() external pure virtual override returns (bytes4[] memory) {
    uint8 fnsCount = 1;
    bytes4[] memory functionSelectors = new bytes4[](fnsCount);
    functionSelectors[--fnsCount] = this.getThirdMarketSymbol.selector;
    require(fnsCount == 0, "use the correct array length");
    return functionSelectors;
  }
}

contract MockThirdComptrollerExtension is DiamondExtension, ComptrollerV3Storage {
  function getFourthMarketSymbol() public view returns (string memory) {
    return allMarkets[3].symbol();
  }

  function _getExtensionFunctions() external pure virtual override returns (bytes4[] memory) {
    uint8 fnsCount = 1;
    bytes4[] memory functionSelectors = new bytes4[](fnsCount);
    functionSelectors[--fnsCount] = this.getFourthMarketSymbol.selector;
    require(fnsCount == 0, "use the correct array length");
    return functionSelectors;
  }
}

contract ExtensionsTest is MarketsTest {
  MockComptrollerExtension internal mockExtension;
  MockSecondComptrollerExtension internal second;
  MockThirdComptrollerExtension internal third;

  function afterForkSetUp() internal virtual override {
    super.afterForkSetUp();
    mockExtension = new MockComptrollerExtension();
    second = new MockSecondComptrollerExtension();
    third = new MockThirdComptrollerExtension();
  }

  function testExtensionReplace() public debuggingOnly fork(BSC_MAINNET) {
    address payable jFiatPoolAddress = payable(0x31d76A64Bc8BbEffb601fac5884372DEF910F044);
    _upgradeExistingPool(jFiatPoolAddress);

    // replace the first extension with the mock
    vm.prank(ffd.owner());
    ffd._registerComptrollerExtension(jFiatPoolAddress, mockExtension, comptrollerExtension);

    // assert that the replacement worked
    MockComptrollerExtension asMockExtension = MockComptrollerExtension(jFiatPoolAddress);
    emit log(asMockExtension.getSecondMarketSymbol());
    assertEq(asMockExtension.getSecondMarketSymbol(), "fETH-1", "market symbol does not match");

    // add a second mock extension
    vm.prank(ffd.owner());
    ffd._registerComptrollerExtension(jFiatPoolAddress, second, DiamondExtension(address(0)));

    // add again the third, removing the second
    vm.prank(ffd.owner());
    ffd._registerComptrollerExtension(jFiatPoolAddress, third, second);

    // assert that it worked
    DiamondBase asBase = DiamondBase(jFiatPoolAddress);
    address[] memory currentExtensions = asBase._listExtensions();
    assertEq(currentExtensions.length, 2, "extensions count does not match");
    assertEq(currentExtensions[0], address(mockExtension), "!first");
    assertEq(currentExtensions[1], address(third), "!second");
  }

  function testNewPoolExtensions() public fork(BSC_MAINNET) {
    PoolDirectory fpd = PoolDirectory(ap.getAddress("PoolDirectory"));

    _prepareComptrollerUpgrade(address(0));

    // deploy a pool that will have an extension registered automatically
    {
      (, address poolAddress) = fpd.deployPool(
        "just-a-test2",
        latestComptrollerImplementation,
        abi.encode(payable(address(ffd))),
        false,
        0.1e18,
        1.1e18,
        ap.getAddress("MasterPriceOracle")
      );

      address[] memory initExtensionsAfter = DiamondBase(payable(poolAddress))._listExtensions();
      assertEq(initExtensionsAfter.length, 1, "remove this if the ffd config is set up");
      assertEq(initExtensionsAfter[0], address(comptrollerExtension), "first extension is not the CFE");
    }
  }

  function testMulticallMarket() public fork(BSC_MAINNET) {
    uint8 random = uint8(block.timestamp % 256);
    PoolDirectory fpd = PoolDirectory(ap.getAddress("PoolDirectory"));

    (, PoolDirectory.Pool[] memory pools) = fpd.getActivePools();

    ComptrollerFirstExtension somePool = ComptrollerFirstExtension(pools[random % pools.length].comptroller);
    ICErc20[] memory markets = somePool.getAllMarkets();

    if (markets.length == 0) return;

    ICErc20 someMarket = markets[random % markets.length];

    emit log("pool");
    emit log_address(address(somePool));
    emit log("market");
    emit log_address(address(someMarket));

    vm.roll(block.number + 1);

    bytes memory blockNumberBeforeCall = abi.encodeWithSelector(someMarket.accrualBlockNumber.selector);
    bytes memory accrueInterestCall = abi.encodeWithSelector(someMarket.accrueInterest.selector);
    bytes memory blockNumberAfterCall = abi.encodeWithSelector(someMarket.accrualBlockNumber.selector);
    bytes[] memory results = someMarket.multicall(
      asArray(blockNumberBeforeCall, accrueInterestCall, blockNumberAfterCall)
    );
    uint256 blockNumberBefore = abi.decode(results[0], (uint256));
    uint256 blockNumberAfter = abi.decode(results[2], (uint256));

    assertGt(blockNumberAfter, blockNumberBefore, "did not accrue?");
  }

  function testBscExistingCTokenExtensionUpgrade() public fork(BSC_MAINNET) {
    _testAllPoolsAllMarketsCTokenExtensionUpgrade();
  }

  function testArbitrumExistingCTokenExtensionUpgrade() public fork(ARBITRUM_ONE) {
    _testAllPoolsAllMarketsCTokenExtensionUpgrade();
  }

  function _testAllPoolsAllMarketsCTokenExtensionUpgrade() internal {
    PoolDirectory fpd = PoolDirectory(ap.getAddress("PoolDirectory"));
    (, PoolDirectory.Pool[] memory pools) = fpd.getActivePools();
    for (uint256 i = 0; i < pools.length; i++) {
      _testPoolAllMarketsExtensionUpgrade(pools[i].comptroller);
    }
  }

  function _testPoolAllMarketsExtensionUpgrade(address poolAddress) internal {
    ComptrollerFirstExtension somePool = ComptrollerFirstExtension(poolAddress);

    ICErc20[] memory markets = somePool.getAllMarkets();

    if (markets.length == 0) return;

    for (uint256 j = 0; j < markets.length; j++) {
      ICErc20 someMarket = markets[j];
      CErc20Delegator asDelegator = CErc20Delegator(address(someMarket));

      emit log("pool");
      emit log_address(address(somePool));
      emit log("market");
      emit log_address(address(someMarket));

      try this._testExistingCTokenExtensionUpgrade(asDelegator) {} catch Error(string memory reason) {
        address plugin = address(CErc20PluginDelegate(address(asDelegator)).plugin());
        emit log("plugin");
        emit log_address(plugin);

        address latestPlugin = ffd.latestPluginImplementation(plugin);
        emit log("latest plugin impl");
        emit log_address(latestPlugin);

        revert(reason);
      }
    }
  }

  function _testExistingCTokenExtensionUpgrade(CErc20Delegator asDelegator) public {
    uint256 totalSupplyBefore = asDelegator.totalSupply();
    if (totalSupplyBefore == 0) return; // total supply should be non-zero

    // TODO
    _upgradeMarket(ICErc20(address(asDelegator)));

    // check if the extension was added
    address[] memory extensions = asDelegator._listExtensions();
    assertEq(extensions.length, 1, "the first extension should be added");
    assertEq(extensions[0], address(newCTokenExtension), "the first extension should be the only extension");

    // check if the storage is read from the same place
    uint256 totalSupplyAfter = asDelegator.totalSupply();
    assertGt(totalSupplyAfter, 0, "total supply should be non-zero");
    assertEq(totalSupplyAfter, totalSupplyBefore, "total supply should be the same");
  }

  function testBscComptrollerExtensions() public debuggingOnly fork(BSC_MAINNET) {
    _testComptrollersExtensions();
  }

  function testPolygonComptrollerExtensions() public debuggingOnly fork(POLYGON_MAINNET) {
    _testComptrollersExtensions();
  }

  function testChapelComptrollerExtensions() public debuggingOnly fork(BSC_CHAPEL) {
    _testComptrollersExtensions();
  }

  function testArbitrumComptrollerExtensions() public debuggingOnly fork(ARBITRUM_ONE) {
    _testComptrollersExtensions();
  }

  function _testComptrollersExtensions() internal {
    PoolDirectory fpd = PoolDirectory(ap.getAddress("PoolDirectory"));

    (, PoolDirectory.Pool[] memory pools) = fpd.getActivePools();

    for (uint8 i = 0; i < pools.length; i++) {
      address payable asPayable = payable(pools[i].comptroller);
      DiamondBase asBase = DiamondBase(asPayable);
      address[] memory extensions = asBase._listExtensions();
      assertEq(extensions.length, 1, "each pool should have the first extension");
    }
  }

  function testBulkAutoUpgrade() public debuggingOnly fork(POLYGON_MAINNET) {
    PoolDirectory fpd = PoolDirectory(ap.getAddress("PoolDirectory"));

    (, PoolDirectory.Pool[] memory pools) = fpd.getActivePools();

    for (uint8 i = 0; i < pools.length; i++) {
      vm.prank(ffd.owner());
      ffd.autoUpgradePool(IonicComptroller(pools[i].comptroller));
    }
  }

  function testPolygonTotalUnderlyingSupplied() public debuggingOnly fork(POLYGON_MAINNET) {
    _testTotalUnderlyingSupplied();
  }

  function testBscTotalUnderlyingSupplied() public debuggingOnly fork(BSC_MAINNET) {
    _testTotalUnderlyingSupplied();
  }

  function _testTotalUnderlyingSupplied() internal {
    PoolDirectory fpd = PoolDirectory(ap.getAddress("PoolDirectory"));

    (, PoolDirectory.Pool[] memory pools) = fpd.getActivePools();

    for (uint8 i = 0; i < pools.length; i++) {
      //      if (pools[i].comptroller == 0x5373C052Df65b317e48D6CAD8Bb8AC50995e9459) continue;
      //      if (pools[i].comptroller == 0xD265ff7e5487E9DD556a4BB900ccA6D087Eb3AD2) continue;
      ComptrollerFirstExtension poolExt = ComptrollerFirstExtension(pools[i].comptroller);

      ICErc20[] memory markets = poolExt.getAllMarkets();
      for (uint8 k = 0; k < markets.length; k++) {
        CErc20Delegate market = CErc20Delegate(address(markets[k]));
        //        emit log(market.contractType());
        //        emit log_named_address("impl", market.implementation());
        CTokenFirstExtension marketAsExt = CTokenFirstExtension(address(markets[k]));
        marketAsExt.getTotalUnderlyingSupplied();
      }
    }
  }

  function testDelegateType() public debuggingOnly fork(POLYGON_MAINNET) {
    emit log(CErc20Delegate(0x587906620D627fe75C4d1288C6A584089780959c).contractType());
  }
}
