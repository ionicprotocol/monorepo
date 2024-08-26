// SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import "../../oracles/configs/OracleAggregatorTokenConfig.sol";

contract NoCheckOracleAggregatorTokenConfig is OracleAggregatorTokenConfig {
    constructor(
        IAggregationStrategy aggregationStrategy_,
        IValidationStrategy validationStrategy_,
        uint256 minimumResponses_,
        address[] memory oracles_
    ) OracleAggregatorTokenConfig(aggregationStrategy_, validationStrategy_, minimumResponses_, oracles_) {}

    function validateConstructorArgs(
        IAggregationStrategy aggregationStrategy_,
        IValidationStrategy,
        uint256 minimumResponses_,
        address[] memory oracles_
    ) internal view virtual override {}
}
