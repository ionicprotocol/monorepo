// SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import "@adrastia-oracle/adrastia-core/contracts/interfaces/IHistoricalOracle.sol";
import "@adrastia-oracle/adrastia-core/contracts/interfaces/IOracle.sol";

import "./ManagedOracleBase.sol";
import "../configs/IOracleAggregatorTokenConfig.sol";

/// @title ManagedHistoricalAggregatorOracleBase
/// @notice A base contract for historical observation (single source) aggregators that are managed by access control.
abstract contract ManagedHistoricalAggregatorOracleBase is ManagedOracleBase {
    struct Config {
        IHistoricalOracle source; // 160 bits
        uint16 observationAmount; // 16 bits
        uint16 observationOffset; // 16 bits
        uint16 observationIncrement; // 16 bits
    }

    uint256 internal constant ERROR_INVALID_AMOUNT = 200;
    uint256 internal constant ERROR_INVALID_INCREMENT = 201;
    uint256 internal constant ERROR_INVALID_SOURCE = 202;
    uint256 internal constant ERROR_INVALID_SOURCE_DECIMAL_MISMATCH = 203;

    /// @notice Emitted when the configuration is updated.
    /// @param oldConfig The old configuration.
    /// @param newConfig The new configuration.
    event ConfigUpdated(Config oldConfig, Config newConfig);

    /// @notice An error thrown when attempting to set an invalid configuration.
    /// @param config The invalid configuration.
    /// @param errorCode The error code.
    error InvalidConfig(Config config, uint256 errorCode);

    /// @notice The current configuration for the source, observation amount, observation offset, and observation
    /// increment.
    Config internal config;

    /// @notice Constructs a new ManagedHistoricalAggregatorOracleBase.
    constructor(
        IHistoricalOracle source_,
        uint256 observationAmount_,
        uint256 observationOffset_,
        uint256 observationIncrement_
    ) ManagedOracleBase() {
        config.source = source_;
        config.observationAmount = uint16(observationAmount_);
        config.observationOffset = uint16(observationOffset_);
        config.observationIncrement = uint16(observationIncrement_);
    }

    /**
     * @notice Sets a new configuration that applies to all tokens.
     * @dev This configuration is for the update threshold, update delay, and heartbeat.
     * @param newConfig The new config.
     * @custom:throws InvalidConfig if the new configuration is invalid.
     */
    function setConfig(Config calldata newConfig) external onlyRole(Roles.CONFIG_ADMIN) {
        // Ensure that the observation amount is not zero
        if (newConfig.observationAmount == 0) revert InvalidConfig(newConfig, ERROR_INVALID_AMOUNT);
        // Ensure that the observation increment is not zero
        if (newConfig.observationIncrement == 0) revert InvalidConfig(newConfig, ERROR_INVALID_INCREMENT);
        // Ensure that the source is not the zero address
        if (address(newConfig.source) == address(0)) revert InvalidConfig(newConfig, ERROR_INVALID_SOURCE);
        // Ensure that the source decimals match the token decimals
        if (
            IOracle(address(newConfig.source)).quoteTokenDecimals() !=
            IOracle(address(config.source)).quoteTokenDecimals() ||
            IOracle(address(newConfig.source)).liquidityDecimals() !=
            IOracle(address(config.source)).liquidityDecimals()
        ) revert InvalidConfig(newConfig, ERROR_INVALID_SOURCE_DECIMAL_MISMATCH);

        Config memory oldConfig = config;
        config = newConfig;
        emit ConfigUpdated(oldConfig, newConfig);
    }
}
