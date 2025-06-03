// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

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
import { ERC721Upgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC721/ERC721Upgradeable.sol";
import { Ownable2StepUpgradeable } from "@openzeppelin-contracts-upgradeable/contracts/access/Ownable2StepUpgradeable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin-contracts-upgradeable/contracts/security/ReentrancyGuardUpgradeable.sol";

/**
 * @title Voter Contract
 * @notice This contract allows veION holders to vote for various markets
 * @author Jourdan Dunkley <jourdan@ionic.money> (https://github.com/jourdanDunkley)
 */
contract Voter is IVoter, Ownable2StepUpgradeable, ReentrancyGuardUpgradeable {
  using SafeERC20 for IERC20;

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                           State Variables                                 ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  ///@notice The ve token that governs these contracts
  address public ve;
  ///@notice Base token of ve contract
  address internal rewardToken;
  ///@notice Standard OZ IGovernor using ve for vote weights
  address public governor;
  ///@notice Master Price Oracle instance
  MasterPriceOracle public mpo;
  ///@notice List of LP tokens
  address[] public lpTokens;
  ///@notice Total Voting Weights for each address
  mapping(address => uint256) public totalWeight;
  ///@notice Maximum number of markets one voter can vote for at once
  uint256 public maxVotingNum;
  ///@notice Minimum value for maxVotingNum
  uint256 internal constant MIN_MAXVOTINGNUM = 10;
  ///@notice All markets viable for incentives
  Market[] public markets;

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                                Mappings                                   ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  ///@notice Mapping from Reward Accumulator to Bribes Voting Reward
  mapping(address => address) public rewardAccumulatorToBribe;
  ///@notice Mapping from Market to Market Side to LP Asset to weights
  mapping(address => mapping(MarketSide => mapping(address => uint256))) public weights;
  ///@notice Mapping from NFT to Pool to LP Asset to Votes
  mapping(uint256 => mapping(address => mapping(MarketSide => mapping(address => uint256)))) public votes;
  ///@notice Mapping from NFT to Pool to LP Asset to Base Weights
  mapping(uint256 => mapping(address => mapping(MarketSide => mapping(address => uint256)))) public baseWeights;
  ///@notice Mapping from NFT to List of markets voted for by NFT
  mapping(uint256 => mapping(address => address[])) public marketVote;
  ///@notice Mapping from NFT to List of market vote sides voted for by NFT
  mapping(uint256 => mapping(address => MarketSide[])) public marketVoteSide;
  ///@notice Mapping from NFT to Total voting weight of NFT
  mapping(uint256 => mapping(address => uint256)) public usedWeights;
  ///@notice Mapping from NFT to Timestamp of last vote (ensures single vote per epoch)
  mapping(uint256 => uint256) public lastVoted;
  ///@notice Mapping from Token to Whitelisted status
  mapping(address => bool) public isWhitelistedToken;
  ///@notice Mapping from TokenId to Whitelisted status
  mapping(uint256 => bool) public isWhitelistedNFT;
  ///@notice Mapping from Reward Accumulator to Liveness status
  mapping(address => bool) public isAlive;
  ///@notice Mapping from Market to Market Side to Reward Accumulator
  mapping(address => mapping(MarketSide => address)) public marketToRewardAccumulators;

  bool distributionTimelockAlive;

  /// @notice Historical prices for each reward token and epoch
  mapping(address => mapping(uint256 => uint256)) public historicalPrices;

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                               Modifiers                                   ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝
  /**
   * @notice Modifier to ensure that the function is called only in a new epoch since the last vote.
   * @dev Reverts if the current epoch start time is less than or equal to the last voted timestamp for the given token ID.
   *      Also reverts if the current time is within the vote distribution window.
   * @param _tokenId The ID of the veNFT to check the last voted timestamp.
   */
  modifier onlyNewEpoch(uint256 _tokenId) {
    if (IonicTimeLibrary.epochStart(block.timestamp) <= lastVoted[_tokenId]) revert AlreadyVotedOrDeposited();
    if (block.timestamp <= IonicTimeLibrary.epochVoteStart(block.timestamp)) revert DistributeWindow();
    _;
  }

  /**
   * @notice Modifier to ensure that the function is called only by the governance address.
   * @dev Reverts if the caller is not the current governor.
   */
  modifier onlyGovernance() {
    if (msg.sender != governor) revert NotGovernor();
    _;
  }

  constructor() {
    _disableInitializers(); // Locks the implementation contract from being initialized
  }

  /**
   * @notice Initializes the Voter contract with the specified parameters.
   * @dev Requires initialization with at least one reward token.
   * @param _tokens An array of token addresses to be whitelisted.
   * @param _mpo The MasterPriceOracle contract address.
   * @param _rewardToken The address of the reward token.
   * @param _ve The address of the veION contract.
   * @custom:reverts TokensArrayEmpty if the _tokens array is empty.
   */
  function initialize(
    address[] calldata _tokens,
    MasterPriceOracle _mpo,
    address _rewardToken,
    address _ve
  ) external initializer {
    __Ownable2Step_init();
    __ReentrancyGuard_init();
    uint256 _length = _tokens.length;
    if (_length == 0) revert TokensArrayEmpty();
    for (uint256 i = 0; i < _length; i++) {
      _whitelistToken(_tokens[i], true);
    }
    mpo = _mpo;
    rewardToken = _rewardToken;
    ve = _ve;
    governor = msg.sender;

    emit Initialized(_tokens, address(_mpo), _rewardToken, _ve, governor);
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                           External Functions                              ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /// @inheritdoc IVoter
  function vote(
    uint256 _tokenId,
    address[] calldata _marketVote,
    MarketSide[] calldata _marketVoteSide,
    uint256[] calldata _weights
  ) external nonReentrant onlyNewEpoch(_tokenId) {
    VoteLocalVars memory vars;
    vars.sender = msg.sender;
    if (ERC721Upgradeable(ve).ownerOf(_tokenId) != vars.sender) revert NotOwner();
    if (
      _marketVote.length != _marketVoteSide.length ||
      _marketVoteSide.length != _weights.length ||
      _weights.length != _marketVote.length
    ) revert UnequalLengths();
    if (_marketVote.length > maxVotingNum) revert TooManyPools();
    vars.timestamp = block.timestamp;
    if ((vars.timestamp > IonicTimeLibrary.epochVoteEnd(vars.timestamp)) && !isWhitelistedNFT[_tokenId])
      revert NotWhitelistedNFT();
    uint256 totalVoteWeight = 0;

    for (uint256 i = 0; i < _marketVote.length; i++) {
      totalVoteWeight += _weights[i];
    }
    for (uint256 i = 0; i < lpTokens.length; i++) {
      _reset(_tokenId, lpTokens[i]);
    }

    lastVoted[_tokenId] = vars.timestamp;
    (vars.votingLPs, vars.votingLPBalances, vars.boosts) = IveION(ve).balanceOfNFT(_tokenId);
    for (uint256 j = 0; j < vars.votingLPs.length; j++) {
      _vote(
        _tokenId,
        vars.votingLPs[j],
        (vars.votingLPBalances[j] * vars.boosts[j]) / 1e18,
        _marketVote,
        _marketVoteSide,
        _weights,
        totalVoteWeight
      );
    }
  }

  /// @inheritdoc IVoter
  function poke(uint256 _tokenId) external nonReentrant {
    if (block.timestamp <= IonicTimeLibrary.epochVoteStart(block.timestamp)) revert DistributeWindow();
    (address[] memory _votingLPs, uint256[] memory _votingLPBalances, uint256[] memory _boosts) = IveION(ve)
      .balanceOfNFT(_tokenId);

    for (uint256 i = 0; i < _votingLPs.length; i++) {
      uint256 effectiveBalance = (_votingLPBalances[i] * _boosts[i]) / 1e18;
      _poke(_tokenId, lpTokens[i], effectiveBalance);
    }
  }

  /// @inheritdoc IVoter
  function reset(uint256 _tokenId) public nonReentrant onlyNewEpoch(_tokenId) {
    if (ERC721Upgradeable(ve).ownerOf(_tokenId) != msg.sender) revert NotOwner();
    for (uint256 i = 0; i < lpTokens.length; i++) {
      _reset(_tokenId, lpTokens[i]);
    }
  }

  /// @inheritdoc IVoter
  function claimBribes(address[] memory _bribes, address[][] memory _tokens, uint256 _tokenId) external nonReentrant {
    if (_bribes.length != _tokens.length) revert UnequalLengths();
    if (ERC721Upgradeable(ve).ownerOf(_tokenId) != _msgSender()) revert NotOwner();
    uint256 _length = _bribes.length;
    for (uint256 i = 0; i < _length; i++) {
      IBribeRewards(_bribes[i]).getReward(_tokenId, _tokens[i]);
    }
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                           Admin External Functions                        ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /// @inheritdoc IVoter
  function distributeRewards() external onlyGovernance {
    if (distributionTimelockAlive && block.timestamp <= IonicTimeLibrary.epochVoteEnd(block.timestamp))
      revert NotDistributeWindow();
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
  function whitelistToken(address _token, bool _bool) external onlyGovernance {
    _whitelistToken(_token, _bool);
  }

  /// @inheritdoc IVoter
  function whitelistNFT(uint256 _tokenId, bool _bool) external onlyGovernance {
    address _sender = msg.sender;
    isWhitelistedNFT[_tokenId] = _bool;
    emit WhitelistNFT(_sender, _tokenId, _bool);
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                           Internal Functions                              ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /**
   * @notice Internal function to handle voting logic for a given token ID and voting asset.
   * @param _tokenId The ID of the token used for voting.
   * @param _votingAsset The address of the asset being used for voting.
   * @param _votingAssetBalance The balance of the voting asset.
   * @param _marketVote An array of market addresses to vote for.
   * @param _marketVoteSide An array of market sides corresponding to the markets.
   * @param _weights An array of weights for each market.
   * @param totalVoteWeight The total weight of the vote.
   */
  function _vote(
    uint256 _tokenId,
    address _votingAsset,
    uint256 _votingAssetBalance,
    address[] memory _marketVote,
    MarketSide[] memory _marketVoteSide,
    uint256[] memory _weights,
    uint256 totalVoteWeight
  ) internal {
    VoteVars memory vars;
    uint256 marketVoteLength = _marketVote.length;
    for (uint256 i = 0; i < marketVoteLength; i++) {
      vars.market = _marketVote[i];
      vars.marketSide = _marketVoteSide[i];
      vars.rewardAccumulator = marketToRewardAccumulators[vars.market][vars.marketSide];
      vars.bribes = rewardAccumulatorToBribe[vars.rewardAccumulator];
      if (_weights[i] == 0) revert ZeroWeight();
      if (vars.rewardAccumulator == address(0)) revert RewardAccumulatorDoesNotExist(vars.market);
      if (!isAlive[vars.rewardAccumulator]) revert RewardAccumulatorNotAlive(vars.rewardAccumulator);

      vars.marketWeight = (_weights[i] * _votingAssetBalance) / totalVoteWeight;
      if (votes[_tokenId][vars.market][vars.marketSide][_votingAsset] != 0) revert NonZeroVotes();

      marketVote[_tokenId][_votingAsset].push(vars.market);
      marketVoteSide[_tokenId][_votingAsset].push(vars.marketSide);

      weights[vars.market][vars.marketSide][_votingAsset] += vars.marketWeight;
      votes[_tokenId][vars.market][vars.marketSide][_votingAsset] += vars.marketWeight;
      baseWeights[_tokenId][vars.market][vars.marketSide][_votingAsset] = _weights[i];
      IBribeRewards(vars.bribes).deposit(_votingAsset, uint256(vars.marketWeight), _tokenId);
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
    IveION(ve).voting(_tokenId, true);
    totalWeight[_votingAsset] += uint256(vars.totalWeight);
    usedWeights[_tokenId][_votingAsset] = uint256(vars.usedWeight);
  }

  /**
   * @notice Internal function to update voting balances for a given token ID and voting asset.
   * @param _tokenId The ID of the token whose voting balance is being updated.
   * @param _votingAsset The address of the asset being used for voting.
   * @param _votingAssetBalance The balance of the voting asset.
   */
  function _poke(uint256 _tokenId, address _votingAsset, uint256 _votingAssetBalance) internal {
    address[] memory _marketVote = marketVote[_tokenId][_votingAsset];
    MarketSide[] memory _marketVoteSide = marketVoteSide[_tokenId][_votingAsset];
    uint256 _marketCnt = _marketVote.length;
    uint256[] memory _weights = new uint256[](_marketCnt);
    uint256 totalVoteWeight = 0;

    for (uint256 i = 0; i < _marketCnt; i++) {
      _weights[i] = baseWeights[_tokenId][_marketVote[i]][_marketVoteSide[i]][_votingAsset];
    }

    for (uint256 i = 0; i < _marketVote.length; i++) {
      totalVoteWeight += _weights[i];
    }

    _reset(_tokenId, _votingAsset);
    _vote(_tokenId, _votingAsset, _votingAssetBalance, _marketVote, _marketVoteSide, _weights, totalVoteWeight);
  }

  /**
   * @notice Internal function to reset voting state for a given token ID and voting asset.
   * @param _tokenId The ID of the token whose voting state is being reset.
   * @param _votingAsset The address of the asset being used for voting.
   */
  function _reset(uint256 _tokenId, address _votingAsset) internal {
    address[] storage _marketVote = marketVote[_tokenId][_votingAsset];
    MarketSide[] storage _marketVoteSide = marketVoteSide[_tokenId][_votingAsset];
    uint256 _marketVoteCnt = _marketVote.length;

    for (uint256 i = 0; i < _marketVoteCnt; i++) {
      address _market = _marketVote[i];
      MarketSide _marketSide = _marketVoteSide[i];

      uint256 _votes = votes[_tokenId][_market][_marketSide][_votingAsset];
      if (_votes != 0) {
        weights[_market][_marketSide][_votingAsset] -= _votes;
        delete votes[_tokenId][_market][_marketSide][_votingAsset];
        IBribeRewards(rewardAccumulatorToBribe[marketToRewardAccumulators[_market][_marketSide]]).withdraw(
          _votingAsset,
          uint256(_votes),
          _tokenId
        );
        totalWeight[_votingAsset] -= _votes;
        emit Abstained(
          msg.sender,
          _market,
          _tokenId,
          _votes,
          weights[_market][_marketSide][_votingAsset],
          block.timestamp
        );
      }
    }
    usedWeights[_tokenId][_votingAsset] = 0;
    delete marketVote[_tokenId][_votingAsset];
    delete marketVoteSide[_tokenId][_votingAsset];
    IveION(ve).voting(_tokenId, false);
  }

  /**
   * @notice Internal function to whitelist or unwhitelist a token for use in bribes.
   * @param _token The address of the token to be whitelisted or unwhitelisted.
   * @param _bool Boolean indicating whether to whitelist (true) or unwhitelist (false) the token.
   */
  function _whitelistToken(address _token, bool _bool) internal {
    isWhitelistedToken[_token] = _bool;
    emit WhitelistToken(msg.sender, _token, _bool);
  }

  /**
   * @notice Internal function to calculate the ETH value of a given amount of LP tokens.
   * @param amount The amount of LP tokens.
   * @param lpToken The address of the LP token.
   * @return The ETH value of the given amount of LP tokens.
   */
  function _getTokenEthValue(uint256 amount, address lpToken) internal view returns (uint256) {
    uint256 tokenPriceInEth = mpo.price(lpToken); // Fetch price of 1 lpToken in ETH
    uint256 ethValue = amount * tokenPriceInEth;
    return ethValue;
  }

  /**
   * @notice Internal function to calculate the total ETH value of all LP tokens in the markets.
   * @return _totalLPValueETH The total ETH value of all LP tokens.
   */
  function _calculateTotalLPValue() internal view returns (uint256 _totalLPValueETH) {
    uint256 marketLength = markets.length;
    for (uint256 i = 0; i < marketLength; i++)
      _totalLPValueETH += _calculateMarketLPValue(markets[i].marketAddress, markets[i].side);
  }

  /**
   * @notice Internal function to calculate the ETH value of LP tokens for a specific market.
   * @param _market The address of the market.
   * @param _marketSide The side of the market.
   * @return _marketLPValueETH The ETH value of LP tokens for the specified market.
   */
  function _calculateMarketLPValue(
    address _market,
    MarketSide _marketSide
  ) internal view returns (uint256 _marketLPValueETH) {
    uint256 lpTokensLength = lpTokens.length;
    for (uint256 i = 0; i < lpTokensLength; i++) {
      uint256 _lpAmount = weights[_market][_marketSide][lpTokens[i]];
      uint256 tokenEthValue = _getTokenEthValue(_lpAmount, lpTokens[i]);
      _marketLPValueETH += tokenEthValue;
    }
  }

  /**
   * @notice Internal function to check if a market exists.
   * @param _marketAddress The address of the market.
   * @param _marketSide The side of the market.
   * @return True if the market exists, false otherwise.
   */
  function _marketExists(address _marketAddress, MarketSide _marketSide) internal view returns (bool) {
    uint256 marketLength = markets.length;
    for (uint256 j = 0; j < marketLength; j++) {
      if (markets[j].marketAddress == _marketAddress && markets[j].side == _marketSide) {
        return true;
      }
    }
    return false;
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                           Setter Functions                                ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /// @inheritdoc IVoter
  function setLpTokens(address[] memory _lpTokens) external onlyOwner {
    require(_lpTokens.length != 0, "LpTokens array cannot be empty");
    lpTokens = _lpTokens;
    emit LpTokensSet(_lpTokens);
  }

  /// @inheritdoc IVoter
  function setMpo(address _mpo) external onlyOwner {
    if (_mpo == address(0)) revert ZeroAddress();
    mpo = MasterPriceOracle(_mpo);
    emit MpoSet(_mpo);
  }

  /// @inheritdoc IVoter
  function setGovernor(address _governor) public onlyOwner {
    if (_governor == address(0)) revert ZeroAddress();
    governor = _governor;
    emit GovernorSet(_governor);
  }

  /// @inheritdoc IVoter
  function addMarkets(Market[] calldata _markets) external onlyGovernance {
    for (uint256 i = 0; i < _markets.length; i++) {
      Market memory newMarket = _markets[i];
      if (_marketExists(newMarket.marketAddress, newMarket.side)) revert MarketAlreadyExists();
      markets.push(newMarket);
    }
    emit MarketsAdded(_markets);
  }

  /// @inheritdoc IVoter
  function setMarketRewardAccumulators(
    address[] calldata _markets,
    MarketSide[] calldata _marketSides,
    address[] calldata _rewardAccumulators
  ) external onlyGovernance {
    uint256 _length = _markets.length;
    if (_marketSides.length != _length) revert MismatchedArrayLengths();
    if (_rewardAccumulators.length != _length) revert MismatchedArrayLengths();
    for (uint256 i = 0; i < _length; i++) {
      marketToRewardAccumulators[_markets[i]][_marketSides[i]] = _rewardAccumulators[i];
      isAlive[_rewardAccumulators[i]] = true;
    }
    emit MarketRewardAccumulatorsSet(_markets, _marketSides, _rewardAccumulators);
  }

  /// @inheritdoc IVoter
  function setBribes(address[] calldata _rewardAccumulators, address[] calldata _bribes) external onlyGovernance {
    uint256 _length = _bribes.length;
    if (_rewardAccumulators.length != _length) revert MismatchedArrayLengths();
    for (uint256 i = 0; i < _length; i++) {
      rewardAccumulatorToBribe[_rewardAccumulators[i]] = _bribes[i];
    }
    emit BribesSet(_rewardAccumulators, _bribes);
  }

  /// @inheritdoc IVoter
  function setMaxVotingNum(uint256 _maxVotingNum) external onlyGovernance {
    if (_maxVotingNum < MIN_MAXVOTINGNUM) revert MaximumVotingNumberTooLow();
    if (_maxVotingNum == maxVotingNum) revert SameValue();
    maxVotingNum = _maxVotingNum;
    emit MaxVotingNumSet(_maxVotingNum);
  }

  /// @inheritdoc IVoter
  function toggleRewardAccumulatorAlive(
    address _market,
    MarketSide _marketSide,
    bool _isAlive
  ) external onlyGovernance {
    address _rewardAccumulator = marketToRewardAccumulators[_market][_marketSide];
    if (_rewardAccumulator == address(0)) revert RewardAccumulatorDoesNotExist(_market);
    isAlive[_rewardAccumulator] = _isAlive;
    emit RewardAccumulatorAliveToggled(_market, _marketSide, _isAlive);
  }

  /// @inheritdoc IVoter
  function toggleDistributionTimelockAlive(bool _isAlive) external onlyGovernance {
    distributionTimelockAlive = _isAlive;
    emit DistributionTimelockAliveToggled(_isAlive);
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
    // emit HistoricalPriceSet(epochTimestamp, lpToken, price);
  }

  /**
   * @notice Gets the historical price for a specific LP token at a given epoch
   * @param lpToken The LP token address
   * @param epochTimestamp The timestamp of the epoch
   * @return The historical price of the LP token at the specified epoch
   */
  function getHistoricalPrice(address lpToken, uint256 epochTimestamp) external view returns (uint256) {
    uint256 epochStart = IonicTimeLibrary.epochStart(epochTimestamp);
    return historicalPrices[lpToken][epochStart];
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║                           Pure/View Functions                             ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /// @inheritdoc IVoter
  function epochStart(uint256 _timestamp) external pure returns (uint256) {
    return IonicTimeLibrary.epochStart(_timestamp);
  }

  /// @inheritdoc IVoter
  function epochNext(uint256 _timestamp) external pure returns (uint256) {
    return IonicTimeLibrary.epochNext(_timestamp);
  }

  /// @inheritdoc IVoter
  function epochVoteStart(uint256 _timestamp) external pure returns (uint256) {
    return IonicTimeLibrary.epochVoteStart(_timestamp);
  }

  /// @inheritdoc IVoter
  function epochVoteEnd(uint256 _timestamp) external pure returns (uint256) {
    return IonicTimeLibrary.epochVoteEnd(_timestamp);
  }

  /// @inheritdoc IVoter
  function marketsLength() external view returns (uint256) {
    return markets.length;
  }

  /// @inheritdoc IVoter
  function getAllLpRewardTokens() external view returns (address[] memory) {
    return lpTokens;
  }

  /// @inheritdoc IVoter
  function getVoteDetails(uint256 _tokenId, address _lpAsset) external view returns (VoteDetails memory) {
    uint256 length = marketVote[_tokenId][_lpAsset].length;
    address[] memory _marketVotes = new address[](length);
    MarketSide[] memory _marketVoteSides = new MarketSide[](length);
    uint256[] memory _votes = new uint256[](length);

    for (uint256 i = 0; i < length; i++) {
      _marketVotes[i] = marketVote[_tokenId][_lpAsset][i];
      _marketVoteSides[i] = marketVoteSide[_tokenId][_lpAsset][i];
      _votes[i] = votes[_tokenId][_marketVotes[i]][_marketVoteSides[i]][_lpAsset];
    }

    uint256 _usedWeight = usedWeights[_tokenId][_lpAsset];

    return
      VoteDetails({
        marketVotes: _marketVotes,
        marketVoteSides: _marketVoteSides,
        votes: _votes,
        usedWeight: _usedWeight
      });
  }
}
