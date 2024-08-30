// SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import "@adrastia-oracle/adrastia-core/contracts/interfaces/IOracle.sol";

import "./IOracleAggregatorTokenConfig.sol";

contract OracleAggregatorTokenConfig is IOracleAggregatorTokenConfig {
    uint256 public constant MAX_ORACLES = 8;

    IAggregationStrategy public immutable override aggregationStrategy;

    IValidationStrategy public immutable override validationStrategy;

    uint256 public immutable override minimumResponses;

    uint256 internal immutable oraclesCount;

    address internal immutable oracle0Address;
    uint8 internal immutable oracle0PriceDecimals;
    uint8 internal immutable oracle0LiquidityDecimals;

    address internal immutable oracle1Address;
    uint8 internal immutable oracle1PriceDecimals;
    uint8 internal immutable oracle1LiquidityDecimals;

    address internal immutable oracle2Address;
    uint8 internal immutable oracle2PriceDecimals;
    uint8 internal immutable oracle2LiquidityDecimals;

    address internal immutable oracle3Address;
    uint8 internal immutable oracle3PriceDecimals;
    uint8 internal immutable oracle3LiquidityDecimals;

    address internal immutable oracle4Address;
    uint8 internal immutable oracle4PriceDecimals;
    uint8 internal immutable oracle4LiquidityDecimals;

    address internal immutable oracle5Address;
    uint8 internal immutable oracle5PriceDecimals;
    uint8 internal immutable oracle5LiquidityDecimals;

    address internal immutable oracle6Address;
    uint8 internal immutable oracle6PriceDecimals;
    uint8 internal immutable oracle6LiquidityDecimals;

    address internal immutable oracle7Address;
    uint8 internal immutable oracle7PriceDecimals;
    uint8 internal immutable oracle7LiquidityDecimals;

    uint256 internal constant ERROR_MISSING_ORACLES = 1;
    uint256 internal constant ERROR_MINIMUM_RESPONSES_TOO_SMALL = 2;
    uint256 internal constant ERROR_INVALID_AGGREGATION_STRATEGY = 3;
    uint256 internal constant ERROR_DUPLICATE_ORACLES = 4;
    uint256 internal constant ERROR_MINIMUM_RESPONSES_TOO_LARGE = 6;
    uint256 internal constant ERROR_INVALID_ORACLE = 7;
    uint256 internal constant ERROR_TOO_MANY_ORACLES = 8;

    error InvalidConfig(uint256 errorCode);

    constructor(
        IAggregationStrategy aggregationStrategy_,
        IValidationStrategy validationStrategy_,
        uint256 minimumResponses_,
        address[] memory oracles_
    ) {
        validateConstructorArgs(aggregationStrategy_, validationStrategy_, minimumResponses_, oracles_);

        aggregationStrategy = aggregationStrategy_;
        validationStrategy = validationStrategy_;
        minimumResponses = minimumResponses_;

        oraclesCount = oracles_.length;

        IOracleAggregator.Oracle[] memory oraclesCpy = new IOracleAggregator.Oracle[](MAX_ORACLES);

        for (uint256 i = 0; i < oracles_.length; ++i) {
            oraclesCpy[i] = IOracleAggregator.Oracle({
                oracle: oracles_[i],
                priceDecimals: IOracle(oracles_[i]).quoteTokenDecimals(),
                liquidityDecimals: IOracle(oracles_[i]).liquidityDecimals()
            });
        }

        oracle0Address = oraclesCpy[0].oracle;
        oracle0PriceDecimals = oraclesCpy[0].priceDecimals;
        oracle0LiquidityDecimals = oraclesCpy[0].liquidityDecimals;

        oracle1Address = oraclesCpy[1].oracle;
        oracle1PriceDecimals = oraclesCpy[1].priceDecimals;
        oracle1LiquidityDecimals = oraclesCpy[1].liquidityDecimals;

        oracle2Address = oraclesCpy[2].oracle;
        oracle2PriceDecimals = oraclesCpy[2].priceDecimals;
        oracle2LiquidityDecimals = oraclesCpy[2].liquidityDecimals;

        oracle3Address = oraclesCpy[3].oracle;
        oracle3PriceDecimals = oraclesCpy[3].priceDecimals;
        oracle3LiquidityDecimals = oraclesCpy[3].liquidityDecimals;

        oracle4Address = oraclesCpy[4].oracle;
        oracle4PriceDecimals = oraclesCpy[4].priceDecimals;
        oracle4LiquidityDecimals = oraclesCpy[4].liquidityDecimals;

        oracle5Address = oraclesCpy[5].oracle;
        oracle5PriceDecimals = oraclesCpy[5].priceDecimals;
        oracle5LiquidityDecimals = oraclesCpy[5].liquidityDecimals;

        oracle6Address = oraclesCpy[6].oracle;
        oracle6PriceDecimals = oraclesCpy[6].priceDecimals;
        oracle6LiquidityDecimals = oraclesCpy[6].liquidityDecimals;

        oracle7Address = oraclesCpy[7].oracle;
        oracle7PriceDecimals = oraclesCpy[7].priceDecimals;
        oracle7LiquidityDecimals = oraclesCpy[7].liquidityDecimals;
    }

    function oracles() external view virtual override returns (IOracleAggregator.Oracle[] memory) {
        uint256 count = oraclesCount;

        IOracleAggregator.Oracle[] memory result = new IOracleAggregator.Oracle[](count);

        if (count > 0) {
            result[0] = IOracleAggregator.Oracle({
                oracle: oracle0Address,
                priceDecimals: oracle0PriceDecimals,
                liquidityDecimals: oracle0LiquidityDecimals
            });
        }
        if (count > 1) {
            result[1] = IOracleAggregator.Oracle({
                oracle: oracle1Address,
                priceDecimals: oracle1PriceDecimals,
                liquidityDecimals: oracle1LiquidityDecimals
            });
        }
        if (count > 2) {
            result[2] = IOracleAggregator.Oracle({
                oracle: oracle2Address,
                priceDecimals: oracle2PriceDecimals,
                liquidityDecimals: oracle2LiquidityDecimals
            });
        }
        if (count > 3) {
            result[3] = IOracleAggregator.Oracle({
                oracle: oracle3Address,
                priceDecimals: oracle3PriceDecimals,
                liquidityDecimals: oracle3LiquidityDecimals
            });
        }
        if (count > 4) {
            result[4] = IOracleAggregator.Oracle({
                oracle: oracle4Address,
                priceDecimals: oracle4PriceDecimals,
                liquidityDecimals: oracle4LiquidityDecimals
            });
        }
        if (count > 5) {
            result[5] = IOracleAggregator.Oracle({
                oracle: oracle5Address,
                priceDecimals: oracle5PriceDecimals,
                liquidityDecimals: oracle5LiquidityDecimals
            });
        }
        if (count > 6) {
            result[6] = IOracleAggregator.Oracle({
                oracle: oracle6Address,
                priceDecimals: oracle6PriceDecimals,
                liquidityDecimals: oracle6LiquidityDecimals
            });
        }
        if (count > 7) {
            result[7] = IOracleAggregator.Oracle({
                oracle: oracle7Address,
                priceDecimals: oracle7PriceDecimals,
                liquidityDecimals: oracle7LiquidityDecimals
            });
        }

        return result;
    }

    function validateConstructorArgs(
        IAggregationStrategy aggregationStrategy_,
        IValidationStrategy,
        uint256 minimumResponses_,
        address[] memory oracles_
    ) internal view virtual {
        if (oracles_.length == 0) revert InvalidConfig(ERROR_MISSING_ORACLES);
        if (oracles_.length > MAX_ORACLES) revert InvalidConfig(ERROR_TOO_MANY_ORACLES);
        if (minimumResponses_ == 0) revert InvalidConfig(ERROR_MINIMUM_RESPONSES_TOO_SMALL);
        if (minimumResponses_ > oracles_.length) revert InvalidConfig(ERROR_MINIMUM_RESPONSES_TOO_LARGE);
        if (address(aggregationStrategy_) == address(0)) revert InvalidConfig(ERROR_INVALID_AGGREGATION_STRATEGY);

        // Validate that there are no duplicate oracles and that no oracle is the zero address.
        for (uint256 i = 0; i < oracles_.length; ++i) {
            if (oracles_[i] == address(0)) revert InvalidConfig(ERROR_INVALID_ORACLE);

            for (uint256 j = i + 1; j < oracles_.length; ++j) {
                if (oracles_[i] == oracles_[j]) revert InvalidConfig(ERROR_DUPLICATE_ORACLES);
            }
        }
    }
}
