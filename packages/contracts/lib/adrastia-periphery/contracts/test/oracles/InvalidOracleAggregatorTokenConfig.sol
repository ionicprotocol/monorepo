// SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import "../../oracles/configs/OracleAggregatorTokenConfig.sol";

contract InvalidOracleAggregatorTokenConfig is OracleAggregatorTokenConfig {
    constructor(
        IAggregationStrategy aggregationStrategy_,
        IValidationStrategy validationStrategy_,
        uint256 minimumResponses_,
        address[] memory oracles_
    ) OracleAggregatorTokenConfig(aggregationStrategy_, validationStrategy_, minimumResponses_, oracles_) {}

    function oracles() external pure override returns (IOracleAggregator.Oracle[] memory) {
        IOracleAggregator.Oracle[] memory result = new IOracleAggregator.Oracle[](1);

        return result;
    }
}
