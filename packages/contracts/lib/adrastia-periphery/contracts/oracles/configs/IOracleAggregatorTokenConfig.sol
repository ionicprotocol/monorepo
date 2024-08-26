// SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import "@adrastia-oracle/adrastia-core/contracts/oracles/IOracleAggregator.sol";

interface IOracleAggregatorTokenConfig {
    function aggregationStrategy() external view returns (IAggregationStrategy);

    function validationStrategy() external view returns (IValidationStrategy);

    function minimumResponses() external view returns (uint256);

    function oracles() external view returns (IOracleAggregator.Oracle[] memory);
}
