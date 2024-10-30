// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "../IStakeStrategy.sol";
import "./VelodromeStakingWallet.sol";
import "./IVeloIonModeStaking.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

/**
 * @title VeloIonModeStakingStrategy
 * @notice Staking interface for usage in veION when staking Velodrome ION-MODE-5050 LP.
 * @author Jourdan Dunkley <jourdan@ionic.money> (https://github.com/jourdanDunkley)
 */
contract VeloIonModeStakingStrategy is IStakeStrategy, Ownable {
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

  constructor(address _escrow, address _stakingToken, address _stakingContract) {
    escrow = _escrow;
    stakingToken = _stakingToken;
    stakingContract = _stakingContract;
  }

  /**
   * @inheritdoc IStakeStrategy
   */
  function stake(address _from, uint256 _amount, bytes memory _data) external override onlyEscrow {
    IERC20(stakingToken).transferFrom(msg.sender, address(this), _amount);

    address veloWallet = userStakingWallet[_from];
    if (veloWallet == address(0)) {
      veloWallet = stakingWalletImplementation.clone();
      VelodromeStakingWallet(veloWallet).initialize(IStakeStrategy(address(this)));
      userStakingWallet[_from] = veloWallet;
    }

    IERC20(stakingToken).approve(veloWallet, _amount);
    VelodromeStakingWallet(veloWallet).stake(_from, _amount, _data);
  }

  /**
   * @notice Claims rewards for the caller.
   */
  function claim(address _from) external onlyEscrow {
    VelodromeStakingWallet veloWallet = VelodromeStakingWallet(userStakingWallet[_from]);
    veloWallet.claim(_from);
  }

  /**
   * @notice Withdraws staked tokens for the caller.
   * @param _owner The address of the user withdrawing the tokens.
   * @param _amount The amount of tokens to withdraw.
   */
  function withdraw(address _owner, address _withdrawTo, uint256 _amount) external onlyEscrow {
    VelodromeStakingWallet veloWallet = VelodromeStakingWallet(userStakingWallet[_owner]);
    veloWallet.withdraw(_withdrawTo, _amount);
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
  function balanceOf(address account) external view override returns (uint256) {
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
