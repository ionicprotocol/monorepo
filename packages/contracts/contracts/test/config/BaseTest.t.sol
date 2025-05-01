// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "forge-std/Vm.sol";
import "forge-std/Test.sol";
import "forge-std/console.sol";

import { AddressesProvider } from "../../ionic/AddressesProvider.sol";

import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

abstract contract BaseTest is Test {
  uint128 constant ETHEREUM_MAINNET = 1;
  uint128 constant BSC_MAINNET = 56;
  uint128 constant POLYGON_MAINNET = 137;
  uint128 constant ARBITRUM_ONE = 42161;

  uint128 constant BSC_CHAPEL = 97;
  uint128 constant NEON_MAINNET = 245022934;
  uint128 constant LINEA_MAINNET = 59144;
  uint128 constant ZKEVM_MAINNET = 1101;
  uint128 constant MODE_MAINNET = 34443;
  uint128 constant BASE_MAINNET = 8453;
  uint128 constant LISK_MAINNET = 1135;

  // taken from ERC1967Upgrade
  bytes32 internal constant _ADMIN_SLOT = 0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103;

  AddressesProvider public ap;
  ProxyAdmin public dpa;

  mapping(uint128 => uint256) private forkIds;

  constructor() {
    configureAddressesProvider(0);
  }

  uint256 constant CRITICAL = 100;
  uint256 constant NORMAL = 90;
  uint256 constant LOW = 80;

  modifier importance(uint256 testImportance) {
    uint256 runLevel = NORMAL;

    try vm.envUint("TEST_RUN_LEVEL") returns (uint256 level) {
      runLevel = level;
    } catch {
      emit log("failed to get env param TEST_RUN_LEVEL");
    }

    if (testImportance >= runLevel) {
      _;
    } else {
      emit log("not running the test");
    }
  }

  modifier debuggingOnly() {
    try vm.envBool("LOCAL_FORGE_ENV") returns (bool run) {
      if (run) _;
    } catch {
      emit log("skipping this test in the CI/CD - add LOCAL_FORGE_ENV=true to your .env file to run locally");
    }
  }

  modifier fork(uint128 chainid) {
    if (shouldRunForChain(chainid)) {
      _forkAtBlock(chainid, 0);
      _;
    }
  }

  modifier forkAtBlock(uint128 chainid, uint256 blockNumber) {
    if (shouldRunForChain(chainid)) {
      _forkAtBlock(chainid, blockNumber);
      _;
    }
  }

  modifier whenForking() {
    try vm.activeFork() returns (uint256) {
      _;
    } catch {}
  }

  function shouldRunForChain(uint256 chainid) internal returns (bool) {
    bool run = true;
    try vm.envUint("TEST_RUN_CHAINID") returns (uint256 envChainId) {
      run = envChainId == chainid;
    } catch {
      emit log("failed to get env param TEST_RUN_CHAINID");
    }
    return run;
  }

  function _forkAtBlock(uint128 chainid, uint256 blockNumber) internal {
    if (block.chainid != chainid) {
      if (blockNumber != 0) {
        vm.selectFork(getArchiveForkId(chainid));
        vm.rollFork(blockNumber);
      } else {
        vm.selectFork(getForkId(chainid));
      }
    }
    configureAddressesProvider(chainid);
    afterForkSetUp();
  }

  function getForkId(uint128 chainid, bool archive) private returns (uint256) {
    return archive ? getForkId(chainid) : getArchiveForkId(chainid);
  }

  function getForkId(uint128 chainid) private returns (uint256) {
    if (forkIds[chainid] == 0) {
      if (chainid == BSC_MAINNET) {
        forkIds[chainid] = vm.createFork(vm.rpcUrl("bsc")) + 100;
      } else if (chainid == BSC_CHAPEL) {
        forkIds[chainid] = vm.createFork(vm.rpcUrl("bsc_chapel")) + 100;
      } else if (chainid == POLYGON_MAINNET) {
        forkIds[chainid] = vm.createFork(vm.rpcUrl("polygon")) + 100;
      } else if (chainid == NEON_MAINNET) {
        forkIds[chainid] = vm.createFork(vm.rpcUrl("neon")) + 100;
      } else if (chainid == ARBITRUM_ONE) {
        forkIds[chainid] = vm.createFork(vm.rpcUrl("arbitrum")) + 100;
      } else if (chainid == ETHEREUM_MAINNET) {
        forkIds[chainid] = vm.createFork(vm.rpcUrl("ethereum")) + 100;
      } else if (chainid == LINEA_MAINNET) {
        forkIds[chainid] = vm.createFork(vm.rpcUrl("linea")) + 100;
      } else if (chainid == ZKEVM_MAINNET) {
        forkIds[chainid] = vm.createFork(vm.rpcUrl("zkevm")) + 100;
      } else if (chainid == MODE_MAINNET) {
        forkIds[chainid] = vm.createFork(vm.rpcUrl("mode")) + 100;
      } else if (chainid == BASE_MAINNET) {
        forkIds[chainid] = vm.createFork(vm.rpcUrl("base")) + 100;
      } else if (chainid == LISK_MAINNET) {
        forkIds[chainid] = vm.createFork(vm.rpcUrl("lisk")) + 100;
      }
    }

    return forkIds[chainid] - 100;
  }

  function getArchiveForkId(uint128 chainid) private returns (uint256) {
    // store the archive rpc urls in the forkIds mapping at an offset
    uint128 chainidWithOffset = chainid + type(uint64).max;
    if (forkIds[chainidWithOffset] == 0) {
      if (chainid == BSC_MAINNET) {
        forkIds[chainidWithOffset] = vm.createFork(vm.rpcUrl("bsc_archive")) + 100;
      } else if (chainid == BSC_CHAPEL) {
        forkIds[chainidWithOffset] = vm.createFork(vm.rpcUrl("bsc_chapel_archive")) + 100;
      } else if (chainid == POLYGON_MAINNET) {
        forkIds[chainidWithOffset] = vm.createFork(vm.rpcUrl("polygon_archive")) + 100;
      } else if (chainid == NEON_MAINNET) {
        forkIds[chainidWithOffset] = vm.createFork(vm.rpcUrl("neon_archive")) + 100;
      } else if (chainid == ARBITRUM_ONE) {
        forkIds[chainidWithOffset] = vm.createFork(vm.rpcUrl("arbitrum_archive")) + 100;
      } else if (chainid == ETHEREUM_MAINNET) {
        forkIds[chainidWithOffset] = vm.createFork(vm.rpcUrl("ethereum_archive")) + 100;
      } else if (chainid == LINEA_MAINNET) {
        forkIds[chainidWithOffset] = vm.createFork(vm.rpcUrl("linea_archive")) + 100;
      } else if (chainid == ZKEVM_MAINNET) {
        forkIds[chainidWithOffset] = vm.createFork(vm.rpcUrl("zkevm_archive")) + 100;
      } else if (chainid == MODE_MAINNET) {
        forkIds[chainidWithOffset] = vm.createFork(vm.rpcUrl("mode_archive")) + 100;
      } else if (chainid == BASE_MAINNET) {
        forkIds[chainidWithOffset] = vm.createFork(vm.rpcUrl("base_archive")) + 100;
      } else if (chainid == LISK_MAINNET) {
        forkIds[chainidWithOffset] = vm.createFork(vm.rpcUrl("lisk_archive")) + 100;
      }
    }
    return forkIds[chainidWithOffset] - 100;
  }

  function afterForkSetUp() internal virtual {}

  function configureAddressesProvider(uint128 chainid) private {
    if (chainid == BSC_MAINNET) {
      ap = AddressesProvider(address(0));
    } else if (chainid == BSC_CHAPEL) {
      ap = AddressesProvider(0x3dc8CE9f581e49B9E5304CF580940ad341F64c3f);
    } else if (block.chainid == POLYGON_MAINNET) {
      ap = AddressesProvider(0xE31baC0B582AA248c0017F87F24087cEa7A55E26);
    } else if (chainid == NEON_MAINNET) {
      ap = AddressesProvider(0xF4C60F6ac6b3AF54044757a1a54D76EEe28244CE);
    } else if (chainid == ARBITRUM_ONE) {
      ap = AddressesProvider(0x3B12BA992259Fb3855C4E1D452a754dCa2E276fC);
    } else if (chainid == LINEA_MAINNET) {
      ap = AddressesProvider(0x914694DA0bED80e74ef1a28029f016119782C0f1);
    } else if (chainid == ZKEVM_MAINNET) {
      ap = AddressesProvider(0x27aA55A3D55959261e119d75256aadAB79aE897C);
    } else if (chainid == MODE_MAINNET) {
      ap = AddressesProvider(0xb0033576a9E444Dd801d5B69e1b63DBC459A6115);
    } else if (chainid == BASE_MAINNET) {
      ap = AddressesProvider(0xcD4D7c8e2bA627684a9B18F7fe88239341D3ba5c);
    } else {
      dpa = new ProxyAdmin();
      AddressesProvider logic = new AddressesProvider();
      TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(
        address(logic),
        address(dpa),
        abi.encodeWithSelector(ap.initialize.selector, address(this))
      );
      ap = AddressesProvider(address(proxy));
      ap.setAddress("DefaultProxyAdmin", address(dpa));
    }
    dpa = ProxyAdmin(ap.getAddress("DefaultProxyAdmin"));
    if (ap.owner() == address(0)) {
      ap.initialize(address(this));
    }
    if (ap.getAddress("deployer") == address(0)) {
      vm.prank(ap.owner());
      ap.setAddress("deployer", 0x1155b614971f16758C92c4890eD338C9e3ede6b7);
    }
  }

  function diff(uint256 a, uint256 b) internal pure returns (uint256) {
    if (a > b) {
      return a - b;
    } else {
      return b - a;
    }
  }

  function compareStrings(string memory a, string memory b) public pure returns (bool) {
    return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
  }

  function asArray(address value) public pure returns (address[] memory) {
    address[] memory array = new address[](1);
    array[0] = value;
    return array;
  }

  function asArray(address value0, address value1) public pure returns (address[] memory) {
    address[] memory array = new address[](2);
    array[0] = value0;
    array[1] = value1;
    return array;
  }

  function asArray(address value0, address value1, address value2) public pure returns (address[] memory) {
    address[] memory array = new address[](3);
    array[0] = value0;
    array[1] = value1;
    array[2] = value2;
    return array;
  }

  function asArray(bool value) public pure returns (bool[] memory) {
    bool[] memory array = new bool[](1);
    array[0] = value;
    return array;
  }

  function asArray(uint256 value0, uint256 value1) public pure returns (uint256[] memory) {
    uint256[] memory array = new uint256[](2);
    array[0] = value0;
    array[1] = value1;
    return array;
  }

  function asArray(uint256 value) public pure returns (uint256[] memory) {
    uint256[] memory array = new uint256[](1);
    array[0] = value;
    return array;
  }

  function asArray(bytes memory value) public pure returns (bytes[] memory) {
    bytes[] memory array = new bytes[](1);
    array[0] = value;
    return array;
  }

  function asArray(bytes memory value0, bytes memory value1) public pure returns (bytes[] memory) {
    bytes[] memory array = new bytes[](2);
    array[0] = value0;
    array[1] = value1;
    return array;
  }

  function asArray(bytes memory value0, bytes memory value1, bytes memory value2) public pure returns (bytes[] memory) {
    bytes[] memory array = new bytes[](3);
    array[0] = value0;
    array[1] = value1;
    array[2] = value2;
    return array;
  }

  function sqrt(uint256 x) public pure returns (uint256) {
    if (x == 0) return 0;
    uint256 xx = x;
    uint256 r = 1;

    if (xx >= 0x100000000000000000000000000000000) {
      xx >>= 128;
      r <<= 64;
    }
    if (xx >= 0x10000000000000000) {
      xx >>= 64;
      r <<= 32;
    }
    if (xx >= 0x100000000) {
      xx >>= 32;
      r <<= 16;
    }
    if (xx >= 0x10000) {
      xx >>= 16;
      r <<= 8;
    }
    if (xx >= 0x100) {
      xx >>= 8;
      r <<= 4;
    }
    if (xx >= 0x10) {
      xx >>= 4;
      r <<= 2;
    }
    if (xx >= 0x8) {
      r <<= 1;
    }

    r = (r + x / r) >> 1;
    r = (r + x / r) >> 1;
    r = (r + x / r) >> 1;
    r = (r + x / r) >> 1;
    r = (r + x / r) >> 1;
    r = (r + x / r) >> 1;
    r = (r + x / r) >> 1; // Seven iterations should be enough
    uint256 r1 = x / r;
    return (r < r1 ? r : r1);
  }
}
