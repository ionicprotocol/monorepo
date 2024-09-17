// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.10;

import { FlywheelDynamicRewards } from "./FlywheelDynamicRewards.sol";
import { IonicFlywheelCore } from "../IonicFlywheelCore.sol";
import { SafeTransferLib, ERC20 } from "solmate/utils/SafeTransferLib.sol";

contract VeIonicFlywheelDynamicRewards is FlywheelDynamicRewards {
    using SafeTransferLib for ERC20;

    address public owner;
    mapping(address => address) public gauges;

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    constructor(IonicFlywheelCore _flywheel, uint32 _cycleLength)
        FlywheelDynamicRewards(_flywheel, _cycleLength)
    {
        owner = msg.sender;
    }

    function setGauges(address[] memory _strategies, address[] memory _gauges) external onlyOwner {
        uint256 _length = _strategies.length;
        require(_gauges.length == _length, "parameters");
        for (uint256 i = 0; i < _length; i++) {
            gauges[_strategies[i]] = _gauges[i];
        }
    }

    function getNextCycleRewards(ERC20 strategy)
        internal
        override
        returns (uint192)
    {
        address gauge = gauges[address(strategy)];
        uint256 rewardAmount = rewardToken.balanceOf(gauge);
        if (rewardAmount != 0) {
            rewardToken.safeTransferFrom(
                gauge,
                address(this),
                rewardAmount
            );
        }
        return uint192(rewardAmount);
    }
}
