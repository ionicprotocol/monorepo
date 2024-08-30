// SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import "@openzeppelin-v4/contracts/access/AccessControlEnumerable.sol";
import "../../access/Roles.sol";

abstract contract ManagedOracleBase is AccessControlEnumerable {
    uint16 internal constant PAUSE_FLAG_MASK = 1;

    /// @notice Event emitted when the pause status of updates for a token is changed.
    /// @param token The token for which the pause status of updates was changed.
    /// @param areUpdatesPaused Whether updates are paused for the token.
    event PauseStatusChanged(address indexed token, bool areUpdatesPaused);

    /// @notice An error that is thrown when updates are paused for a token.
    /// @param token The token for which updates are paused.
    error UpdatesArePaused(address token);

    /// @notice An error thrown when attempting to call a function that requires a certain role.
    /// @param account The account that is missing the role.
    /// @param role The role that is missing.
    error MissingRole(address account, bytes32 role);

    constructor() {
        initializeRoles();
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

        // UPDATE_PAUSE_ADMIN is managed by ADMIN
        _setRoleAdmin(Roles.UPDATE_PAUSE_ADMIN, Roles.ADMIN);

        // Hierarchy:
        // ADMIN
        //   - CONFIG_ADMIN
        //   - UPDATER_ADMIN
        //     - ORACLE_UPDATER
        //   - UPDATE_PAUSE_ADMIN
    }
}
