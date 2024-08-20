//SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import "@adrastia-oracle/adrastia-core/contracts/oracles/PeriodicPriceAccumulationOracle.sol";

import "./bases/ManagedOracleBase.sol";

contract ManagedPeriodicPriceAccumulationOracle is PeriodicPriceAccumulationOracle, ManagedOracleBase {
    constructor(
        address priceAccumulator_,
        address quoteToken_,
        uint256 period_,
        uint256 granularity_,
        uint112 staticTokenLiquidity_,
        uint112 staticQuoteTokenLiquidity_,
        uint8 liquidityDecimals_
    )
        PeriodicPriceAccumulationOracle(
            priceAccumulator_,
            quoteToken_,
            period_,
            granularity_,
            staticTokenLiquidity_,
            staticQuoteTokenLiquidity_,
            liquidityDecimals_
        )
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
    ) public view virtual override(AccessControlEnumerable, PeriodicPriceAccumulationOracle) returns (bool) {
        return
            AccessControlEnumerable.supportsInterface(interfaceId) ||
            PeriodicPriceAccumulationOracle.supportsInterface(interfaceId);
    }
}
