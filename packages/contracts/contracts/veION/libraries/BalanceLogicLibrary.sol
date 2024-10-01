// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.10;

import { IveION } from "../interfaces/IveION.sol";

library BalanceLogicLibrary {
  uint256 internal constant WEEK = 1 weeks;

  /// @notice Binary search to get the user point index for a token id at or prior to a given timestamp
  /// @dev If a user point does not exist prior to the timestamp, this will return 0.
  /// @param s_userPointEpoch State of all user point epochs
  /// @param s_userPointHistory State of all user point history
  /// @param _tokenId .
  /// @param _timestamp .
  /// @return User point index
  function getPastUserPointIndex(
    mapping(uint256 => mapping(IveION.LpTokenType => uint256)) storage s_userPointEpoch,
    mapping(uint256 => mapping(IveION.LpTokenType => IveION.UserPoint[1000000000])) storage s_userPointHistory,
    IveION.LpTokenType _lpType,
    uint256 _tokenId,
    uint256 _timestamp
  ) internal view returns (uint256) {
    uint256 _userEpoch = s_userPointEpoch[_tokenId][_lpType];
    if (_userEpoch == 0) return 0;
    // First check most recent balance
    if (s_userPointHistory[_tokenId][_lpType][_userEpoch].ts <= _timestamp) return (_userEpoch);
    // Next check implicit zero balance
    if (s_userPointHistory[_tokenId][_lpType][1].ts > _timestamp) return 0;

    uint256 lower = 0;
    uint256 upper = _userEpoch;
    while (upper > lower) {
      uint256 center = upper - (upper - lower) / 2; // ceil, avoiding overflow
      IveION.UserPoint storage userPoint = s_userPointHistory[_tokenId][_lpType][center];
      if (userPoint.ts == _timestamp) {
        return center;
      } else if (userPoint.ts < _timestamp) {
        lower = center;
      } else {
        upper = center - 1;
      }
    }
    return lower;
  }

  /// @notice Binary search to get the global point index at or prior to a given timestamp
  /// @dev If a checkpoint does not exist prior to the timestamp, this will return 0.
  /// @param _epoch Current global point epoch
  /// @param _pointHistory State of all global point history
  /// @param _timestamp .
  /// @return Global point index
  function getPastGlobalPointIndex(
    uint256 _epoch,
    mapping(uint256 => IveION.GlobalPoint) storage _pointHistory,
    uint256 _timestamp
  ) internal view returns (uint256) {
    if (_epoch == 0) return 0;
    // First check most recent balance
    if (_pointHistory[_epoch].ts <= _timestamp) return (_epoch);
    // Next check implicit zero balance
    if (_pointHistory[1].ts > _timestamp) return 0;

    uint256 lower = 0;
    uint256 upper = _epoch;
    while (upper > lower) {
      uint256 center = upper - (upper - lower) / 2; // ceil, avoiding overflow
      IveION.GlobalPoint storage globalPoint = _pointHistory[center];
      if (globalPoint.ts == _timestamp) {
        return center;
      } else if (globalPoint.ts < _timestamp) {
        lower = center;
      } else {
        upper = center - 1;
      }
    }
    return lower;
  }

  /// @notice Get the current voting power for `_tokenId`
  /// @dev Adheres to the ERC20 `balanceOf` interface for Aragon compatibility
  ///      Fetches last user point prior to a certain timestamp, then walks forward to timestamp.
  /// @param s_userPointEpoch State of all user point epochs
  /// @param s_userPointHistory State of all user point history
  /// @param _tokenId NFT for lock
  /// @param _t Epoch time to return voting power at
  /// @return User voting power
  function balanceOfNFTAt(
    mapping(uint256 => mapping(IveION.LpTokenType => uint256)) storage s_userPointEpoch,
    mapping(uint256 => mapping(IveION.LpTokenType => IveION.UserPoint[1000000000])) storage s_userPointHistory,
    IveION.LpTokenType _lpType,
    uint256 _tokenId,
    uint256 _t
  ) external view returns (uint256) {
    uint256 _epoch = getPastUserPointIndex(s_userPointEpoch, s_userPointHistory, _lpType, _tokenId, _t);
    // epoch 0 is an empty point
    if (_epoch == 0) return 0;
    IveION.UserPoint memory lastPoint = s_userPointHistory[_tokenId][_lpType][_epoch];
    if (lastPoint.permanent != 0) {
      return lastPoint.permanent;
    } else {
      lastPoint.bias -= lastPoint.slope * int128(int256(_t) - int256(lastPoint.ts));
      if (lastPoint.bias < 0) {
        lastPoint.bias = 0;
      }
      return uint256(int256(lastPoint.bias));
    }
  }

  /// @notice Calculate total voting power at some point in the past
  /// @param _slopeChanges State of all slopeChanges
  /// @param _pointHistory State of all global point history
  /// @param _epoch The epoch to start search from
  /// @param _t Time to calculate the total voting power at
  /// @return Total voting power at that time
  function supplyAt(
    mapping(uint256 => int128) storage _slopeChanges,
    mapping(uint256 => IveION.GlobalPoint) storage _pointHistory,
    uint256 _epoch,
    uint256 _t
  ) external view returns (uint256) {
    uint256 epoch_ = getPastGlobalPointIndex(_epoch, _pointHistory, _t);
    // epoch 0 is an empty point
    if (epoch_ == 0) return 0;
    IveION.GlobalPoint memory _point = _pointHistory[epoch_];
    int128 bias = _point.bias;
    int128 slope = _point.slope;
    uint256 ts = _point.ts;
    uint256 t_i = (ts / WEEK) * WEEK;
    for (uint256 i = 0; i < 255; ++i) {
      t_i += WEEK;
      int128 dSlope = 0;
      if (t_i > _t) {
        t_i = _t;
      } else {
        dSlope = _slopeChanges[t_i];
      }
      bias -= slope * int128(int256(t_i - ts));
      if (t_i == _t) {
        break;
      }
      slope += dSlope;
      ts = t_i;
    }

    if (bias < 0) {
      bias = 0;
    }
    return uint256(uint128(bias)) + _point.permanentLockBalance;
  }
}
