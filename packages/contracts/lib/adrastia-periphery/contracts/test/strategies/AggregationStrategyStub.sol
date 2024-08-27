// SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import "@adrastia-oracle/adrastia-core/contracts/strategies/aggregation/IAggregationStrategy.sol";

contract AggregationStrategyStub is IAggregationStrategy {
    uint112 public price;
    uint112 public tokenLiquidity;
    uint112 public quoteTokenLiquidity;
    uint32 public timestamp;

    function aggregateObservations(
        address,
        ObservationLibrary.MetaObservation[] calldata,
        uint256,
        uint256
    ) external view returns (ObservationLibrary.Observation memory) {
        return ObservationLibrary.Observation(price, tokenLiquidity, quoteTokenLiquidity, timestamp);
    }

    function stubSetResult(
        uint112 price_,
        uint112 tokenLiquidity_,
        uint112 quoteTokenLiquidity_,
        uint32 timestamp_
    ) public {
        price = price_;
        tokenLiquidity = tokenLiquidity_;
        quoteTokenLiquidity = quoteTokenLiquidity_;
        timestamp = timestamp_;
    }
}
