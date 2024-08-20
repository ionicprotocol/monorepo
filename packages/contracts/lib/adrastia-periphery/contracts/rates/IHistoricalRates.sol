//SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.9.0;

import "./RateLibrary.sol";

/**
 * @title IHistoricalRates
 * @notice An interface that defines a contract that stores historical rates.
 */
interface IHistoricalRates {
    /// @notice Gets an rate for a token at a specific index.
    /// @param token The address of the token to get the rates for.
    /// @param index The index of the rate to get, where index 0 contains the latest rate, and the last
    ///   index contains the oldest rate (uses reverse chronological ordering).
    /// @return rate The rate for the token at the specified index.
    function getRateAt(address token, uint256 index) external view returns (RateLibrary.Rate memory);

    /// @notice Gets the latest rates for a token.
    /// @param token The address of the token to get the rates for.
    /// @param amount The number of rates to get.
    /// @return rates The latest rates for the token, in reverse chronological order, from newest to oldest.
    function getRates(address token, uint256 amount) external view returns (RateLibrary.Rate[] memory);

    /// @notice Gets the latest rates for a token.
    /// @param token The address of the token to get the rates for.
    /// @param amount The number of rates to get.
    /// @param offset The index of the first rate to get (default: 0).
    /// @param increment The increment between rates to get (default: 1).
    /// @return rates The latest rates for the token, in reverse chronological order, from newest to oldest.
    function getRates(
        address token,
        uint256 amount,
        uint256 offset,
        uint256 increment
    ) external view returns (RateLibrary.Rate[] memory);

    /// @notice Gets the number of rates for a token.
    /// @param token The address of the token to get the number of rates for.
    /// @return count The number of rates for the token.
    function getRatesCount(address token) external view returns (uint256);

    /// @notice Gets the capacity of rates for a token.
    /// @param token The address of the token to get the capacity of rates for.
    /// @return capacity The capacity of rates for the token.
    function getRatesCapacity(address token) external view returns (uint256);

    /// @notice Sets the capacity of rates for a token.
    /// @param token The address of the token to set the capacity of rates for.
    /// @param amount The new capacity of rates for the token.
    function setRatesCapacity(address token, uint256 amount) external;
}
