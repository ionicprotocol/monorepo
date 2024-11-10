// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.10;

import { FlywheelDynamicRewards } from "./FlywheelDynamicRewards.sol";
import { IonicFlywheelCore } from "../IonicFlywheelCore.sol";
import { SafeTransferLib, ERC20 } from "solmate/utils/SafeTransferLib.sol";

contract IonicFlywheelDynamicRewards is FlywheelDynamicRewards {
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

    function getRewardsPerSecondPerToken(ERC20 strategy) external view override returns (uint256) {
        RewardsCycle memory cycle = rewardsCycle[strategy];
        if (rewardsCycleLength == 0) return 0;
        // scaled by 1e18
        else return (cycle.reward * 1e18) / (rewardsCycleLength * strategy.totalSupply());
    }
}
