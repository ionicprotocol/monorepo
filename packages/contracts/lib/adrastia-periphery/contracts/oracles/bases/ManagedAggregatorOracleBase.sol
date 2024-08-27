// SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import "./ManagedOracleBase.sol";
import "../configs/IOracleAggregatorTokenConfig.sol";

/// @title ManagedAggregatorOracleBase
/// @notice A base contract for aggregators that are managed by access control with support for token-specific
/// configurations.
abstract contract ManagedAggregatorOracleBase is ManagedOracleBase {
    uint256 internal constant ERROR_MISSING_ORACLES = 1;
    uint256 internal constant ERROR_INVALID_MINIMUM_RESPONSES = 2;
    uint256 internal constant ERROR_INVALID_AGGREGATION_STRATEGY = 3;
    uint256 internal constant ERROR_DUPLICATE_ORACLES = 4;
    uint256 internal constant ERROR_QUOTE_TOKEN_DECIMALS_MISMATCH = 5;
    uint256 internal constant ERROR_MINIMUM_RESPONSES_TOO_LARGE = 6;
    uint256 internal constant ERROR_INVALID_ORACLE = 7;

    /// @notice A mapping of token addresses to their configurations.
    mapping(address => IOracleAggregatorTokenConfig) internal tokenConfigs;

    /// @notice Emitted when a token's configuration is updated.
    /// @param token The token whose configuration was updated.
    /// @param oldConfig The old configuration address.
    /// @param newConfig The new configuration address.
    event TokenConfigUpdated(
        address indexed token,
        IOracleAggregatorTokenConfig oldConfig,
        IOracleAggregatorTokenConfig newConfig
    );

    error InvalidTokenConfig(IOracleAggregatorTokenConfig config, uint256 errorCode);

    /// @notice Constructs a new ManagedAggregatorOracleBase.
    constructor() ManagedOracleBase() {}

    /**
     * @notice Sets a new configuration for a specific token.
     * @dev This configuration is for the strategies, minimum responses, and underlying oracles.
     * @param token The token to set the configuration for.
     * @param newConfig The new token configuration.
     */
    function setTokenConfig(
        address token,
        IOracleAggregatorTokenConfig newConfig
    ) external onlyRole(Roles.CONFIG_ADMIN) {
        if (address(newConfig) != address(0)) {
            IOracleAggregator.Oracle[] memory oracles = newConfig.oracles();

            // Validate that newConfig.oracles().length > 0
            if (oracles.length == 0) revert InvalidTokenConfig(newConfig, ERROR_MISSING_ORACLES);

            // Validate that newConfig.minimumResponses() > 0
            uint256 minResponses = newConfig.minimumResponses();
            if (minResponses == 0) revert InvalidTokenConfig(newConfig, ERROR_INVALID_MINIMUM_RESPONSES);
            if (minResponses > newConfig.oracles().length)
                revert InvalidTokenConfig(newConfig, ERROR_MINIMUM_RESPONSES_TOO_LARGE);

            // Validate that newConfig.aggregationStrategy() != address(0)
            if (address(newConfig.aggregationStrategy()) == address(0))
                revert InvalidTokenConfig(newConfig, ERROR_INVALID_AGGREGATION_STRATEGY);

            // Validate that there are no duplicate oracles and that no oracle is the zero address
            for (uint256 i = 0; i < oracles.length; ++i) {
                if (address(oracles[i].oracle) == address(0))
                    revert InvalidTokenConfig(newConfig, ERROR_INVALID_ORACLE);

                for (uint256 j = i + 1; j < oracles.length; ++j) {
                    if (address(oracles[i].oracle) == address(oracles[j].oracle))
                        revert InvalidTokenConfig(newConfig, ERROR_DUPLICATE_ORACLES);
                }
            }

            // Validate that the validation strategy's quote token decimals match our quote token decimals
            // (if the validation strategy is set)
            IValidationStrategy validationStrategy = newConfig.validationStrategy();
            if (address(validationStrategy) != address(0)) {
                if (validationStrategy.quoteTokenDecimals() != quoteTokenDecimals())
                    revert InvalidTokenConfig(newConfig, ERROR_QUOTE_TOKEN_DECIMALS_MISMATCH);
            }
        }

        IOracleAggregatorTokenConfig oldConfig = tokenConfigs[token];
        tokenConfigs[token] = newConfig;
        emit TokenConfigUpdated(token, oldConfig, newConfig);
    }

    function quoteTokenDecimals() public view virtual returns (uint8);
}
