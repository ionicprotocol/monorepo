// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.9.0;

library Roles {
    bytes32 public constant ADMIN = keccak256("ADMIN_ROLE");

    bytes32 public constant UPDATER_ADMIN = keccak256("UPDATER_ADMIN_ROLE");

    bytes32 public constant ORACLE_UPDATER = keccak256("ORACLE_UPDATER_ROLE");

    bytes32 public constant RATE_ADMIN = keccak256("RATE_ADMIN_ROLE");

    bytes32 public constant UPDATE_PAUSE_ADMIN = keccak256("UPDATE_PAUSE_ADMIN_ROLE");

    bytes32 public constant CONFIG_ADMIN = keccak256("CONFIG_ADMIN_ROLE");
}
