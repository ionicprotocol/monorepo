// SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import "@adrastia-oracle/adrastia-core/contracts/oracles/AbstractOracle.sol";

contract MockOracle is AbstractOracle {
    uint8 internal immutable _liquidityDecimals;

    mapping(address => ObservationLibrary.Observation) internal observations;

    mapping(address => ObservationLibrary.Observation) internal instantRates;

    constructor(address quoteToken_, uint8 liquidityDecimals_) AbstractOracle(quoteToken_) {
        _liquidityDecimals = liquidityDecimals_;
    }

    function getLatestObservation(
        address token
    ) public view virtual override returns (ObservationLibrary.Observation memory observation) {
        return observations[token];
    }

    function stubSetObservation(
        address token,
        uint112 price,
        uint112 tokenLiquidity,
        uint112 quoteTokenLiquidity,
        uint32 timestamp
    ) public {
        ObservationLibrary.Observation storage observation = observations[token];

        observation.price = price;
        observation.tokenLiquidity = tokenLiquidity;
        observation.quoteTokenLiquidity = quoteTokenLiquidity;
        observation.timestamp = timestamp;
    }

    function stubSetInstantRates(
        address token,
        uint112 price,
        uint112 tokenLiquidity,
        uint112 quoteTokenLiquidity
    ) public {
        ObservationLibrary.Observation storage observation = instantRates[token];

        observation.price = price;
        observation.tokenLiquidity = tokenLiquidity;
        observation.quoteTokenLiquidity = quoteTokenLiquidity;
    }

    function liquidityDecimals() public view virtual override returns (uint8) {
        return _liquidityDecimals;
    }

    function update(bytes memory /*data*/) public virtual override returns (bool) {
        return false;
    }

    function needsUpdate(bytes memory /*data*/) public view virtual override returns (bool) {
        return false;
    }

    function canUpdate(bytes memory /*data*/) public view virtual override returns (bool) {
        return false;
    }

    function instantFetch(
        address token
    ) internal view virtual override returns (uint112 price, uint112 tokenLiquidity, uint112 quoteTokenLiquidity) {
        ObservationLibrary.Observation storage observation = instantRates[token];

        price = observation.price;
        tokenLiquidity = observation.tokenLiquidity;
        quoteTokenLiquidity = observation.quoteTokenLiquidity;
    }
}
