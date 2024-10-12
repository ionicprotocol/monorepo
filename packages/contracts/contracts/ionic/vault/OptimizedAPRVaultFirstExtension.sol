// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.10;

//import "./OptimizedAPRVaultExtension.sol";
//import { OptimizedVaultsRegistry } from "./OptimizedVaultsRegistry.sol";
import { IonicFlywheel } from "../strategies/flywheel/IonicFlywheel.sol";
//import { AdapterConfig } from "./OptimizedAPRVaultStorage.sol";
import { VaultFees } from "./IVault.sol";

import { ERC20 } from "solmate/tokens/ERC20.sol";
//import { FuseFlywheelDynamicRewards } from "fuse-flywheel/rewards/FuseFlywheelDynamicRewards.sol";
//import { IFlywheelBooster } from "flywheel/interfaces/IFlywheelBooster.sol";
import { IFlywheelRewards } from "flywheel/interfaces/IFlywheelRewards.sol";
//import { FlywheelCore } from "flywheel/FlywheelCore.sol";
//
//import { SafeERC20Upgradeable as SafeERC20 } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/utils/SafeERC20Upgradeable.sol";
//import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
//import { IERC20Upgradeable as IERC20 } from "openzeppelin-contracts-upgradeable/contracts/interfaces/IERC4626Upgradeable.sol";
//import { IERC20MetadataUpgradeable as IERC20Metadata } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/extensions/ERC4626Upgradeable.sol";
//import { MathUpgradeable as Math } from "openzeppelin-contracts-upgradeable/contracts/utils/math/MathUpgradeable.sol";
//
//contract OptimizedAPRVaultFirstExtension is OptimizedAPRVaultExtension {
//  using SafeERC20 for IERC20;
//  using Math for uint256;
//
//  error AssetInvalid();
//  error InvalidConfig();
//
//  constructor() {
//    _disableInitializers();
//  }
//
//  function _getExtensionFunctions() external pure virtual override returns (bytes4[] memory) {
//    uint8 fnsCount = 6;
//    bytes4[] memory functionSelectors = new bytes4[](fnsCount);
//    functionSelectors[--fnsCount] = this.initialize.selector;
//    functionSelectors[--fnsCount] = this.proposeAdapters.selector;
//    functionSelectors[--fnsCount] = this.getAllFlywheels.selector;
//    functionSelectors[--fnsCount] = this.addRewardToken.selector;
//    functionSelectors[--fnsCount] = this.claimRewards.selector;
//    functionSelectors[--fnsCount] = this.claimRewardsForUser.selector;
//
//    require(fnsCount == 0, "use the correct array length");
//    return functionSelectors;
//  }
//
//  function initialize(bytes calldata data) public initializer {
//    require(msg.sender == address(this), "!not self call");
//
//    (
//      IERC20 asset_,
//      AdapterConfig[10] memory adapters_,
//      uint8 adaptersCount_,
//      VaultFees memory fees_,
//      address feeRecipient_,
//      uint256 depositLimit_,
//      OptimizedVaultsRegistry registry_,
//      address flywheelLogic_
//    ) = abi.decode(
//        data,
//        (IERC20, AdapterConfig[10], uint8, VaultFees, address, uint256, OptimizedVaultsRegistry, address)
//      );
//
//    if (address(asset_) == address(0)) revert AssetInvalid();
//    __ERC4626_init(asset_);
//
//    _name = string(bytes.concat("Midas Optimized ", bytes(IERC20Metadata(address(asset_)).name()), " Vault"));
//    _symbol = string(bytes.concat("mo-", bytes(IERC20Metadata(address(asset_)).symbol())));
//    _decimals = IERC20Metadata(address(asset_)).decimals() + DECIMAL_OFFSET; // Asset decimals + decimal offset to combat inflation attacks
//
//    depositLimit = depositLimit_;
//    registry = registry_;
//    flywheelLogic = flywheelLogic_;
//    INITIAL_CHAIN_ID = block.chainid;
//    INITIAL_DOMAIN_SEPARATOR = computeDomainSeparator();
//    feesUpdatedAt = block.timestamp;
//    highWaterMark = 1e9;
//    quitPeriod = 3 days;
//
//    // vault fees
//    if (fees_.deposit >= 1e18 || fees_.withdrawal >= 1e18 || fees_.management >= 1e18 || fees_.performance >= 1e18)
//      revert InvalidVaultFees();
//    fees = fees_;
//
//    // fee recipient
//    if (feeRecipient_ == address(0)) revert InvalidFeeRecipient();
//    feeRecipient = feeRecipient_;
//
//    // adapters config
//    _verifyAdapterConfig(adapters_, adaptersCount_);
//    adaptersCount = adaptersCount_;
//    for (uint8 i; i < adaptersCount_; i++) {
//      adapters[i] = adapters_[i];
//      asset_.approve(address(adapters_[i].adapter), type(uint256).max);
//    }
//  }
//
//  function _verifyAdapterConfig(AdapterConfig[10] memory newAdapters, uint8 adapterCount_) internal view {
//    if (adapterCount_ == 0 || adapterCount_ > 10) revert InvalidConfig();
//
//    uint256 totalAllocation;
//    for (uint8 i; i < adapterCount_; i++) {
//      if (newAdapters[i].adapter.asset() != asset()) revert AssetInvalid();
//
//      uint256 allocation = uint256(newAdapters[i].allocation);
//      if (allocation == 0) revert InvalidConfig();
//
//      totalAllocation += allocation;
//    }
//    if (totalAllocation != 1e18) revert InvalidConfig();
//  }
//
//  /*------------------------------------------------------------
//                            ADAPTER LOGIC
//    ------------------------------------------------------------*/
//
//  event NewAdaptersProposed(AdapterConfig[10] newAdapter, uint8 adaptersCount, uint256 timestamp);
//
//  /**
//   * @notice Propose a new adapter for this vault. Caller must be Owner.
//   * @param newAdapters A new ERC4626 that should be used as a yield adapter for this asset.
//   * @param newAdaptersCount Amount of new adapters.
//   */
//  function proposeAdapters(AdapterConfig[10] calldata newAdapters, uint8 newAdaptersCount) external onlyOwner {
//    _verifyAdapterConfig(newAdapters, newAdaptersCount);
//
//    for (uint8 i; i < newAdaptersCount; i++) {
//      proposedAdapters[i] = newAdapters[i];
//    }
//
//    proposedAdaptersCount = newAdaptersCount;
//
//    proposedAdapterTime = block.timestamp;
//
//    emit NewAdaptersProposed(newAdapters, proposedAdaptersCount, block.timestamp);
//  }
//
//  function getAllFlywheels() external view returns (IonicFlywheel[] memory allFlywheels) {
//    allFlywheels = new IonicFlywheel[](rewardTokens.length);
//    for (uint256 i = 0; i < rewardTokens.length; i++) {
//      allFlywheels[i] = flywheelForRewardToken[rewardTokens[i]];
//    }
//  }
//
//  /// @notice claim all token rewards
//  function claimRewards() public {
//    _claimRewards(msg.sender);
//  }
//
//  function claimRewardsForUser(address user) public {
//    _claimRewards(user);
//  }
//
//  function _claimRewards(address user) internal {
//    for (uint256 i = 0; i < rewardTokens.length; i++) {
//      IonicFlywheel flywheel = flywheelForRewardToken[rewardTokens[i]];
//      flywheel.accrue(ERC20(address(this)), user);
//      flywheel.claimRewards(user);
//    }
//  }
//
//  function _afterTokenTransfer(
//    address from,
//    address to,
//    uint256 amount
//  ) internal override {
//    super._afterTokenTransfer(from, to, amount);
//    for (uint256 i; i < rewardTokens.length; ++i) {
//      flywheelForRewardToken[rewardTokens[i]].accrue(ERC20(address(this)), from, to);
//    }
//  }
//
//  function addRewardToken(IERC20 token_) public {
//    require(msg.sender == owner() || msg.sender == address(this), "!owner or self");
//    require(address(flywheelForRewardToken[token_]) == address(0), "already added");
//
//    TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(flywheelLogic, owner(), "");
//    IonicFlywheel newFlywheel = IonicFlywheel(address(proxy));
//
//    newFlywheel.initialize(
//      ERC20(address(token_)),
//      IFlywheelRewards(address(0)),
//      IFlywheelBooster(address(0)),
//      address(this)
//    );
//    FuseFlywheelDynamicRewards rewardsContract = new FuseFlywheelDynamicRewards(
//      FlywheelCore(address(newFlywheel)),
//      1 days
//    );
//    newFlywheel.setFlywheelRewards(rewardsContract);
//    token_.approve(address(rewardsContract), type(uint256).max);
//    newFlywheel.updateFeeSettings(0, address(this));
//    // TODO accept owner
//    newFlywheel._setPendingOwner(owner());
//
//    // lets the vault shareholders accrue
//    newFlywheel.addStrategyForRewards(ERC20(address(this)));
//    flywheelForRewardToken[token_] = newFlywheel;
//    rewardTokens.push(token_);
//  }
//}
