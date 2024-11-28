// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "../IStakeStrategy.sol";
import "./VeloAeroStakingWallet.sol";
import "./IVeloIonModeStaking.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import { Ownable2StepUpgradeable } from "openzeppelin-contracts-upgradeable/contracts/access/Ownable2StepUpgradeable.sol";

/**
 * @title VeloAeroStakingStrategy
 * @notice Staking interface for usage in veION when staking Velodrome ION-MODE-5050 LP.
 * @author Jourdan Dunkley <jourdan@ionic.money> (https://github.com/jourdanDunkley)
 */
contract VeloAeroStakingStrategy is IStakeStrategy, Ownable2StepUpgradeable {
  using Clones for address;

  address public escrow;
  address public stakingToken;
  address public stakingContract;
  address public stakingWalletImplementation;
  mapping(address => address) public userStakingWallet;

  modifier onlyEscrow() {
    require(msg.sender == escrow, "Not authorized: Only escrow can call this function");
    _;
  }

  function initialize(
    address _escrow,
    address _stakingToken,
    address _stakingContract,
    address _stakingWalletImplementation
  ) public initializer {
    __Ownable2Step_init();
    escrow = _escrow;
    stakingToken = _stakingToken;
    stakingContract = _stakingContract;
    stakingWalletImplementation = _stakingWalletImplementation;
  }

  /**
   * @inheritdoc IStakeStrategy
   */
  function stake(address _from, uint256 _amount, bytes memory _data) external override onlyEscrow {
    IERC20(stakingToken).transferFrom(msg.sender, address(this), _amount);

    address veloWallet = userStakingWallet[_from];
    if (veloWallet == address(0)) {
      veloWallet = stakingWalletImplementation.clone();
      VeloAeroStakingWallet(veloWallet).initialize(IStakeStrategy(address(this)));
      userStakingWallet[_from] = veloWallet;
    }

    IERC20(stakingToken).approve(veloWallet, _amount);
    VeloAeroStakingWallet(veloWallet).stake(_from, _amount, _data);
  }

  /**
   * @notice Claims rewards for the caller.
   */
  function claim(address _from) external onlyEscrow {
    VeloAeroStakingWallet veloWallet = VeloAeroStakingWallet(userStakingWallet[_from]);
    veloWallet.claim(_from);
  }

  /**
   * @notice Withdraws staked tokens for the caller.
   * @param _owner The address of the user withdrawing the tokens.
   * @param _amount The amount of tokens to withdraw.
   */
  function withdraw(address _owner, address _withdrawTo, uint256 _amount) external onlyEscrow {
    VeloAeroStakingWallet veloWallet = VeloAeroStakingWallet(userStakingWallet[_owner]);
    veloWallet.withdraw(_withdrawTo, _amount);
  }

  /**
   * @notice Transfers the staking wallet from one owner to another.
   * @param _from The current owner of the staking wallet.
   * @param _to The new owner of the staking wallet.
   */
  function transferStakingWallet(address _from, address _to, uint256 _amount) external onlyEscrow {
    address fromWallet = userStakingWallet[_from];
    address toWallet = userStakingWallet[_to];

    if (toWallet == address(0)) {
      toWallet = stakingWalletImplementation.clone();
      VeloAeroStakingWallet(toWallet).initialize(IStakeStrategy(address(this)));
      userStakingWallet[_to] = toWallet;
    }

    VeloAeroStakingWallet(fromWallet).withdraw(address(this), _amount);
    IERC20(stakingToken).approve(address(toWallet), _amount);
    VeloAeroStakingWallet(toWallet).stake(_to, _amount, "");
  }

  /**
   * @inheritdoc IStakeStrategy
   */
  function rewardRate() external view override returns (uint256) {
    return IVeloIonModeStaking(stakingContract).rewardRate();
  }

  /**
   * @inheritdoc IStakeStrategy
   */
  function periodFinish() external view override returns (uint256) {
    return IVeloIonModeStaking(stakingContract).periodFinish();
  }

  /**
   * @inheritdoc IStakeStrategy
   */
  function balanceOf(address account) public view override returns (uint256) {
    return IVeloIonModeStaking(stakingContract).balanceOf(account);
  }

  /**
   * @inheritdoc IStakeStrategy
   */
  function totalSupply() external view override returns (uint256) {
    return IVeloIonModeStaking(stakingContract).totalSupply();
  }

  /**
   * @inheritdoc IStakeStrategy
   */
  function rewardToken() public view returns (address) {
    return IVeloIonModeStaking(stakingContract).rewardToken();
  }

  function setEscrow(address _escrow) external onlyOwner {
    require(_escrow != address(0), "Invalid address");
    escrow = _escrow;
  }

  function setStakingToken(address _stakingToken) external onlyOwner {
    require(_stakingToken != address(0), "Invalid address");
    stakingToken = _stakingToken;
  }

  function setStakingContract(address _stakingContract) external onlyOwner {
    require(_stakingContract != address(0), "Invalid address");
    stakingContract = _stakingContract;
  }

  function setStakingWalletImplementation(address _stakingWalletImplementation) external onlyOwner {
    require(_stakingWalletImplementation != address(0), "Invalid address");
    stakingWalletImplementation = _stakingWalletImplementation;
  }
}
