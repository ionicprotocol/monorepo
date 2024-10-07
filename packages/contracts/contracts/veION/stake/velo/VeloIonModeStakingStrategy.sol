// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "../IStakeStrategy.sol";
import "./VelodromeStakingWallet.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title VeloIonModeStakingStrategy
 * @notice Staking interface for usage in veION when staking Velodrome ION-MODE-5050 LP.
 * @author Jourdan Dunkley <jourdan@ionic.money> (https://github.com/jourdanDunkley)
 */
contract VeloIonModeStakingStrategy is IStakeStrategy {
  address public escrow;
  address public stakingToken;
  IVeloIonModeStaking public stakingContract;
  mapping(address => address) public userStakingWallet;

  modifier onlyEscrow() {
    require(msg.sender == escrow, "Not authorized: Only escrow can call this function");
    _;
  }

  constructor(address _escrow, address _stakingToken, IVeloIonModeStaking _stakingContract) {
    escrow = _escrow;
    stakingToken = _stakingToken;
    stakingContract = _stakingContract;
  }

  /**
   * @inheritdoc IStakeStrategy
   */
  function stake(address _from, uint256 _amount, bytes memory _data) external override onlyEscrow {
    IERC20(stakingToken).transferFrom(msg.sender, address(this), _amount);
    VelodromeStakingWallet veloWallet = new VelodromeStakingWallet(address(this));
    IERC20(stakingToken).approve(address(veloWallet), _amount);
    veloWallet.stake(_from, _amount, _data);
    userStakingWallet[_from] = address(veloWallet);
  }

  /**
   * @notice Claims rewards for the caller.
   */
  function claim(address _from) external onlyEscrow {
    VelodromeStakingWallet veloWallet = VelodromeStakingWallet(userStakingWallet[_from]);
    veloWallet.claim(_from);
  }

  /**
   * @inheritdoc IStakeStrategy
   */
  function rewardRate() external view override returns (uint256) {
    return stakingContract.rewardRate();
  }

  /**
   * @inheritdoc IStakeStrategy
   */
  function periodFinish() external view override returns (uint256) {
    return stakingContract.periodFinish();
  }

  /**
   * @inheritdoc IStakeStrategy
   */
  function balanceOf(address account) external view override returns (uint256) {
    return stakingContract.balanceOf(account);
  }

  /**
   * @inheritdoc IStakeStrategy
   */
  function totalSupply() external view override returns (uint256) {
    return stakingContract.totalSupply();
  }

  /**
   * @inheritdoc IStakeStrategy
   */
  function rewardToken() public view returns (address) {
    return stakingContract.rewardToken();
  }
}
