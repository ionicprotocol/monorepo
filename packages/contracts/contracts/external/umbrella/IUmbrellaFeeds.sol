// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IUmbrellaFeeds {
  struct PriceData {
    /// @dev this is placeholder, that can be used for some additional data
    /// atm of creating this smart contract, it is only used as marker for removed data (when == type(uint8).max)
    uint8 data;
    /// @dev heartbeat: how often price data will be refreshed in case price stay flat
    uint24 heartbeat;
    /// @dev timestamp: price time, at this time validators run consensus
    uint32 timestamp;
    /// @dev price
    uint128 price;
  }

  /// @dev this is main endpoint for reading feeds.
  /// In case timestamp is empty (that means there is no data), contract will execute fallback call.
  /// Check main contract description for fallback details.
  /// If you do not need whole data from `PriceData` struct, you can save some gas by using other view methods that
  /// returns just what you need.
  /// @notice method will revert if data for `_key` not exists.
  /// @param _key hash of feed name
  /// @return data full PriceData struct
  function getPriceData(bytes32 _key) external view returns (PriceData memory data);

  /// @dev this is only for dev debug,
  /// please use `getPriceData` directly for lower has cost and fallback functionality
  function priceData(string memory _key) external view returns (PriceData memory);

  /// @notice same as `getPriceData` but does not revert when no data
  /// @param _key hash of feed name
  /// @return data full PriceData struct
  function getPriceDataRaw(bytes32 _key) external view returns (PriceData memory data);

  /// @notice reader for mapping
  /// @param _key hash of feed name
  /// @return data full PriceData struct
  function prices(bytes32 _key) external view returns (PriceData memory data);

  /// @notice method will revert if data for `_key` not exists.
  /// @param _key hash of feed name
  /// @return price
  function getPrice(bytes32 _key) external view returns (uint128 price);

  /// @notice method will revert if data for `_key` not exists.
  /// @param _key hash of feed name
  /// @return price
  /// @return timestamp
  function getPriceTimestamp(bytes32 _key) external view returns (uint128 price, uint32 timestamp);

  /// @notice method will revert if data for `_key` not exists.
  /// @param _key hash of feed name
  /// @return price
  /// @return timestamp
  /// @return heartbeat
  function getPriceTimestampHeartbeat(bytes32 _key)
    external
    view
    returns (
      uint128 price,
      uint32 timestamp,
      uint24 heartbeat
    );

  /// @dev This method should be used only for Layer2 as it is more gas consuming than others views.
  /// @notice It does not revert on empty data.
  /// @param _name string feed name
  /// @return data PriceData
  function getPriceDataByName(string calldata _name) external view returns (PriceData memory data);

  /// @dev decimals for prices stored in this contract
  function DECIMALS() external view returns (uint8); // solhint-disable-line func-name-mixedcase
}
