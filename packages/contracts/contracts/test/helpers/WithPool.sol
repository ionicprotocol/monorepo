// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.23;

import { ERC20 } from "solmate/tokens/ERC20.sol";
import { Auth, Authority } from "solmate/auth/Auth.sol";

import { JumpRateModel } from "../../compound/JumpRateModel.sol";
import { Unitroller } from "../../compound/Unitroller.sol";
import { Comptroller } from "../../compound/Comptroller.sol";
import { CErc20PluginDelegate } from "../../compound/CErc20PluginDelegate.sol";
import { CErc20PluginRewardsDelegate } from "../../compound/CErc20PluginRewardsDelegate.sol";
import { CErc20Delegate } from "../../compound/CErc20Delegate.sol";
import { CErc20Delegator } from "../../compound/CErc20Delegator.sol";
import { IonicComptroller } from "../../compound/ComptrollerInterface.sol";
import { ICErc20 } from "../../compound/CTokenInterfaces.sol";
import { InterestRateModel } from "../../compound/InterestRateModel.sol";
import { FeeDistributor } from "../../FeeDistributor.sol";
import { PoolDirectory } from "../../PoolDirectory.sol";
import { MasterPriceOracle } from "../../oracles/MasterPriceOracle.sol";
import { ERC4626 } from "solmate/mixins/ERC4626.sol";
import { PoolLens } from "../../PoolLens.sol";
import { ERC20Upgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";
import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import { CTokenFirstExtension, DiamondExtension } from "../../compound/CTokenFirstExtension.sol";
import { ComptrollerFirstExtension } from "../../compound/ComptrollerFirstExtension.sol";
import { AuthoritiesRegistry } from "../../ionic/AuthoritiesRegistry.sol";
import { PoolRolesAuthority } from "../../ionic/PoolRolesAuthority.sol";

import { BaseTest } from "../config/BaseTest.t.sol";

contract WithPool is BaseTest {
  ERC20Upgradeable public underlyingToken;
  CErc20Delegate cErc20Delegate;
  CErc20PluginDelegate cErc20PluginDelegate;
  CErc20PluginRewardsDelegate cErc20PluginRewardsDelegate;

  IonicComptroller comptroller;
  Comptroller newComptroller;
  JumpRateModel interestModel;

  FeeDistributor ionicAdmin;
  PoolDirectory poolDirectory;
  MasterPriceOracle priceOracle;
  PoolLens poolLens;

  address[] markets;
  bool[] t;
  bool[] f;
  address[] newImplementation;
  address[] hardcodedAddresses;
  string[] hardcodedNames;

  function setUpWithPool(MasterPriceOracle _masterPriceOracle, ERC20Upgradeable _underlyingToken) public {
    priceOracle = _masterPriceOracle;
    underlyingToken = _underlyingToken;

    ionicAdmin = FeeDistributor(payable(ap.getAddress("FeeDistributor")));
    if (address(ionicAdmin) != address(0)) {
      // upgrade
      {
        FeeDistributor newImpl = new FeeDistributor();
        TransparentUpgradeableProxy proxy = TransparentUpgradeableProxy(payable(address(ionicAdmin)));
        bytes32 bytesAtSlot = vm.load(
          address(proxy),
          0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103
        );
        address admin = address(uint160(uint256(bytesAtSlot)));
        vm.prank(admin);
        proxy.upgradeTo(address(newImpl));
      }
    } else {
      ionicAdmin = new FeeDistributor();
      ionicAdmin.initialize(1e16);
    }

    {
      vm.prank(ionicAdmin.owner());
      ionicAdmin._setPendingOwner(address(this));
      ionicAdmin._acceptOwner();
    }
    setUpBaseContracts();
    setUpExtensions();
  }

  function setUpExtensions() internal {
    cErc20Delegate = new CErc20Delegate();
    cErc20PluginDelegate = new CErc20PluginDelegate();
    cErc20PluginRewardsDelegate = new CErc20PluginRewardsDelegate();

    DiamondExtension[] memory cErc20DelegateExtensions = new DiamondExtension[](2);
    cErc20DelegateExtensions[0] = new CTokenFirstExtension();

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

    cErc20DelegateExtensions[1] = cErc20Delegate;
    ionicAdmin._setCErc20DelegateExtensions(address(cErc20Delegate), cErc20DelegateExtensions);
    cErc20DelegateExtensions[1] = cErc20PluginDelegate;
    ionicAdmin._setCErc20DelegateExtensions(address(cErc20PluginDelegate), cErc20DelegateExtensions);
    cErc20DelegateExtensions[1] = cErc20PluginRewardsDelegate;
    ionicAdmin._setCErc20DelegateExtensions(address(cErc20PluginRewardsDelegate), cErc20DelegateExtensions);
  }

  function setUpBaseContracts() internal {
    interestModel = new JumpRateModel(2343665, 1e18, 1e18, 4e18, 0.8e18);
    poolDirectory = new PoolDirectory();
    poolDirectory.initialize(false, new address[](0));

    poolLens = new PoolLens();
    poolLens.initialize(
      poolDirectory,
      "Pool",
      "lens",
      hardcodedAddresses,
      hardcodedNames,
      hardcodedNames,
      hardcodedNames,
      hardcodedNames,
      hardcodedNames
    );
  }

  function setUpPool(
    string memory name,
    bool enforceWhitelist,
    uint256 closeFactor,
    uint256 liquidationIncentive
  ) public {
    Comptroller newComptrollerImplementation = new Comptroller();
    ionicAdmin._setLatestComptrollerImplementation(address(0), address(newComptrollerImplementation));
    DiamondExtension[] memory extensions = new DiamondExtension[](2);
    extensions[0] = new ComptrollerFirstExtension();
    extensions[1] = newComptrollerImplementation;
    ionicAdmin._setComptrollerExtensions(address(newComptrollerImplementation), extensions);

    (, address comptrollerAddress) = poolDirectory.deployPool(
      name,
      address(newComptrollerImplementation),
      abi.encode(payable(address(ionicAdmin))),
      enforceWhitelist,
      closeFactor,
      liquidationIncentive,
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
  }

  function upgradePool(address pool) internal {
    Comptroller newComptrollerImplementation = new Comptroller();

    Unitroller asUnitroller = Unitroller(payable(pool));

    // upgrade to the new comptroller
    vm.startPrank(asUnitroller.admin());
    asUnitroller._registerExtension(
      newComptrollerImplementation,
      DiamondExtension(asUnitroller.comptrollerImplementation())
    );
    asUnitroller._upgrade();
    vm.stopPrank();
  }

  function deployCErc20Delegate(
    address _underlyingToken,
    bytes memory name,
    bytes memory symbol,
    uint256 _collateralFactorMantissa
  ) public {
    comptroller._deployMarket(
      cErc20Delegate.delegateType(),
      abi.encode(
        _underlyingToken,
        comptroller,
        payable(address(ionicAdmin)),
        InterestRateModel(address(interestModel)),
        name,
        symbol,
        uint256(1),
        uint256(0)
      ),
      "",
      _collateralFactorMantissa
    );
  }

  function deployCErc20PluginDelegate(address _erc4626, uint256 _collateralFactorMantissa) public {
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
      abi.encode(_erc4626),
      _collateralFactorMantissa
    );
  }

  function deployCErc20PluginRewardsDelegate(address _mockERC4626Dynamic, uint256 _collateralFactorMantissa) public {
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
      abi.encode(_mockERC4626Dynamic),
      _collateralFactorMantissa
    );
  }
}
