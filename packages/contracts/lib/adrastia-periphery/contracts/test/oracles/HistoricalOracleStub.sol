// SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import "@adrastia-oracle/adrastia-core/contracts/oracles/HistoricalOracle.sol";
import "@adrastia-oracle/adrastia-core/contracts/oracles/AbstractOracle.sol";

contract HistoricalOracleStub is AbstractOracle, HistoricalOracle {
    struct Config {
        uint8 liquidityDecimals;
    }

    Config public config;

    constructor(address quoteToken_) AbstractOracle(quoteToken_) HistoricalOracle(100) {}

    function stubPush(
        address token,
        uint112 price,
        uint112 tokenLiquidity,
        uint112 quoteTokenLiquidity,
        uint32 timestamp
    ) public {
        ObservationLibrary.Observation memory observation = ObservationLibrary.Observation({
            price: price,
            tokenLiquidity: tokenLiquidity,
            quoteTokenLiquidity: quoteTokenLiquidity,
            timestamp: timestamp
        });

        push(token, observation);
    }

    function stubPushNow(address token, uint112 price, uint112 tokenLiquidity, uint112 quoteTokenLiquidity) public {
        stubPush(token, price, tokenLiquidity, quoteTokenLiquidity, uint32(block.timestamp));
    }

    function stubSetLiquidityDecimals(uint8 liquidityDecimals_) public {
        config.liquidityDecimals = liquidityDecimals_;
    }

    /// @inheritdoc AbstractOracle
    function needsUpdate(bytes memory) public view virtual override returns (bool) {
        return false;
    }

    /// @inheritdoc AbstractOracle
    function canUpdate(bytes memory) public view virtual override returns (bool) {
        return false;
    }

    /// @inheritdoc AbstractOracle
    function update(bytes memory) public virtual override returns (bool) {
        return false;
    }

    function liquidityDecimals() public view virtual override returns (uint8) {
        return config.liquidityDecimals;
    }

    function getLatestObservation(
        address token
    ) public view virtual override returns (ObservationLibrary.Observation memory observation) {
        BufferMetadata storage meta = observationBufferMetadata[token];

        if (meta.size == 0) {
            // If the buffer is empty, return the default observation
            return ObservationLibrary.Observation({price: 0, tokenLiquidity: 0, quoteTokenLiquidity: 0, timestamp: 0});
        }

        return observationBuffers[token][meta.end];
    }

    function instantFetch(
        address token
    ) internal view virtual override returns (uint112 price, uint112 tokenLiquidity, uint112 quoteTokenLiquidity) {
        ObservationLibrary.Observation memory observation = getLatestObservation(token);

        price = observation.price;
        tokenLiquidity = observation.tokenLiquidity;
        quoteTokenLiquidity = observation.quoteTokenLiquidity;
    }
}
