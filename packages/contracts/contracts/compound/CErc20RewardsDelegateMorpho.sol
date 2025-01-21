// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "./CErc20RewardsDelegate.sol";

contract CErc20RewardsDelegateMorpho is CErc20RewardsDelegate {
  event RewardsClaimedAndSet(address indexed account, address indexed reward, uint256 claimedAmount);

  /**
   * @notice Claims the reward tokens from the Morpho contract and forwards them to the FlywheelRewards contract.
   * @param rewardToken The reward strategy for which the rewards are being claimed.
   * @param claimable The amount of tokens to claim and forward.
   * @param proof The proof required to validate the claim.
   * @dev Only callable by the governance.
   */
  function claim(address rewardToken, uint256 claimable, bytes32[] memory proof) external {
    uint256 claimedAmount = IMorphoClaim(morphoURD).claim(address(this), rewardToken, claimable, proof);
    EIP20Interface(rewardToken).transfer(comptroller.admin(), claimedAmount);
    emit RewardsClaimedAndSet(address(this), rewardToken, claimedAmount);
  }
}

interface IMorphoClaim {
  function claim(
    address account,
    address reward,
    uint256 claimable,
    bytes32[] memory proof
  ) external returns (uint256 amount);
}
