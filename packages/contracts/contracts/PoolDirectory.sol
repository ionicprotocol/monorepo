// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/utils/Create2Upgradeable.sol";

import { IonicComptroller } from "./compound/ComptrollerInterface.sol";
import { BasePriceOracle } from "./oracles/BasePriceOracle.sol";
import { Unitroller } from "./compound/Unitroller.sol";
import "./ionic/SafeOwnableUpgradeable.sol";
import "./ionic/DiamondExtension.sol";

/**
 * @title PoolDirectory
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 * @notice PoolDirectory is a directory for Ionic interest rate pools.
 */
contract PoolDirectory is SafeOwnableUpgradeable {
  /**
   * @dev Initializes a deployer whitelist if desired.
   * @param _enforceDeployerWhitelist Boolean indicating if the deployer whitelist is to be enforced.
   * @param _deployerWhitelist Array of Ethereum accounts to be whitelisted.
   */
  function initialize(bool _enforceDeployerWhitelist, address[] memory _deployerWhitelist) public initializer {
    __SafeOwnable_init(msg.sender);
    enforceDeployerWhitelist = _enforceDeployerWhitelist;
    for (uint256 i = 0; i < _deployerWhitelist.length; i++) deployerWhitelist[_deployerWhitelist[i]] = true;
  }

  /**
   * @dev Struct for a Ionic interest rate pool.
   */
  struct Pool {
    string name;
    address creator;
    address comptroller;
    uint256 blockPosted;
    uint256 timestampPosted;
  }

  /**
   * @dev Array of Ionic interest rate pools.
   */
  Pool[] public pools;

  /**
   * @dev Maps Ethereum accounts to arrays of Ionic pool indexes.
   */
  mapping(address => uint256[]) private _poolsByAccount;

  /**
   * @dev Maps Ionic pool Comptroller addresses to bools indicating if they have been registered via the directory.
   */
  mapping(address => bool) public poolExists;

  /**
   * @dev Emitted when a new Ionic pool is added to the directory.
   */
  event PoolRegistered(uint256 index, Pool pool);

  /**
   * @dev Booleans indicating if the deployer whitelist is enforced.
   */
  bool public enforceDeployerWhitelist;

  /**
   * @dev Maps Ethereum accounts to booleans indicating if they are allowed to deploy pools.
   */
  mapping(address => bool) public deployerWhitelist;

  /**
   * @dev Controls if the deployer whitelist is to be enforced.
   * @param enforce Boolean indicating if the deployer whitelist is to be enforced.
   */
  function _setDeployerWhitelistEnforcement(bool enforce) external onlyOwner {
    enforceDeployerWhitelist = enforce;
  }

  /**
   * @dev Adds/removes Ethereum accounts to the deployer whitelist.
   * @param deployers Array of Ethereum accounts to be whitelisted.
   * @param status Whether to add or remove the accounts.
   */
  function _editDeployerWhitelist(address[] calldata deployers, bool status) external onlyOwner {
    require(deployers.length > 0, "No deployers supplied.");
    for (uint256 i = 0; i < deployers.length; i++) deployerWhitelist[deployers[i]] = status;
  }

  /**
   * @dev Adds a new Ionic pool to the directory (without checking msg.sender).
   * @param name The name of the pool.
   * @param comptroller The pool's Comptroller proxy contract address.
   * @return The index of the registered Ionic pool.
   */
  function _registerPool(string memory name, address comptroller) internal returns (uint256) {
    require(!poolExists[comptroller], "Pool already exists in the directory.");
    require(!enforceDeployerWhitelist || deployerWhitelist[msg.sender], "Sender is not on deployer whitelist.");
    require(bytes(name).length <= 100, "No pool name supplied.");
    Pool memory pool = Pool(name, msg.sender, comptroller, block.number, block.timestamp);
    pools.push(pool);
    _poolsByAccount[msg.sender].push(pools.length - 1);
    poolExists[comptroller] = true;
    emit PoolRegistered(pools.length - 1, pool);
    return pools.length - 1;
  }

  function _deprecatePool(address comptroller) external onlyOwner {
    for (uint256 i = 0; i < pools.length; i++) {
      if (pools[i].comptroller == comptroller) {
        _deprecatePool(i);
        break;
      }
    }
  }

  function _deprecatePool(uint256 index) public onlyOwner {
    Pool storage ionicPool = pools[index];

    require(ionicPool.comptroller != address(0), "pool already deprecated");

    // swap with the last pool of the creator and delete
    uint256[] storage creatorPools = _poolsByAccount[ionicPool.creator];
    for (uint256 i = 0; i < creatorPools.length; i++) {
      if (creatorPools[i] == index) {
        creatorPools[i] = creatorPools[creatorPools.length - 1];
        creatorPools.pop();
        break;
      }
    }

    // leave it to true to deny the re-registering of the same pool
    poolExists[ionicPool.comptroller] = true;

    // nullify the storage
    ionicPool.comptroller = address(0);
    ionicPool.creator = address(0);
    ionicPool.name = "";
    ionicPool.blockPosted = 0;
    ionicPool.timestampPosted = 0;
  }

  /**
   * @dev Deploys a new Ionic pool and adds to the directory.
   * @param name The name of the pool.
   * @param implementation The Comptroller implementation contract address.
   * @param constructorData Encoded construction data for `Unitroller constructor()`
   * @param enforceWhitelist Boolean indicating if the pool's supplier/borrower whitelist is to be enforced.
   * @param closeFactor The pool's close factor (scaled by 1e18).
   * @param liquidationIncentive The pool's liquidation incentive (scaled by 1e18).
   * @param priceOracle The pool's PriceOracle contract address.
   * @return Index of the registered Ionic pool and the Unitroller proxy address.
   */
  function deployPool(
    string memory name,
    address implementation,
    bytes calldata constructorData,
    bool enforceWhitelist,
    uint256 closeFactor,
    uint256 liquidationIncentive,
    address priceOracle
  ) external returns (uint256, address) {
    // Input validation
    require(implementation != address(0), "No Comptroller implementation contract address specified.");
    require(priceOracle != address(0), "No PriceOracle contract address specified.");

    // Deploy Unitroller using msg.sender, name, and block.number as a salt
    bytes memory unitrollerCreationCode = abi.encodePacked(type(Unitroller).creationCode, constructorData);
    address proxy = Create2Upgradeable.deploy(
      0,
      keccak256(abi.encodePacked(msg.sender, name, ++poolsCounter)),
      unitrollerCreationCode
    );

    // Setup the pool
    IonicComptroller comptrollerProxy = IonicComptroller(proxy);
    // Set up the extensions
    comptrollerProxy._upgrade();

    // Set pool parameters
    require(comptrollerProxy._setCloseFactor(closeFactor) == 0, "Failed to set pool close factor.");
    require(
      comptrollerProxy._setLiquidationIncentive(liquidationIncentive) == 0,
      "Failed to set pool liquidation incentive."
    );
    require(comptrollerProxy._setPriceOracle(BasePriceOracle(priceOracle)) == 0, "Failed to set pool price oracle.");

    // Whitelist
    if (enforceWhitelist)
      require(comptrollerProxy._setWhitelistEnforcement(true) == 0, "Failed to enforce supplier/borrower whitelist.");

    // Make msg.sender the admin
    require(comptrollerProxy._setPendingAdmin(msg.sender) == 0, "Failed to set pending admin on Unitroller.");

    // Register the pool with this PoolDirectory
    return (_registerPool(name, proxy), proxy);
  }

  /**
   * @notice Returns `ids` and directory information of all non-deprecated Ionic pools.
   * @dev This function is not designed to be called in a transaction: it is too gas-intensive.
   */
  function getActivePools() public view returns (uint256[] memory, Pool[] memory) {
    uint256 count = 0;
    for (uint256 i = 0; i < pools.length; i++) {
      if (pools[i].comptroller != address(0)) count++;
    }

    Pool[] memory activePools = new Pool[](count);
    uint256[] memory poolIds = new uint256[](count);

    uint256 index = 0;
    for (uint256 i = 0; i < pools.length; i++) {
      if (pools[i].comptroller != address(0)) {
        poolIds[index] = i;
        activePools[index] = pools[i];
        index++;
      }
    }

    return (poolIds, activePools);
  }

  /**
   * @notice Returns arrays of all Ionic pools' data.
   * @dev This function is not designed to be called in a transaction: it is too gas-intensive.
   */
  function getAllPools() public view returns (Pool[] memory) {
    uint256 count = 0;
    for (uint256 i = 0; i < pools.length; i++) {
      if (pools[i].comptroller != address(0)) count++;
    }

    Pool[] memory result = new Pool[](count);

    uint256 index = 0;
    for (uint256 i = 0; i < pools.length; i++) {
      if (pools[i].comptroller != address(0)) {
        result[index++] = pools[i];
      }
    }

    return result;
  }

  /**
   * @notice Returns arrays of all public Ionic pool indexes and data.
   * @dev This function is not designed to be called in a transaction: it is too gas-intensive.
   */
  function getPublicPools() external view returns (uint256[] memory, Pool[] memory) {
    uint256 arrayLength = 0;

    (, Pool[] memory activePools) = getActivePools();
    for (uint256 i = 0; i < activePools.length; i++) {
      try IonicComptroller(activePools[i].comptroller).enforceWhitelist() returns (bool enforceWhitelist) {
        if (enforceWhitelist) continue;
      } catch {}

      arrayLength++;
    }

    uint256[] memory indexes = new uint256[](arrayLength);
    Pool[] memory publicPools = new Pool[](arrayLength);
    uint256 index = 0;

    for (uint256 i = 0; i < activePools.length; i++) {
      try IonicComptroller(activePools[i].comptroller).enforceWhitelist() returns (bool enforceWhitelist) {
        if (enforceWhitelist) continue;
      } catch {}

      indexes[index] = i;
      publicPools[index] = activePools[i];
      index++;
    }

    return (indexes, publicPools);
  }

  /**
   * @notice Returns arrays of all public Ionic pool indexes and data.
   * @dev This function is not designed to be called in a transaction: it is too gas-intensive.
   */
  function getPoolsOfUser(address user) external view returns (uint256[] memory, Pool[] memory) {
    uint256 arrayLength = 0;

    (, Pool[] memory activePools) = getActivePools();
    for (uint256 i = 0; i < activePools.length; i++) {
      try IonicComptroller(activePools[i].comptroller).isUserOfPool(user) returns (bool isUsing) {
        if (!isUsing) continue;
      } catch {}

      arrayLength++;
    }

    uint256[] memory indexes = new uint256[](arrayLength);
    Pool[] memory poolsOfUser = new Pool[](arrayLength);
    uint256 index = 0;

    for (uint256 i = 0; i < activePools.length; i++) {
      try IonicComptroller(activePools[i].comptroller).isUserOfPool(user) returns (bool isUsing) {
        if (!isUsing) continue;
      } catch {}

      indexes[index] = i;
      poolsOfUser[index] = activePools[i];
      index++;
    }

    return (indexes, poolsOfUser);
  }

  /**
   * @notice Returns arrays of Ionic pool indexes and data created by `account`.
   */
  function getPoolsByAccount(address account) external view returns (uint256[] memory, Pool[] memory) {
    uint256[] memory indexes = new uint256[](_poolsByAccount[account].length);
    Pool[] memory accountPools = new Pool[](_poolsByAccount[account].length);
    (, Pool[] memory activePools) = getActivePools();

    for (uint256 i = 0; i < _poolsByAccount[account].length; i++) {
      indexes[i] = _poolsByAccount[account][i];
      accountPools[i] = activePools[_poolsByAccount[account][i]];
    }

    return (indexes, accountPools);
  }

  /**
   * @notice Modify existing Ionic pool name.
   */
  function setPoolName(uint256 index, string calldata name) external {
    IonicComptroller _comptroller = IonicComptroller(pools[index].comptroller);
    require(
      (msg.sender == _comptroller.admin() && _comptroller.adminHasRights()) || msg.sender == owner(),
      "!permission"
    );
    pools[index].name = name;
  }

  /**
   * @dev Maps Ethereum accounts to booleans indicating if they are a whitelisted admin.
   */
  mapping(address => bool) public adminWhitelist;

  /**
   * @dev used as salt for the creation of new pools
   */
  uint256 public poolsCounter;

  /**
   * @dev Event emitted when the admin whitelist is updated.
   */
  event AdminWhitelistUpdated(address[] admins, bool status);

  /**
   * @dev Adds/removes Ethereum accounts to the admin whitelist.
   * @param admins Array of Ethereum accounts to be whitelisted.
   * @param status Whether to add or remove the accounts.
   */
  function _editAdminWhitelist(address[] calldata admins, bool status) external onlyOwner {
    require(admins.length > 0, "No admins supplied.");
    for (uint256 i = 0; i < admins.length; i++) adminWhitelist[admins[i]] = status;
    emit AdminWhitelistUpdated(admins, status);
  }

  /**
   * @notice Returns arrays of all Ionic pool indexes and data with whitelisted admins.
   * @dev This function is not designed to be called in a transaction: it is too gas-intensive.
   */
  function getPublicPoolsByVerification(bool whitelistedAdmin) external view returns (uint256[] memory, Pool[] memory) {
    uint256 arrayLength = 0;

    (, Pool[] memory activePools) = getActivePools();
    for (uint256 i = 0; i < activePools.length; i++) {
      IonicComptroller comptroller = IonicComptroller(activePools[i].comptroller);

      try comptroller.admin() returns (address admin) {
        if (whitelistedAdmin != adminWhitelist[admin]) continue;
      } catch {}

      arrayLength++;
    }

    uint256[] memory indexes = new uint256[](arrayLength);
    Pool[] memory publicPools = new Pool[](arrayLength);
    uint256 index = 0;

    for (uint256 i = 0; i < activePools.length; i++) {
      IonicComptroller comptroller = IonicComptroller(activePools[i].comptroller);

      try comptroller.admin() returns (address admin) {
        if (whitelistedAdmin != adminWhitelist[admin]) continue;
      } catch {}

      indexes[index] = i;
      publicPools[index] = activePools[i];
      index++;
    }

    return (indexes, publicPools);
  }

  /**
   * @notice Returns arrays of all verified Ionic pool indexes and data for which the account is whitelisted
   * @param account who is whitelisted in the returned verified whitelist-enabled pools.
   * @dev This function is not designed to be called in a transaction: it is too gas-intensive.
   */
  function getVerifiedPoolsOfWhitelistedAccount(address account)
    external
    view
    returns (uint256[] memory, Pool[] memory)
  {
    uint256 arrayLength = 0;
    (, Pool[] memory activePools) = getActivePools();
    for (uint256 i = 0; i < activePools.length; i++) {
      IonicComptroller comptroller = IonicComptroller(activePools[i].comptroller);

      try comptroller.enforceWhitelist() returns (bool enforceWhitelist) {
        if (!enforceWhitelist || !comptroller.whitelist(account)) continue;
      } catch {}

      arrayLength++;
    }

    uint256[] memory indexes = new uint256[](arrayLength);
    Pool[] memory accountWhitelistedPools = new Pool[](arrayLength);
    uint256 index = 0;

    for (uint256 i = 0; i < activePools.length; i++) {
      IonicComptroller comptroller = IonicComptroller(activePools[i].comptroller);
      try comptroller.enforceWhitelist() returns (bool enforceWhitelist) {
        if (!enforceWhitelist || !comptroller.whitelist(account)) continue;
      } catch {}

      indexes[index] = i;
      accountWhitelistedPools[index] = activePools[i];
      index++;
    }

    return (indexes, accountWhitelistedPools);
  }
}
