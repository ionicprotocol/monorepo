// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.10;

import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { IBribeRewards } from "./interfaces/IBribeRewards.sol";
import { IVoter } from "./interfaces/IVoter.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin-contracts-upgradeable/contracts/security/ReentrancyGuardUpgradeable.sol";
import { IonicTimeLibrary } from "./libraries/IonicTimeLibrary.sol";
import { IveION } from "./interfaces/IveION.sol";
import { ERC721Upgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC721/ERC721Upgradeable.sol";

/// @title BribeRewards
/// @notice Base reward contract for distribution of rewards
contract BribeRewards is IBribeRewards, ReentrancyGuardUpgradeable {
  using SafeERC20 for IERC20;

  uint256 public constant DURATION = 7 days;

  address public voter;
  address public ve;
  /// @dev Address which has permission to externally call _deposit() & _withdraw()
  address public authorized;

  uint256 public totalSupply;
  mapping(uint256 => uint256) public balanceOf;
  mapping(address => mapping(uint256 => uint256)) public tokenRewardsPerEpoch;
  mapping(address => mapping(uint256 => uint256)) public lastEarn;

  address[] public rewards;
  mapping(address => bool) public isReward;

  /// @notice A checkpoint for marking balance
  struct Checkpoint {
    uint256 timestamp;
    uint256 balanceOf;
  }

  /// @notice A checkpoint for marking supply
  struct SupplyCheckpoint {
    uint256 timestamp;
    uint256 supply;
  }

  /// @notice A record of balance checkpoints for each account, by index
  mapping(uint256 => mapping(uint256 => Checkpoint)) public checkpoints;
  /// @notice The number of checkpoints for each account
  mapping(uint256 => uint256) public numCheckpoints;
  /// @notice A record of balance checkpoints for each token, by index
  mapping(uint256 => SupplyCheckpoint) public supplyCheckpoints;
  /// @notice The number of checkpoints
  uint256 public supplyNumCheckpoints;

  function initialize(address _voter) public initializer {
    __ReentrancyGuard_init();
    voter = _voter;
    ve = IVoter(_voter).ve();
  }

  /// @inheritdoc IBribeRewards
  function getPriorBalanceIndex(uint256 tokenId, uint256 timestamp) public view returns (uint256) {
    uint256 nCheckpoints = numCheckpoints[tokenId];
    if (nCheckpoints == 0) {
      return 0;
    }

    // First check most recent balance
    if (checkpoints[tokenId][nCheckpoints - 1].timestamp <= timestamp) {
      return (nCheckpoints - 1);
    }

    // Next check implicit zero balance
    if (checkpoints[tokenId][0].timestamp > timestamp) {
      return 0;
    }

    uint256 lower = 0;
    uint256 upper = nCheckpoints - 1;
    while (upper > lower) {
      uint256 center = upper - (upper - lower) / 2; // ceil, avoiding overflow
      Checkpoint memory cp = checkpoints[tokenId][center];
      if (cp.timestamp == timestamp) {
        return center;
      } else if (cp.timestamp < timestamp) {
        lower = center;
      } else {
        upper = center - 1;
      }
    }
    return lower;
  }

  /// @inheritdoc IBribeRewards
  function getPriorSupplyIndex(uint256 timestamp) public view returns (uint256) {
    uint256 nCheckpoints = supplyNumCheckpoints;
    if (nCheckpoints == 0) {
      return 0;
    }

    // First check most recent balance
    if (supplyCheckpoints[nCheckpoints - 1].timestamp <= timestamp) {
      return (nCheckpoints - 1);
    }

    // Next check implicit zero balance
    if (supplyCheckpoints[0].timestamp > timestamp) {
      return 0;
    }

    uint256 lower = 0;
    uint256 upper = nCheckpoints - 1;
    while (upper > lower) {
      uint256 center = upper - (upper - lower) / 2; // ceil, avoiding overflow
      SupplyCheckpoint memory cp = supplyCheckpoints[center];
      if (cp.timestamp == timestamp) {
        return center;
      } else if (cp.timestamp < timestamp) {
        lower = center;
      } else {
        upper = center - 1;
      }
    }
    return lower;
  }

  function _writeCheckpoint(uint256 tokenId, uint256 balance) internal {
    uint256 _nCheckPoints = numCheckpoints[tokenId];
    uint256 _timestamp = block.timestamp;

    if (
      _nCheckPoints > 0 &&
      IonicTimeLibrary.epochStart(checkpoints[tokenId][_nCheckPoints - 1].timestamp) ==
      IonicTimeLibrary.epochStart(_timestamp)
    ) {
      checkpoints[tokenId][_nCheckPoints - 1] = Checkpoint(_timestamp, balance);
    } else {
      checkpoints[tokenId][_nCheckPoints] = Checkpoint(_timestamp, balance);
      numCheckpoints[tokenId] = _nCheckPoints + 1;
    }
  }

  function _writeSupplyCheckpoint() internal {
    uint256 _nCheckPoints = supplyNumCheckpoints;
    uint256 _timestamp = block.timestamp;

    if (
      _nCheckPoints > 0 &&
      IonicTimeLibrary.epochStart(supplyCheckpoints[_nCheckPoints - 1].timestamp) ==
      IonicTimeLibrary.epochStart(_timestamp)
    ) {
      supplyCheckpoints[_nCheckPoints - 1] = SupplyCheckpoint(_timestamp, totalSupply);
    } else {
      supplyCheckpoints[_nCheckPoints] = SupplyCheckpoint(_timestamp, totalSupply);
      supplyNumCheckpoints = _nCheckPoints + 1;
    }
  }

  function rewardsListLength() external view returns (uint256) {
    return rewards.length;
  }

  /// @inheritdoc IBribeRewards
  function earned(address token, uint256 tokenId) public view returns (uint256) {
    if (numCheckpoints[tokenId] == 0) {
      return 0;
    }

    uint256 reward = 0;
    uint256 _supply = 1;
    uint256 _currTs = IonicTimeLibrary.epochStart(lastEarn[token][tokenId]); // take epoch last claimed in as starting point
    uint256 _index = getPriorBalanceIndex(tokenId, _currTs);
    Checkpoint memory cp0 = checkpoints[tokenId][_index];

    // accounts for case where lastEarn is before first checkpoint
    _currTs = Math.max(_currTs, IonicTimeLibrary.epochStart(cp0.timestamp));

    // get epochs between current epoch and first checkpoint in same epoch as last claim
    uint256 numEpochs = (IonicTimeLibrary.epochStart(block.timestamp) - _currTs) / DURATION;

    if (numEpochs > 0) {
      for (uint256 i = 0; i < numEpochs; i++) {
        // get index of last checkpoint in this epoch
        _index = getPriorBalanceIndex(tokenId, _currTs + DURATION - 1);
        // get checkpoint in this epoch
        cp0 = checkpoints[tokenId][_index];
        // get supply of last checkpoint in this epoch
        _supply = Math.max(supplyCheckpoints[getPriorSupplyIndex(_currTs + DURATION - 1)].supply, 1);
        reward += (cp0.balanceOf * tokenRewardsPerEpoch[token][_currTs]) / _supply;
        _currTs += DURATION;
      }
    }

    return reward;
  }

  /// @inheritdoc IBribeRewards
  function _deposit(uint256 amount, uint256 tokenId) external {
    address sender = msg.sender;
    if (sender != authorized) revert Unauthorized();

    totalSupply += amount;
    balanceOf[tokenId] += amount;

    _writeCheckpoint(tokenId, balanceOf[tokenId]);
    _writeSupplyCheckpoint();

    emit Deposit(sender, tokenId, amount);
  }

  /// @inheritdoc IBribeRewards
  function _withdraw(uint256 amount, uint256 tokenId) external {
    address sender = msg.sender;
    if (sender != authorized) revert Unauthorized();

    totalSupply -= amount;
    balanceOf[tokenId] -= amount;

    _writeCheckpoint(tokenId, balanceOf[tokenId]);
    _writeSupplyCheckpoint();

    emit Withdraw(sender, tokenId, amount);
  }

  /// @inheritdoc IBribeRewards
  function getReward(uint256 tokenId, address[] memory tokens) external override nonReentrant {
    address sender = msg.sender;
    if (!IveION(ve).isApprovedOrOwner(sender, tokenId) && sender != voter) revert Unauthorized();

    address _owner = ERC721Upgradeable(ve).ownerOf(tokenId);
    _getReward(_owner, tokenId, tokens);
  }

  /// @dev used with all getReward implementations
  function _getReward(address recipient, uint256 tokenId, address[] memory tokens) internal {
    uint256 _length = tokens.length;
    for (uint256 i = 0; i < _length; i++) {
      uint256 _reward = earned(tokens[i], tokenId);
      lastEarn[tokens[i]][tokenId] = block.timestamp;
      if (_reward > 0) IERC20(tokens[i]).safeTransfer(recipient, _reward);

      emit RewardsClaimed(recipient, tokens[i], _reward);
    }
  }

  /// @inheritdoc IBribeRewards
  function notifyRewardAmount(address token, uint256 amount) external override nonReentrant {
    address sender = msg.sender;

    if (!isReward[token]) {
      if (!IVoter(voter).isWhitelistedToken(token)) revert TokenNotWhitelisted();
      isReward[token] = true;
      rewards.push(token);
    }

    _notifyRewardAmount(sender, token, amount);
  }

  /// @dev used within all notifyRewardAmount implementations
  function _notifyRewardAmount(address sender, address token, uint256 amount) internal {
    if (amount == 0) revert AmountCannotBeZero();
    IERC20(token).safeTransferFrom(sender, address(this), amount);

    uint256 epochStart = IonicTimeLibrary.epochStart(block.timestamp);
    tokenRewardsPerEpoch[token][epochStart] += amount;

    emit RewardNotification(sender, token, epochStart, amount);
  }
}
