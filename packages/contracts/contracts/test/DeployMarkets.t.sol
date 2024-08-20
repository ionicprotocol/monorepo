// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "forge-std/Test.sol";

import { ERC20 } from "solmate/tokens/ERC20.sol";
import { Auth, Authority } from "solmate/auth/Auth.sol";
import { MockERC20 } from "solmate/test/utils/mocks/MockERC20.sol";
import { IonicFlywheelDynamicRewardsPlugin } from "../ionic/strategies/flywheel/rewards/IonicFlywheelDynamicRewardsPlugin.sol";
import { FlywheelCore } from "flywheel/FlywheelCore.sol";
import { IFlywheelBooster } from "../ionic/strategies/flywheel/IFlywheelBooster.sol";
import { IFlywheelRewards } from "../ionic/strategies/flywheel/rewards/IFlywheelRewards.sol";
import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

import { ICErc20, ICErc20Plugin, ICErc20PluginRewards } from "../compound/CTokenInterfaces.sol";
import { JumpRateModel } from "../compound/JumpRateModel.sol";
import { Unitroller } from "../compound/Unitroller.sol";
import { Comptroller } from "../compound/Comptroller.sol";
import { ComptrollerFirstExtension } from "../compound/ComptrollerFirstExtension.sol";
import { CTokenFirstExtension, DiamondExtension } from "../compound/CTokenFirstExtension.sol";
import { CErc20Delegate } from "../compound/CErc20Delegate.sol";
import { CErc20PluginDelegate } from "../compound/CErc20PluginDelegate.sol";
import { CErc20PluginRewardsDelegate } from "../compound/CErc20PluginRewardsDelegate.sol";
import { CErc20 } from "../compound/CToken.sol";
import { IonicComptroller } from "../compound/ComptrollerInterface.sol";
import { InterestRateModel } from "../compound/InterestRateModel.sol";
import { FeeDistributor } from "../FeeDistributor.sol";
import { PoolDirectory } from "../PoolDirectory.sol";
import { AuthoritiesRegistry } from "../ionic/AuthoritiesRegistry.sol";
import { PoolRolesAuthority } from "../ionic/PoolRolesAuthority.sol";
import { IonicFlywheelCore } from "../ionic/strategies/flywheel/IonicFlywheelCore.sol";

import { MockPriceOracle } from "../oracles/1337/MockPriceOracle.sol";
import { MockERC4626 } from "../ionic/strategies/MockERC4626.sol";
import { MockERC4626Dynamic } from "../ionic/strategies/MockERC4626Dynamic.sol";

contract DeployMarketsTest is Test {
  MockERC20 underlyingToken;
  MockERC20 rewardToken;

  JumpRateModel interestModel;
  IonicComptroller comptroller;

  CErc20Delegate cErc20Delegate;
  CErc20PluginDelegate cErc20PluginDelegate;
  CErc20PluginRewardsDelegate cErc20PluginRewardsDelegate;

  MockERC4626 mockERC4626;
  MockERC4626Dynamic mockERC4626Dynamic;

  FeeDistributor ionicAdmin;
  PoolDirectory poolDirectory;

  IonicFlywheelDynamicRewardsPlugin rewards;

  address[] markets;
  bool[] t;
  bool[] f;
  IonicFlywheelCore[] flywheelsToClaim;

  function setUpBaseContracts() public {
    underlyingToken = new MockERC20("UnderlyingToken", "UT", 18);
    rewardToken = new MockERC20("RewardToken", "RT", 18);
    interestModel = new JumpRateModel(2343665, 1e18, 1e18, 4e18, 0.8e18);
    ionicAdmin = new FeeDistributor();
    ionicAdmin.initialize(1e16);
    poolDirectory = new PoolDirectory();
    poolDirectory.initialize(false, new address[](0));
  }

  function setUpExtensions() public {
    cErc20Delegate = new CErc20Delegate();
    cErc20PluginDelegate = new CErc20PluginDelegate();
    cErc20PluginRewardsDelegate = new CErc20PluginRewardsDelegate();

    DiamondExtension[] memory cErc20DelegateExtensions = new DiamondExtension[](2);
    cErc20DelegateExtensions[0] = cErc20Delegate;
    cErc20DelegateExtensions[1] = new CTokenFirstExtension();
    ionicAdmin._setCErc20DelegateExtensions(address(0), cErc20DelegateExtensions);
    ionicAdmin._setCErc20DelegateExtensions(address(cErc20Delegate), cErc20DelegateExtensions);

    cErc20DelegateExtensions[0] = cErc20PluginDelegate;
    ionicAdmin._setCErc20DelegateExtensions(address(cErc20PluginDelegate), cErc20DelegateExtensions);

    cErc20DelegateExtensions[0] = cErc20PluginRewardsDelegate;
    ionicAdmin._setCErc20DelegateExtensions(address(cErc20PluginRewardsDelegate), cErc20DelegateExtensions);

    ionicAdmin._setLatestCErc20Delegate(cErc20Delegate.delegateType(), address(cErc20Delegate), "");

    ionicAdmin._setLatestCErc20Delegate(
      cErc20PluginDelegate.delegateType(),
      address(cErc20PluginDelegate),
      abi.encode(address(0))
    );

    ionicAdmin._setLatestCErc20Delegate(
      cErc20PluginRewardsDelegate.delegateType(),
      address(cErc20PluginRewardsDelegate),
      abi.encode(address(0))
    );
  }

  function setUpPool() public {
    underlyingToken.mint(address(this), 100e36);

    MockPriceOracle priceOracle = new MockPriceOracle(10);
    Comptroller tempComptroller = new Comptroller();
    ionicAdmin._setLatestComptrollerImplementation(address(0), address(tempComptroller));
    DiamondExtension[] memory extensions = new DiamondExtension[](2);
    extensions[0] = new ComptrollerFirstExtension();
    extensions[1] = tempComptroller;
    ionicAdmin._setComptrollerExtensions(address(tempComptroller), extensions);
    (, address comptrollerAddress) = poolDirectory.deployPool(
      "TestPool",
      address(tempComptroller),
      abi.encode(payable(address(ionicAdmin))),
      false,
      0.1e18,
      1.1e18,
      address(priceOracle)
    );

    Unitroller(payable(comptrollerAddress))._acceptAdmin();
    comptroller = IonicComptroller(comptrollerAddress);

    AuthoritiesRegistry impl = new AuthoritiesRegistry();
    TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(address(impl), address(1), "");
    AuthoritiesRegistry newAr = AuthoritiesRegistry(address(proxy));
    newAr.initialize(address(321));
    ionicAdmin.reinitialize(newAr);
    PoolRolesAuthority poolAuth = newAr.createPoolAuthority(comptrollerAddress);
    newAr.setUserRole(comptrollerAddress, address(this), poolAuth.BORROWER_ROLE(), true);
    newAr.setUserRole(comptrollerAddress, address(ionicAdmin), poolAuth.SUPPLIER_ROLE(), true);
  }

  function setUp() public {
    setUpBaseContracts();
    setUpPool();
    setUpExtensions();
    vm.roll(1);
  }

  function testDeployCErc20Delegate() public {
    vm.roll(1);
    comptroller._deployMarket(
      cErc20Delegate.delegateType(),
      abi.encode(
        address(underlyingToken),
        comptroller,
        payable(address(ionicAdmin)),
        InterestRateModel(address(interestModel)),
        "cUnderlyingToken",
        "CUT",
        uint256(1),
        uint256(0)
      ),
      "",
      0.9e18
    );

    ICErc20[] memory allMarkets = comptroller.getAllMarkets();
    ICErc20 cToken = allMarkets[allMarkets.length - 1];
    assertEq(cToken.name(), "cUnderlyingToken");
    underlyingToken.approve(address(cToken), 1e36);
    address[] memory cTokens = new address[](1);
    cTokens[0] = address(cToken);
    comptroller.enterMarkets(cTokens);
    vm.roll(1);
    require(cToken.mint(10e18) == 0, "mint failed");
    assertEq(cToken.totalSupply(), 10e18 * 5);
    assertEq(underlyingToken.balanceOf(address(cToken)), 10e18);
  }

  function testDeployCErc20PluginDelegate() public {
    mockERC4626 = new MockERC4626(ERC20(address(underlyingToken)));

    vm.roll(1);
    comptroller._deployMarket(
      cErc20PluginDelegate.delegateType(),
      abi.encode(
        address(underlyingToken),
        comptroller,
        payable(address(ionicAdmin)),
        InterestRateModel(address(interestModel)),
        "cUnderlyingToken",
        "CUT",
        uint256(1),
        uint256(0)
      ),
      abi.encode(mockERC4626),
      0.9e18
    );

    ICErc20[] memory allMarkets = comptroller.getAllMarkets();
    ICErc20Plugin cToken = ICErc20Plugin(address(allMarkets[allMarkets.length - 1]));

    assertEq(address(cToken.plugin()), address(mockERC4626), "!plugin == erc4626");

    underlyingToken.approve(address(cToken), 1e36);
    address[] memory cTokens = new address[](1);
    cTokens[0] = address(cToken);
    comptroller.enterMarkets(cTokens);
    vm.roll(1);

    cToken.mint(10e18);
    assertEq(cToken.totalSupply(), 10e18 * 5);
    assertEq(mockERC4626.balanceOf(address(cToken)), 10e18);
    assertEq(underlyingToken.balanceOf(address(mockERC4626)), 10e18);
  }

  function testDeployCErc20PluginRewardsDelegate() public {
    IonicFlywheelCore impl = new IonicFlywheelCore();
    TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(address(impl), address(1), "");
    IonicFlywheelCore flywheel = IonicFlywheelCore(address(proxy));
    flywheel.initialize(underlyingToken, IFlywheelRewards(address(0)), IFlywheelBooster(address(0)), address(this));
    IonicFlywheelCore asFlywheelCore = IonicFlywheelCore(address(flywheel));
    rewards = new IonicFlywheelDynamicRewardsPlugin(asFlywheelCore, 1);
    flywheel.setFlywheelRewards(rewards);

    mockERC4626Dynamic = new MockERC4626Dynamic(ERC20(address(underlyingToken)), asFlywheelCore);

    vm.roll(1);
    comptroller._deployMarket(
      cErc20PluginRewardsDelegate.delegateType(),
      abi.encode(
        address(underlyingToken),
        comptroller,
        payable(address(ionicAdmin)),
        InterestRateModel(address(interestModel)),
        "cUnderlyingToken",
        "CUT",
        uint256(1),
        uint256(0)
      ),
      abi.encode(address(mockERC4626Dynamic), address(flywheel), address(underlyingToken)),
      0.9e18
    );

    ICErc20[] memory allMarkets = comptroller.getAllMarkets();
    ICErc20PluginRewards cToken = ICErc20PluginRewards(address(allMarkets[allMarkets.length - 1]));

    flywheel.addStrategyForRewards(ERC20(address(cToken)));

    assertEq(address(cToken.plugin()), address(mockERC4626Dynamic), "!plugin == erc4626");
    assertEq(underlyingToken.allowance(address(cToken), address(mockERC4626Dynamic)), type(uint256).max);
    assertEq(underlyingToken.allowance(address(cToken), address(flywheel)), 0);

    cToken.approve(address(rewardToken), address(flywheel));
    assertEq(rewardToken.allowance(address(cToken), address(flywheel)), type(uint256).max);

    underlyingToken.approve(address(cToken), 1e36);
    address[] memory cTokens = new address[](1);
    cTokens[0] = address(cToken);
    comptroller.enterMarkets(cTokens);
    vm.roll(1);

    cToken.mint(10000000);
    assertEq(cToken.totalSupply(), 10000000 * 5);
    assertEq(mockERC4626Dynamic.balanceOf(address(cToken)), 10000000);
    assertEq(underlyingToken.balanceOf(address(mockERC4626Dynamic)), 10000000);
  }

  function testAutoImplementationCErc20Delegate() public {
    mockERC4626 = new MockERC4626(ERC20(address(underlyingToken)));

    vm.roll(1);
    comptroller._deployMarket(
      cErc20PluginDelegate.delegateType(),
      abi.encode(
        address(underlyingToken),
        comptroller,
        payable(address(ionicAdmin)),
        InterestRateModel(address(interestModel)),
        "cUnderlyingToken",
        "CUT",
        uint256(1),
        uint256(0)
      ),
      abi.encode(mockERC4626),
      0.9e18
    );

    ICErc20[] memory allMarkets = comptroller.getAllMarkets();
    ICErc20Plugin cToken = ICErc20Plugin(address(allMarkets[allMarkets.length - 1]));

    assertEq(address(cToken.plugin()), address(mockERC4626), "!plugin == erc4626");

    address implBefore = cToken.implementation();
    // just testing to replace the plugin delegate with the plugin rewards delegate
    ionicAdmin._setLatestCErc20Delegate(
      cToken.delegateType(),
      address(cErc20PluginRewardsDelegate),
      abi.encode(address(0)) // should trigger use of latest implementation
    );

    // run the upgrade
    vm.prank(ionicAdmin.owner());
    ionicAdmin.autoUpgradePool(comptroller);

    address implAfter = cToken.implementation();

    assertEq(implBefore, address(cErc20PluginDelegate), "the old impl should be the plugin delegate");
    assertEq(implAfter, address(cErc20PluginRewardsDelegate), "the new impl should be the plugin rewards delegate");
  }

  function testAutoImplementationPlugin() public {
    MockERC4626 pluginA = new MockERC4626(ERC20(address(underlyingToken)));
    MockERC4626 pluginB = new MockERC4626(ERC20(address(underlyingToken)));

    vm.roll(1);
    comptroller._deployMarket(
      cErc20PluginDelegate.delegateType(),
      abi.encode(
        address(underlyingToken),
        comptroller,
        payable(address(ionicAdmin)),
        InterestRateModel(address(interestModel)),
        "cUnderlyingToken",
        "CUT",
        uint256(1),
        uint256(0)
      ),
      abi.encode(pluginA),
      0.9e18
    );

    ICErc20[] memory allMarkets = comptroller.getAllMarkets();
    ICErc20Plugin cToken = ICErc20Plugin(address(allMarkets[allMarkets.length - 1]));

    assertEq(address(cToken.plugin()), address(pluginA), "!plugin == erc4626");

    address pluginImplBefore = address(cToken.plugin());
    ionicAdmin._setLatestPluginImplementation(address(pluginA), address(pluginB));
    ionicAdmin._upgradePluginToLatestImplementation(address(cToken));
    address pluginImplAfter = address(cToken.plugin());

    assertEq(pluginImplBefore, address(pluginA), "the old impl should be the A plugin");
    assertEq(pluginImplAfter, address(pluginB), "the new impl should be the B plugin");
  }

  function testAutoImplementationCErc20PluginDelegate() public {
    MockERC4626 pluginA = new MockERC4626(ERC20(address(underlyingToken)));
    MockERC4626 pluginB = new MockERC4626(ERC20(address(underlyingToken)));

    vm.roll(1);
    comptroller._deployMarket(
      cErc20PluginDelegate.delegateType(),
      abi.encode(
        address(underlyingToken),
        comptroller,
        payable(address(ionicAdmin)),
        InterestRateModel(address(interestModel)),
        "cUnderlyingToken",
        "CUT",
        uint256(1),
        uint256(0)
      ),
      abi.encode(pluginA),
      0.9e18
    );

    ICErc20[] memory allMarkets = comptroller.getAllMarkets();
    ICErc20Plugin cToken = ICErc20Plugin(address(allMarkets[allMarkets.length - 1]));

    assertEq(address(cToken.plugin()), address(pluginA), "!plugin == erc4626");

    address pluginImplBefore = address(cToken.plugin());
    address implBefore = cToken.implementation();
    uint8 delegateType = cToken.delegateType();

    // just testing to replace the plugin delegate with the plugin rewards delegate
    ionicAdmin._setLatestCErc20Delegate(
      delegateType,
      address(cErc20PluginRewardsDelegate),
      abi.encode(address(0)) // should trigger use of latest implementation
    );
    ionicAdmin._setLatestPluginImplementation(address(pluginA), address(pluginB));

    // run the upgrade
    vm.prank(ionicAdmin.owner());
    ionicAdmin.autoUpgradePool(comptroller);

    address pluginImplAfter = address(cToken.plugin());
    address implAfter = cToken.implementation();

    assertEq(pluginImplBefore, address(pluginA), "the old impl should be the A plugin");
    assertEq(pluginImplAfter, address(pluginB), "the new impl should be the B plugin");
    assertEq(implBefore, address(cErc20PluginDelegate), "the old impl should be the plugin delegate");
    assertEq(implAfter, address(cErc20PluginRewardsDelegate), "the new impl should be the plugin rewards delegate");
  }

  function testInflateExchangeRate() public {
    vm.roll(1);
    comptroller._deployMarket(
      cErc20Delegate.delegateType(),
      abi.encode(
        address(underlyingToken),
        comptroller,
        payable(address(ionicAdmin)),
        InterestRateModel(address(interestModel)),
        "cUnderlyingToken",
        "CUT",
        uint256(1),
        uint256(0)
      ),
      "",
      0.9e18
    );

    ICErc20[] memory allMarkets = comptroller.getAllMarkets();
    ICErc20 cToken = allMarkets[allMarkets.length - 1];
    assertEq(cToken.name(), "cUnderlyingToken");
    address[] memory cTokens = new address[](1);
    cTokens[0] = address(cToken);
    comptroller.enterMarkets(cTokens);
    vm.roll(1);

    // mint just 2 wei
    underlyingToken.approve(address(cToken), 1e36);
    cToken.mint(2);
    assertEq(cToken.totalSupply(), 10);
    assertEq(underlyingToken.balanceOf(address(cToken)), 2, "!total supply 2");

    uint256 exchRateBefore = cToken.exchangeRateCurrent();
    emit log_named_uint("exch rate", exchRateBefore);
    assertEq(exchRateBefore, 2e17, "!default exch rate");

    // donate
    underlyingToken.transfer(address(cToken), 1e36);

    uint256 exchRateAfter = cToken.exchangeRateCurrent();
    emit log_named_uint("exch rate after", exchRateAfter);
    assertGt(exchRateAfter, 1e30, "!inflated exch rate");

    // the market should own 1e36 + 2 underlying assets
    assertEq(underlyingToken.balanceOf(address(cToken)), 1e36 + 2, "!total underlying");

    // 50% + 1
    uint256 errCode = cToken.redeemUnderlying(0.5e36 + 2);
    assertEq(errCode, 0, "!redeem underlying");

    assertEq(cToken.totalSupply(), 0, "!should have redeemed all ctokens for 50% + 1 of the underlying");
  }

  function testSupplyCapInflatedExchangeRate() public {
    vm.roll(1);
    comptroller._deployMarket(
      cErc20Delegate.delegateType(),
      abi.encode(
        address(underlyingToken),
        comptroller,
        payable(address(ionicAdmin)),
        InterestRateModel(address(interestModel)),
        "cUnderlyingToken",
        "CUT",
        uint256(1),
        uint256(0)
      ),
      "",
      0.9e18
    );

    ICErc20[] memory allMarkets = comptroller.getAllMarkets();
    ICErc20 cToken = allMarkets[allMarkets.length - 1];
    assertEq(cToken.name(), "cUnderlyingToken");
    address[] memory cTokens = new address[](1);
    cTokens[0] = address(cToken);
    comptroller.enterMarkets(cTokens);
    vm.roll(1);

    // mint 1e18
    underlyingToken.approve(address(cToken), 1e18);
    cToken.mint(1e18);
    assertEq(cToken.totalSupply(), 5 * 1e18, "!total supply 5");
    assertEq(underlyingToken.balanceOf(address(cToken)), 1e18, "!market underlying balance 1");

    (, , uint256 liqBefore, uint256 sfBefore) = comptroller.getAccountLiquidity(address(this));

    uint256[] memory caps = new uint256[](1);
    caps[0] = 25e18;
    ICErc20[] memory marketArray = new ICErc20[](1);
    marketArray[0] = cToken;
    vm.prank(comptroller.admin());
    comptroller._setMarketSupplyCaps(marketArray, caps);

    // donate 100e18
    underlyingToken.transfer(address(cToken), 100e18);
    assertEq(underlyingToken.balanceOf(address(cToken)), 101e18, "!market balance 101");
    assertEq(cToken.balanceOfUnderlying(address(this)), 101e18, "!user balance 101");

    (, , uint256 liqAfter, uint256 sfAfter) = comptroller.getAccountLiquidity(address(this));
    emit log_named_uint("liqBefore", liqBefore);
    emit log_named_uint("liqAfter", liqAfter);

    assertEq(liqAfter / liqBefore, 25, "liquidity should increase only 25x");
  }
}
