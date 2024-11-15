// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { IBribeRewards } from "./interfaces/IBribeRewards.sol";
import { IVoter } from "./interfaces/IVoter.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin-contracts-upgradeable/contracts/security/ReentrancyGuardUpgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin-contracts-upgradeable/contracts/access/OwnableUpgradeable.sol";
import { IonicTimeLibrary } from "./libraries/IonicTimeLibrary.sol";
import { IveION } from "./interfaces/IveION.sol";
import { ERC721Upgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC721/ERC721Upgradeable.sol";
import { MasterPriceOracle } from "../oracles/MasterPriceOracle.sol";

/// @title BribeRewards
/// @notice Base reward contract for distribution of rewards
contract BribeRewards is IBribeRewards, ReentrancyGuardUpgradeable, OwnableUpgradeable {
  using SafeERC20 for IERC20;

  uint256 public constant DURATION = 7 days;

  address public voter;
  address public ve;
  /// @dev Address which has permission to externally call _deposit() & _withdraw()
  address public authorized;

  mapping(address => uint256) public totalSupply;
  mapping(uint256 => mapping(address => uint256)) public balanceOf;
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
  mapping(uint256 => mapping(address => mapping(uint256 => Checkpoint))) public checkpoints;
  /// @notice The number of checkpoints for each account
  mapping(uint256 => mapping(address => uint256)) public numCheckpoints;
  /// @notice A record of balance checkpoints for each token, by index
  mapping(uint256 => mapping(address => SupplyCheckpoint)) public supplyCheckpoints;
  /// @notice The number of checkpoints
  mapping(address => uint256) public supplyNumCheckpoints;

  mapping(address => mapping(uint256 => uint256)) public historicalPrices;

  modifier onlyVoter() {
    require(msg.sender == voter, "Caller is not the voter");
    _;
  }

  function initialize(address _voter) public initializer {
    __ReentrancyGuard_init();
    __Ownable_init();
    voter = _voter;
    ve = IVoter(_voter).ve();
  }

  /// @inheritdoc IBribeRewards
  function getPriorBalanceIndex(uint256 tokenId, address lpToken, uint256 timestamp) public view returns (uint256) {
    uint256 nCheckpoints = numCheckpoints[tokenId][lpToken];
    if (nCheckpoints == 0) {
      return 0;
    }

    // First check most recent balance
    if (checkpoints[tokenId][lpToken][nCheckpoints - 1].timestamp <= timestamp) {
      return (nCheckpoints - 1);
    }

    // Next check implicit zero balance
    if (checkpoints[tokenId][lpToken][0].timestamp > timestamp) {
      return 0;
    }

    uint256 lower = 0;
    uint256 upper = nCheckpoints - 1;
    while (upper > lower) {
      uint256 center = upper - (upper - lower) / 2; // ceil, avoiding overflow
      Checkpoint memory cp = checkpoints[tokenId][lpToken][center];
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
  function getPriorSupplyIndex(uint256 timestamp, address lpToken) public view returns (uint256) {
    uint256 nCheckpoints = supplyNumCheckpoints[lpToken];
    if (nCheckpoints == 0) {
      return 0;
    }

    // First check most recent balance
    if (supplyCheckpoints[nCheckpoints - 1][lpToken].timestamp <= timestamp) {
      return (nCheckpoints - 1);
    }

    // Next check implicit zero balance
    if (supplyCheckpoints[0][lpToken].timestamp > timestamp) {
      return 0;
    }

    uint256 lower = 0;
    uint256 upper = nCheckpoints - 1;
    while (upper > lower) {
      uint256 center = upper - (upper - lower) / 2; // ceil, avoiding overflow
      SupplyCheckpoint memory cp = supplyCheckpoints[center][lpToken];
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

  function _writeCheckpoint(uint256 tokenId, address lpToken, uint256 balance) internal {
    uint256 _nCheckPoints = numCheckpoints[tokenId][lpToken];
    uint256 _timestamp = block.timestamp;

    if (
      _nCheckPoints > 0 &&
      IonicTimeLibrary.epochStart(checkpoints[tokenId][lpToken][_nCheckPoints - 1].timestamp) ==
      IonicTimeLibrary.epochStart(_timestamp)
    ) {
      checkpoints[tokenId][lpToken][_nCheckPoints - 1] = Checkpoint(_timestamp, balance);
    } else {
      checkpoints[tokenId][lpToken][_nCheckPoints] = Checkpoint(_timestamp, balance);
      numCheckpoints[tokenId][lpToken] = _nCheckPoints + 1;
    }
  }

  function _writeSupplyCheckpoint(address lpToken) internal {
    uint256 _nCheckPoints = supplyNumCheckpoints[lpToken];
    uint256 _timestamp = block.timestamp;

    if (
      _nCheckPoints > 0 &&
      IonicTimeLibrary.epochStart(supplyCheckpoints[_nCheckPoints - 1][lpToken].timestamp) ==
      IonicTimeLibrary.epochStart(_timestamp)
    ) {
      supplyCheckpoints[_nCheckPoints - 1][lpToken] = SupplyCheckpoint(_timestamp, totalSupply[lpToken]);
    } else {
      supplyCheckpoints[_nCheckPoints][lpToken] = SupplyCheckpoint(_timestamp, totalSupply[lpToken]);
      supplyNumCheckpoints[lpToken] = _nCheckPoints + 1;
    }
  }

  function rewardsListLength() external view returns (uint256) {
    return rewards.length;
  }

  struct EarnedVars {
    uint256 totalReward;
    uint256 reward;
    uint256 supplyValue;
    uint256 epochBalanceValue;
    uint256 currTs;
    uint256 index;
    uint256 numEpochs;
    uint256 overallBalance;
    uint256 overallSupply;
    uint256 historicalPrice;
  }

  /// @inheritdoc IBribeRewards
  function earned(address token, uint256 tokenId) public view returns (uint256) {
    EarnedVars memory vars;
    vars.totalReward = 0;
    address[] memory lpTokens = getAllLpRewardTokens();

    for (uint256 j = 0; j < lpTokens.length; j++) {
      address lpToken = lpTokens[j];

      if (numCheckpoints[tokenId][lpToken] == 0) {
        continue;
      }

      vars.reward = 0;
      vars.supplyValue = 1;
      vars.currTs = IonicTimeLibrary.epochStart(lastEarn[token][tokenId]); // take epoch last claimed in as starting point
      vars.index = getPriorBalanceIndex(tokenId, lpToken, vars.currTs);
      Checkpoint memory cp0 = checkpoints[tokenId][lpToken][vars.index];

      // accounts for case where lastEarn is before first checkpoint
      vars.currTs = Math.max(vars.currTs, IonicTimeLibrary.epochStart(cp0.timestamp));

      // get epochs between current epoch and first checkpoint in same epoch as last claim
      vars.numEpochs = (IonicTimeLibrary.epochStart(block.timestamp) - vars.currTs) / DURATION;

      if (vars.numEpochs > 0) {
        for (uint256 i = 0; i < vars.numEpochs; i++) {
          // get index of last checkpoint in this epoch
          vars.index = getPriorBalanceIndex(tokenId, lpToken, vars.currTs + DURATION - 1);
          // get checkpoint in this epoch
          cp0 = checkpoints[tokenId][lpToken][vars.index];
          // get supply of last checkpoint in this epoch
          vars.supplyValue = 0;
          for (uint256 k = 0; k < lpTokens.length; k++) {
            address currentLpToken = lpTokens[k];
            uint256 supplyAmount = Math.max(
              supplyCheckpoints[getPriorSupplyIndex(vars.currTs + DURATION - 1, currentLpToken)][currentLpToken].supply,
              1
            );
            vars.supplyValue += _getTokenEthValueAt(supplyAmount, currentLpToken, vars.currTs);
          }
          vars.epochBalanceValue = _getTokenEthValueAt(cp0.balanceOf, lpToken, vars.currTs);
          if (vars.supplyValue > 0) {
            vars.totalReward += (vars.epochBalanceValue * tokenRewardsPerEpoch[token][vars.currTs]) / vars.supplyValue;
          }
          vars.currTs += DURATION;
        }
      }
    }

    return vars.totalReward;
  }

  /// @inheritdoc IBribeRewards
  function deposit(address lpToken, uint256 amount, uint256 tokenId) external onlyVoter {
    address sender = msg.sender;

    totalSupply[lpToken] += amount;
    balanceOf[tokenId][lpToken] += amount;

    _writeCheckpoint(tokenId, lpToken, balanceOf[tokenId][lpToken]);
    _writeSupplyCheckpoint(lpToken);

    emit Deposit(sender, tokenId, amount);
  }

  /// @inheritdoc IBribeRewards
  function withdraw(address lpToken, uint256 amount, uint256 tokenId) external onlyVoter {
    address sender = msg.sender;

    totalSupply[lpToken] -= amount;
    balanceOf[tokenId][lpToken] -= amount;

    _writeCheckpoint(tokenId, lpToken, balanceOf[tokenId][lpToken]);
    _writeSupplyCheckpoint(lpToken);

    emit Withdraw(sender, tokenId, amount);
  }

  /// @inheritdoc IBribeRewards
  function getReward(uint256 tokenId, address[] memory tokens) external nonReentrant onlyVoter {
    address sender = msg.sender;
    if (ERC721Upgradeable(ve).ownerOf(tokenId) != sender && sender != voter) revert Unauthorized();

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

  function getAllLpRewardTokens() public view returns (address[] memory) {
    return IVoter(voter).getAllLpRewardTokens();
  }

  //TODO account for non 18 decimal assets, optimize looping for earned
  function _getTokenEthValueAt(
    uint256 amount,
    address lpToken,
    uint256 epochTimestamp
  ) internal view returns (uint256) {
    uint256 epochStart = IonicTimeLibrary.epochStart(epochTimestamp);
    if (historicalPrices[lpToken][epochStart] == 0) revert HistoricalPriceNotSet(lpToken, epochStart);
    uint256 _priceAtTimestamp = historicalPrices[lpToken][epochStart];
    uint256 ethValue = (amount * _priceAtTimestamp) / 1e18;
    return ethValue;
  }

  function setHistoricalPrices(uint256 epochTimestamp, address lpToken, uint256 price) external onlyOwner {
    uint256 epochStart = IonicTimeLibrary.epochStart(epochTimestamp);
    historicalPrices[lpToken][epochStart] = price;
  }

  function setAuthorized(address _authorized) external onlyOwner {
    authorized = _authorized;
  }
}
