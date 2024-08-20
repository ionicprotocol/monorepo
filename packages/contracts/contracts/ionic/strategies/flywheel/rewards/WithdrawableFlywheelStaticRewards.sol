// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.10;

import { FlywheelStaticRewards } from "./FlywheelStaticRewards.sol";
import { BaseFlywheelRewards } from "./BaseFlywheelRewards.sol";
import { IonicFlywheelCore } from "../IonicFlywheelCore.sol";
import { Auth, Authority } from "solmate/auth/Auth.sol";
import { SafeTransferLib, ERC20 } from "solmate/utils/SafeTransferLib.sol";

contract WithdrawableFlywheelStaticRewards is FlywheelStaticRewards {
  using SafeTransferLib for ERC20;

  constructor(
    IonicFlywheelCore _flywheel,
    address _owner,
    Authority _authority
  ) FlywheelStaticRewards(_flywheel, _owner, _authority) {}

  function withdraw(uint256 amount) external {
    require(msg.sender == flywheel.owner());
    rewardToken.safeTransfer(address(flywheel.owner()), amount);
  }
}
