// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";

import "../../external/uniswap/IUniswapV2Pair.sol";
import "../../external/uniswap/IUniswapV2Factory.sol";

/**
 * @title UniswapTwapPriceOracleV2Root
 * @notice Stores cumulative prices and returns TWAPs for assets on Uniswap V2 pairs.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract UniswapTwapPriceOracleV2Root {
  /**
   * @dev wtoken token contract address.
   */
  address public immutable wtoken;

  /**
   * @dev Minimum TWAP interval.
   */
  uint256 public constant MIN_TWAP_TIME = 15 minutes;

  /**
   * @dev Constructor to set wtoken address
   */
  constructor(address _wtoken) {
    wtoken = _wtoken;
  }

  /**
   * @dev Return the TWAP value price0. Revert if TWAP time range is not within the threshold.
   * Copied from: https://github.com/AlphaFinanceLab/homora-v2/blob/master/contracts/oracle/BaseKP3ROracle.sol
   * @param pair The pair to query for price0.
   */
  function price0TWAP(address pair) internal view returns (uint256) {
    uint256 length = observationCount[pair];
    require(length > 0, "No length-1 TWAP observation.");
    Observation memory lastObservation = observations[pair][(length - 1) % OBSERVATION_BUFFER];
    if (lastObservation.timestamp > block.timestamp - MIN_TWAP_TIME) {
      require(length > 1, "No length-2 TWAP observation.");
      lastObservation = observations[pair][(length - 2) % OBSERVATION_BUFFER];
    }
    uint256 elapsedTime = block.timestamp - lastObservation.timestamp;
    require(elapsedTime >= MIN_TWAP_TIME, "Bad TWAP time.");
    uint256 currPx0Cumu = currentPx0Cumu(pair);
    unchecked {
      return (currPx0Cumu - lastObservation.price0Cumulative) / (block.timestamp - lastObservation.timestamp); // overflow is desired
    }
  }

  /**
   * @dev Return the TWAP value price1. Revert if TWAP time range is not within the threshold.
   * Copied from: https://github.com/AlphaFinanceLab/homora-v2/blob/master/contracts/oracle/BaseKP3ROracle.sol
   * @param pair The pair to query for price1.
   */
  function price1TWAP(address pair) internal view returns (uint256) {
    uint256 length = observationCount[pair];
    require(length > 0, "No length-1 TWAP observation.");
    Observation memory lastObservation = observations[pair][(length - 1) % OBSERVATION_BUFFER];
    if (lastObservation.timestamp > block.timestamp - MIN_TWAP_TIME) {
      require(length > 1, "No length-2 TWAP observation.");
      lastObservation = observations[pair][(length - 2) % OBSERVATION_BUFFER];
    }
    uint256 elapsedTime = block.timestamp - lastObservation.timestamp;
    require(elapsedTime >= MIN_TWAP_TIME, "Bad TWAP time.");
    uint256 currPx1Cumu = currentPx1Cumu(pair);
    unchecked {
      return (currPx1Cumu - lastObservation.price1Cumulative) / (block.timestamp - lastObservation.timestamp); // overflow is desired
    }
  }

  /**
   * @dev Return the current price0 cumulative value on Uniswap.
   * Copied from: https://github.com/AlphaFinanceLab/homora-v2/blob/master/contracts/oracle/BaseKP3ROracle.sol
   * @param pair The uniswap pair to query for price0 cumulative value.
   */
  function currentPx0Cumu(address pair) internal view returns (uint256 px0Cumu) {
    uint32 currTime = uint32(block.timestamp);
    px0Cumu = IUniswapV2Pair(pair).price0CumulativeLast();
    (uint256 reserve0, uint256 reserve1, uint32 lastTime) = IUniswapV2Pair(pair).getReserves();
    if (lastTime != block.timestamp) {
      unchecked {
        uint32 timeElapsed = currTime - lastTime; // overflow is desired
        px0Cumu += uint256((reserve1 << 112) / reserve0) * timeElapsed; // overflow is desired
      }
    }
  }

  /**
   * @dev Return the current price1 cumulative value on Uniswap.
   * Copied from: https://github.com/AlphaFinanceLab/homora-v2/blob/master/contracts/oracle/BaseKP3ROracle.sol
   * @param pair The uniswap pair to query for price1 cumulative value.
   */
  function currentPx1Cumu(address pair) internal view returns (uint256 px1Cumu) {
    uint32 currTime = uint32(block.timestamp);
    px1Cumu = IUniswapV2Pair(pair).price1CumulativeLast();
    (uint256 reserve0, uint256 reserve1, uint32 lastTime) = IUniswapV2Pair(pair).getReserves();
    if (lastTime != currTime) {
      unchecked {
        uint32 timeElapsed = currTime - lastTime; // overflow is desired
        px1Cumu += uint256((reserve0 << 112) / reserve1) * timeElapsed; // overflow is desired
      }
    }
  }

  /**
   * @dev Returns the price of `underlying` in terms of `baseToken` given `factory`.
   */
  function price(
    address underlying,
    address baseToken,
    address factory
  ) external view returns (uint256) {
    // Return ERC20/ETH TWAP
    address pair = IUniswapV2Factory(factory).getPair(underlying, baseToken);
    uint256 baseUnit = 10**uint256(ERC20Upgradeable(underlying).decimals());
    return (((underlying < baseToken ? price0TWAP(pair) : price1TWAP(pair)) / (2**56)) * baseUnit) / (2**56); // Scaled by 1e18, not 2 ** 112
  }

  /**
   * @dev Struct for cumulative price observations.
   */
  struct Observation {
    uint32 timestamp;
    uint256 price0Cumulative;
    uint256 price1Cumulative;
  }

  /**
   * @dev Length after which observations roll over to index 0.
   */
  uint8 public constant OBSERVATION_BUFFER = 4;

  /**
   * @dev Total observation count for each pair.
   */
  mapping(address => uint256) public observationCount;

  /**
   * @dev Array of cumulative price observations for each pair.
   */
  mapping(address => Observation[OBSERVATION_BUFFER]) public observations;

  /// @notice Get pairs for token combinations.
  function pairsFor(
    address[] calldata tokenA,
    address[] calldata tokenB,
    address factory
  ) external view returns (address[] memory) {
    require(
      tokenA.length > 0 && tokenA.length == tokenB.length,
      "Token array lengths must be equal and greater than 0."
    );
    address[] memory pairs = new address[](tokenA.length);
    for (uint256 i = 0; i < tokenA.length; i++) pairs[i] = IUniswapV2Factory(factory).getPair(tokenA[i], tokenB[i]);
    return pairs;
  }

  /// @notice Check which of multiple pairs are workable/updatable.
  function workable(
    address[] calldata pairs,
    address[] calldata baseTokens,
    uint256[] calldata minPeriods,
    uint256[] calldata deviationThresholds
  ) external view returns (bool[] memory) {
    require(
      pairs.length > 0 &&
        pairs.length == baseTokens.length &&
        pairs.length == minPeriods.length &&
        pairs.length == deviationThresholds.length,
      "Array lengths must be equal and greater than 0."
    );
    bool[] memory answers = new bool[](pairs.length);
    for (uint256 i = 0; i < pairs.length; i++)
      answers[i] = _workable(pairs[i], baseTokens[i], minPeriods[i], deviationThresholds[i]);
    return answers;
  }

  /// @dev Internal function to check if a pair is workable (updateable AND reserves have changed AND deviation threshold is satisfied).
  function _workable(
    address pair,
    address baseToken,
    uint256 minPeriod,
    uint256 deviationThreshold
  ) internal view returns (bool) {
    // Workable if:
    // 1) We have no observations
    // 2) The elapsed time since the last observation is > minPeriod AND reserves have changed AND deviation threshold is satisfied
    // Note that we loop observationCount[pair] around OBSERVATION_BUFFER so we don't waste gas on new storage slots
    if (observationCount[pair] <= 0) return true;
    (, , uint32 lastTime) = IUniswapV2Pair(pair).getReserves();
    return
      (block.timestamp - observations[pair][(observationCount[pair] - 1) % OBSERVATION_BUFFER].timestamp) >
      (minPeriod >= MIN_TWAP_TIME ? minPeriod : MIN_TWAP_TIME) &&
      lastTime != observations[pair][(observationCount[pair] - 1) % OBSERVATION_BUFFER].timestamp &&
      _deviation(pair, baseToken) >= deviationThreshold;
  }

  /// @dev Internal function to check if a pair's spot price's deviation from its TWAP price as a ratio scaled by 1e18
  function _deviation(address pair, address baseToken) internal view returns (uint256) {
    // Get token base unit
    address token0 = IUniswapV2Pair(pair).token0();
    bool useToken0Price = token0 != baseToken;
    address underlying = useToken0Price ? token0 : IUniswapV2Pair(pair).token1();
    uint256 baseUnit = 10**uint256(ERC20Upgradeable(underlying).decimals());

    // Get TWAP price
    uint256 twapPrice = (((useToken0Price ? price0TWAP(pair) : price1TWAP(pair)) / (2**56)) * baseUnit) / (2**56); // Scaled by 1e18, not 2 ** 112

    // Get spot price
    (uint256 reserve0, uint256 reserve1, ) = IUniswapV2Pair(pair).getReserves();
    uint256 spotPrice = useToken0Price ? (reserve1 * baseUnit) / reserve0 : (reserve0 * baseUnit) / reserve1;

    // Get ratio and return deviation
    uint256 ratio = (spotPrice * 1e18) / twapPrice;
    return ratio >= 1e18 ? ratio - 1e18 : 1e18 - ratio;
  }

  /// @dev Internal function to check if a pair is updatable at all.
  function _updateable(address pair) internal view returns (bool) {
    // Updateable if:
    // 1) We have no observations
    // 2) The elapsed time since the last observation is > MIN_TWAP_TIME
    // Note that we loop observationCount[pair] around OBSERVATION_BUFFER so we don't waste gas on new storage slots
    return
      observationCount[pair] <= 0 ||
      (block.timestamp - observations[pair][(observationCount[pair] - 1) % OBSERVATION_BUFFER].timestamp) >
      MIN_TWAP_TIME;
  }

  /// @notice Update one pair.
  function update(address pair) external {
    require(_update(pair), "Failed to update pair.");
  }

  /// @notice Update multiple pairs at once.
  function update(address[] calldata pairs) external {
    bool worked = false;
    for (uint256 i = 0; i < pairs.length; i++) if (_update(pairs[i])) worked = true;
    require(worked, "No pairs can be updated (yet).");
  }

  /// @dev Internal function to update a single pair.
  function _update(address pair) internal returns (bool) {
    // Check if workable
    if (!_updateable(pair)) return false;

    // Get cumulative price(s)
    uint256 price0Cumulative = IUniswapV2Pair(pair).price0CumulativeLast();
    uint256 price1Cumulative = IUniswapV2Pair(pair).price1CumulativeLast();

    // Loop observationCount[pair] around OBSERVATION_BUFFER so we don't waste gas on new storage slots
    (, , uint32 lastTime) = IUniswapV2Pair(pair).getReserves();
    observations[pair][observationCount[pair] % OBSERVATION_BUFFER] = Observation(
      lastTime,
      price0Cumulative,
      price1Cumulative
    );
    observationCount[pair]++;
    return true;
  }
}
