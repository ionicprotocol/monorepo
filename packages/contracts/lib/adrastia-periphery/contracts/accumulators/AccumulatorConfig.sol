// SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import "@openzeppelin-v4/contracts/access/AccessControlEnumerable.sol";
import "../access/Roles.sol";

/// @title AccumulatorConfig
/// @notice A contract for managing the configuration of an accumulator.
abstract contract AccumulatorConfig is AccessControlEnumerable {
    /// @dev A struct that holds configuration values for the accumulator.
    struct Config {
        uint32 updateThreshold;
        uint32 updateDelay;
        uint32 heartbeat;
    }

    /// @dev Emitted when the configuration is updated.
    event ConfigUpdated(Config oldConfig, Config newConfig);

    /// @dev The current configuration.
    Config internal config;

    /// @dev An error thrown when attempting to set an invalid configuration.
    error InvalidConfig(Config config);

    /// @notice An error thrown when attempting to call a function that requires a certain role.
    /// @param account The account that is missing the role.
    /// @param role The role that is missing.
    error MissingRole(address account, bytes32 role);

    /// @notice Constructs a new AccumulatorConfig with the given configuration values.
    /// @param updateThreshold_ The initial value for the update threshold.
    /// @param updateDelay_ The initial value for the update delay.
    /// @param heartbeat_ The initial value for the heartbeat.
    constructor(uint32 updateThreshold_, uint32 updateDelay_, uint32 heartbeat_) {
        initializeRoles();

        config.updateThreshold = updateThreshold_;
        config.updateDelay = updateDelay_;
        config.heartbeat = heartbeat_;
    }

    /**
     * @notice Modifier to make a function callable only by a certain role. In addition to checking the sender's role,
     * `address(0)` 's role is also considered. Granting a role to `address(0)` is equivalent to enabling this role for
     * everyone.
     * @param role The role to check.
     */
    modifier onlyRoleOrOpenRole(bytes32 role) {
        if (!hasRole(role, address(0))) {
            if (!hasRole(role, msg.sender)) revert MissingRole(msg.sender, role);
        }
        _;
    }

    /// @notice Sets a new configuration.
    /// @param newConfig The new configuration values.
    /// @dev Only accounts with the CONFIG_ADMIN role can call this function.
    function setConfig(Config calldata newConfig) external virtual onlyRole(Roles.CONFIG_ADMIN) {
        // Ensure that updateDelay is not greater than heartbeat
        if (newConfig.updateDelay > newConfig.heartbeat) revert InvalidConfig(newConfig);

        // Ensure that updateThreshold is not zero
        if (newConfig.updateThreshold == 0) revert InvalidConfig(newConfig);

        Config memory oldConfig = config;
        config = newConfig;
        emit ConfigUpdated(oldConfig, newConfig);
    }

    function initializeRoles() internal virtual {
        // Setup admin role, setting msg.sender as admin
        _setupRole(Roles.ADMIN, msg.sender);
        _setRoleAdmin(Roles.ADMIN, Roles.ADMIN);

        // CONFIG_ADMIN is managed by ADMIN
        _setRoleAdmin(Roles.CONFIG_ADMIN, Roles.ADMIN);

        // UPDATER_ADMIN is managed by ADMIN
        _setRoleAdmin(Roles.UPDATER_ADMIN, Roles.ADMIN);

        // ORACLE_UPDATER is managed by UPDATER_ADMIN
        _setRoleAdmin(Roles.ORACLE_UPDATER, Roles.UPDATER_ADMIN);

        // Hierarchy:
        // ADMIN
        //   - CONFIG_ADMIN
        //   - UPDATER_ADMIN
        //     - ORACLE_UPDATER
    }
}
