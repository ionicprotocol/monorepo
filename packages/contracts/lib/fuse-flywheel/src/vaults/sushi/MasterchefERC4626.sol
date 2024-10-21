// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity 0.8.10;

import {ERC20, ERC4626} from "solmate/mixins/ERC4626.sol";
import {SafeTransferLib} from "solmate/utils/SafeTransferLib.sol";

import {RewardsClaimer} from "../../utils/RewardsClaimer.sol";

// main Masterchef contract basic interface
interface IMasterchef {
    // deposit into Masterchef staking
    function deposit(
        uint256 _pid,
        uint256 _amount,
        address _to
    ) external;

    // withdraw from Masterchef staking
    function withdraw(
        uint256 _pid,
        uint256 _amount,
        address _to
    ) external;

    // claim Masterchef staking rewards
    function harvest(uint256 _pid, address _to) external;

    function userInfo(uint256 _pid, address _account)
        external
        view
        returns (uint256, int256);

    function lpToken(uint256 _pid) external view returns (address);
}

/// @title Masterchef Staking Yield Bearing Vault
/// @author joeysantoro
contract MasterchefERC4626 is ERC4626, RewardsClaimer {
    using SafeTransferLib for ERC20;

    /// @notice The Masterchef staking contract (for deposit/withdraw)
    IMasterchef public immutable staking;

    uint256 public immutable pid;

    /**
     @notice Creates a new Vault that accepts a specific underlying token.
     @param _asset The ERC20 compliant token the Vault should accept.
     @param _name The name for the vault token.
     @param _symbol The symbol for the vault token.
     @param _staking The Masterchef Staking contract.
     @param _rewardsDestination the address to send staking rewards.
     @param _rewardTokens the rewards tokens to send out.
    */
    constructor(
        ERC20 _asset,
        string memory _name,
        string memory _symbol,
        IMasterchef _staking,
        uint256 _pid,
        address _rewardsDestination,
        ERC20[] memory _rewardTokens
    )
        ERC4626(_asset, _name, _symbol)
        RewardsClaimer(_rewardsDestination, _rewardTokens)
    {
        staking = _staking;

        require(staking.lpToken(_pid) == address(_asset), "pid != asset");
        pid = _pid;

        _asset.safeApprove(address(_staking), type(uint256).max);
    }

    function afterDeposit(uint256 amount, uint256) internal override {
        staking.deposit(pid, amount, address(this));
    }

    function beforeWithdraw(uint256 amount, uint256) internal override {
        staking.withdraw(pid, amount, address(this));
    }

    function beforeClaim() internal override {
        staking.harvest(pid, address(this));
    }

    /// @notice Calculates the total amount of underlying tokens the Vault holds.
    /// @return The total amount of underlying tokens the Vault holds.
    function totalAssets() public view override returns (uint256) {
        (uint256 amount, ) = staking.userInfo(pid, address(this));
        return amount;
    }
}
