// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity 0.8.10;

import {ERC20, ERC4626} from "solmate/mixins/ERC4626.sol";
import {SafeTransferLib} from "solmate/utils/SafeTransferLib.sol";

import {RewardsClaimer} from "../../utils/RewardsClaimer.sol";

// Staking Contract reference: https://github.com/alchemix-finance/alchemix-protocol/blob/master/contracts/StakingPools.sol

// main Alchemix staking contract basic interface
interface IAlchemixStaking {
    // deposit into Alchemix staking
    function deposit(uint256 _pid, uint256 _amount) external;

    // withdraw from Alchemix staking
    function withdraw(uint256 _pid, uint256 _amount) external;

    // claim Alchemix staking rewards
    function claim(uint256 _pid) external;

    // get Alchemix staking (pool id + 1) for underlying
    function tokenPoolIds(address _token) external returns (uint256 _pid);

    function getStakeTotalDeposited(address _account, uint256 _pid)
        external
        view
        returns (uint256);
}

/// @title Alchemix Finance Staking Yield Bearing Vault
/// @author joeysantoro
contract AlchemixERC4626 is ERC4626, RewardsClaimer {
    using SafeTransferLib for ERC20;

    /// @notice The Alchemix staking contract (for deposit/withdraw)
    IAlchemixStaking public immutable staking;

    uint256 public immutable pid;

    /**
     @notice Creates a new Vault that accepts a specific underlying token.
     @param _asset The ERC20 compliant token the Vault should accept.
     @param _name The name for the vault token.
     @param _symbol The symbol for the vault token.
     @param _staking The Alchemix Staking contract.
     @param _rewardsDestination the address to send ALCX rewards.
     @param _rewardTokens the rewards tokens to send out.
    */
    constructor(
        ERC20 _asset,
        string memory _name,
        string memory _symbol,
        IAlchemixStaking _staking,
        address _rewardsDestination,
        ERC20[] memory _rewardTokens
    )
        ERC4626(_asset, _name, _symbol)
        RewardsClaimer(_rewardsDestination, _rewardTokens)
    {
        staking = _staking;

        // function returns pid + 1
        pid = staking.tokenPoolIds(address(asset)) - 1;

        _asset.safeApprove(address(_staking), type(uint256).max);
    }

    function afterDeposit(uint256 amount, uint256) internal override {
        staking.deposit(pid, amount);
    }

    function beforeWithdraw(uint256 amount, uint256) internal override {
        staking.withdraw(pid, amount);
    }

    function beforeClaim() internal override {
        staking.claim(pid);
    }

    /// @notice Calculates the total amount of underlying tokens the Vault holds.
    /// @return The total amount of underlying tokens the Vault holds.
    function totalAssets() public view override returns (uint256) {
        return staking.getStakeTotalDeposited(address(this), pid);
    }
}
