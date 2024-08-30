// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.8.0;

contract BConst {
  uint256 public constant BONE = 10**18;

  uint256 public constant MIN_BOUND_TOKENS = 2;
  uint256 public constant MAX_BOUND_TOKENS = 8;

  uint256 public constant MIN_FEE = BONE / 10**6;
  uint256 public constant MAX_FEE = BONE / 10;
  uint256 public constant EXIT_FEE = 0;

  uint256 public constant MIN_WEIGHT = BONE;
  uint256 public constant MAX_WEIGHT = BONE * 50;
  uint256 public constant MAX_TOTAL_WEIGHT = BONE * 50;
  uint256 public constant MIN_BALANCE = BONE / 10**12;

  uint256 public constant INIT_POOL_SUPPLY = BONE * 100;

  uint256 public constant MIN_BPOW_BASE = 1 wei;
  uint256 public constant MAX_BPOW_BASE = (2 * BONE) - 1 wei;
  uint256 public constant BPOW_PRECISION = BONE / 10**10;

  uint256 public constant MAX_IN_RATIO = BONE / 2;
  uint256 public constant MAX_OUT_RATIO = (BONE / 3) + 1 wei;
}
