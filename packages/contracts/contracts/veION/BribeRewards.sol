// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { IBribeRewards } from "./interfaces/IBribeRewards.sol";
import { IVoter } from "./interfaces/IVoter.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin-contracts-upgradeable/contracts/security/ReentrancyGuardUpgradeable.sol";
import { Ownable2StepUpgradeable } from "openzeppelin-contracts-upgradeable/contracts/access/Ownable2StepUpgradeable.sol";
import { IonicTimeLibrary } from "./libraries/IonicTimeLibrary.sol";
import { IveION } from "./interfaces/IveION.sol";
import { ERC721Upgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC721/ERC721Upgradeable.sol";
import { MasterPriceOracle } from "../oracles/MasterPriceOracle.sol";

/**
 * @title BribeRewards Contract
 * @notice This contract allows veION to benefit from bribes when voting for various markets
 * @author Jourdan Dunkley <jourdan@ionic.money> (https://github.com/jourdanDunkley)
 */
contract BribeRewards is IBribeRewards, ReentrancyGuardUpgradeable, Ownable2StepUpgradeable {
  using SafeERC20 for IERC20;

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                           State Variables                                 ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  /// @notice Duration of the reward period in seconds
  uint256 public constant DURATION = 7 days;
  /// @notice Address of the voter contract
  address public voter;
  /// @notice Address of the veION contract
  address public ve;
  /// @notice List of reward tokens
  address[] public rewards;

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                                Mappings                                   ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  /// @notice Mapping to check if an address is a reward token
  mapping(address => bool) public isReward;
  /// @notice Total supply of LP tokens for each reward token
  mapping(address => uint256) public totalSupply;
  /// @notice Balance of LP tokens for each tokenId and reward token
  mapping(uint256 => mapping(address => uint256)) public balanceOf;
  /// @notice Rewards per epoch for each reward token
  mapping(address => mapping(uint256 => uint256)) public tokenRewardsPerEpoch;
  /// @notice Last earned timestamp for each reward token and tokenId
  mapping(address => mapping(uint256 => uint256)) public lastEarn;
  /// @notice A record of balance checkpoints for each account, by index
  mapping(uint256 => mapping(address => mapping(uint256 => Checkpoint))) public checkpoints;
  /// @notice The number of checkpoints for each account
  mapping(uint256 => mapping(address => uint256)) public numCheckpoints;
  /// @notice A record of balance checkpoints for each token, by index
  mapping(uint256 => mapping(address => SupplyCheckpoint)) public supplyCheckpoints;
  /// @notice The number of supply checkpoints for each token
  mapping(address => uint256) public supplyNumCheckpoints;
  /// @notice Historical prices for each reward token and epoch
  mapping(address => mapping(uint256 => uint256)) public historicalPrices;

  /**
   * @notice Modifier to restrict access to only the voter contract
   * @dev Ensures that the caller is the voter contract
   */
  modifier onlyVoter() {
    require(msg.sender == voter, "Caller is not the voter");
    _;
  }

  constructor() {
    _disableInitializers(); // Locks the implementation contract from being initialized
  }

  /**
   * @notice Initializes the BribeRewards contract with the voter and veION addresses
   * @dev This function is called only once during contract deployment
   * @param _voter The address of the voter contract
   * @param _ve The address of the veION contract
   */
  function initialize(address _voter, address _ve) public initializer {
    __ReentrancyGuard_init();
    __Ownable2Step_init();
    voter = _voter;
    ve = _ve;
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                           External Functions                              ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

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

  /**
   * @inheritdoc IBribeRewards
   * @notice This function can accept any token, regardless of its whitelisting status.
   * @dev If we were to check the whitelisting status, it could prevent tokens that were initially whitelisted and later de-whitelisted from having their rewards claimed, leading to unclaimable rewards.
   */
  function getReward(uint256 tokenId, address[] memory tokens) external nonReentrant onlyVoter {
    address sender = msg.sender;
    if (ERC721Upgradeable(ve).ownerOf(tokenId) != sender && sender != voter) revert Unauthorized();

    address _owner = ERC721Upgradeable(ve).ownerOf(tokenId);
    _getReward(_owner, tokenId, tokens);
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

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                           Internal Functions                              ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /// @dev used with all getReward implementations
  function _getReward(address recipient, uint256 tokenId, address[] memory tokens) internal {
    // check if token whitelisted
    uint256 _length = tokens.length;
    for (uint256 i = 0; i < _length; i++) {
      uint256 _reward = earned(tokens[i], tokenId);
      lastEarn[tokens[i]][tokenId] = block.timestamp;
      if (_reward > 0) IERC20(tokens[i]).safeTransfer(recipient, _reward);

      emit RewardsClaimed(recipient, tokens[i], _reward);
    }
  }

  /**
   * @notice Writes a new checkpoint for a token's balance
   * @param tokenId The ID of the veION token
   * @param lpToken The LP token address
   * @param balance The balance to record
   */
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

  /// @notice Writes a new checkpoint for total supply
  /// @param lpToken The LP token address
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

  /// @dev used within all notifyRewardAmount implementations
  function _notifyRewardAmount(address sender, address token, uint256 amount) internal {
    if (amount == 0) revert AmountCannotBeZero();
    IERC20(token).safeTransferFrom(sender, address(this), amount);

    uint256 epochStart = IonicTimeLibrary.epochStart(block.timestamp);
    tokenRewardsPerEpoch[token][epochStart] += amount;

    emit RewardNotification(sender, token, epochStart, amount);
  }

  /**
   * @notice Calculates the ETH value of a token amount at a specific epoch
   * @param amount The amount of tokens
   * @param lpToken The LP token address
   * @param epochTimestamp The timestamp of the epoch
   * @return The ETH value of the tokens
   */
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

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                           Pure/View Functions                             ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /// @notice Returns the total number of reward tokens
  /// @return The length of the rewards array
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

      vars.currTs = IonicTimeLibrary.epochStart(lastEarn[token][tokenId]);
      vars.index = getPriorBalanceIndex(tokenId, lpToken, vars.currTs);
      Checkpoint memory cp0 = checkpoints[tokenId][lpToken][vars.index];

      vars.currTs = Math.max(vars.currTs, IonicTimeLibrary.epochStart(cp0.timestamp));
      vars.numEpochs = (IonicTimeLibrary.epochStart(block.timestamp) - vars.currTs) / DURATION;

      if (vars.numEpochs > 0) {
        for (uint256 i = 0; i < vars.numEpochs; i++) {
          vars.index = getPriorBalanceIndex(tokenId, lpToken, vars.currTs + DURATION - 1);
          cp0 = checkpoints[tokenId][lpToken][vars.index];
          vars.epochBalanceValue = _getTokenEthValueAt(cp0.balanceOf, lpToken, vars.currTs);

          vars.supplyValue = 0;
          for (uint256 k = 0; k < lpTokens.length; k++) {
            address currentLpToken = lpTokens[k];
            uint256 supplyAmount = Math.max(
              supplyCheckpoints[getPriorSupplyIndex(vars.currTs + DURATION - 1, currentLpToken)][currentLpToken].supply,
              1
            );
            vars.supplyValue += _getTokenEthValueAt(supplyAmount, currentLpToken, vars.currTs);
          }
          if (vars.supplyValue > 0) {
            vars.totalReward += (vars.epochBalanceValue * tokenRewardsPerEpoch[token][vars.currTs]) / vars.supplyValue;
          }
          vars.currTs += DURATION;
        }
      }
    }

    return vars.totalReward;
  }

  /// @notice Gets all LP tokens that can receive rewards
  /// @return Array of LP token addresses
  function getAllLpRewardTokens() public view returns (address[] memory) {
    return IVoter(voter).getAllLpRewardTokens();
  }

  /**
   * @notice Sets historical prices for LP tokens at specific epochs
   * @param epochTimestamp The timestamp of the epoch
   * @param lpToken The LP token address
   * @param price The price to set
   */
  function setHistoricalPrices(uint256 epochTimestamp, address lpToken, uint256 price) external onlyOwner {
    uint256 epochStart = IonicTimeLibrary.epochStart(epochTimestamp);
    historicalPrices[lpToken][epochStart] = price;
  }

  /**
   * @notice Gets a specific checkpoint for a token
   * @param tokenId The ID of the veION token
   * @param lpToken The LP token address
   * @param index The index of the checkpoint to retrieve
   * @return The checkpoint data
   */
  function getCheckpoint(uint256 tokenId, address lpToken, uint256 index) external view returns (Checkpoint memory) {
    return checkpoints[tokenId][lpToken][index];
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
}
