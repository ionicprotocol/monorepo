// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import { BaseTest } from "./config/BaseTest.t.sol";
import "../ionic/AuthoritiesRegistry.sol";
import "./helpers/WithPool.sol";
import { RolesAuthority, Authority } from "solmate/auth/authorities/RolesAuthority.sol";

contract AuthoritiesRegistryTest is WithPool {
  AuthoritiesRegistry registry;

  function afterForkSetUp() internal override {
    registry = AuthoritiesRegistry(ap.getAddress("AuthoritiesRegistry"));
    if (address(registry) == address(0)) {
      address proxyAdmin = address(999);
      AuthoritiesRegistry impl = new AuthoritiesRegistry();
      TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(address(impl), proxyAdmin, "");
      registry = AuthoritiesRegistry(address(proxy));
      registry.initialize(address(1023));
    }

    super.setUpWithPool(
      MasterPriceOracle(ap.getAddress("MasterPriceOracle")),
      ERC20Upgradeable(ap.getAddress("wtoken"))
    );

    setUpPool("auth-reg-test", false, 0.1e18, 1.1e18);
  }

  function testRegistry() public fork(POLYGON_MAINNET) {
    PoolRolesAuthority auth;

    vm.prank(address(555));
    vm.expectRevert("Ownable: caller is not the owner");
    auth = registry.createPoolAuthority(address(comptroller));

    vm.prank(registry.owner());
    auth = registry.createPoolAuthority(address(comptroller));

    assertEq(auth.owner(), registry.owner(), "!same owner");
  }

  function testAuthReconfigurePermissions() public fork(POLYGON_MAINNET) {
    vm.prank(registry.owner());
    PoolRolesAuthority auth = registry.createPoolAuthority(address(comptroller));

    vm.prank(address(8283));
    vm.expectRevert("not owner or pool");
    registry.reconfigureAuthority(address(comptroller));

    vm.prank(registry.owner());
    registry.reconfigureAuthority(address(comptroller));
  }

  function upgradeRegistry() internal {
    TransparentUpgradeableProxy proxy = TransparentUpgradeableProxy(payable(address(registry)));
    AuthoritiesRegistry newImpl = new AuthoritiesRegistry();
    vm.startPrank(dpa.owner());
    dpa.upgradeAndCall(
      proxy,
      address(newImpl),
      abi.encodeWithSelector(AuthoritiesRegistry.reinitialize.selector, registry.leveredPositionsFactory())
    );
    vm.stopPrank();
  }

  function upgradeAuth(PoolRolesAuthority auth) internal {
    TransparentUpgradeableProxy proxy = TransparentUpgradeableProxy(payable(address(auth)));
    PoolRolesAuthority newImpl = new PoolRolesAuthority();
    vm.prank(dpa.owner());
    dpa.upgrade(proxy, address(newImpl));
  }

  function testAuthPermissions() public debuggingOnly fork(BSC_CHAPEL) {
    address pool = 0xa4bc2fCF2F9d87EB349f74f8729024F92A030330;
    registry = AuthoritiesRegistry(0xa5E190Fa38F325617381e835da8b2DB2D12cE5eb);
    //upgradeRegistry();

    PoolRolesAuthority auth = PoolRolesAuthority(0xFe5AfFFC8b55A2d139cb2ef76699C8B58c1EA299);
    //upgradeAuth(auth);
    TransparentUpgradeableProxy proxy = TransparentUpgradeableProxy(payable(address(auth)));

    vm.prank(address(dpa));
    emit log_named_address("proxy.implementation", proxy.implementation());

    emit log_named_address("registry.poolAuthLogic", address(registry.poolAuthLogic()));
    //vm.prank(registry.owner());
    //registry.reconfigureAuthority(pool);

    bool isReg = auth.doesUserHaveRole(address(registry), auth.REGISTRY_ROLE());
    assertEq(isReg, true, "!not registry role");

    bool canCall = auth.canCall(address(registry), address(auth), RolesAuthority.setUserRole.selector);
    assertEq(canCall, true, "!cannot call setUserRol");
  }
}
