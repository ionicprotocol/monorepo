// SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import "@openzeppelin-v4/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin-v4/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin-v4/contracts/token/ERC20/utils/SafeERC20.sol";

import "@adrastia-oracle/adrastia-core/contracts/interfaces/IPriceOracle.sol";

import "../access/Roles.sol";

/**
 * @title PriceManipulationBounty
 * @notice Contract for setting up and claiming bounties against price manipulation.
 */
contract PriceManipulationBounty is AccessControlEnumerable {
    using SafeERC20 for IERC20;

    /// @notice Configuration for bounty conditions.
    struct Config {
        uint112 lowerBoundPrice;
        uint112 upperBoundPrice;
        uint32 expiration;
    }

    /// @notice The record of a claim.
    struct ClaimRecord {
        address claimer;
        uint32 claimedTime;
        uint112 claimedPrice;
        uint112 rewardAmount;
    }

    /// @notice The oracle used to fetch the price.
    IPriceOracle public immutable oracle;

    /// @notice The token to be monitored for price manipulation.
    IERC20 public immutable bountyToken;

    /// @notice The token to be rewarded for claiming the bounty.
    IERC20 public immutable rewardToken;

    /// @notice The bounty configuration.
    Config public config;

    /// @notice Whether the bounty has been claimed.
    bool public claimed;

    ClaimRecord internal _claimRecord;

    /**
     * @notice Emitted when the bounty conditions are updated.
     * @param bountyToken The token to be monitored for price manipulation.
     * @param lowerBoundPrice The lower bound price.
     * @param upperBoundPrice The upper bound price.
     * @param expiration The expiration timestamp.
     */
    event BountyConditionsUpdated(
        IERC20 bountyToken,
        uint256 lowerBoundPrice,
        uint256 upperBoundPrice,
        uint256 expiration
    );

    /**
     * @notice Emitted when the bounty is claimed.
     * @param claimer The address of the claimer.
     * @param rewardToken The token rewarded for claiming the bounty.
     * @param rewardAmount The amount of the reward token that was paid out.
     * @param bountyToken The token that was monitored for price manipulation.
     * @param bountyTokenPrice The price of the bounty token at the time of the claim.
     * @param lowerBoundPrice The lower bound price.
     * @param upperBoundPrice The upper bound price.
     */
    event BountyClaimed(
        address indexed claimer,
        IERC20 rewardToken,
        uint256 rewardAmount,
        IERC20 bountyToken,
        uint256 bountyTokenPrice,
        uint256 lowerBoundPrice,
        uint256 upperBoundPrice,
        uint256 expiration
    );

    /**
     * @notice Emitted when the bounty claim fails.
     * @param claimer The address of the claimer.
     * @param bountyToken The token that was monitored for price manipulation.
     * @param bountyTokenPrice The price of the bounty token at the time of the claim.
     * @param lowerBoundPrice The lower bound price.
     * @param upperBoundPrice The upper bound price.
     */
    event BountyClaimFailed(
        address indexed claimer,
        IERC20 bountyToken,
        uint256 bountyTokenPrice,
        uint256 lowerBoundPrice,
        uint256 upperBoundPrice
    );

    /// @notice An error that is thrown if the bounty has expired yet a claim is attempted.
    error BountyExpired();

    /// @notice An error that is thrown if the bounty has already been claimed yet a claim is attempted.
    error BountyAlreadyClaimed();

    /// @notice An error that is thrown if the reward token is attempted to be recovered.
    error CannotRecoverRewardToken();

    /// @notice An error that is thrown if an invalid configuration is attempted to be set.
    error InvalidConfig();

    /**
     * @notice Constructs a new PriceManipulationBounty.
     * @param oracle_ The oracle used to fetch the price.
     * @param bountyToken_ The token to be monitored for price manipulation.
     * @param rewardToken_ The token to be rewarded for claiming the bounty.
     */
    constructor(IPriceOracle oracle_, IERC20 bountyToken_, IERC20 rewardToken_) {
        oracle = oracle_;
        bountyToken = bountyToken_;
        rewardToken = rewardToken_;

        initializeRoles();
    }

    /// @notice The address of the claimer (if the bounty has been claimed).
    /// @return The address of the claimer.
    function claimer() external view virtual returns (address) {
        return _claimRecord.claimer;
    }

    /// @notice The timestamp of the claim (if the bounty has been claimed).
    /// @return The timestamp of the claim.
    function claimedTime() external view virtual returns (uint32) {
        return _claimRecord.claimedTime;
    }

    /// @notice The price of the bounty token at the time of the claim (if the bounty has been claimed).
    /// @return The price of the bounty token at the time of the claim.
    function claimedPrice() external view virtual returns (uint112) {
        return _claimRecord.claimedPrice;
    }

    /// @notice The amount of the reward token that was paid out (if the bounty has been claimed).
    /// @return The amount of the reward token that was paid out.
    function claimedAmount() external view virtual returns (uint256) {
        return _claimRecord.rewardAmount;
    }

    /**
     * @notice Claims the bounty if the conditions are met.
     * @dev The bounty can only be claimed once.
     * @custom:throws BountyAlreadyClaimed If the bounty has already been claimed.
     * @custom:throws BountyExpired If the bounty has expired.
     */
    function claimBounty() external virtual {
        if (claimed) revert BountyAlreadyClaimed();

        uint256 expiration = config.expiration;
        if (expiration < block.timestamp) revert BountyExpired();

        uint112 lowerBoundPrice = config.lowerBoundPrice;
        uint112 upperBoundPrice = config.upperBoundPrice;

        uint112 currentPrice = oracle.consultPrice(address(bountyToken));
        if (currentPrice < lowerBoundPrice || currentPrice > upperBoundPrice) {
            claimed = true;
            uint256 rewardAmount_ = rewardToken.balanceOf(address(this));

            _claimRecord.claimer = msg.sender;
            _claimRecord.claimedTime = uint32(block.timestamp);
            _claimRecord.claimedPrice = currentPrice;
            _claimRecord.rewardAmount = uint112(rewardAmount_);

            rewardToken.safeTransfer(msg.sender, rewardAmount_);

            emit BountyClaimed(
                msg.sender,
                rewardToken,
                rewardAmount_,
                bountyToken,
                currentPrice,
                lowerBoundPrice,
                upperBoundPrice,
                expiration
            );
        } else {
            emit BountyClaimFailed(msg.sender, bountyToken, currentPrice, lowerBoundPrice, upperBoundPrice);
        }
    }

    /**
     * @notice Sets the bounty conditions. The bounty can only be claimed if the price of the bounty token is outside
     * the bounds and the current timestamp is before the expiration.
     * @dev Only accounts with the CONFIG_ADMIN role can call this function.
     * @param lowerBoundPrice The lower bound price.
     * @param upperBoundPrice The upper bound price.
     * @param expiration The expiration timestamp.
     */
    function setClaimConditions(
        uint112 lowerBoundPrice,
        uint112 upperBoundPrice,
        uint32 expiration
    ) external virtual onlyRole(Roles.CONFIG_ADMIN) {
        if (claimed) revert BountyAlreadyClaimed();
        if (lowerBoundPrice > upperBoundPrice) revert InvalidConfig();

        config.lowerBoundPrice = lowerBoundPrice;
        config.upperBoundPrice = upperBoundPrice;
        config.expiration = expiration;

        emit BountyConditionsUpdated(bountyToken, lowerBoundPrice, upperBoundPrice, expiration);
    }

    /**
     * @notice Removes the bounty and returns the reward token to the caller.
     * @dev Only accounts with the ADMIN role can call this function.
     */
    function removeBounty() external virtual onlyRole(Roles.ADMIN) {
        uint256 rewardAmount_ = rewardToken.balanceOf(address(this));
        rewardToken.safeTransfer(msg.sender, rewardAmount_);
    }

    /**
     * @notice Recovers ERC20 tokens that were accidentally sent to the contract.
     * @dev Only accounts with the ADMIN role can call this function. The reward token can only be recovered by calling
     * `removeBounty`.
     * @param tokenAddress The address of the token to recover.
     * @param tokenAmount The amount of tokens to recover.
     * @custom:throws CannotRecoverRewardToken If the reward token is attempted to be recovered.
     */
    function recoverERC20(IERC20 tokenAddress, uint256 tokenAmount) external virtual onlyRole(Roles.ADMIN) {
        if (tokenAddress == rewardToken) revert CannotRecoverRewardToken();

        tokenAddress.safeTransfer(msg.sender, tokenAmount);
    }

    /**
     * @notice Initializes the roles for the contract.
     * @dev This should only be called once and by the constructor.
     */
    function initializeRoles() internal virtual {
        // Setup admin role, setting msg.sender as admin
        _setupRole(Roles.ADMIN, msg.sender);
        _setRoleAdmin(Roles.ADMIN, Roles.ADMIN);

        // CONFIG_ADMIN is managed by ADMIN
        _setRoleAdmin(Roles.CONFIG_ADMIN, Roles.ADMIN);

        // Hierarchy:
        // ADMIN
        //   - CONFIG_ADMIN
    }
}
