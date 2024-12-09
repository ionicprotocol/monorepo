// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.10;

import { FlywheelDynamicRewards } from "./FlywheelDynamicRewards.sol";
import { IonicFlywheelCore } from "../IonicFlywheelCore.sol";
import { SafeTransferLib, ERC20 } from "solmate/utils/SafeTransferLib.sol";

contract IonicFlywheelDynamicRewards is FlywheelDynamicRewards {
    using SafeTransferLib for ERC20;

    address public owner;
    mapping(address => address) public rewardAccumulators;

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    constructor(IonicFlywheelCore _flywheel, uint32 _cycleLength)
        FlywheelDynamicRewards(_flywheel, _cycleLength)
    {
        owner = msg.sender;
    }

    function setRewardAccumulators(address[] memory _strategies, address[] memory _rewardAccumulators) external onlyOwner {
        uint256 _length = _strategies.length;
        require(_rewardAccumulators.length == _length, "parameters");
        for (uint256 i = 0; i < _length; i++) {
            rewardAccumulators[_strategies[i]] = _rewardAccumulators[i];
        }
    }

    function getNextCycleRewards(ERC20 strategy)
        internal
        override
        returns (uint192)
    {
        address rewardAccumulator = rewardAccumulators[address(strategy)];
        uint256 rewardAmount = rewardToken.balanceOf(rewardAccumulator);
        if (rewardAmount != 0) {
            rewardToken.safeTransferFrom(
                rewardAccumulator,
                address(this),
                rewardAmount
            );
        }
        return uint192(rewardAmount);
    }
}
