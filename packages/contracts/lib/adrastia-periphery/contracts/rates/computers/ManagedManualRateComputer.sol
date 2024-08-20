//SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import "@openzeppelin-v4/contracts/access/AccessControlEnumerable.sol";

import "./ManualRateComputer.sol";
import "../../access/Roles.sol";

/**
 * @title ManagedManualRateComputer
 * @notice A contract that allows manual rate input with access control enforced by the OpenZeppelin
 * AccessControlEnumerable contract.
 * @dev Inherits from ManualRateComputer and AccessControlEnumerable. The contract enforces the RATE_ADMIN role for
 * setting rates.
 */
contract ManagedManualRateComputer is ManualRateComputer, AccessControlEnumerable {
    /**
     * @notice Constructs the ManagedManualRateComputer contract.
     * @dev Initializes the roles hierarchy.
     */
    constructor() {
        initializeRoles();
    }

    /// @inheritdoc IERC165
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(AccessControlEnumerable, ManualRateComputer) returns (bool) {
        return
            ManualRateComputer.supportsInterface(interfaceId) || AccessControlEnumerable.supportsInterface(interfaceId);
    }

    /// @notice Requires the sender to have the RATE_ADMIN role to call setRate.
    function checkSetRate() internal view virtual override onlyRole(Roles.RATE_ADMIN) {}

    /**
     * @notice Initializes the roles hierarchy.
     * @dev Sets up the roles and their hierarchy:
     *          ADMIN
     *            |
     *        RATE_ADMIN
     * @dev The ADMIN role is set up with msg.sender as the initial admin.
     */
    function initializeRoles() internal virtual {
        // Setup admin role, setting msg.sender as admin
        _setupRole(Roles.ADMIN, msg.sender);
        _setRoleAdmin(Roles.ADMIN, Roles.ADMIN);

        // Set admin of RATE_ADMIN as ADMIN
        _setRoleAdmin(Roles.RATE_ADMIN, Roles.ADMIN);

        // Hierarchy:
        // ADMIN
        //   - RATE_ADMIN
    }
}
