// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/Create2Upgradeable.sol";
import "./compound/CEtherDelegator.sol";
import "./compound/CErc20Delegator.sol";

/**
 * @title FuseFeeDistributor
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 * @notice FuseFeeDistributor controls and receives protocol fees from Fuse pools and relays admin actions to Fuse pools.
 */
contract FuseFeeDistributor is Initializable, OwnableUpgradeable {
  using AddressUpgradeable for address;
  using SafeERC20Upgradeable for IERC20Upgradeable;

  /**
   * @dev Initializer that sets initial values of state variables.
   * @param _defaultInterestFeeRate The default proportion of Fuse pool interest taken as a protocol fee (scaled by 1e18).
   */
  function initialize(uint256 _defaultInterestFeeRate) public initializer {
    require(_defaultInterestFeeRate <= 1e18, "Interest fee rate cannot be more than 100%.");
    __Ownable_init();
    defaultInterestFeeRate = _defaultInterestFeeRate;
    maxSupplyEth = type(uint256).max;
    maxUtilizationRate = type(uint256).max;
  }

  /**
   * @notice The proportion of Fuse pool interest taken as a protocol fee (scaled by 1e18).
   */
  uint256 public defaultInterestFeeRate;

  /**
   * @dev Sets the default proportion of Fuse pool interest taken as a protocol fee.
   * @param _defaultInterestFeeRate The default proportion of Fuse pool interest taken as a protocol fee (scaled by 1e18).
   */
  function _setDefaultInterestFeeRate(uint256 _defaultInterestFeeRate) external onlyOwner {
    require(_defaultInterestFeeRate <= 1e18, "Interest fee rate cannot be more than 100%.");
    defaultInterestFeeRate = _defaultInterestFeeRate;
  }

  /**
   * @dev Withdraws accrued fees on interest.
   * @param erc20Contract The ERC20 token address to withdraw. Set to the zero address to withdraw ETH.
   */
  function _withdrawAssets(address erc20Contract) external {
    if (erc20Contract == address(0)) {
      uint256 balance = address(this).balance;
      require(balance > 0, "No balance available to withdraw.");
      (bool success, ) = owner().call{ value: balance }("");
      require(success, "Failed to transfer ETH balance to msg.sender.");
    } else {
      IERC20Upgradeable token = IERC20Upgradeable(erc20Contract);
      uint256 balance = token.balanceOf(address(this));
      require(balance > 0, "No token balance available to withdraw.");
      token.safeTransfer(owner(), balance);
    }
  }

  /**
   * @dev Minimum borrow balance (in ETH) per user per Fuse pool asset (only checked on new borrows, not redemptions).
   */
  uint256 public minBorrowEth;

  /**
   * @dev Maximum supply balance (in ETH) per user per Fuse pool asset.
   * No longer used as of `Rari-Capital/compound-protocol` version `fuse-v1.1.0`.
   */
  uint256 public maxSupplyEth;

  /**
   * @dev Maximum utilization rate (scaled by 1e18) for Fuse pool assets (only checked on new borrows, not redemptions).
   * No longer used as of `Rari-Capital/compound-protocol` version `fuse-v1.1.0`.
   */
  uint256 public maxUtilizationRate;

  /**
   * @dev Sets the proportion of Fuse pool interest taken as a protocol fee.
   * @param _minBorrowEth Minimum borrow balance (in ETH) per user per Fuse pool asset (only checked on new borrows, not redemptions).
   * @param _maxSupplyEth Maximum supply balance (in ETH) per user per Fuse pool asset.
   * @param _maxUtilizationRate Maximum utilization rate (scaled by 1e18) for Fuse pool assets (only checked on new borrows, not redemptions).
   */
  function _setPoolLimits(
    uint256 _minBorrowEth,
    uint256 _maxSupplyEth,
    uint256 _maxUtilizationRate
  ) external onlyOwner {
    minBorrowEth = _minBorrowEth;
    maxSupplyEth = _maxSupplyEth;
    maxUtilizationRate = _maxUtilizationRate;
  }

  /**
   * @dev Receives ETH fees.
   */
  receive() external payable {}

  /**
   * @dev Sends data to a contract.
   * @param targets The contracts to which `data` will be sent.
   * @param data The data to be sent to each of `targets`.
   */
  function _callPool(address[] calldata targets, bytes[] calldata data) external onlyOwner {
    require(targets.length > 0 && targets.length == data.length, "Array lengths must be equal and greater than 0.");
    for (uint256 i = 0; i < targets.length; i++) targets[i].functionCall(data[i]);
  }

  /**
   * @dev Sends data to a contract.
   * @param targets The contracts to which `data` will be sent.
   * @param data The data to be sent to each of `targets`.
   */
  function _callPool(address[] calldata targets, bytes calldata data) external onlyOwner {
    require(targets.length > 0, "No target addresses specified.");
    for (uint256 i = 0; i < targets.length; i++) targets[i].functionCall(data);
  }

  function deployCEther(bytes calldata constructorData) external returns (address) {
    // Make sure comptroller == msg.sender
    address comptroller = abi.decode(constructorData[0:32], (address));
    require(comptroller == msg.sender, "Comptroller is not sender.");
    // Deploy CEtherDelegator using msg.sender, underlying, and block.number as a salt
    bytes32 salt = keccak256(abi.encodePacked(msg.sender, address(0), block.number));

    bytes memory cEtherDelegatorCreationCode = abi.encodePacked(type(CEtherDelegator).creationCode, constructorData);
    address proxy = Create2Upgradeable.deploy(0, salt, cEtherDelegatorCreationCode);
    return proxy;
  }

  function deployCErc20(bytes calldata constructorData) external returns (address) {
    // Make sure comptroller == msg.sender
    (address underlying, address comptroller) = abi.decode(constructorData[0:64], (address, address));
    require(comptroller == msg.sender, "Comptroller is not sender.");

    // Deploy CErc20Delegator using msg.sender, underlying, and block.number as a salt
    bytes32 salt = keccak256(abi.encodePacked(msg.sender, underlying, block.number));

    bytes memory cErc20DelegatorCreationCode = abi.encodePacked(type(CErc20Delegator).creationCode, constructorData);
    address proxy = Create2Upgradeable.deploy(0, salt, cErc20DelegatorCreationCode);

    return proxy;
  }

  /**
   * @dev Whitelisted Comptroller implementation contract addresses for each existing implementation.
   */
  mapping(address => mapping(address => bool)) public comptrollerImplementationWhitelist;

  /**
   * @dev Adds/removes Comptroller implementations to the whitelist.
   * @param oldImplementations The old `Comptroller` implementation addresses to upgrade from for each `newImplementations` to upgrade to.
   * @param newImplementations Array of `Comptroller` implementations to be whitelisted/unwhitelisted.
   * @param statuses Array of whitelist statuses corresponding to `implementations`.
   */
  function _editComptrollerImplementationWhitelist(
    address[] calldata oldImplementations,
    address[] calldata newImplementations,
    bool[] calldata statuses
  ) external onlyOwner {
    require(
      newImplementations.length > 0 &&
        newImplementations.length == oldImplementations.length &&
        newImplementations.length == statuses.length,
      "No Comptroller implementations supplied or array lengths not equal."
    );
    for (uint256 i = 0; i < newImplementations.length; i++)
      comptrollerImplementationWhitelist[oldImplementations[i]][newImplementations[i]] = statuses[i];
  }

  /**
   * @dev Whitelisted CErc20Delegate implementation contract addresses and `allowResign` values for each existing implementation.
   */
  mapping(address => mapping(address => mapping(bool => bool))) public cErc20DelegateWhitelist;

  /**
   * @dev Adds/removes CErc20Delegate implementations to the whitelist.
   * @param oldImplementations The old `CErc20Delegate` implementation addresses to upgrade from for each `newImplementations` to upgrade to.
   * @param newImplementations Array of `CErc20Delegate` implementations to be whitelisted/unwhitelisted.
   * @param allowResign Array of `allowResign` values corresponding to `newImplementations` to be whitelisted/unwhitelisted.
   * @param statuses Array of whitelist statuses corresponding to `newImplementations`.
   */
  function _editCErc20DelegateWhitelist(
    address[] calldata oldImplementations,
    address[] calldata newImplementations,
    bool[] calldata allowResign,
    bool[] calldata statuses
  ) external onlyOwner {
    require(
      newImplementations.length > 0 &&
        newImplementations.length == oldImplementations.length &&
        newImplementations.length == allowResign.length &&
        newImplementations.length == statuses.length,
      "No CErc20Delegate implementations supplied or array lengths not equal."
    );
    for (uint256 i = 0; i < newImplementations.length; i++)
      cErc20DelegateWhitelist[oldImplementations[i]][newImplementations[i]][allowResign[i]] = statuses[i];
  }

  /**
   * @dev Whitelisted CEtherDelegate implementation contract addresses and `allowResign` values for each existing implementation.
   */
  mapping(address => mapping(address => mapping(bool => bool))) public cEtherDelegateWhitelist;

  /**
   * @dev Adds/removes CEtherDelegate implementations to the whitelist.
   * @param oldImplementations The old `CEtherDelegate` implementation addresses to upgrade from for each `newImplementations` to upgrade to.
   * @param newImplementations Array of `CEtherDelegate` implementations to be whitelisted/unwhitelisted.
   * @param allowResign Array of `allowResign` values corresponding to `newImplementations` to be whitelisted/unwhitelisted.
   * @param statuses Array of whitelist statuses corresponding to `newImplementations`.
   */
  function _editCEtherDelegateWhitelist(
    address[] calldata oldImplementations,
    address[] calldata newImplementations,
    bool[] calldata allowResign,
    bool[] calldata statuses
  ) external onlyOwner {
    require(
      newImplementations.length > 0 &&
        newImplementations.length == oldImplementations.length &&
        newImplementations.length == allowResign.length &&
        newImplementations.length == statuses.length,
      "No CEtherDelegate implementations supplied or array lengths not equal."
    );
    for (uint256 i = 0; i < newImplementations.length; i++)
      cEtherDelegateWhitelist[oldImplementations[i]][newImplementations[i]][allowResign[i]] = statuses[i];
  }

  /**
   * @dev Latest Comptroller implementation for each existing implementation.
   */
  mapping(address => address) internal _latestComptrollerImplementation;

  /**
   * @dev Latest Comptroller implementation for each existing implementation.
   */
  function latestComptrollerImplementation(address oldImplementation) external view returns (address) {
    return
      _latestComptrollerImplementation[oldImplementation] != address(0)
        ? _latestComptrollerImplementation[oldImplementation]
        : oldImplementation;
  }

  /**
   * @dev Sets the latest `Comptroller` upgrade implementation address.
   * @param oldImplementation The old `Comptroller` implementation address to upgrade from.
   * @param newImplementation Latest `Comptroller` implementation address.
   */
  function _setLatestComptrollerImplementation(address oldImplementation, address newImplementation)
    external
    onlyOwner
  {
    _latestComptrollerImplementation[oldImplementation] = newImplementation;
  }

  struct CDelegateUpgradeData {
    address implementation;
    bool allowResign;
    bytes becomeImplementationData;
  }

  /**
   * @dev Latest CErc20Delegate implementation for each existing implementation.
   */
  mapping(address => CDelegateUpgradeData) public _latestCErc20Delegate;

  /**
   * @dev Latest CEtherDelegate implementation for each existing implementation.
   */
  mapping(address => CDelegateUpgradeData) public _latestCEtherDelegate;

  /**
   * @dev Latest CErc20Delegate implementation for each existing implementation.
   */
  function latestCErc20Delegate(address oldImplementation)
    external
    view
    returns (
      address,
      bool,
      bytes memory
    )
  {
    CDelegateUpgradeData memory data = _latestCErc20Delegate[oldImplementation];
    bytes memory emptyBytes;
    return
      data.implementation != address(0)
        ? (data.implementation, data.allowResign, data.becomeImplementationData)
        : (oldImplementation, false, emptyBytes);
  }

  /**
   * @dev Latest CEtherDelegate implementation for each existing implementation.
   */
  function latestCEtherDelegate(address oldImplementation)
    external
    view
    returns (
      address,
      bool,
      bytes memory
    )
  {
    CDelegateUpgradeData memory data = _latestCEtherDelegate[oldImplementation];
    bytes memory emptyBytes;
    return
      data.implementation != address(0)
        ? (data.implementation, data.allowResign, data.becomeImplementationData)
        : (oldImplementation, false, emptyBytes);
  }

  /**
   * @dev Sets the latest `CEtherDelegate` upgrade implementation address and data.
   * @param oldImplementation The old `CEtherDelegate` implementation address to upgrade from.
   * @param newImplementation Latest `CEtherDelegate` implementation address.
   * @param allowResign Whether or not `resignImplementation` should be called on the old implementation before upgrade.
   * @param becomeImplementationData Data passed to the new implementation via `becomeImplementation` after upgrade.
   */
  function _setLatestCEtherDelegate(
    address oldImplementation,
    address newImplementation,
    bool allowResign,
    bytes calldata becomeImplementationData
  ) external onlyOwner {
    _latestCEtherDelegate[oldImplementation] = CDelegateUpgradeData(
      newImplementation,
      allowResign,
      becomeImplementationData
    );
  }

  /**
   * @dev Sets the latest `CErc20Delegate` upgrade implementation address and data.
   * @param oldImplementation The old `CErc20Delegate` implementation address to upgrade from.
   * @param newImplementation Latest `CErc20Delegate` implementation address.
   * @param allowResign Whether or not `resignImplementation` should be called on the old implementation before upgrade.
   * @param becomeImplementationData Data passed to the new implementation via `becomeImplementation` after upgrade.
   */
  function _setLatestCErc20Delegate(
    address oldImplementation,
    address newImplementation,
    bool allowResign,
    bytes calldata becomeImplementationData
  ) external onlyOwner {
    _latestCErc20Delegate[oldImplementation] = CDelegateUpgradeData(
      newImplementation,
      allowResign,
      becomeImplementationData
    );
  }

  /**
   * @notice Maps Unitroller (Comptroller proxy) addresses to the proportion of Fuse pool interest taken as a protocol fee (scaled by 1e18).
   * @dev A value of 0 means unset whereas a negative value means 0.
   */
  mapping(address => int256) public customInterestFeeRates;

  /**
   * @notice Returns the proportion of Fuse pool interest taken as a protocol fee (scaled by 1e18).
   */
  function interestFeeRate() external view returns (uint256) {
    (bool success, bytes memory data) = msg.sender.staticcall(abi.encodeWithSignature("comptroller()"));

    if (success && data.length == 32) {
      address comptroller = abi.decode(data, (address));
      int256 customRate = customInterestFeeRates[comptroller];
      if (customRate > 0) return uint256(customRate);
      if (customRate < 0) return 0;
    }

    return defaultInterestFeeRate;
  }

  /**
   * @dev Sets the proportion of Fuse pool interest taken as a protocol fee.
   * @param comptroller The Unitroller (Comptroller proxy) address.
   * @param rate The proportion of Fuse pool interest taken as a protocol fee (scaled by 1e18).
   */
  function _setCustomInterestFeeRate(address comptroller, int256 rate) external onlyOwner {
    require(rate <= 1e18, "Interest fee rate cannot be more than 100%.");
    customInterestFeeRates[comptroller] = rate;
  }
}
