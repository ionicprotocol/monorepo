// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "./IStakeStrategy.sol";
import "./IStakingRewards.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract VeloIonModeStakingModeReward is IStakeStrategy {
  /**
   * @notice Stakes a specified amount of tokens according to the strategy.
   * @param _from The address from which the tokens are staked.
   * @param _amount The amount of tokens to stake.
   */
  function stake(address _from, uint256 _amount, bytes memory /* _data */) external override {
    IERC20 token = IERC20(0x690A74d2eC0175a69C0962B309E03021C0b5002E); // Address of the token to be staked
    token.approve(0x8EE410cC13948e7e684ebACb36b552e2c2A125fC, _amount);
    IStakingRewards(0x8EE410cC13948e7e684ebACb36b552e2c2A125fC).deposit(_amount, _from);
  }
}
