// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/Create2Upgradeable.sol";

import "./external/compound/IComptroller.sol";
import "./external/compound/IUnitroller.sol";
import "./external/compound/IPriceOracle.sol";
import "./compound/Unitroller.sol";

/**
 * @title FusePoolDirectory
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 * @notice FusePoolDirectory is a directory for Fuse interest rate pools.
 */
contract FusePoolDirectory is OwnableUpgradeable {
  /**
   * @dev Initializes a deployer whitelist if desired.
   * @param _enforceDeployerWhitelist Boolean indicating if the deployer whitelist is to be enforced.
   * @param _deployerWhitelist Array of Ethereum accounts to be whitelisted.
   */
  function initialize(bool _enforceDeployerWhitelist, address[] memory _deployerWhitelist) public initializer {
    __Ownable_init();
    enforceDeployerWhitelist = _enforceDeployerWhitelist;
    for (uint256 i = 0; i < _deployerWhitelist.length; i++) deployerWhitelist[_deployerWhitelist[i]] = true;
  }

  /**
   * @dev Struct for a Fuse interest rate pool.
   */
  struct FusePool {
    string name;
    address creator;
    address comptroller;
    uint256 blockPosted;
    uint256 timestampPosted;
  }

  /**
   * @dev Array of Fuse interest rate pools.
   */
  FusePool[] public pools;

  /**
   * @dev Maps Ethereum accounts to arrays of Fuse pool indexes.
   */
  mapping(address => uint256[]) private _poolsByAccount;

  /**
   * @dev Maps Fuse pool Comptroller addresses to bools indicating if they have been registered via the directory.
   */
  mapping(address => bool) public poolExists;

  /**
   * @dev Emitted when a new Fuse pool is added to the directory.
   */
  event PoolRegistered(uint256 index, FusePool pool);

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
   * @dev Adds a new Fuse pool to the directory (without checking msg.sender).
   * @param name The name of the pool.
   * @param comptroller The pool's Comptroller proxy contract address.
   * @return The index of the registered Fuse pool.
   */
  function _registerPool(string memory name, address comptroller) internal returns (uint256) {
    require(!poolExists[comptroller], "Pool already exists in the directory.");
    require(!enforceDeployerWhitelist || deployerWhitelist[msg.sender], "Sender is not on deployer whitelist.");
    require(bytes(name).length <= 100, "No pool name supplied.");
    FusePool memory pool = FusePool(name, msg.sender, comptroller, block.number, block.timestamp);
    pools.push(pool);
    _poolsByAccount[msg.sender].push(pools.length - 1);
    poolExists[comptroller] = true;
    emit PoolRegistered(pools.length - 1, pool);
    return pools.length - 1;
  }

  /**
   * @dev Deploys a new Fuse pool and adds to the directory.
   * @param name The name of the pool.
   * @param implementation The Comptroller implementation contract address.
   * @param enforceWhitelist Boolean indicating if the pool's supplier/borrower whitelist is to be enforced.
   * @param closeFactor The pool's close factor (scaled by 1e18).
   * @param liquidationIncentive The pool's liquidation incentive (scaled by 1e18).
   * @param priceOracle The pool's PriceOracle contract address.
   * @return The index of the registered Fuse pool and the Unitroller proxy address.
   */
  function deployPool(
    string memory name,
    address implementation,
    bool enforceWhitelist,
    uint256 closeFactor,
    uint256 liquidationIncentive,
    address priceOracle
  ) external returns (uint256, address) {
    // Input validation
    require(implementation != address(0), "No Comptroller implementation contract address specified.");
    require(priceOracle != address(0), "No PriceOracle contract address specified.");

    // Deploy CEtherDelegator using msg.sender, underlying, and block.number as a salt
    //        bytes32 salt = keccak256(abi.encodePacked(msg.sender, address(0), block.number));
    //

    //        address proxy = Create2Upgradeable.deploy(0, salt, cEtherDelegatorCreationCode);

    // Deploy Unitroller using msg.sender, name, and block.number as a salt
    bytes32 salt = keccak256(abi.encodePacked(msg.sender, name, block.number));
    bytes memory unitrollerCreationCode = abi.encodePacked(type(Unitroller).creationCode);
    address proxy = Create2Upgradeable.deploy(0, salt, unitrollerCreationCode);

    // Setup Unitroller
    IUnitroller unitroller = IUnitroller(proxy);
    require(
      unitroller._setPendingImplementation(implementation) == 0,
      "Failed to set pending implementation on Unitroller."
    ); // Checks Comptroller implementation whitelist
    IComptroller comptrollerImplementation = IComptroller(implementation);
    comptrollerImplementation._become(unitroller);
    IComptroller comptrollerProxy = IComptroller(proxy);

    // Set pool parameters
    require(comptrollerProxy._setCloseFactor(closeFactor) == 0, "Failed to set pool close factor.");
    require(
      comptrollerProxy._setLiquidationIncentive(liquidationIncentive) == 0,
      "Failed to set pool liquidation incentive."
    );
    require(comptrollerProxy._setPriceOracle(IPriceOracle(priceOracle)) == 0, "Failed to set pool price oracle.");

    // Whitelist
    if (enforceWhitelist)
      require(comptrollerProxy._setWhitelistEnforcement(true) == 0, "Failed to enforce supplier/borrower whitelist.");

    // Enable auto-implementation
    require(comptrollerProxy._toggleAutoImplementations(true) == 0, "Failed to enable pool auto implementations.");

    // Make msg.sender the admin
    require(unitroller._setPendingAdmin(msg.sender) == 0, "Failed to set pending admin on Unitroller.");

    // Register the pool with this FusePoolDirectory
    return (_registerPool(name, proxy), proxy);
  }

  /**
   * @notice Returns arrays of all Fuse pools' data.
   * @dev This function is not designed to be called in a transaction: it is too gas-intensive.
   */
  function getAllPools() external view returns (FusePool[] memory) {
    return pools;
  }

  /**
   * @notice Returns arrays of all public Fuse pool indexes and data.
   * @dev This function is not designed to be called in a transaction: it is too gas-intensive.
   */
  function getPublicPools() external view returns (uint256[] memory, FusePool[] memory) {
    uint256 arrayLength = 0;

    for (uint256 i = 0; i < pools.length; i++) {
      try IComptroller(pools[i].comptroller).enforceWhitelist() returns (bool enforceWhitelist) {
        if (enforceWhitelist) continue;
      } catch {}

      arrayLength++;
    }

    uint256[] memory indexes = new uint256[](arrayLength);
    FusePool[] memory publicPools = new FusePool[](arrayLength);
    uint256 index = 0;

    for (uint256 i = 0; i < pools.length; i++) {
      try IComptroller(pools[i].comptroller).enforceWhitelist() returns (bool enforceWhitelist) {
        if (enforceWhitelist) continue;
      } catch {}

      indexes[index] = i;
      publicPools[index] = pools[i];
      index++;
    }

    return (indexes, publicPools);
  }

  /**
   * @notice Returns arrays of Fuse pool indexes and data created by `account`.
   */
  function getPoolsByAccount(address account) external view returns (uint256[] memory, FusePool[] memory) {
    uint256[] memory indexes = new uint256[](_poolsByAccount[account].length);
    FusePool[] memory accountPools = new FusePool[](_poolsByAccount[account].length);

    for (uint256 i = 0; i < _poolsByAccount[account].length; i++) {
      indexes[i] = _poolsByAccount[account][i];
      accountPools[i] = pools[_poolsByAccount[account][i]];
    }

    return (indexes, accountPools);
  }

  /**
   * @dev Maps Ethereum accounts to arrays of Fuse pool Comptroller proxy contract addresses.
   */
  mapping(address => address[]) private _bookmarks;

  /**
   * @notice Returns arrays of Fuse pool Unitroller (Comptroller proxy) contract addresses bookmarked by `account`.
   */
  function getBookmarks(address account) external view returns (address[] memory) {
    return _bookmarks[account];
  }

  /**
   * @notice Bookmarks a Fuse pool Unitroller (Comptroller proxy) contract addresses.
   */
  function bookmarkPool(address comptroller) external {
    _bookmarks[msg.sender].push(comptroller);
  }

  /**
   * @notice Modify existing Fuse pool name.
   */
  function setPoolName(uint256 index, string calldata name) external {
    IComptroller _comptroller = IComptroller(pools[index].comptroller);
    require((msg.sender == _comptroller.admin() && _comptroller.adminHasRights()) || msg.sender == owner());
    pools[index].name = name;
  }

  /**
   * @dev Maps Ethereum accounts to booleans indicating if they are a whitelisted admin.
   */
  mapping(address => bool) public adminWhitelist;

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
   * @notice Returns arrays of all public Fuse pool indexes and data with whitelisted admins.
   * @dev This function is not designed to be called in a transaction: it is too gas-intensive.
   */
  function getPublicPoolsByVerification(bool whitelistedAdmin)
    external
    view
    returns (uint256[] memory, FusePool[] memory)
  {
    uint256 arrayLength = 0;

    for (uint256 i = 0; i < pools.length; i++) {
      IComptroller comptroller = IComptroller(pools[i].comptroller);

      try comptroller.enforceWhitelist() returns (bool enforceWhitelist) {
        if (enforceWhitelist) continue;

        try comptroller.admin() returns (address admin) {
          if (whitelistedAdmin != adminWhitelist[admin]) continue;
        } catch {}
      } catch {}

      arrayLength++;
    }

    uint256[] memory indexes = new uint256[](arrayLength);
    FusePool[] memory publicPools = new FusePool[](arrayLength);
    uint256 index = 0;

    for (uint256 i = 0; i < pools.length; i++) {
      IComptroller comptroller = IComptroller(pools[i].comptroller);

      try comptroller.enforceWhitelist() returns (bool enforceWhitelist) {
        if (enforceWhitelist) continue;

        try comptroller.admin() returns (address admin) {
          if (whitelistedAdmin != adminWhitelist[admin]) continue;
        } catch {}
      } catch {}

      indexes[index] = i;
      publicPools[index] = pools[i];
      index++;
    }

    return (indexes, publicPools);
  }
}
