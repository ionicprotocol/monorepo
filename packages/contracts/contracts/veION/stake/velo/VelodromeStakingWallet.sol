// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "../IStakeWallet.sol";
import "../IStakeStrategy.sol";
import "./IVeloIonModeStaking.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

/**
 * @title VelodromeStakingWallet
 * @notice Staking interface for usage in veION when staking Velodrome ION-MODE-5050 LP.
 * @dev This contract allows staking and claiming rewards with a specific staking strategy.
 * @dev The staking strategy is set during contract deployment and can only be called by the strategy.
 * @dev The contract is designed to be used with the Velodrome ION-MODE-5050 LP token.
 * @author Jourdan Dunkley <jourdan@ionic.money>
 */
contract VelodromeStakingWallet is IStakeWallet, Initializable {
  using SafeERC20 for IERC20;
  IStakeStrategy public stakeStrategy;

  /**
   * @dev Modifier to restrict function access to only the stake strategy contract
   */
  modifier onlyStakeStrategy() {
    require(msg.sender == address(stakeStrategy), "Not authorized: Only stake strategy can call this function");
    _;
  }

  /**
   * @notice Initializes the contract with a staking strategy
   * @dev Can only be called once due to initializer modifier
   * @param _stakeStrategy The address of the staking strategy contract
   */
  function initialize(IStakeStrategy _stakeStrategy) external initializer {
    stakeStrategy = _stakeStrategy;
  }

  /**
   * @notice Stakes tokens into the Velodrome staking contract
   * @dev Transfers tokens from sender to this contract and then stakes them
   * @param _amount The amount of tokens to stake
   */
  function stake(address /* _from */, uint256 _amount, bytes memory /* _data */) external override onlyStakeStrategy {
    IERC20 stakingToken = IERC20(stakeStrategy.stakingToken());
    IVeloIonModeStaking stakingContract = IVeloIonModeStaking(stakeStrategy.stakingContract());

    stakingToken.safeTransferFrom(msg.sender, address(this), _amount);
    stakingToken.approve(address(stakingContract), _amount);
    stakingContract.deposit(_amount);
  }

  /**
   * @notice Claims staking rewards from the Velodrome contract
   * @dev Claims rewards and transfers them to the specified recipient
   * @param _from The address that will receive the claimed rewards
   */
  function claim(address _from) external onlyStakeStrategy {
    IERC20 rewardToken = IERC20(stakeStrategy.rewardToken());
    IVeloIonModeStaking stakingContract = IVeloIonModeStaking(stakeStrategy.stakingContract());

    stakingContract.getReward(address(this));
    uint256 rewardAmount = rewardToken.balanceOf(address(this));
    IERC20(rewardToken).safeTransfer(_from, rewardAmount);
  }

  /**
   * @notice Withdraws staked tokens from the Velodrome contract
   * @dev Withdraws tokens and transfers them to the specified recipient
   * @param _withdrawTo The address that will receive the withdrawn tokens
   * @param _amount The amount of tokens to withdraw
   */
  function withdraw(address _withdrawTo, uint256 _amount) external onlyStakeStrategy {
    IERC20 stakingToken = IERC20(stakeStrategy.stakingToken());
    IVeloIonModeStaking stakingContract = IVeloIonModeStaking(stakeStrategy.stakingContract());

    stakingContract.withdraw(_amount);
    stakingToken.safeTransfer(_withdrawTo, _amount);
  }
}
