// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "./CErc20RewardsDelegate.sol";

contract CErc20RewardsDelegateMorpho is CErc20RewardsDelegate {
  uint256 constant MINT_WINDOW = 3 * 24 * 60 * 60;

  event RewardsClaimedAndSet(address indexed account, address indexed reward, uint256 claimedAmount);

  /**
   * @notice Claims the reward tokens from the Morpho contract and forwards them to the FlywheelRewards contract.
   * @param rewardToken The reward strategy for which the rewards are being claimed.
   * @param claimable The amount of tokens to claim and forward.
   * @param proof The proof required to validate the claim.
   * @param flywheelRewards The flywheel rewards contract to forward rewards to.
   * @dev Only callable by the governance.
   */
  function claim(address rewardToken, uint256 claimable, bytes32[] memory proof, address flywheelRewards) external {
    uint256 claimedAmount = IMorphoClaim(morphoURD).claim(address(this), rewardToken, claimable, proof);
    EIP20Interface(rewardToken).approve(flywheelRewards, claimedAmount);
    IFlywheelInstantRewards(flywheelRewards).setRewards(address(this), claimedAmount);
    ICTokenMinter(cTokenMinter).setMintWindow(block.timestamp, block.timestamp + MINT_WINDOW);
    emit RewardsClaimedAndSet(address(this), rewardToken, claimedAmount);
  }
}

interface IFlywheelInstantRewards {
  function setRewards(address _strategy, uint256 _amount) external;
}

interface IMorphoClaim {
  function claim(
    address account,
    address reward,
    uint256 claimable,
    bytes32[] memory proof
  ) external returns (uint256 amount);
}

interface ICTokenMinter {
  function setMintWindow(uint256 _newStartTime, uint256 _newEndTime) external;
}
