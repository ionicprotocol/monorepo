// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

import "../IStakeStrategy.sol";
import "./VeloAeroStakingWallet.sol";
import "./IVeloIonModeStaking.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Ownable2StepUpgradeable } from "openzeppelin-contracts-upgradeable/contracts/access/Ownable2StepUpgradeable.sol";
import { BeaconProxy } from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import { UpgradeableBeacon } from "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

/**
 * @title VeloAeroStakingStrategy
 * @notice Staking interface for usage in veION when staking Velodrome/Aerodrome style LP.
 * @author Jourdan Dunkley <jourdan@ionic.money> (https://github.com/jourdanDunkley)
 */
contract VeloAeroStakingStrategy is IStakeStrategy, Ownable2StepUpgradeable {
  using SafeERC20 for IERC20;
  using Clones for address;

  /// @notice Address of the escrow responsible for managing staking operations
  address public escrow;
  /// @notice Address of the token being staked
  address public stakingToken;
  /// @notice Address of the contract where staking operations are executed
  address public stakingContract;
  /// @notice Address of beacon contract that manages wallet proxies
  UpgradeableBeacon public veloAeroBeacon;
  /// @notice Mapping of user addresses to their respective staking wallet addresses
  mapping(address => address) public userStakingWallet;

  /// @dev Modifier to restrict function access to only the escrow address
  modifier onlyEscrow() {
    require(msg.sender == escrow, "Not authorized: Only escrow can call this function");
    _;
  }

  constructor() {
    _disableInitializers(); // Locks the implementation contract from being initialized
  }

  /**
   * @notice Initializes the staking strategy contract with necessary parameters
   * @dev This function can only be called once due to the initializer modifier
   * @param _escrow The address of the escrow responsible for staking operations
   * @param _stakingToken The address of the token to be staked
   * @param _stakingContract The address of the contract handling staking
   * @param _stakingWalletImplementation The address of the staking wallet implementation
   */
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

    veloAeroBeacon = new UpgradeableBeacon(_stakingWalletImplementation);
    veloAeroBeacon.transferOwnership(msg.sender);

    emit Initialized(_escrow, _stakingToken, _stakingContract, _stakingWalletImplementation);
  }

  /// @inheritdoc IStakeStrategy
  function stake(address _from, uint256 _amount, bytes memory _data) external override onlyEscrow {
    IERC20(stakingToken).safeTransferFrom(msg.sender, address(this), _amount);

    address veloWallet = userStakingWallet[_from];
    if (veloWallet == address(0)) {
      BeaconProxy newWallet = new BeaconProxy(address(veloAeroBeacon), "");
      veloWallet = address(newWallet);
      VeloAeroStakingWallet(veloWallet).initialize(IStakeStrategy(address(this)));
      userStakingWallet[_from] = veloWallet;
    }

    IERC20(stakingToken).approve(veloWallet, _amount);
    VeloAeroStakingWallet(veloWallet).stake(_from, _amount, _data);
    emit Staked(_from, _amount, veloWallet);
  }

  /// @inheritdoc IStakeStrategy
  function claim(address _from) external onlyEscrow {
    VeloAeroStakingWallet veloWallet = VeloAeroStakingWallet(userStakingWallet[_from]);
    veloWallet.claim(_from);
    emit Claimed(_from, address(veloWallet));
  }

  /// @inheritdoc IStakeStrategy
  function withdraw(address _owner, address _withdrawTo, uint256 _amount) external onlyEscrow {
    VeloAeroStakingWallet veloWallet = VeloAeroStakingWallet(userStakingWallet[_owner]);
    veloWallet.withdraw(_withdrawTo, _amount);
    emit Withdrawn(_owner, _withdrawTo, _amount);
  }

  /// @inheritdoc IStakeStrategy
  function transferStakingWallet(address _from, address _to, uint256 _amount) external onlyEscrow {
    address fromWallet = userStakingWallet[_from];
    address toWallet = userStakingWallet[_to];

    if (toWallet == address(0)) {
      BeaconProxy newWallet = new BeaconProxy(address(veloAeroBeacon), "");
      toWallet = address(newWallet);
      VeloAeroStakingWallet(toWallet).initialize(IStakeStrategy(address(this)));
      userStakingWallet[_to] = toWallet;
    }

    VeloAeroStakingWallet(fromWallet).withdraw(address(this), _amount);
    IERC20(stakingToken).approve(address(toWallet), _amount);
    VeloAeroStakingWallet(toWallet).stake(_to, _amount, "");
    emit StakingWalletTransferred(_from, _to, _amount);
  }

  /// @inheritdoc IStakeStrategy
  function rewardRate() external view override returns (uint256) {
    return IVeloIonModeStaking(stakingContract).rewardRate();
  }

  /// @inheritdoc IStakeStrategy
  function periodFinish() external view override returns (uint256) {
    return IVeloIonModeStaking(stakingContract).periodFinish();
  }

  /// @inheritdoc IStakeStrategy
  function balanceOf(address account) public view override returns (uint256) {
    return IVeloIonModeStaking(stakingContract).balanceOf(account);
  }

  /// @inheritdoc IStakeStrategy
  function totalSupply() external view override returns (uint256) {
    return IVeloIonModeStaking(stakingContract).totalSupply();
  }

  /// @inheritdoc IStakeStrategy
  function rewardToken() public view returns (address) {
    return IVeloIonModeStaking(stakingContract).rewardToken();
  }

  /// @inheritdoc IStakeStrategy
  function setEscrow(address _escrow) external onlyOwner {
    require(_escrow != address(0), "Invalid address");
    escrow = _escrow;
    emit EscrowSet(_escrow);
  }

  /// @inheritdoc IStakeStrategy
  function setStakingToken(address _stakingToken) external onlyOwner {
    require(_stakingToken != address(0), "Invalid address");
    stakingToken = _stakingToken;
    emit StakingTokenSet(_stakingToken);
  }

  /// @inheritdoc IStakeStrategy
  function setStakingContract(address _stakingContract) external onlyOwner {
    require(_stakingContract != address(0), "Invalid address");
    stakingContract = _stakingContract;
    emit StakingContractSet(_stakingContract);
  }

  /// @inheritdoc IStakeStrategy
  function setUpgradeableBeacon(address _beacon) external onlyOwner {
    require(_beacon != address(0), "Invalid address");
    veloAeroBeacon = UpgradeableBeacon(_beacon);
    emit UpgradeableBeaconSet(_beacon);
  }
}
