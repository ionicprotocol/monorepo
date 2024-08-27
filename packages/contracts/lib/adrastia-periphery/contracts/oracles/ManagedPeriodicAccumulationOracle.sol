//SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import "@adrastia-oracle/adrastia-core/contracts/oracles/PeriodicAccumulationOracle.sol";

import "./bases/ManagedOracleBase.sol";

contract ManagedPeriodicAccumulationOracle is PeriodicAccumulationOracle, ManagedOracleBase {
    constructor(
        address liquidityAccumulator_,
        address priceAccumulator_,
        address quoteToken_,
        uint256 period_,
        uint256 granularity_
    )
        PeriodicAccumulationOracle(liquidityAccumulator_, priceAccumulator_, quoteToken_, period_, granularity_)
        ManagedOracleBase()
    {}

    function canUpdate(bytes memory data) public view virtual override returns (bool) {
        // Return false if the message sender is missing the required role
        if (!hasRole(Roles.ORACLE_UPDATER, address(0)) && !hasRole(Roles.ORACLE_UPDATER, msg.sender)) return false;

        return super.canUpdate(data);
    }

    function update(bytes memory data) public virtual override onlyRoleOrOpenRole(Roles.ORACLE_UPDATER) returns (bool) {
        return super.update(data);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(AccessControlEnumerable, PeriodicAccumulationOracle) returns (bool) {
        return
            AccessControlEnumerable.supportsInterface(interfaceId) ||
            PeriodicAccumulationOracle.supportsInterface(interfaceId);
    }
}
