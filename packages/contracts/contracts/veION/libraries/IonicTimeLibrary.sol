// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

library IonicTimeLibrary {
  uint256 internal constant _WEEK = 7 days;

  /// @dev Returns start of epoch based on current timestamp
  function epochStart(uint256 timestamp) internal pure returns (uint256) {
    unchecked {
      return timestamp - (timestamp % _WEEK);
    }
  }

  /// @dev Returns start of next epoch / end of current epoch
  function epochNext(uint256 timestamp) internal pure returns (uint256) {
    unchecked {
      return timestamp - (timestamp % _WEEK) + _WEEK;
    }
  }

  /// @dev Returns start of voting window
  function epochVoteStart(uint256 timestamp) internal pure returns (uint256) {
    unchecked {
      return timestamp - (timestamp % _WEEK) + 1 hours;
    }
  }

  /// @dev Returns end of voting window / beginning of unrestricted voting window
  function epochVoteEnd(uint256 timestamp) internal pure returns (uint256) {
    unchecked {
      return timestamp - (timestamp % _WEEK) + _WEEK - 12 hours;
    }
  }
}
