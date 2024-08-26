// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { PoolRolesAuthority } from "../ionic/PoolRolesAuthority.sol";
import { SafeOwnableUpgradeable } from "../ionic/SafeOwnableUpgradeable.sol";
import { IonicComptroller } from "../compound/ComptrollerInterface.sol";

import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract AuthoritiesRegistry is SafeOwnableUpgradeable {
  mapping(address => PoolRolesAuthority) public poolsAuthorities;
  PoolRolesAuthority public poolAuthLogic;
  address public leveredPositionsFactory;
  bool public noAuthRequired;

  function initialize(address _leveredPositionsFactory) public initializer {
    __SafeOwnable_init(msg.sender);
    leveredPositionsFactory = _leveredPositionsFactory;
    poolAuthLogic = new PoolRolesAuthority();
  }

  function reinitialize(address _leveredPositionsFactory) public onlyOwnerOrAdmin {
    leveredPositionsFactory = _leveredPositionsFactory;
    poolAuthLogic = new PoolRolesAuthority();
    // for Neon the auth is not required
    noAuthRequired = block.chainid == 245022934;
  }

  function createPoolAuthority(address pool) public onlyOwner returns (PoolRolesAuthority auth) {
    require(address(poolsAuthorities[pool]) == address(0), "already created");

    TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(address(poolAuthLogic), _getProxyAdmin(), "");
    auth = PoolRolesAuthority(address(proxy));
    auth.initialize(address(this));
    poolsAuthorities[pool] = auth;

    auth.openPoolSupplierCapabilities(IonicComptroller(pool));
    auth.setUserRole(address(this), auth.REGISTRY_ROLE(), true);
    // sets the registry owner as the auth owner
    reconfigureAuthority(pool);
  }

  function reconfigureAuthority(address poolAddress) public {
    IonicComptroller pool = IonicComptroller(poolAddress);
    PoolRolesAuthority auth = poolsAuthorities[address(pool)];

    if (msg.sender != poolAddress || address(auth) != address(0)) {
      require(address(auth) != address(0), "no such authority");
      require(msg.sender == owner() || msg.sender == poolAddress, "not owner or pool");

      auth.configureRegistryCapabilities();
      auth.configurePoolSupplierCapabilities(pool);
      auth.configurePoolBorrowerCapabilities(pool);
      // everyone can be a liquidator
      auth.configureOpenPoolLiquidatorCapabilities(pool);
      auth.configureLeveredPositionCapabilities(pool);

      if (auth.owner() != owner()) {
        auth.setOwner(owner());
      }
    }
  }

  function canCall(
    address pool,
    address user,
    address target,
    bytes4 functionSig
  ) external view returns (bool) {
    PoolRolesAuthority authorityForPool = poolsAuthorities[pool];
    if (address(authorityForPool) == address(0)) {
      return noAuthRequired;
    } else {
      // allow only if an auth exists and it allows the action
      return authorityForPool.canCall(user, target, functionSig);
    }
  }

  function setUserRole(
    address pool,
    address user,
    uint8 role,
    bool enabled
  ) external {
    PoolRolesAuthority poolAuth = poolsAuthorities[pool];

    require(address(poolAuth) != address(0), "auth does not exist");
    require(msg.sender == owner() || msg.sender == leveredPositionsFactory, "not owner or factory");
    require(msg.sender != leveredPositionsFactory || role == poolAuth.LEVERED_POSITION_ROLE(), "only lev pos role");

    poolAuth.setUserRole(user, role, enabled);
  }
}
