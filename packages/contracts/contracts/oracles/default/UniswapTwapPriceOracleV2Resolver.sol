// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { IResolver } from "ops/interfaces/IResolver.sol";
import { UniswapTwapPriceOracleV2Root } from "./UniswapTwapPriceOracleV2Root.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract UniswapTwapPriceOracleV2Resolver is IResolver, Ownable {
  struct PairConfig {
    address pair;
    address baseToken;
    uint256 minPeriod;
    uint256 deviationThreshold;
  }

  // need to store as arrays for the UniswapTwapPriceOracleV2Root workable functions
  address[] pairs;
  address[] baseTokens;
  uint256[] minPeriods;
  uint256[] deviationThresholds;

  UniswapTwapPriceOracleV2Root public root;
  uint256 public lastUpdate;

  constructor(PairConfig[] memory _pairConfigs, UniswapTwapPriceOracleV2Root _root) {
    for (uint256 i = 0; i < _pairConfigs.length; i++) {
      pairs[i] = _pairConfigs[i].pair;
      baseTokens[i] = _pairConfigs[i].baseToken;
      minPeriods[i] = _pairConfigs[i].minPeriod;
      deviationThresholds[i] = _pairConfigs[i].deviationThreshold;
    }
    root = _root;
  }

  function getPairs() external view returns (PairConfig[] memory) {
    PairConfig[] memory pairConfigs = new PairConfig[](pairs.length);
    for (uint256 i = 0; i < pairs.length; i++) {
      PairConfig memory pairConfig = PairConfig({
        pair: pairs[i],
        baseToken: baseTokens[i],
        minPeriod: minPeriods[i],
        deviationThreshold: deviationThresholds[i]
      });
      pairConfigs[i] = pairConfig;
    }
    return pairConfigs;
  }

  function changeRoot(UniswapTwapPriceOracleV2Root _root) external onlyOwner {
    root = _root;
  }

  function removeFromPairs(uint256 index) external onlyOwner {
    if (index >= pairs.length) return;

    for (uint256 i = index; i < pairs.length - 1; i++) {
      pairs[i] = pairs[i + 1];
      baseTokens[i] = baseTokens[i + 1];
      minPeriods[i] = minPeriods[i + 1];
      deviationThresholds[i] = deviationThresholds[i + 1];
    }
    pairs.pop();
    baseTokens.pop();
    minPeriods.pop();
    deviationThresholds.pop();
  }

  function addPair(PairConfig calldata pair) external onlyOwner {
    pairs.push(pair.pair);
    baseTokens.push(pair.baseToken);
    minPeriods.push(pair.minPeriod);
    deviationThresholds.push(pair.deviationThreshold);
  }

  function getWorkablePairs() public view returns (address[] memory) {
    bool[] memory workable = root.workable(pairs, baseTokens, minPeriods, deviationThresholds);
    uint256 workableCount = 0;
    for (uint256 i = 0; i < workable.length; i += 1) {
      if (workable[i]) {
        workableCount += 1;
      }
    }

    address[] memory workablePairs = new address[](workableCount);
    uint256 j = 0;

    for (uint256 i = 0; i < workable.length; i++) {
      if (workable[i]) {
        workablePairs[j++] = pairs[i];
      }
    }
    return workablePairs;
  }

  function updatePairs(address[] calldata workablePairs) external {
    if (workablePairs.length == 0) return;
    root.update(workablePairs);
  }

  function checker() external view override returns (bool canExec, bytes memory execPayload) {
    address[] memory workablePairs = getWorkablePairs();
    if (workablePairs.length == 0) {
      return (false, bytes("No workable pairs"));
    }

    canExec = true;
    execPayload = abi.encodeWithSelector(this.updatePairs.selector, workablePairs);
  }
}
