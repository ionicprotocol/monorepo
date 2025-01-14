// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import { IveION } from "../interfaces/IveION.sol";

library BalanceLogicLibrary {
  uint256 internal constant WEEK = 1 weeks;

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
    uint256 _t,
    bool _isPermanent
  ) external view returns (uint256) {
    uint256 _epoch = getPastUserPointIndex(s_userPointEpoch, s_userPointHistory, _lpType, _tokenId, _t);
    // epoch 0 is an empty point
    if (_epoch == 0) return 0;
    IveION.UserPoint memory lastPoint = s_userPointHistory[_tokenId][_lpType][_epoch];
    if (_isPermanent) {
      return lastPoint.permanent + lastPoint.permanentDelegate;
    } else {
      uint256 reduction = lastPoint.slope * (_t - lastPoint.ts);
      if (reduction > lastPoint.bias) {
        lastPoint.bias = 0;
      } else {
        lastPoint.bias -= reduction;
      }
      return lastPoint.bias;
    }
  }

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
}
