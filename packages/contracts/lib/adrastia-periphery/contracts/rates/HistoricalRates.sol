//SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import "./IHistoricalRates.sol";

/**
 * @title HistoricalRates
 * @notice The HistoricalRates contract is an abstract contract designed to store historical rate data for various
 * tokens on the blockchain. It provides functionalities for initializing, updating, and querying historical rate
 * data in a circular buffer with a fixed capacity.
 * @dev This contract implements the IHistoricalRates interface and maintains a mapping of tokens to their respective
 * rate buffers and metadata. Each rate buffer holds an array of Rate structs containing target rate, current rate, and
 * timestamp data. The metadata includes information about the buffer's start, end, size, maximum size, and a pause
 * flag, which can be used to pause updates in extended contracts.
 */
abstract contract HistoricalRates is IHistoricalRates {
    struct BufferMetadata {
        uint8 start;
        uint8 end;
        uint8 size;
        uint8 maxSize;
        bool pauseUpdates; // Note: this is left for extentions, but is not used in this contract.
    }

    /// @notice Event emitted when a rate buffer's capacity is increased past the initial capacity.
    /// @dev Buffer initialization does not emit an event.
    /// @param token The token for which the rate buffer's capacity was increased.
    /// @param oldCapacity The previous capacity of the rate buffer.
    /// @param newCapacity The new capacity of the rate buffer.
    event RatesCapacityIncreased(address indexed token, uint256 oldCapacity, uint256 newCapacity);

    /// @notice Event emitted when a rate buffer's capacity is initialized.
    /// @param token The token for which the rate buffer's capacity was initialized.
    /// @param capacity The capacity of the rate buffer.
    event RatesCapacityInitialized(address indexed token, uint256 capacity);

    /// @notice Event emitted when a new rate is pushed to the rate buffer.
    /// @param token The token for which the rate was pushed.
    /// @param target The target rate.
    /// @param current The current rate, which may be different from the target rate if the rate change is capped.
    /// @param timestamp The timestamp at which the rate was pushed.
    event RateUpdated(address indexed token, uint256 target, uint256 current, uint256 timestamp);

    /// @notice An error that is thrown if we try to initialize a rate buffer that has already been initialized.
    /// @param token The token for which we tried to initialize the rate buffer.
    error BufferAlreadyInitialized(address token);

    /// @notice An error that is thrown if we try to retrieve a rate at an invalid index.
    /// @param token The token for which we tried to retrieve the rate.
    /// @param index The index of the rate that we tried to retrieve.
    /// @param size The size of the rate buffer.
    error InvalidIndex(address token, uint256 index, uint256 size);

    /// @notice An error that is thrown if we try to decrease the capacity of a rate buffer.
    /// @param token The token for which we tried to decrease the capacity of the rate buffer.
    /// @param amount The capacity that we tried to decrease the rate buffer to.
    /// @param currentCapacity The current capacity of the rate buffer.
    error CapacityCannotBeDecreased(address token, uint256 amount, uint256 currentCapacity);

    /// @notice An error that is thrown if we try to increase the capacity of a rate buffer past the maximum capacity.
    /// @param token The token for which we tried to increase the capacity of the rate buffer.
    /// @param amount The capacity that we tried to increase the rate buffer to.
    /// @param maxCapacity The maximum capacity of the rate buffer.
    error CapacityTooLarge(address token, uint256 amount, uint256 maxCapacity);

    /// @notice An error that is thrown if we try to retrieve more rates than are available in the rate buffer.
    /// @param token The token for which we tried to retrieve the rates.
    /// @param size The size of the rate buffer.
    /// @param minSizeRequired The minimum size of the rate buffer that we require.
    error InsufficientData(address token, uint256 size, uint256 minSizeRequired);

    /// @notice The initial capacity of the rate buffer.
    uint8 internal immutable initialBufferCardinality;

    /// @notice Maps a token to its metadata.
    mapping(address => BufferMetadata) internal rateBufferMetadata;

    /// @notice Maps a token to a buffer of rates.
    mapping(address => RateLibrary.Rate[]) internal rateBuffers;

    /**
     * @notice Constructs the HistoricalRates contract with a specified initial buffer capacity.
     * @param initialBufferCardinality_ The initial capacity of the rate buffer.
     */
    constructor(uint8 initialBufferCardinality_) {
        initialBufferCardinality = initialBufferCardinality_;
    }

    /// @inheritdoc IHistoricalRates
    function getRateAt(address token, uint256 index) external view virtual override returns (RateLibrary.Rate memory) {
        BufferMetadata memory meta = rateBufferMetadata[token];

        if (index >= meta.size) {
            revert InvalidIndex(token, index, meta.size);
        }

        uint256 bufferIndex = meta.end < index ? meta.end + meta.size - index : meta.end - index;

        return rateBuffers[token][bufferIndex];
    }

    /// @inheritdoc IHistoricalRates
    function getRates(
        address token,
        uint256 amount
    ) external view virtual override returns (RateLibrary.Rate[] memory) {
        return _getRates(token, amount, 0, 1);
    }

    /// @inheritdoc IHistoricalRates
    function getRates(
        address token,
        uint256 amount,
        uint256 offset,
        uint256 increment
    ) external view virtual override returns (RateLibrary.Rate[] memory) {
        return _getRates(token, amount, offset, increment);
    }

    /// @inheritdoc IHistoricalRates
    function getRatesCount(address token) external view override returns (uint256) {
        return rateBufferMetadata[token].size;
    }

    /// @inheritdoc IHistoricalRates
    function getRatesCapacity(address token) external view virtual override returns (uint256) {
        uint256 maxSize = rateBufferMetadata[token].maxSize;
        if (maxSize == 0) return initialBufferCardinality;

        return maxSize;
    }

    /// @param amount The new capacity of rates for the token. Must be greater than the current capacity, but
    ///   less than 256.
    /// @inheritdoc IHistoricalRates
    function setRatesCapacity(address token, uint256 amount) external virtual {
        _setRatesCapacity(token, amount);
    }

    /**
     * @dev Internal function to set the capacity of the rate buffer for a token.
     * @param token The token for which to set the new capacity.
     * @param amount The new capacity of rates for the token. Must be greater than the current capacity, but
     * less than 256.
     */
    function _setRatesCapacity(address token, uint256 amount) internal virtual {
        BufferMetadata storage meta = rateBufferMetadata[token];

        if (amount < meta.maxSize) revert CapacityCannotBeDecreased(token, amount, meta.maxSize);
        if (amount > type(uint8).max) revert CapacityTooLarge(token, amount, type(uint8).max);

        RateLibrary.Rate[] storage rateBuffer = rateBuffers[token];

        // Add new slots to the buffer
        uint256 capacityToAdd = amount - meta.maxSize;
        for (uint256 i = 0; i < capacityToAdd; ++i) {
            // Push a dummy rate with non-zero values to put most of the gas cost on the caller
            rateBuffer.push(RateLibrary.Rate({target: 1, current: 1, timestamp: 1}));
        }

        if (meta.maxSize != amount) {
            emit RatesCapacityIncreased(token, meta.maxSize, amount);

            // Update the metadata
            meta.maxSize = uint8(amount);
        }
    }

    /**
     * @dev Internal function to get historical rates with specified amount, offset, and increment.
     * @param token The token for which to retrieve the rates.
     * @param amount The number of historical rates to retrieve.
     * @param offset The number of rates to skip before starting to collect the rates.
     * @param increment The step size between the rates to collect.
     * @return observations An array of Rate structs containing the retrieved historical rates.
     */
    function _getRates(
        address token,
        uint256 amount,
        uint256 offset,
        uint256 increment
    ) internal view virtual returns (RateLibrary.Rate[] memory) {
        if (amount == 0) return new RateLibrary.Rate[](0);

        BufferMetadata memory meta = rateBufferMetadata[token];
        if (meta.size <= (amount - 1) * increment + offset)
            revert InsufficientData(token, meta.size, (amount - 1) * increment + offset + 1);

        RateLibrary.Rate[] memory observations = new RateLibrary.Rate[](amount);

        uint256 count = 0;

        for (
            uint256 i = meta.end < offset ? meta.end + meta.size - offset : meta.end - offset;
            count < amount;
            i = (i < increment) ? (i + meta.size) - increment : i - increment
        ) {
            observations[count++] = rateBuffers[token][i];
        }

        return observations;
    }

    /**
     * @dev Internal function to initialize rate buffers for a token.
     * @param token The token for which to initialize the rate buffer.
     */
    function initializeBuffers(address token) internal virtual {
        if (rateBuffers[token].length != 0) {
            revert BufferAlreadyInitialized(token);
        }

        BufferMetadata storage meta = rateBufferMetadata[token];

        // Initialize the buffers
        RateLibrary.Rate[] storage observationBuffer = rateBuffers[token];

        for (uint256 i = 0; i < initialBufferCardinality; ++i) {
            observationBuffer.push();
        }

        // Initialize the metadata
        meta.start = 0;
        meta.end = 0;
        meta.size = 0;
        meta.maxSize = initialBufferCardinality;
        meta.pauseUpdates = false;

        emit RatesCapacityInitialized(token, meta.maxSize);
    }

    /**
     * @dev Internal function to push a new rate data into the rate buffer and update metadata accordingly.
     * @param token The token for which to push the new rate data.
     * @param rate The Rate struct containing target rate, current rate, and timestamp data to be pushed.
     */
    function push(address token, RateLibrary.Rate memory rate) internal virtual {
        BufferMetadata storage meta = rateBufferMetadata[token];

        if (meta.size == 0) {
            if (meta.maxSize == 0) {
                // Initialize the buffers
                initializeBuffers(token);
            }
        } else {
            meta.end = (meta.end + 1) % meta.maxSize;
        }

        rateBuffers[token][meta.end] = rate;

        emit RateUpdated(token, rate.target, rate.current, block.timestamp);

        if (meta.size < meta.maxSize && meta.end == meta.size) {
            // We are at the end of the array and we have not yet filled it
            meta.size++;
        } else {
            // start was just overwritten
            meta.start = (meta.start + 1) % meta.size;
        }
    }
}
