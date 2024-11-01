// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { IVoter } from "./interfaces/IVoter.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IonicTimeLibrary } from "./libraries/IonicTimeLibrary.sol";
import { IveION } from "./interfaces/IveION.sol";
import { IBribeRewards } from "./interfaces/IBribeRewards.sol";
import { IonicComptroller } from "../compound/ComptrollerInterface.sol";
import { ICErc20 } from "../compound/CTokenInterfaces.sol";
import { MasterPriceOracle } from "../oracles/MasterPriceOracle.sol";
import "openzeppelin-contracts-upgradeable/contracts/access/OwnableUpgradeable.sol";

interface IPoolLens {
  function getPoolSummary(
    IonicComptroller comptroller
  ) external returns (uint256, uint256, address[] memory, string[] memory, bool);
}

contract Voter is IVoter, OwnableUpgradeable {
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
  /// @notice Standard OZ IGovernor using ve for vote weights.
  address public governor;
  /// @notice Custom Epoch Governor using ve for vote weights.
  address public epochGovernor;
  /// @notice credibly neutral party similar to Curve's Emergency DAO
  address public emergencyCouncil;

  /// @dev Total Voting Weights
  mapping(address => uint256) public totalWeight;
  /// @dev Most number of markets one voter can vote for at once
  uint256 public maxVotingNum;
  uint256 internal constant MIN_MAXVOTINGNUM = 10;

  /// @dev All markets viable for incentives
  Market[] public markets;
  /// @dev Reward Accumulator => Bribes Voting Reward
  mapping(address => address) public rewardAccumulatorToBribe;
  /// @dev Market => Market Side => LP Asset => weights
  mapping(address => mapping(MarketSide => mapping(address => uint256))) public weights;
  /// @dev NFT => Pool => LP Asset => Votes
  mapping(uint256 => mapping(address => mapping(MarketSide => mapping(address => uint256)))) public votes;
  /// @dev NFT => List of markets voted for by NFT
  mapping(uint256 => address[]) public marketVote;
  /// @dev NFT => List of market vote sides voted for by NFT
  mapping(uint256 => MarketSide[]) public marketVoteSide;
  /// @dev NFT => Total voting weight of NFT
  mapping(uint256 => mapping(address => uint256)) public usedWeights;
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
  /// @dev Market => Market Side => Supply Index
  mapping(address => uint256) public supplyIndex;

  MasterPriceOracle public mpo;

  address[] public lpTokens;

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
  function initialize(address[] calldata _tokens, MasterPriceOracle _mpo, address _rewardToken) external initializer {
    __Ownable_init();
    uint256 _length = _tokens.length;
    if (_length == 0) revert TokensArrayEmpty();
    for (uint256 i = 0; i < _length; i++) {
      _whitelistToken(_tokens[i], true);
    }
    mpo = _mpo;
    rewardToken = _rewardToken;
    governor = msg.sender;
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

  function setBribes(address[] calldata _rewardAccumulators, address[] calldata _bribes) external {
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

  function distributeRewards() external {
    if (msg.sender != governor) revert NotGovernor();
    if (block.timestamp <= IonicTimeLibrary.epochVoteEnd(block.timestamp)) revert NotDistributeWindow();
    uint256 _reward = IERC20(rewardToken).balanceOf(address(this));
    uint256 _totalLPValueETH = _calculateTotalLPValue();
    for (uint256 i = 0; i < markets.length; i++) {
      uint256 _marketWeightETH = _calculateMarketLPValue(markets[i].marketAddress, markets[i].side);
      if (_marketWeightETH > 0) {
        IERC20(rewardToken).safeTransfer(
          marketToRewardAccumulators[markets[i].marketAddress][markets[i].side],
          (_reward * _marketWeightETH) / _totalLPValueETH
        );
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
    MarketSide[] storage _marketVoteSide = marketVoteSide[_tokenId];
    uint256 _marketVoteCnt = _marketVote.length;
    uint256 _totalWeight = 0;

    for (uint256 i = 0; i < _marketVoteCnt; i++) {
      address _market = _marketVote[i];
      MarketSide _marketSide = _marketVoteSide[i];

      address[] memory lpRewardTokens = _getAllLpRewardTokens();
      for (uint256 k = 0; k < lpRewardTokens.length; k++) {
        uint256 _votes = votes[_tokenId][_market][_marketSide][lpRewardTokens[k]];
        if (_votes != 0) {
          weights[_market][_marketSide][lpRewardTokens[k]] -= _votes;
          delete votes[_tokenId][_market][_marketSide][lpRewardTokens[k]];
          IBribeRewards(rewardAccumulatorToBribe[marketToRewardAccumulators[_market][_marketSide]]).withdraw(
            lpRewardTokens[k],
            uint256(_votes),
            _tokenId
          );
          _totalWeight += _votes;
          emit Abstained(
            msg.sender,
            _market,
            _tokenId,
            _votes,
            weights[_market][_marketSide][lpRewardTokens[k]],
            block.timestamp
          );
        }
        IveION(ve).voting(_tokenId, false);
        totalWeight[lpRewardTokens[k]] -= _totalWeight;
        usedWeights[_tokenId][lpRewardTokens[k]] = 0;
        delete marketVote[_tokenId];
      }
    }
  }

  /// @inheritdoc IVoter
  function poke(uint256 _tokenId) external {
    if (block.timestamp <= IonicTimeLibrary.epochVoteStart(block.timestamp)) revert DistributeWindow();
    (address[] memory _votingLPs, uint256[] memory _votingLPBalances, uint256[] memory _boosts) = IveION(ve)
      .balanceOfNFT(_tokenId);

    for (uint256 i = 0; i < _votingLPs.length; i++) {
      _poke(_tokenId, _votingLPs[i], (_votingLPBalances[i] * _boosts[i]) / 1e18);
    }
  }

  //can you only vote for one particular side or any amount of sides for a market
  function _poke(uint256 _tokenId, address _votingAsset, uint256 _votingAssetBalance) internal {
    address[] memory _marketVote = marketVote[_tokenId];
    MarketSide[] memory _marketVoteSide = marketVoteSide[_tokenId];
    uint256 _marketCnt = _marketVote.length;
    uint256[] memory _weights = new uint256[](_marketCnt);

    for (uint256 i = 0; i < _marketCnt; i++) {
      _weights[i] = votes[_tokenId][_marketVote[i]][_marketVoteSide[i]][_votingAsset];
    }
    _vote(_tokenId, _votingAsset, _votingAssetBalance, _marketVote, _marketVoteSide, _weights);
  }

  struct VoteVars {
    uint256 totalVoteWeight;
    uint256 totalWeight;
    uint256 usedWeight;
    address market;
    MarketSide marketSide;
    address rewardAccumulator;
    uint256 marketWeight;
  }

  function _vote(
    uint256 _tokenId,
    address _votingAsset,
    uint256 _votingAssetBalance,
    address[] memory _marketVote,
    MarketSide[] memory _marketVoteSide,
    uint256[] memory _weights
  ) internal {
    _reset(_tokenId);
    VoteVars memory vars;

    for (uint256 i = 0; i < _marketVote.length; i++) {
      vars.totalVoteWeight += _weights[i];
    }

    for (uint256 i = 0; i < _marketVote.length; i++) {
      vars.market = _marketVote[i];
      vars.marketSide = _marketVoteSide[i];
      vars.rewardAccumulator = rewardAccumulatorToBribe[marketToRewardAccumulators[vars.market][vars.marketSide]];
      if (vars.rewardAccumulator == address(0)) revert RewardAccumulatorDoesNotExist(vars.market);
      if (!isAlive[vars.rewardAccumulator]) revert RewardAccumulatorNotAlive(vars.rewardAccumulator);

      if (isGauge[vars.rewardAccumulator]) {
        vars.marketWeight = (_weights[i] * _votingAssetBalance) / vars.totalVoteWeight;
        if (votes[_tokenId][vars.market][vars.marketSide][_votingAsset] != 0) revert NonZeroVotes();
        if (vars.marketWeight == 0) revert ZeroBalance();

        marketVote[_tokenId].push(vars.market);
        marketVoteSide[_tokenId].push(vars.marketSide);

        weights[vars.market][vars.marketSide][_votingAsset] += vars.marketWeight;
        votes[_tokenId][vars.market][vars.marketSide][_votingAsset] += vars.marketWeight;
        IBribeRewards(vars.rewardAccumulator).deposit(_votingAsset, uint256(vars.marketWeight), _tokenId);
        vars.usedWeight += vars.marketWeight;
        vars.totalWeight += vars.marketWeight;
        emit Voted(
          msg.sender,
          vars.market,
          _tokenId,
          vars.marketWeight,
          weights[vars.market][vars.marketSide][_votingAsset],
          block.timestamp
        );
      }
    }
    if (vars.usedWeight > 0) IveION(ve).voting(_tokenId, true);
    totalWeight[_votingAsset] += uint256(vars.totalWeight);
    usedWeights[_tokenId][_votingAsset] = uint256(vars.usedWeight);
  }

  struct VoteLocalVars {
    address sender;
    uint256 timestamp;
    address[] votingLPs;
    uint256[] votingLPBalances;
    uint256[] boosts;
  }

  /// @inheritdoc IVoter
  function vote(
    uint256 _tokenId,
    address[] calldata _marketVote,
    MarketSide[] calldata _marketVoteSide,
    uint256[] calldata _weights
  ) external onlyNewEpoch(_tokenId) {
    VoteLocalVars memory vars;
    vars.sender = msg.sender;
    if (!IveION(ve).isApprovedOrOwner(vars.sender, _tokenId)) revert NotApprovedOrOwner();
    if (_marketVote.length != _weights.length) revert UnequalLengths();
    if (_marketVote.length != _marketVoteSide.length) revert UnequalLengths();
    if (_marketVote.length > maxVotingNum) revert TooManyPools();
    vars.timestamp = block.timestamp;
    if ((vars.timestamp > IonicTimeLibrary.epochVoteEnd(vars.timestamp)) && !isWhitelistedNFT[_tokenId])
      revert NotWhitelistedNFT();
    lastVoted[_tokenId] = vars.timestamp;
    (vars.votingLPs, vars.votingLPBalances, vars.boosts) = IveION(ve).balanceOfNFT(_tokenId);
    for (uint256 i = 0; i < vars.votingLPs.length; i++) {
      _vote(
        _tokenId,
        vars.votingLPs[i],
        (vars.votingLPBalances[i] * vars.boosts[i]) / 1e18,
        _marketVote,
        _marketVoteSide,
        _weights
      );
    }
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
  function claimBribes(address[] memory _bribes, address[][] memory _tokens, uint256 _tokenId) external {
    if (!IveION(ve).isApprovedOrOwner(_msgSender(), _tokenId)) revert NotApprovedOrOwner();
    uint256 _length = _bribes.length;
    for (uint256 i = 0; i < _length; i++) {
      IBribeRewards(_bribes[i]).getReward(_tokenId, _tokens[i]);
    }
  }

  // External function to get all LP reward tokens
  function getAllLpRewardTokens() external view returns (address[] memory) {
    return _getAllLpRewardTokens();
  }

  // Internal function to get all LP reward tokens
  function _getAllLpRewardTokens() internal view returns (address[] memory) {
    return lpTokens;
  }

  function setLpTokens(address[] memory _lpTokens) external onlyOwner {
    lpTokens = _lpTokens;
  }

  function _getTokenEthValue(uint256 amount, address lpToken) internal view returns (uint256) {
    uint256 tokenPriceInEth = mpo.price(lpToken); // Fetch price of 1 lpToken in ETH
    uint256 ethValue = amount * tokenPriceInEth;
    return ethValue;
  }

  function _calculateTotalLPValue() internal view returns (uint256 _totalLPValueETH) {
    for (uint256 i = 0; i < markets.length; i++)
      _totalLPValueETH += _calculateMarketLPValue(markets[i].marketAddress, markets[i].side);
  }

  function _calculateMarketLPValue(
    address _market,
    MarketSide _marketSide
  ) internal view returns (uint256 _marketLPValueETH) {
    address[] memory lpRewardTokens = _getAllLpRewardTokens();
    for (uint256 i = 0; i < lpRewardTokens.length; i++) {
      uint256 _lpAmount = weights[_market][_marketSide][lpRewardTokens[i]];
      uint256 tokenEthValue = _getTokenEthValue(_lpAmount, lpRewardTokens[i]);
      _marketLPValueETH += tokenEthValue;
    }
  }

  function setMpo(address _mpo) external onlyOwner {
    mpo = MasterPriceOracle(_mpo);
  }
}
