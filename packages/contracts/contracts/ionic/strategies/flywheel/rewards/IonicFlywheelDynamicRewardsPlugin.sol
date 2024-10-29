// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.10;

import "./FlywheelDynamicRewards.sol";

interface ICERC20 {
    function plugin() external returns (address);
}

interface IPlugin_FDR {
    function claimRewards() external;
}

/** 
 @title Ionic Flywheel Dynamic Reward Stream
 @notice Determines rewards based on reward cycle
 Each cycle, claims rewards on the plugin before getting the reward amount
*/
contract IonicFlywheelDynamicRewardsPlugin is FlywheelDynamicRewards {
    using SafeTransferLib for ERC20;

    constructor(IonicFlywheelCore _flywheel, uint32 _cycleLength)
        FlywheelDynamicRewards(_flywheel, _cycleLength)
    {}

    function getNextCycleRewards(ERC20 strategy)
        internal
        override
        returns (uint192)
    {
        IPlugin_FDR plugin = IPlugin_FDR(ICERC20(address(strategy)).plugin());
        try plugin.claimRewards() {} catch {}

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
        return 0;
    }
}
