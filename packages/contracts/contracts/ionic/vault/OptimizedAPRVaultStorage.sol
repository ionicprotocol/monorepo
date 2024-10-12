//// SPDX-License-Identifier: GPL-3.0
//pragma solidity ^0.8.10;
//
//import { VaultFees, IERC20 } from "./IVault.sol";
//import { CompoundMarketERC4626 } from "../strategies/CompoundMarketERC4626.sol";
//import { OptimizedVaultsRegistry } from "./OptimizedVaultsRegistry.sol";
//import { IonicFlywheel } from "../strategies/flywheel/IonicFlywheel.sol";
//import { SafeOwnable } from "../../ionic/SafeOwnable.sol";
//
//struct AdapterConfig {
//  CompoundMarketERC4626 adapter;
//  uint64 allocation;
//}
//
//abstract contract OptimizedAPRVaultStorage is SafeOwnable {
//  uint256 internal constant SECONDS_PER_YEAR = 365.25 days;
//
//  uint8 public constant DECIMAL_OFFSET = 9;
//
//  uint8 internal _decimals;
//  string internal _name;
//  string internal _symbol;
//
//  uint256 public highWaterMark;
//  uint256 public assetsCheckpoint;
//  uint256 public feesUpdatedAt;
//
//  VaultFees public fees;
//  VaultFees public proposedFees;
//  uint256 public proposedFeeTime;
//  address public feeRecipient;
//
//  AdapterConfig[10] public adapters;
//  AdapterConfig[10] public proposedAdapters;
//  uint8 public adaptersCount;
//  uint8 public proposedAdaptersCount;
//  uint256 public proposedAdapterTime;
//
//  uint256 public quitPeriod;
//  uint256 public depositLimit;
//
//  //  EIP-2612 STORAGE
//  uint256 internal INITIAL_CHAIN_ID;
//  bytes32 internal INITIAL_DOMAIN_SEPARATOR;
//  mapping(address => uint256) public nonces;
//
//  // OptimizedAPRVault storage
//
//  bool public emergencyExit;
//  uint256 public withdrawalThreshold;
//  OptimizedVaultsRegistry public registry;
//  mapping(IERC20 => IonicFlywheel) public flywheelForRewardToken;
//  address public flywheelLogic;
//
//  IERC20[] public rewardTokens;
//}
