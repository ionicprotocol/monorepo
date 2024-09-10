// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "./IStakeStrategy.sol";
import "./IStakingRewards.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title VeloIonModeStakingModeReward
 * @notice Staking interface for usage in veION when staking Velodrome ION-MODE-5050 LP.
 * @author Jourdan Dunkley <jourdan@ionic.money> (https://github.com/jourdanDunkley)
 */
contract VeloIonModeStakingModeReward is IStakeStrategy {
  /**
   * @inheritdoc IStakeStrategy
   */
  function stake(address /* _from */, uint256 _amount, bytes memory /* _data */) external override {
    IERC20 token = IERC20(0x690A74d2eC0175a69C0962B309E03021C0b5002E); // Address of the token to be staked
    token.approve(0x8EE410cC13948e7e684ebACb36b552e2c2A125fC, _amount);
    IStakingRewards(0x8EE410cC13948e7e684ebACb36b552e2c2A125fC).deposit(_amount);
  }

  /**
   * @notice Claims rewards for the caller.
   */
  function claim() external {
    IStakingRewards stakingRewards = IStakingRewards(0x8EE410cC13948e7e684ebACb36b552e2c2A125fC);
    stakingRewards.getReward(address(this));
  }

  /**
   * @inheritdoc IStakeStrategy
   */
  function rewardRate() external view override returns (uint256) {
    return IStakingRewards(0x8EE410cC13948e7e684ebACb36b552e2c2A125fC).rewardRate();
  }

  /**
   * @inheritdoc IStakeStrategy
   */
  function periodFinish() external view override returns (uint256) {
    return IStakingRewards(0x8EE410cC13948e7e684ebACb36b552e2c2A125fC).periodFinish();
  }

  /**
   * @inheritdoc IStakeStrategy
   */
  function balanceOf(address account) external view override returns (uint256) {
    return IStakingRewards(0x8EE410cC13948e7e684ebACb36b552e2c2A125fC).balanceOf(account);
  }

  /**
   * @inheritdoc IStakeStrategy
   */
  function totalSupply() external view override returns (uint256) {
    return IStakingRewards(0x8EE410cC13948e7e684ebACb36b552e2c2A125fC).totalSupply();
  }

  /**
   * @inheritdoc IStakeStrategy
   */
  function rewardToken() external view returns (address) {
    return IStakingRewards(0x8EE410cC13948e7e684ebACb36b552e2c2A125fC).rewardToken();
  }
}
