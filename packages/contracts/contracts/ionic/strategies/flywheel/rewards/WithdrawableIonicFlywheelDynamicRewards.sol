// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.10;

import { FlywheelDynamicRewards } from "./FlywheelDynamicRewards.sol";
import { IonicFlywheelCore } from "../IonicFlywheelCore.sol";
import { SafeTransferLib, ERC20 } from "solmate/utils/SafeTransferLib.sol";

contract WithdrawableIonicFlywheelDynamicRewards is FlywheelDynamicRewards {
    using SafeTransferLib for ERC20;

    constructor(IonicFlywheelCore _flywheel, uint32 _cycleLength)
        FlywheelDynamicRewards(_flywheel, _cycleLength)
    {}

    function getNextCycleRewards(ERC20 strategy)
        internal
        override
        returns (uint192)
    {
        uint256 rewardAmount = rewardToken.balanceOf(address(strategy));
        if (rewardAmount != 0) {
            rewardToken.safeTransferFrom(
                address(strategy),
                address(this),
                rewardAmount
            );
        }
        return uint192(rewardAmount);
    }

    function withdraw(uint256 amount) external {
        require(msg.sender == flywheel.owner());
        rewardToken.safeTransfer(address(flywheel.owner()), amount);
    }
}
