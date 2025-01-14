// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

/**
 * @title IVoter
 * @notice Interface for the Voter contract, which manages voting and reward distribution.
 */
interface IVoter {
  /// @notice Error thrown when a user has already voted or deposited.
  error AlreadyVotedOrDeposited();

  /// @notice Error thrown when an action is attempted outside the distribution window.
  error DistributeWindow();

  /// @notice Error thrown when a factory path is not approved.
  error FactoryPathNotApproved();

  /// @notice Error thrown when a gauge is already killed.
  error GaugeAlreadyKilled();

  /// @notice Error thrown when a gauge is already revived.
  error GaugeAlreadyRevived();

  /// @notice Error thrown when a gauge already exists.
  error GaugeExists();

  /// @notice Error thrown when a reward accumulator does not exist for a given pool.
  error RewardAccumulatorDoesNotExist(address _pool);

  /// @notice Error thrown when a reward accumulator is not alive.
  error RewardAccumulatorNotAlive(address _rewardAccumulator);

  /// @notice Error thrown when a managed NFT is inactive.
  error InactiveManagedNFT();

  /// @notice Error thrown when a market already exists.
  error MarketAlreadyExists();

  /// @notice Error thrown when the maximum voting number is too low.
  error MaximumVotingNumberTooLow();

  /// @notice Error thrown when array lengths do not match.
  error MismatchedArrayLengths();

  /// @notice Error thrown when there are non-zero votes.
  error NonZeroVotes();

  /// @notice Error thrown when not all pools are included.
  error NotAllPools();

  /// @notice Error thrown when an address is not a pool.
  error NotAPool();

  /// @notice Error thrown when the caller is not the owner.
  error NotOwner();

  /// @notice Error thrown when an action is attempted outside the distribution window.
  error NotDistributeWindow();

  /// @notice Error thrown when the caller is not the governor.
  error NotGovernor();

  /// @notice Error thrown when the caller is not the minter.
  error NotMinter();

  /// @notice Error thrown when an NFT is not whitelisted.
  error NotWhitelistedNFT();

  /// @notice Error thrown when a token is not whitelisted.
  error NotWhitelistedToken();

  /// @notice Error thrown when the same value is provided.
  error SameValue();

  /// @notice Error thrown during a special voting window.
  error SpecialVotingWindow();

  /// @notice Error thrown when there are too many pools.
  error TooManyPools();

  /// @notice Error thrown when array lengths are unequal.
  error UnequalLengths();

  /// @notice Error thrown when there is a zero balance.
  error ZeroBalance();

  /// @notice Error thrown when an address is zero.
  error ZeroAddress();

  /// @notice Error thrown when the tokens array is empty.
  error TokensArrayEmpty();

  /// @notice Error thrown when the weight is zero.
  error ZeroWeight();

  /**
   * @notice Struct to store vote details.
   * @param marketVotes Array of market addresses voted for.
   * @param marketVoteSides Array of market sides voted for.
   * @param votes Array of vote weights.
   * @param usedWeight Total weight used in voting.
   */
  struct VoteDetails {
    address[] marketVotes;
    MarketSide[] marketVoteSides;
    uint256[] votes;
    uint256 usedWeight;
  }

  /**
   * @notice Struct to store market information.
   * @param marketAddress Address of the market.
   * @param side Side of the market (Supply or Borrow).
   */
  struct Market {
    address marketAddress;
    MarketSide side;
  }

  /**
   * @notice Struct to store variables used in voting.
   * @param totalWeight Total weight available for voting.
   * @param usedWeight Weight used in voting.
   * @param market Address of the market.
   * @param marketSide Side of the market.
   * @param rewardAccumulator Address of the reward accumulator.
   * @param marketWeight Weight of the market.
   * @param bribes Address of the bribes.
   */
  struct VoteVars {
    uint256 totalWeight;
    uint256 usedWeight;
    address market;
    MarketSide marketSide;
    address rewardAccumulator;
    uint256 marketWeight;
    address bribes;
  }

  /**
   * @notice Struct to store local variables used in voting.
   * @param sender Address of the sender.
   * @param timestamp Timestamp of the vote.
   * @param votingLPs Array of voting LP addresses.
   * @param votingLPBalances Array of voting LP balances.
   * @param boosts Array of boosts.
   */
  struct VoteLocalVars {
    address sender;
    uint256 timestamp;
    address[] votingLPs;
    uint256[] votingLPBalances;
    uint256[] boosts;
  }

  /**
   * @notice Enum to represent the side of a market.
   */
  enum MarketSide {
    Supply,
    Borrow
  }

  /**
   * @notice Event emitted when a vote is cast.
   * @param voter Address of the voter.
   * @param pool Address of the pool.
   * @param tokenId ID of the token.
   * @param weight Weight of the vote.
   * @param totalWeight Total weight of the vote.
   * @param timestamp Timestamp of the vote.
   */
  event Voted(
    address indexed voter,
    address indexed pool,
    uint256 indexed tokenId,
    uint256 weight,
    uint256 totalWeight,
    uint256 timestamp
  );

  /**
   * @notice Event emitted when a vote is abstained.
   * @param voter Address of the voter.
   * @param pool Address of the pool.
   * @param tokenId ID of the token.
   * @param weight Weight of the vote.
   * @param totalWeight Total weight of the vote.
   * @param timestamp Timestamp of the vote.
   */
  event Abstained(
    address indexed voter,
    address indexed pool,
    uint256 indexed tokenId,
    uint256 weight,
    uint256 totalWeight,
    uint256 timestamp
  );

  /**
   * @notice Event emitted when a reward is notified.
   * @param sender Address of the sender.
   * @param reward Address of the reward.
   * @param amount Amount of the reward.
   */
  event NotifyReward(address indexed sender, address indexed reward, uint256 amount);

  /**
   * @notice Event emitted when a token is whitelisted.
   * @param whitelister Address of the whitelister.
   * @param token Address of the token.
   * @param _bool Boolean indicating whitelist status.
   */
  event WhitelistToken(address indexed whitelister, address indexed token, bool indexed _bool);

  /**
   * @notice Event emitted when an NFT is whitelisted.
   * @param whitelister Address of the whitelister.
   * @param tokenId ID of the token.
   * @param _bool Boolean indicating whitelist status.
   */
  event WhitelistNFT(address indexed whitelister, uint256 indexed tokenId, bool indexed _bool);

  event LpTokensSet(address[] indexed lpTokens);
  event MpoSet(address indexed mpo);
  event GovernorSet(address indexed governor);
  event MarketsAdded(Market[] markets);
  event MarketRewardAccumulatorsSet(
    address[] indexed markets,
    MarketSide[] indexed marketSides,
    address[] indexed rewardAccumulators
  );
  event BribesSet(address[] indexed rewardAccumulators, address[] indexed bribes);
  event MaxVotingNumSet(uint256 indexed maxVotingNum);
  event RewardAccumulatorAliveToggled(address indexed market, MarketSide indexed marketSide, bool isAlive);
  event Initialized(address[] tokens, address mpo, address rewardToken, address ve, address governor);

  /**
   * @notice Get the weight of a market.
   * @param market Address of the market.
   * @param marketSide Side of the market.
   * @param lpToken Address of the LP token.
   * @return The weight of the market.
   */
  function weights(address market, MarketSide marketSide, address lpToken) external view returns (uint256);

  /**
   * @notice Get the votes for a token.
   * @param tokenId ID of the token.
   * @param market Address of the market.
   * @param marketSide Side of the market.
   * @param lpToken Address of the LP token.
   * @return The votes for the token.
   */
  function votes(
    uint256 tokenId,
    address market,
    MarketSide marketSide,
    address lpToken
  ) external view returns (uint256);

  /**
   * @notice Get the used weights for a token.
   * @param tokenId ID of the token.
   * @param lpToken Address of the LP token.
   * @return The used weights for the token.
   */
  function usedWeights(uint256 tokenId, address lpToken) external view returns (uint256);

  /**
   * @notice Get the last voted timestamp for a token.
   * @param tokenId ID of the token.
   * @return The last voted timestamp for the token.
   */
  function lastVoted(uint256 tokenId) external view returns (uint256);

  /**
   * @notice Check if a token is whitelisted.
   * @param token Address of the token.
   * @return True if the token is whitelisted, false otherwise.
   */
  function isWhitelistedToken(address token) external view returns (bool);

  /**
   * @notice Check if an NFT is whitelisted.
   * @param tokenId ID of the token.
   * @return True if the NFT is whitelisted, false otherwise.
   */
  function isWhitelistedNFT(uint256 tokenId) external view returns (bool);

  /**
   * @notice Get the address of the ve contract.
   * @return The address of the ve contract.
   */
  function ve() external view returns (address);

  /**
   * @notice Get the address of the governor.
   * @return The address of the governor.
   */
  function governor() external view returns (address);

  /**
   * @notice Update voting balances in voting rewards contracts.
   * @param _tokenId ID of veNFT whose balance you wish to update.
   */
  function poke(uint256 _tokenId) external;

  /**
   * @notice Vote for pools. Votes distributed proportionally based on weights.
   * @dev Can only vote or deposit into a managed NFT once per epoch.
   *      Can only vote for gauges that have not been killed.
   *      Throws if length of _poolVote and _weights do not match.
   * @param _tokenId ID of veNFT you are voting with.
   * @param _poolVote Array of pools you are voting for.
   * @param _marketVoteSide Array of market vote sides you are voting for.
   * @param _weights Weights of pools.
   */
  function vote(
    uint256 _tokenId,
    address[] calldata _poolVote,
    MarketSide[] calldata _marketVoteSide,
    uint256[] calldata _weights
  ) external;

  /**
   * @notice Reset voting state. Required if you wish to make changes to veNFT state.
   * @dev Cannot reset in the same epoch that you voted in.
   *      Can vote or deposit into a managed NFT again after reset.
   * @param _tokenId ID of veNFT that you are resetting.
   */
  function reset(uint256 _tokenId) external;

  /**
   * @notice Distributes rewards to eligible markets.
   */
  function distributeRewards() external;

  /**
   * @notice Claim bribes for a given NFT.
   * @dev Utility to help batch bribe claims.
   * @param _bribes Array of BribeVotingReward contracts to collect from.
   * @param _tokens Array of tokens that are used as bribes.
   * @param _tokenId ID of veNFT that you wish to claim bribes for.
   */
  function claimBribes(address[] memory _bribes, address[][] memory _tokens, uint256 _tokenId) external;

  /**
   * @notice Whitelist (or unwhitelist) token for use in bribes.
   * @dev Throws if not called by governor.
   * @param _token Address of the token.
   * @param _bool Boolean indicating whitelist status.
   */
  function whitelistToken(address _token, bool _bool) external;

  /**
   * @notice Whitelist (or unwhitelist) token id for voting in last hour prior to epoch flip.
   * @dev Throws if not called by governor.
   *      Throws if already whitelisted.
   * @param _tokenId ID of the token.
   * @param _bool Boolean indicating whitelist status.
   */
  function whitelistNFT(uint256 _tokenId, bool _bool) external;

  /**
   * @notice Set the LP tokens.
   * @param _lpTokens Array of LP token addresses.
   */
  function setLpTokens(address[] memory _lpTokens) external;

  /**
   * @notice Set the Master Price Oracle (MPO) address.
   * @param _mpo Address of the Master Price Oracle.
   */
  function setMpo(address _mpo) external;

  /**
   * @notice Set a new governor.
   * @param _governor Address of the new governor.
   */
  function setGovernor(address _governor) external;

  /**
   * @notice Add new markets.
   * @param _markets Array of Market structs to be added.
   */
  function addMarkets(Market[] calldata _markets) external;

  /**
   * @notice Set reward accumulators for markets.
   * @param _markets Array of market addresses.
   * @param _marketSides Array of market sides.
   * @param _rewardAccumulators Array of reward accumulator addresses.
   */
  function setMarketRewardAccumulators(
    address[] calldata _markets,
    MarketSide[] calldata _marketSides,
    address[] calldata _rewardAccumulators
  ) external;

  /**
   * @notice Set bribes for reward accumulators.
   * @param _rewardAccumulators Array of reward accumulator addresses.
   * @param _bribes Array of bribe addresses.
   */
  function setBribes(address[] calldata _rewardAccumulators, address[] calldata _bribes) external;

  /**
   * @notice Set the maximum number of votes.
   * @param _maxVotingNum Maximum number of votes allowed.
   */
  function setMaxVotingNum(uint256 _maxVotingNum) external;

  /**
   * @notice Toggle the alive status of a reward accumulator.
   * @param _market Address of the market.
   * @param _marketSide Side of the market.
   * @param _isAlive Boolean indicating if the reward accumulator is alive.
   */
  function toggleRewardAccumulatorAlive(address _market, MarketSide _marketSide, bool _isAlive) external;

  /**
   * @notice Get the start of the epoch for a given timestamp.
   * @param _timestamp The timestamp to calculate the epoch start for.
   * @return The start of the epoch.
   */
  function epochStart(uint256 _timestamp) external pure returns (uint256);

  /**
   * @notice Get the next epoch for a given timestamp.
   * @param _timestamp The timestamp to calculate the next epoch for.
   * @return The next epoch.
   */
  function epochNext(uint256 _timestamp) external pure returns (uint256);

  /**
   * @notice Get the start of the voting period for a given timestamp.
   * @param _timestamp The timestamp to calculate the voting start for.
   * @return The start of the voting period.
   */
  function epochVoteStart(uint256 _timestamp) external pure returns (uint256);

  /**
   * @notice Get the end of the voting period for a given timestamp.
   * @param _timestamp The timestamp to calculate the voting end for.
   * @return The end of the voting period.
   */
  function epochVoteEnd(uint256 _timestamp) external pure returns (uint256);

  /**
   * @notice Get the number of markets.
   * @return The number of markets.
   */
  function marketsLength() external view returns (uint256);

  /**
   * @notice Get all LP reward tokens.
   * @return An array of addresses representing all LP reward tokens.
   */
  function getAllLpRewardTokens() external view returns (address[] memory);

  /**
   * @notice Get vote details for a specific token ID and LP asset.
   * @param _tokenId The ID of the token.
   * @param _lpAsset The address of the LP asset.
   * @return A struct containing vote details.
   */
  function getVoteDetails(uint256 _tokenId, address _lpAsset) external view returns (VoteDetails memory);
}
