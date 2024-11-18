// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IVoter {
  error AlreadyVotedOrDeposited();
  error DistributeWindow();
  error FactoryPathNotApproved();
  error GaugeAlreadyKilled();
  error GaugeAlreadyRevived();
  error GaugeExists();
  error RewardAccumulatorDoesNotExist(address _pool);
  error RewardAccumulatorNotAlive(address _rewardAccumulator);
  error InactiveManagedNFT();
  error MarketAlreadyExists();
  error MaximumVotingNumberTooLow();
  error MismatchedArrayLengths();
  error NonZeroVotes();
  error NotAllPools();
  error NotAPool();
  error NotApprovedOrOwner();
  error NotDistributeWindow();
  error NotGovernor();
  error NotMinter();
  error NotWhitelistedNFT();
  error NotWhitelistedToken();
  error SameValue();
  error SpecialVotingWindow();
  error TooManyPools();
  error UnequalLengths();
  error ZeroBalance();
  error ZeroAddress();
  error TokensArrayEmpty();

  struct Market {
    address marketAddress;
    MarketSide side;
  }

  struct VoteVars {
    uint256 totalWeight;
    uint256 usedWeight;
    address market;
    MarketSide marketSide;
    address rewardAccumulator;
    uint256 marketWeight;
    address bribes;
  }

  struct VoteLocalVars {
    address sender;
    uint256 timestamp;
    address[] votingLPs;
    uint256[] votingLPBalances;
    uint256[] boosts;
  }

  enum MarketSide {
    Supply,
    Borrow
  }

  event Voted(
    address indexed voter,
    address indexed pool,
    uint256 indexed tokenId,
    uint256 weight,
    uint256 totalWeight,
    uint256 timestamp
  );
  event Abstained(
    address indexed voter,
    address indexed pool,
    uint256 indexed tokenId,
    uint256 weight,
    uint256 totalWeight,
    uint256 timestamp
  );
  event NotifyReward(address indexed sender, address indexed reward, uint256 amount);
  event WhitelistToken(address indexed whitelister, address indexed token, bool indexed _bool);
  event WhitelistNFT(address indexed whitelister, uint256 indexed tokenId, bool indexed _bool);

  // mappings
  function weights(address market, MarketSide marketSide, address lpToken) external view returns (uint256);

  function votes(
    uint256 tokenId,
    address market,
    MarketSide marketSide,
    address lpToken
  ) external view returns (uint256);

  function usedWeights(uint256 tokenId, address lpToken) external view returns (uint256);

  function lastVoted(uint256 tokenId) external view returns (uint256);

  function isGauge(address gauge) external view returns (bool);

  function isWhitelistedToken(address token) external view returns (bool);

  function isWhitelistedNFT(uint256 tokenId) external view returns (bool);

  function ve() external view returns (address);

  function governor() external view returns (address);

  function epochGovernor() external view returns (address);

  function marketsLength() external view returns (uint256);

  /// @notice Called by users to update voting balances in voting rewards contracts.
  /// @param _tokenId Id of veNFT whose balance you wish to update.
  function poke(uint256 _tokenId) external;

  /// @notice Called by users to vote for pools. Votes distributed proportionally based on weights.
  ///         Can only vote or deposit into a managed NFT once per epoch.
  ///         Can only vote for gauges that have not been killed.
  /// @dev Weights are distributed proportional to the sum of the weights in the array.
  ///      Throws if length of _poolVote and _weights do not match.
  /// @param _tokenId           Id of veNFT you are voting with.
  /// @param _poolVote          Array of pools you are voting for.
  /// @param _marketVoteSide    Array of market vote sides you are voting for.
  /// @param _weights           Weights of pools.
  function vote(
    uint256 _tokenId,
    address[] calldata _poolVote,
    MarketSide[] calldata _marketVoteSide,
    uint256[] calldata _weights
  ) external;

  /// @notice Called by users to reset voting state. Required if you wish to make changes to
  ///         veNFT state (e.g. merge, split, deposit into managed etc).
  ///         Cannot reset in the same epoch that you voted in.
  ///         Can vote or deposit into a managed NFT again after reset.
  /// @param _tokenId Id of veNFT you are reseting.
  function reset(uint256 _tokenId) external;

  /// @notice Claim bribes for a given NFT.
  /// @dev Utility to help batch bribe claims.
  /// @param _bribes  Array of BribeVotingReward contracts to collect from.
  /// @param _tokens  Array of tokens that are used as bribes.
  /// @param _tokenId Id of veNFT that you wish to claim bribes for.
  function claimBribes(address[] memory _bribes, address[][] memory _tokens, uint256 _tokenId) external;

  /// @notice Set new governor.
  /// @dev Throws if not called by governor.
  /// @param _governor .
  function setGovernor(address _governor) external;

  /// @notice Set new epoch based governor.
  /// @dev Throws if not called by governor.
  /// @param _epochGovernor .
  function setEpochGovernor(address _epochGovernor) external;

  /// @notice Whitelist (or unwhitelist) token for use in bribes.
  /// @dev Throws if not called by governor.
  /// @param _token .
  /// @param _bool .
  function whitelistToken(address _token, bool _bool) external;

  /// @notice Whitelist (or unwhitelist) token id for voting in last hour prior to epoch flip.
  /// @dev Throws if not called by governor.
  ///      Throws if already whitelisted.
  /// @param _tokenId .
  /// @param _bool .
  function whitelistNFT(uint256 _tokenId, bool _bool) external;

  function getAllLpRewardTokens() external view returns (address[] memory);
}
