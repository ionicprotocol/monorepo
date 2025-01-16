// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin-contracts-upgradeable/contracts/utils/AddressUpgradeable.sol";
import "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin-contracts-upgradeable/contracts/utils/Create2Upgradeable.sol";

import { IonicComptroller } from "./compound/ComptrollerInterface.sol";
import { ICErc20 } from "./compound/CTokenInterfaces.sol";
import { CErc20Delegator } from "./compound/CErc20Delegator.sol";
import { CErc20PluginDelegate } from "./compound/CErc20PluginDelegate.sol";
import { SafeOwnableUpgradeable } from "./ionic/SafeOwnableUpgradeable.sol";
import { BasePriceOracle } from "./oracles/BasePriceOracle.sol";
import { DiamondExtension, DiamondBase } from "./ionic/DiamondExtension.sol";
import { AuthoritiesRegistry } from "./ionic/AuthoritiesRegistry.sol";

contract FeeDistributorStorage {
  struct CDelegateUpgradeData {
    address implementation;
    bytes becomeImplementationData;
  }

  /**
   * @notice Maps Unitroller (Comptroller proxy) addresses to the proportion of Ionic pool interest taken as a protocol fee (scaled by 1e18).
   * @dev A value of 0 means unset whereas a negative value means 0.
   */
  mapping(address => int256) public customInterestFeeRates;

  /**
   * @dev Latest Comptroller implementation for each existing implementation.
   */
  mapping(address => address) internal _latestComptrollerImplementation;

  /**
   * @dev Latest CErc20Delegate implementation for each existing implementation.
   */
  mapping(uint8 => CDelegateUpgradeData) internal _latestCErc20Delegate;

  /**
   * @dev Latest Plugin implementation for each existing implementation.
   */
  mapping(address => address) internal _latestPluginImplementation;

  mapping(address => DiamondExtension[]) public comptrollerExtensions;

  mapping(address => DiamondExtension[]) public cErc20DelegateExtensions;

  AuthoritiesRegistry public authoritiesRegistry;

  /**
   * @dev used as salt for the creation of new markets
   */
  uint256 public marketsCounter;

  /**
   * @dev Minimum borrow balance (in ETH) per user per Ionic pool asset (only checked on new borrows, not redemptions).
   */
  uint256 public minBorrowEth;

  /**
   * @dev Maximum utilization rate (scaled by 1e18) for Ionic pool assets (only checked on new borrows, not redemptions).
   * No longer used as of `Rari-Capital/compound-protocol` version `fuse-v1.1.0`.
   */
  uint256 public maxUtilizationRate;

  /**
   * @notice The proportion of Ionic pool interest taken as a protocol fee (scaled by 1e18).
   */
  uint256 public defaultInterestFeeRate;
}

/**
 * @title FeeDistributor
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 * @notice FeeDistributor controls and receives protocol fees from Ionic pools and relays admin actions to Ionic pools.
 */
contract FeeDistributor is SafeOwnableUpgradeable, FeeDistributorStorage {
  using AddressUpgradeable for address;
  using SafeERC20Upgradeable for IERC20Upgradeable;

  /**
   * @dev Initializer that sets initial values of state variables.
   * @param _defaultInterestFeeRate The default proportion of Ionic pool interest taken as a protocol fee (scaled by 1e18).
   */
  function initialize(uint256 _defaultInterestFeeRate) public initializer {
    require(_defaultInterestFeeRate <= 1e18, "Interest fee rate cannot be more than 100%.");
    __SafeOwnable_init(msg.sender);
    defaultInterestFeeRate = _defaultInterestFeeRate;
    maxUtilizationRate = type(uint256).max;
  }

  function reinitialize(AuthoritiesRegistry _ar) public onlyOwnerOrAdmin {
    authoritiesRegistry = _ar;
  }

  /**
   * @dev Sets the default proportion of Ionic pool interest taken as a protocol fee.
   * @param _defaultInterestFeeRate The default proportion of Ionic pool interest taken as a protocol fee (scaled by 1e18).
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
   * @dev Sets the proportion of Ionic pool interest taken as a protocol fee.
   * @param _minBorrowEth Minimum borrow balance (in ETH) per user per Ionic pool asset (only checked on new borrows, not redemptions).
   * @param _maxUtilizationRate Maximum utilization rate (scaled by 1e18) for Ionic pool assets (only checked on new borrows, not redemptions).
   */
  function _setPoolLimits(uint256 _minBorrowEth, uint256 _maxUtilizationRate) external onlyOwner {
    minBorrowEth = _minBorrowEth;
    maxUtilizationRate = _maxUtilizationRate;
  }

  function getMinBorrowEth(ICErc20 _ctoken) public view returns (uint256) {
    (, , uint256 borrowBalance, ) = _ctoken.getAccountSnapshot(_msgSender());
    if (borrowBalance == 0) return minBorrowEth;
    IonicComptroller comptroller = IonicComptroller(address(_ctoken.comptroller()));
    BasePriceOracle oracle = comptroller.oracle();
    uint256 underlyingPriceEth = oracle.price(ICErc20(address(_ctoken)).underlying());
    uint256 underlyingDecimals = _ctoken.decimals();
    uint256 borrowBalanceEth = (underlyingPriceEth * borrowBalance) / 10 ** underlyingDecimals;
    if (borrowBalanceEth > minBorrowEth) {
      return 0;
    }
    return minBorrowEth - borrowBalanceEth;
  }

  /**
   * @dev Receives native fees.
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

  /**
   * @dev Deploys a CToken for an underlying ERC20
   * @param constructorData Encoded construction data for `CToken initialize()`
   */
  function deployCErc20(
    uint8 delegateType,
    bytes calldata constructorData,
    bytes calldata becomeImplData
  ) external returns (address) {
    // Make sure comptroller == msg.sender
    (address underlying, address comptroller) = abi.decode(constructorData[0:64], (address, address));
    require(comptroller == msg.sender, "Comptroller is not sender.");

    // Deploy CErc20Delegator using msg.sender, underlying, and block.number as a salt
    bytes32 salt = keccak256(abi.encodePacked(msg.sender, underlying, ++marketsCounter));

    bytes memory cErc20DelegatorCreationCode = abi.encodePacked(type(CErc20Delegator).creationCode, constructorData);
    address proxy = Create2Upgradeable.deploy(0, salt, cErc20DelegatorCreationCode);

    CDelegateUpgradeData memory data = _latestCErc20Delegate[delegateType];
    DiamondExtension delegateAsExtension = DiamondExtension(data.implementation);
    // register the first extension
    DiamondBase(proxy)._registerExtension(delegateAsExtension, DiamondExtension(address(0)));
    // derive and configure the other extensions
    DiamondExtension[] memory ctokenExts = cErc20DelegateExtensions[address(delegateAsExtension)];
    for (uint256 i = 0; i < ctokenExts.length; i++) {
      if (ctokenExts[i] == delegateAsExtension) continue;
      DiamondBase(proxy)._registerExtension(ctokenExts[i], DiamondExtension(address(0)));
    }
    CErc20PluginDelegate(address(proxy))._becomeImplementation(becomeImplData);

    return proxy;
  }

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
  function _setLatestComptrollerImplementation(
    address oldImplementation,
    address newImplementation
  ) external onlyOwner {
    _latestComptrollerImplementation[oldImplementation] = newImplementation;
  }

  /**
   * @dev Latest CErc20Delegate implementation for each existing implementation.
   */
  function latestCErc20Delegate(uint8 delegateType) external view returns (address, bytes memory) {
    CDelegateUpgradeData memory data = _latestCErc20Delegate[delegateType];
    bytes memory emptyBytes;
    return
      data.implementation != address(0)
        ? (data.implementation, data.becomeImplementationData)
        : (address(0), emptyBytes);
  }

  /**
   * @dev Sets the latest `CErc20Delegate` upgrade implementation address and data.
   * @param delegateType The old `CErc20Delegate` implementation address to upgrade from.
   * @param newImplementation Latest `CErc20Delegate` implementation address.
   * @param becomeImplementationData Data passed to the new implementation via `becomeImplementation` after upgrade.
   */
  function _setLatestCErc20Delegate(
    uint8 delegateType,
    address newImplementation,
    bytes calldata becomeImplementationData
  ) external onlyOwner {
    _latestCErc20Delegate[delegateType] = CDelegateUpgradeData(newImplementation, becomeImplementationData);
  }

  /**
   * @dev Latest Plugin implementation for each existing implementation.
   */
  function latestPluginImplementation(address oldImplementation) external view returns (address) {
    return
      _latestPluginImplementation[oldImplementation] != address(0)
        ? _latestPluginImplementation[oldImplementation]
        : oldImplementation;
  }

  /**
   * @dev Sets the latest plugin upgrade implementation address.
   * @param oldImplementation The old plugin implementation address to upgrade from.
   * @param newImplementation Latest plugin implementation address.
   */
  function _setLatestPluginImplementation(address oldImplementation, address newImplementation) external onlyOwner {
    _latestPluginImplementation[oldImplementation] = newImplementation;
  }

  /**
   * @dev Upgrades a plugin of a CErc20PluginDelegate market to the latest implementation
   * @param cDelegator the proxy address
   * @return if the plugin was upgraded or not
   */
  function _upgradePluginToLatestImplementation(address cDelegator) external onlyOwner returns (bool) {
    CErc20PluginDelegate market = CErc20PluginDelegate(cDelegator);

    address oldPluginAddress = address(market.plugin());
    market._updatePlugin(_latestPluginImplementation[oldPluginAddress]);
    address newPluginAddress = address(market.plugin());

    return newPluginAddress != oldPluginAddress;
  }

  /**
   * @notice Returns the proportion of Ionic pool interest taken as a protocol fee (scaled by 1e18).
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
   * @dev Sets the proportion of Ionic pool interest taken as a protocol fee.
   * @param comptroller The Unitroller (Comptroller proxy) address.
   * @param rate The proportion of Ionic pool interest taken as a protocol fee (scaled by 1e18).
   */
  function _setCustomInterestFeeRate(address comptroller, int256 rate) external onlyOwner {
    require(rate <= 1e18, "Interest fee rate cannot be more than 100%.");
    customInterestFeeRates[comptroller] = rate;
  }

  function getComptrollerExtensions(address comptroller) external view returns (DiamondExtension[] memory) {
    return comptrollerExtensions[comptroller];
  }

  function _setComptrollerExtensions(address comptroller, DiamondExtension[] calldata extensions) external onlyOwner {
    comptrollerExtensions[comptroller] = extensions;
  }

  function _registerComptrollerExtension(
    address payable pool,
    DiamondExtension extensionToAdd,
    DiamondExtension extensionToReplace
  ) external onlyOwner {
    DiamondBase(pool)._registerExtension(extensionToAdd, extensionToReplace);
  }

  function getCErc20DelegateExtensions(address cErc20Delegate) external view returns (DiamondExtension[] memory) {
    return cErc20DelegateExtensions[cErc20Delegate];
  }

  function _setCErc20DelegateExtensions(
    address cErc20Delegate,
    DiamondExtension[] calldata extensions
  ) external onlyOwner {
    cErc20DelegateExtensions[cErc20Delegate] = extensions;
  }

  function autoUpgradePool(IonicComptroller pool) external onlyOwner {
    ICErc20[] memory markets = pool.getAllMarkets();

    // auto upgrade the pool
    pool._upgrade();

    for (uint8 i = 0; i < markets.length; i++) {
      // upgrade the market
      markets[i]._upgrade();
    }
  }

  function canCall(address pool, address user, address target, bytes4 functionSig) external view returns (bool) {
    return authoritiesRegistry.canCall(pool, user, target, functionSig);
  }
}
