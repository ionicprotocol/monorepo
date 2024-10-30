// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "../IStakeWallet.sol";
import "../IStakeStrategy.sol";
import "./IVeloIonModeStaking.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title VeloIonModeStakingModeReward
 * @notice Staking interface for usage in veION when staking Velodrome ION-MODE-5050 LP.
 * @dev This contract allows staking and claiming rewards with a specific staking strategy.
 * @dev The staking strategy is set during contract deployment and can only be called by the strategy.
 * @dev The contract is designed to be used with the Velodrome ION-MODE-5050 LP token.
 * @dev The contract is authored by Jourdan Dunkley <jourdan@ionic.money>.
 */
contract VelodromeStakingWallet is IStakeWallet {
  using SafeERC20 for IERC20;
  IStakeStrategy public stakeStrategy;

  modifier onlyStakeStrategy() {
    require(msg.sender == address(stakeStrategy), "Not authorized: Only stake strategy can call this function");
    _;
  }

  constructor(IStakeStrategy _stakeStrategy) {
    stakeStrategy = _stakeStrategy;
  }

  /**
   * @inheritdoc IStakeWallet
   */
  function stake(address /* _from */, uint256 _amount, bytes memory /* _data */) external override onlyStakeStrategy {
    IERC20 stakingToken = IERC20(stakeStrategy.stakingToken());
    IVeloIonModeStaking stakingContract = IVeloIonModeStaking(stakeStrategy.stakingContract());

    stakingToken.safeTransferFrom(msg.sender, address(this), _amount);
    stakingToken.approve(address(stakingContract), _amount);
    stakingContract.deposit(_amount);
  }

  /**
   * @notice Claims rewards for the caller.
   */
  function claim(address _from) external onlyStakeStrategy {
    IERC20 rewardToken = IERC20(stakeStrategy.rewardToken());
    IVeloIonModeStaking stakingContract = IVeloIonModeStaking(stakeStrategy.stakingContract());

    stakingContract.getReward(address(this));
    uint256 rewardAmount = rewardToken.balanceOf(address(this));
    IERC20(rewardToken).safeTransfer(_from, rewardAmount);
  }

  /**
   * @notice Withdraws a specified amount of staked tokens.
   * @param _withdrawTo The address of the user withdrawing the tokens.
   * @param _amount The amount of tokens to withdraw.
   */
  function withdraw(address _withdrawTo, uint256 _amount) external onlyStakeStrategy {
    IERC20 stakingToken = IERC20(stakeStrategy.stakingToken());
    IVeloIonModeStaking stakingContract = IVeloIonModeStaking(stakeStrategy.stakingContract());

    stakingContract.withdraw(_amount);
    stakingToken.safeTransfer(_withdrawTo, _amount);
  }
}
