// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.10;

import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { IVoter } from "./interfaces/IVoter.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { IonicTimeLibrary } from "./libraries/IonicTimeLibrary.sol";
import { IveION } from "./interfaces/IveION.sol";
import { IBribeRewards } from "./interfaces/IBribeRewards.sol";
import { IonicComptroller } from "../compound/ComptrollerInterface.sol";

interface IPoolLens {
  function getPoolSummary(IonicComptroller comptroller) external returns (uint256, uint256, address[] memory, string[] memory, bool);
}

contract Voter is IVoter {
  using SafeERC20 for IERC20;
  /// @notice Store trusted forwarder address to pass into factories
  address public immutable forwarder;
  /// @notice The ve token that governs these contracts
  address public immutable ve;
  /// @notice Factory registry for valid pool / gauge / rewards factories
  address public immutable factoryRegistry;
  /// @notice V1 factory
  address public immutable v1Factory;
  /// @notice Base token of ve contract
  address internal immutable rewardToken;
  address public minter;
  address public poolLens;
  /// @notice Standard OZ IGovernor using ve for vote weights.
  address public governor;
  /// @notice Custom Epoch Governor using ve for vote weights.
  address public epochGovernor;
  /// @notice credibly neutral party similar to Curve's Emergency DAO
  address public emergencyCouncil;

  /// @dev Total Voting Weights
  uint256 public totalWeight;
  /// @dev Most number of markets one voter can vote for at once
  uint256 public maxVotingNum;
  uint256 internal constant MIN_MAXVOTINGNUM = 10;

  /// @dev All markets viable for incentives
  address[] public markets;
  /// @dev Reward Accumulator => Bribes Voting Reward
  mapping(address => address) public rewardAccumulatorToBribe;
  /// @dev Market => Market Side => weights
  mapping(address => mapping (MarketSide => uint256)) public weights;
  /// @dev NFT => Pool => Votes
  mapping(uint256 => mapping(address => mapping(MarketSide => uint256))) public votes;
  /// @dev NFT => List of markets voted for by NFT
  mapping(uint256 => address[]) public marketVote;
  /// @dev NFT => List of market vote sides voted for by NFT
  mapping(uint256 => MarketSide[]) public marketVoteSide;
  /// @dev NFT => Total voting weight of NFT
  mapping(uint256 => uint256) public usedWeights;
  /// @dev Nft => Timestamp of last vote (ensures single vote per epoch)
  mapping(uint256 => uint256) public lastVoted;
  /// @dev Address => Gauge
  mapping(address => bool) public isGauge;
  /// @dev Token => Whitelisted status
  mapping(address => bool) public isWhitelistedToken;
  /// @dev TokenId => Whitelisted status
  mapping(uint256 => bool) public isWhitelistedNFT;
  /// @dev Gauge => Liveness status
  mapping(address => bool) public isAlive;
  /// @dev Accumulated distributions per vote
  uint256 internal index;
  /// @dev Gauge => Amount claimable
  mapping(address => uint256) public claimable;
  /// @dev Market => Market Side => Reward Accumulator
  mapping(address => mapping(MarketSide => address)) marketToRewardAccumulators;

  modifier onlyNewEpoch(uint256 _tokenId) {
    // ensure new epoch since last vote
    if (IonicTimeLibrary.epochStart(block.timestamp) <= lastVoted[_tokenId]) revert AlreadyVotedOrDeposited();
    if (block.timestamp <= IonicTimeLibrary.epochVoteStart(block.timestamp)) revert DistributeWindow();
    _;
  }

  function epochStart(uint256 _timestamp) external pure returns (uint256) {
    return IonicTimeLibrary.epochStart(_timestamp);
  }

  function epochNext(uint256 _timestamp) external pure returns (uint256) {
    return IonicTimeLibrary.epochNext(_timestamp);
  }

  function epochVoteStart(uint256 _timestamp) external pure returns (uint256) {
    return IonicTimeLibrary.epochVoteStart(_timestamp);
  }

  function epochVoteEnd(uint256 _timestamp) external pure returns (uint256) {
    return IonicTimeLibrary.epochVoteEnd(_timestamp);
  }

  /// @dev requires initialization with at least rewardToken
  function initialize(address[] calldata _tokens, address _minter, address _poolLens) external {
    if (msg.sender != minter) revert NotMinter();
    uint256 _length = _tokens.length;
    for (uint256 i = 0; i < _length; i++) {
      _whitelistToken(_tokens[i], true);
    }
    minter = _minter;
    poolLens = _poolLens;
  }

  /// @inheritdoc IVoter
  function setGovernor(address _governor) public {
    if (msg.sender != governor) revert NotGovernor();
    if (_governor == address(0)) revert ZeroAddress();
    governor = _governor;
  }

  /// @inheritdoc IVoter
  function setEpochGovernor(address _epochGovernor) public {
    if (msg.sender != governor) revert NotGovernor();
    if (_epochGovernor == address(0)) revert ZeroAddress();
    epochGovernor = _epochGovernor;
  }

  /// @inheritdoc IVoter
  function setEmergencyCouncil(address _council) public {
    if (msg.sender != emergencyCouncil) revert NotEmergencyCouncil();
    if (_council == address(0)) revert ZeroAddress();
    emergencyCouncil = _council;
  }

  function setMarketRewardAccumulators(
    address[] calldata _markets,
    MarketSide[] calldata _marketSides,
    address[] calldata _rewardAccumulators
  ) external {
    if (msg.sender != governor) revert NotGovernor();
    uint256 _length = _markets.length;
    if (_marketSides.length != _length) revert MismatchedArrayLengths();
    if (_rewardAccumulators.length != _length) revert MismatchedArrayLengths();
    for (uint256 i = 0; i < _length; i++) {
      marketToRewardAccumulators[_markets[i]][_marketSides[i]] = _rewardAccumulators[i];
    }
  }

  function setBribes(
    address[] calldata _rewardAccumulators,
    address[] calldata _bribes
  ) external {
    if (msg.sender != governor) revert NotGovernor();
    uint256 _length = _bribes.length;
    if (_rewardAccumulators.length != _length) revert MismatchedArrayLengths();
    for (uint256 i = 0; i < _length; i++) {
      rewardAccumulatorToBribe[_rewardAccumulators[i]] = _bribes[i];
    }
  }

  function setMaxVotingNum(uint256 _maxVotingNum) external {
    if (msg.sender != governor) revert NotGovernor();
    if (_maxVotingNum < MIN_MAXVOTINGNUM) revert MaximumVotingNumberTooLow();
    if (_maxVotingNum == maxVotingNum) revert SameValue();
    maxVotingNum = _maxVotingNum;
  }

  function distributeRewards(address _comptroller) external {
    if (msg.sender != governor) revert NotGovernor();
    if (block.timestamp <= IonicTimeLibrary.epochVoteEnd(block.timestamp)) revert NotDistributeWindow();
    uint256 _reward = IERC20(rewardToken).balanceOf(address(this));
    for (uint256 i = 0; i < markets.length; i++) {
      for (uint256 j = 0; j < 3; j++) {
        uint256 _weight = weights[markets[i]][MarketSide(j)];
        if (MarketSide(j) == MarketSide.Utilization && _weight > 0) {
          // TODO: receive borrow and supply for specific market
          (uint256 totalSupply, uint256 totalBorrow, , , ) = IPoolLens(poolLens).getPoolSummary(IonicComptroller(_comptroller));
          uint256 _utilization = totalSupply * 100 / totalBorrow;
          uint256 _marketReward = _reward * _weight  / totalWeight;
          IERC20(rewardToken).safeTransfer(marketToRewardAccumulators[markets[i]][MarketSide.Supply], _marketReward * _utilization / 100); 
          IERC20(rewardToken).safeTransfer(marketToRewardAccumulators[markets[i]][MarketSide.Borrow], _marketReward * (100 - _utilization) / 100); 
        }
        if (_weight > 0) {
            IERC20(rewardToken).safeTransfer(marketToRewardAccumulators[markets[i]][MarketSide(j)], _reward * _weight  / totalWeight); 
        }
      }
    }
  }

  /// @inheritdoc IVoter
  function reset(uint256 _tokenId) external onlyNewEpoch(_tokenId) {
    if (!IveION(ve).isApprovedOrOwner(msg.sender, _tokenId)) revert NotApprovedOrOwner();
    _reset(_tokenId);
  }

  function _reset(uint256 _tokenId) internal {
    address[] storage _marketVote = marketVote[_tokenId];
    uint256 _marketVoteCnt = _marketVote.length;
    uint256 _totalWeight = 0;

    for (uint256 i = 0; i < _marketVoteCnt; i++) {
      address _market = _marketVote[i];
      for (uint256 j = 0; j < 3; j++) {
        uint256 _votes = votes[_tokenId][_market][MarketSide(j)];

        if (_votes != 0) {
          weights[_market][MarketSide(j)] -= _votes;
          delete votes[_tokenId][_market][MarketSide(j)];
          IBribeRewards(rewardAccumulatorToBribe[marketToRewardAccumulators[_market][MarketSide(j)]])._withdraw(uint256(_votes), _tokenId);
          _totalWeight += _votes;
          emit Abstained(msg.sender, _market, _tokenId, _votes, weights[_market][MarketSide(j)], block.timestamp);
        }
      }
    }
    IveION(ve).voting(_tokenId, false);
    totalWeight -= _totalWeight;
    usedWeights[_tokenId] = 0;
    delete marketVote[_tokenId];
  }

  /// @inheritdoc IVoter
  function poke(uint256 _tokenId) external {
    if (block.timestamp <= IonicTimeLibrary.epochVoteStart(block.timestamp)) revert DistributeWindow();
    uint256 _weight = IveION(ve).balanceOfNFT(_tokenId);
    _poke(_tokenId, _weight);
  }

  function _poke(uint256 _tokenId, uint256 _weight) internal {
    address[] memory _marketVote = marketVote[_tokenId];
    MarketSide[] memory _marketVoteSide = marketVoteSide[_tokenId];
    uint256 _marketCnt = _marketVote.length;
    uint256[] memory _weights = new uint256[](_marketCnt);

    for (uint256 i = 0; i < _marketCnt; i++) {
      for (uint256 j = 0; j < 3; j++) {
        _weights[i] = votes[_tokenId][_marketVote[i]][MarketSide(j)];
      }
    }
    _vote(_tokenId, _weight, _marketVote, _marketVoteSide, _weights);
  }

  function _vote(
    uint256 _tokenId, 
    uint256 _weight, 
    address[] memory _marketVote, 
    MarketSide[] memory _marketVoteSide,
    uint256[] memory _weights
  ) internal {
    _reset(_tokenId);
    uint256 _totalVoteWeight = 0;
    uint256 _totalWeight = 0;
    uint256 _usedWeight = 0;

    for (uint256 i = 0; i < _marketVote.length; i++) {
      _totalVoteWeight += _weights[i];
    }

    for (uint256 i = 0; i < _marketVote.length; i++) {
      address _market = _marketVote[i];
      address _rewardAccumulator = rewardAccumulatorToBribe[marketToRewardAccumulators[_marketVote[i]][_marketVoteSide[i]]];
      if (_rewardAccumulator == address(0)) revert RewardAccumulatorDoesNotExist(_market);
      if (!isAlive[_rewardAccumulator]) revert RewardAccumulatorNotAlive(_rewardAccumulator);

      if (isGauge[_rewardAccumulator]) {
        uint256 _marketWeight = (_weights[i] * _weight) / _totalVoteWeight;
        if (votes[_tokenId][_market][_marketVoteSide[i]] != 0) revert NonZeroVotes();
        if (_marketWeight == 0) revert ZeroBalance();

        marketVote[_tokenId].push(_market);

        weights[_market][_marketVoteSide[i]] += _marketWeight;
        votes[_tokenId][_market][_marketVoteSide[i]] += _marketWeight;
        IBribeRewards(_rewardAccumulator)._deposit(uint256(_marketWeight), _tokenId);
        _usedWeight += _marketWeight;
        _totalWeight += _marketWeight;
        emit Voted(msg.sender, _market, _tokenId, _marketWeight, weights[_market][_marketVoteSide[i]], block.timestamp);
      }
    }
    if (_usedWeight > 0) IveION(ve).voting(_tokenId, true);
    totalWeight += uint256(_totalWeight);
    usedWeights[_tokenId] = uint256(_usedWeight);
  }

  /// @inheritdoc IVoter
  function vote(
    uint256 _tokenId,
    address[] calldata _marketVote,
    MarketSide[] calldata _marketVoteSide,
    uint256[] calldata _weights
  ) external onlyNewEpoch(_tokenId) {
    address _sender = msg.sender;
    if (!IveION(ve).isApprovedOrOwner(_sender, _tokenId)) revert NotApprovedOrOwner();
    if (_marketVote.length != _weights.length) revert UnequalLengths();
    if (_marketVote.length > maxVotingNum) revert TooManyPools();
    if (IveION(ve).deactivated(_tokenId)) revert InactiveManagedNFT();
    uint256 _timestamp = block.timestamp;
    if ((_timestamp > IonicTimeLibrary.epochVoteEnd(_timestamp)) && !isWhitelistedNFT[_tokenId])
      revert NotWhitelistedNFT();
    lastVoted[_tokenId] = _timestamp;
    uint256 _weight = IveION(ve).balanceOfNFT(_tokenId);
    _vote(_tokenId, _weight, _marketVote, _marketVoteSide, _weights);
  }

  /// @inheritdoc IVoter
  function whitelistToken(address _token, bool _bool) external {
    if (msg.sender != governor) revert NotGovernor();
    _whitelistToken(_token, _bool);
  }

  function _whitelistToken(address _token, bool _bool) internal {
    isWhitelistedToken[_token] = _bool;
    emit WhitelistToken(msg.sender, _token, _bool);
  }

  /// @inheritdoc IVoter
  function whitelistNFT(uint256 _tokenId, bool _bool) external {
    address _sender = msg.sender;
    if (_sender != governor) revert NotGovernor();
    isWhitelistedNFT[_tokenId] = _bool;
    emit WhitelistNFT(_sender, _tokenId, _bool);
  }

  function length() external view returns (uint256) {
    return markets.length;
  }

  /// @inheritdoc IVoter
  function notifyRewardAmount(uint256 _amount) external {
    address sender = msg.sender;
    if (sender != minter) revert NotMinter();
    IERC20(rewardToken).safeTransferFrom(sender, address(this), _amount); // transfer the distribution in
    uint256 _ratio = (_amount * 1e18) / Math.max(totalWeight, 1); // 1e18 adjustment is removed during claim
    if (_ratio > 0) {
      index += _ratio;
    }
    emit NotifyReward(sender, rewardToken, _amount);
  }
  /// @inheritdoc IVoter
  function claimBribes(address[] memory _bribes, address[][] memory _tokens, uint256 _tokenId) external {}
}
