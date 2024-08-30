// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.8.0;

import { IERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

interface IAsset {}

enum UserBalanceOpKind {
  DEPOSIT_INTERNAL,
  WITHDRAW_INTERNAL,
  TRANSFER_INTERNAL,
  TRANSFER_EXTERNAL
}

enum SwapKind {
  GIVEN_IN,
  GIVEN_OUT
}

enum ExitKind {
  EXACT_BPT_IN_FOR_ONE_TOKEN_OUT,
  EXACT_BPT_IN_FOR_TOKENS_OUT,
  BPT_IN_FOR_EXACT_TOKENS_OUT,
  MANAGEMENT_FEE_TOKENS_OUT
}

struct UserBalanceOp {
  UserBalanceOpKind kind;
  IAsset asset;
  uint256 amount;
  address sender;
  address payable recipient;
}
struct FundManagement {
  address sender;
  bool fromInternalBalance;
  address payable recipient;
  bool toInternalBalance;
}

struct SingleSwap {
  bytes32 poolId;
  SwapKind kind;
  IAsset assetIn;
  IAsset assetOut;
  uint256 amount;
  bytes userData;
}

struct ExitPoolRequest {
  IERC20Upgradeable[] assets;
  uint256[] minAmountsOut;
  bytes userData;
  bool toInternalBalance;
}

interface IBalancerVault {
  function swap(
    SingleSwap memory singleSwap,
    FundManagement memory funds,
    uint256 limit,
    uint256 deadline
  ) external returns (uint256 amountCalculated);

  function manageUserBalance(UserBalanceOp[] memory ops) external payable;

  function getPoolTokens(bytes32 poolId)
    external
    view
    returns (
      IERC20Upgradeable[] memory tokens,
      uint256[] memory balances,
      uint256 lastChangeBlock
    );

  function exitPool(
    bytes32 poolId,
    address sender,
    address payable recipient,
    ExitPoolRequest memory request
  ) external;
}
