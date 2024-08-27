// SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import "./ManagedAggregatorOracleBase.sol";

/// @title ManagedCurrentAggregatorOracleBase
/// @notice A base contract for aggregators that are managed by access control with support for token-specific
/// configurations.
abstract contract ManagedCurrentAggregatorOracleBase is ManagedAggregatorOracleBase {
    struct Config {
        uint32 updateThreshold;
        uint32 updateDelay;
        uint32 heartbeat;
    }

    uint256 internal constant ERROR_UPDATE_DELAY_TOO_HIGH = 100;
    uint256 internal constant ERROR_UPDATE_THRESHOLD_ZERO = 101;
    uint256 internal constant ERROR_HEARTBEAT_ZERO = 101;

    /// @notice Emitted when the configuration is updated.
    /// @param oldConfig The old configuration.
    /// @param newConfig The new configuration.
    event ConfigUpdated(Config oldConfig, Config newConfig);

    /// @notice An error thrown when attempting to set an invalid configuration.
    /// @param config The invalid configuration.
    /// @param errorCode The error code.
    error InvalidConfig(Config config, uint256 errorCode);

    /// @notice The current configuration for the update threshold, update delay, and heartbeat.
    Config internal config;

    /// @notice Constructs a new ManagedCurrentAggregatorOracleBase with the given configuration values.
    /// @param updateThreshold_ The initial value for the update threshold.
    /// @param updateDelay_ The initial value for the update delay.
    /// @param heartbeat_ The initial value for the heartbeat.
    constructor(uint32 updateThreshold_, uint32 updateDelay_, uint32 heartbeat_) ManagedAggregatorOracleBase() {
        config.updateThreshold = updateThreshold_;
        config.updateDelay = updateDelay_;
        config.heartbeat = heartbeat_;
    }

    /**
     * @notice Sets a new configuration that applies to all tokens.
     * @dev This configuration is for the update threshold, update delay, and heartbeat.
     * @param newConfig The new config.
     * @custom:throws InvalidConfig if the new configuration is invalid.
     */
    function setConfig(Config calldata newConfig) external onlyRole(Roles.CONFIG_ADMIN) {
        // Ensure that updateDelay is not greater than heartbeat
        if (newConfig.updateDelay > newConfig.heartbeat) revert InvalidConfig(newConfig, ERROR_UPDATE_DELAY_TOO_HIGH);
        // Ensure that the update threshold is not zero
        if (newConfig.updateThreshold == 0) revert InvalidConfig(newConfig, ERROR_UPDATE_THRESHOLD_ZERO);
        // Ensure that the heartbeat is not zero
        if (newConfig.heartbeat == 0) revert InvalidConfig(newConfig, ERROR_HEARTBEAT_ZERO);

        Config memory oldConfig = config;
        config = newConfig;
        emit ConfigUpdated(oldConfig, newConfig);
    }
}
