//SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import "@adrastia-oracle/adrastia-core/contracts/oracles/PriceVolatilityOracle.sol";

import "./bases/ManagedHistoricalAggregatorOracleBase.sol";

contract ManagedPriceVolatilityOracle is PriceVolatilityOracle, ManagedHistoricalAggregatorOracleBase {
    constructor(
        VolatilityOracleView view_,
        IHistoricalOracle source_,
        uint256 observationAmount_,
        uint256 observationOffset_,
        uint256 observationIncrement_,
        uint256 meanType_
    )
        PriceVolatilityOracle(view_, source_, observationAmount_, observationOffset_, observationIncrement_, meanType_)
        ManagedHistoricalAggregatorOracleBase(source_, observationAmount_, observationOffset_, observationIncrement_)
    {}

    function setUpdatesPaused(address token, bool paused) external virtual onlyRole(Roles.UPDATE_PAUSE_ADMIN) {
        uint16 flags = observationBufferMetadata[token].flags;

        if (paused) {
            flags |= PAUSE_FLAG_MASK;
        } else {
            flags &= ~PAUSE_FLAG_MASK;
        }

        observationBufferMetadata[token].flags = flags;

        emit PauseStatusChanged(token, paused);
    }

    function areUpdatesPaused(address token) external view virtual returns (bool) {
        return _areUpdatesPaused(token);
    }

    function canUpdate(bytes memory data) public view virtual override returns (bool) {
        // Return false if the message sender is missing the required role
        if (!hasRole(Roles.ORACLE_UPDATER, address(0)) && !hasRole(Roles.ORACLE_UPDATER, msg.sender)) return false;

        address token = abi.decode(data, (address));
        if (_areUpdatesPaused(token)) return false;

        return super.canUpdate(data);
    }

    function update(bytes memory data) public virtual override onlyRoleOrOpenRole(Roles.ORACLE_UPDATER) returns (bool) {
        address token = abi.decode(data, (address));
        if (_areUpdatesPaused(token)) revert UpdatesArePaused(token);

        return super.update(data);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(AccessControlEnumerable, HistoricalAggregatorOracle) returns (bool) {
        return
            AccessControlEnumerable.supportsInterface(interfaceId) ||
            HistoricalAggregatorOracle.supportsInterface(interfaceId);
    }

    function _source() internal view virtual override returns (IHistoricalOracle) {
        return config.source;
    }

    function _observationAmount() internal view virtual override returns (uint256) {
        return config.observationAmount;
    }

    function _observationOffset() internal view virtual override returns (uint256) {
        return config.observationOffset;
    }

    function _observationIncrement() internal view virtual override returns (uint256) {
        return config.observationIncrement;
    }

    function _areUpdatesPaused(address token) internal view virtual returns (bool) {
        return (observationBufferMetadata[token].flags & PAUSE_FLAG_MASK) != 0;
    }
}
