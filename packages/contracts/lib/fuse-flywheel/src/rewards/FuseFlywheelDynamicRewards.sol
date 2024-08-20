// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.10;

import "flywheel/rewards/FlywheelDynamicRewards.sol";

/** 
 @title Fuse Flywheel Dynamic Reward Stream
 @notice Determines rewards based on reward cycle
*/
contract FuseFlywheelDynamicRewards is FlywheelDynamicRewards {
    using SafeTransferLib for ERC20;

    constructor(FlywheelCore _flywheel, uint32 _cycleLength)
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
}
