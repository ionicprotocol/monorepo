// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { ERC20 } from "solmate/tokens/ERC20.sol";
import { SafeTransferLib } from "solmate/utils/SafeTransferLib.sol";


contract MockIonicFlywheelCore {
    using SafeTransferLib for ERC20;

    address public rewardToken;
    address public flywheelRewards;
    function setRewardToken(address _rewardToken) public {
        rewardToken = _rewardToken;
    }

    function setFlywheelRewards(address _flywheelRewards) public {
        flywheelRewards = _flywheelRewards;
    }

    function updateBlacklistBalances(ERC20 _market, address _user) external {}

    function accrue(ERC20 _market, address _user) public returns (uint256) {
        return 0;
    }

    function takeRewardsFromUser(address _user, address _receiver) external {   
        uint256 balance = ERC20(rewardToken).balanceOf(address(flywheelRewards));
        ERC20(rewardToken).safeTransferFrom(address(flywheelRewards), _receiver, balance);
    }
    function whitelistUser(ERC20 strategy, address user) external  {}

}