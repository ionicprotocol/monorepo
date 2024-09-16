// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.10;

import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
// import { IReward } from "./interfaces/IReward.sol";
import { IVoter } from "./IVoter.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { IonicTimeLibrary } from "./libraries/IonicTimeLibrary.sol";
import { IveION } from "./IveION.sol";

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
  /// @notice Standard OZ IGovernor using ve for vote weights.
  address public governor;
  /// @notice Custom Epoch Governor using ve for vote weights.
  address public epochGovernor;
  /// @notice credibly neutral party similar to Curve's Emergency DAO
  address public emergencyCouncil;

  /// @dev Total Voting Weights
  uint256 public totalWeight;
  /// @dev Most number of pools one voter can vote for at once
  uint256 public maxVotingNum;
  uint256 internal constant MIN_MAXVOTINGNUM = 10;

  /// @dev All pools viable for incentives
  address[] public pools;
  /// @dev Pool => Gauge
  mapping(address => address) public gauges;
  /// @dev Gauge => Pool
  mapping(address => address) public poolForGauge;
  /// @dev Gauge => Fees Voting Reward
  mapping(address => address) public gaugeToFees;
  /// @dev Gauge => Bribes Voting Reward
  mapping(address => address) public gaugeToBribe;
  /// @dev Pool => Weights
  mapping(address => uint256) public weights;
  /// @dev NFT => Pool => Votes
  mapping(uint256 => mapping(address => uint256)) public votes;
  /// @dev NFT => List of pools voted for by NFT
  mapping(uint256 => address[]) public poolVote;
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
  /// @dev Gauge => Accumulated gauge distributions
  mapping(address => uint256) internal supplyIndex;
  /// @dev Gauge => Amount claimable
  mapping(address => uint256) public claimable;

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
  function initialize(address[] calldata _tokens, address _minter) external {
    if (msg.sender != minter) revert NotMinter();
    uint256 _length = _tokens.length;
    for (uint256 i = 0; i < _length; i++) {
      _whitelistToken(_tokens[i], true);
    }
    minter = _minter;
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

  function setMaxVotingNum(uint256 _maxVotingNum) external {
    if (msg.sender != governor) revert NotGovernor();
    if (_maxVotingNum < MIN_MAXVOTINGNUM) revert MaximumVotingNumberTooLow();
    if (_maxVotingNum == maxVotingNum) revert SameValue();
    maxVotingNum = _maxVotingNum;
  }

  /// @inheritdoc IVoter
  function reset(uint256 _tokenId) external onlyNewEpoch(_tokenId) {
    if (!IveION(ve).isApprovedOrOwner(msg.sender, _tokenId)) revert NotApprovedOrOwner();
    _reset(_tokenId);
  }

  function _reset(uint256 _tokenId) internal {
    address[] storage _poolVote = poolVote[_tokenId];
    uint256 _poolVoteCnt = _poolVote.length;
    uint256 _totalWeight = 0;

    for (uint256 i = 0; i < _poolVoteCnt; i++) {
      address _pool = _poolVote[i];
      uint256 _votes = votes[_tokenId][_pool];

      if (_votes != 0) {
        _updateFor(gauges[_pool]);
        weights[_pool] -= _votes;
        delete votes[_tokenId][_pool];
        // IReward(gaugeToFees[gauges[_pool]])._withdraw(uint256(_votes), _tokenId);
        // IReward(gaugeToBribe[gauges[_pool]])._withdraw(uint256(_votes), _tokenId);
        _totalWeight += _votes;
        emit Abstained(msg.sender, _pool, _tokenId, _votes, weights[_pool], block.timestamp);
      }
    }
    IveION(ve).voting(_tokenId, false);
    totalWeight -= _totalWeight;
    usedWeights[_tokenId] = 0;
    delete poolVote[_tokenId];
  }

  /// @inheritdoc IVoter
  function poke(uint256 _tokenId) external {
    if (block.timestamp <= IonicTimeLibrary.epochVoteStart(block.timestamp)) revert DistributeWindow();
    uint256 _weight = IveION(ve).balanceOfNFT(_tokenId);
    _poke(_tokenId, _weight);
  }

  function _poke(uint256 _tokenId, uint256 _weight) internal {
    address[] memory _poolVote = poolVote[_tokenId];
    uint256 _poolCnt = _poolVote.length;
    uint256[] memory _weights = new uint256[](_poolCnt);

    for (uint256 i = 0; i < _poolCnt; i++) {
      _weights[i] = votes[_tokenId][_poolVote[i]];
    }
    _vote(_tokenId, _weight, _poolVote, _weights);
  }

  function _vote(uint256 _tokenId, uint256 _weight, address[] memory _poolVote, uint256[] memory _weights) internal {
    _reset(_tokenId);
    uint256 _poolCnt = _poolVote.length;
    uint256 _totalVoteWeight = 0;
    uint256 _totalWeight = 0;
    uint256 _usedWeight = 0;

    for (uint256 i = 0; i < _poolCnt; i++) {
      _totalVoteWeight += _weights[i];
    }

    for (uint256 i = 0; i < _poolCnt; i++) {
      address _pool = _poolVote[i];
      address _gauge = gauges[_pool];
      if (_gauge == address(0)) revert GaugeDoesNotExist(_pool);
      if (!isAlive[_gauge]) revert GaugeNotAlive(_gauge);

      if (isGauge[_gauge]) {
        uint256 _poolWeight = (_weights[i] * _weight) / _totalVoteWeight;
        if (votes[_tokenId][_pool] != 0) revert NonZeroVotes();
        if (_poolWeight == 0) revert ZeroBalance();
        _updateFor(_gauge);

        poolVote[_tokenId].push(_pool);

        weights[_pool] += _poolWeight;
        votes[_tokenId][_pool] += _poolWeight;
        // IReward(gaugeToFees[_gauge])._deposit(uint256(_poolWeight), _tokenId);
        // IReward(gaugeToBribe[_gauge])._deposit(uint256(_poolWeight), _tokenId);
        _usedWeight += _poolWeight;
        _totalWeight += _poolWeight;
        emit Voted(msg.sender, _pool, _tokenId, _poolWeight, weights[_pool], block.timestamp);
      }
    }
    if (_usedWeight > 0) IveION(ve).voting(_tokenId, true);
    totalWeight += uint256(_totalWeight);
    usedWeights[_tokenId] = uint256(_usedWeight);
  }

  /// @inheritdoc IVoter
  function vote(
    uint256 _tokenId,
    address[] calldata _poolVote,
    uint256[] calldata _weights
  ) external onlyNewEpoch(_tokenId) {
    address _sender = msg.sender;
    if (!IveION(ve).isApprovedOrOwner(_sender, _tokenId)) revert NotApprovedOrOwner();
    if (_poolVote.length != _weights.length) revert UnequalLengths();
    if (_poolVote.length > maxVotingNum) revert TooManyPools();
    if (IveION(ve).deactivated(_tokenId)) revert InactiveManagedNFT();
    uint256 _timestamp = block.timestamp;
    if ((_timestamp > IonicTimeLibrary.epochVoteEnd(_timestamp)) && !isWhitelistedNFT[_tokenId])
      revert NotWhitelistedNFT();
    lastVoted[_tokenId] = _timestamp;
    uint256 _weight = IveION(ve).balanceOfNFT(_tokenId);
    _vote(_tokenId, _weight, _poolVote, _weights);
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
    return pools.length;
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
  function updateFor(address[] memory _gauges) external {
    uint256 _length = _gauges.length;
    for (uint256 i = 0; i < _length; i++) {
      _updateFor(_gauges[i]);
    }
  }

  /// @inheritdoc IVoter
  function updateFor(uint256 start, uint256 end) external {
    for (uint256 i = start; i < end; i++) {
      _updateFor(gauges[pools[i]]);
    }
  }

  /// @inheritdoc IVoter
  function updateFor(address _gauge) external {
    _updateFor(_gauge);
  }

  function _updateFor(address _gauge) internal {
    address _pool = poolForGauge[_gauge];
    uint256 _supplied = weights[_pool];
    if (_supplied > 0) {
      uint256 _supplyIndex = supplyIndex[_gauge];
      uint256 _index = index; // get global index0 for accumulated distribution
      supplyIndex[_gauge] = _index; // update _gauge current position to global position
      uint256 _delta = _index - _supplyIndex; // see if there is any difference that need to be accrued
      if (_delta > 0) {
        uint256 _share = (uint256(_supplied) * _delta) / 1e18; // add accrued difference for each supplied token
        if (isAlive[_gauge]) {
          claimable[_gauge] += _share;
        } else {
          IERC20(rewardToken).safeTransfer(minter, _share); // send rewards back to Minter so they're not stuck in Voter
        }
      }
    } else {
      supplyIndex[_gauge] = index; // new users are set to the default global state
    }
  }
}
