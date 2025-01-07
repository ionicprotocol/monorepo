# Fuse Flywheel

The Fuse-specific compatibility modules to add flywheel v2 to the existing Fuse comptroller.

The `FuseFlywheelCore` is just a wrapper around FlywheelCore with all transfer hooks and identifiers overloaded for backward compatibility.

## Adding Flywheel to Fuse

1. Deploy `FuseFlywheelCore` and configure with desired `rewardToken`, `rewards` and `booster` modules. If the rewards and booster need to reference core, set to 0 initially on core. After deploying, use the setter functions to re-point core to them.
2. Add the flywheel by calling `comptroller._addRewardsDistributor(flywheelCore)` on the Fuse pool Comptroller.
3. Ensure that the desired markets are added on the flywheel core by calling `strategy.addStrategyForRewards(market)`
4. Make sure the rewards module is configured and seeded with `rewardToken` if needed.

### Using the optional plugin rewards modules

Plugin rewards modules pass incentives through from Fuse strategies or other sources back to depositors via flywheel.
A great example is the [Convex Fuse Pool](https://app.rari.capital/fuse/pool/156)

If the rewards are sent straight to depositors, for example by merkle drop, use the [CERC20RewardsDelegate](https://github.com/Rari-Capital/compound-protocol/blob/fuse-plugin-4626/contracts/CErc20RewardsDelegate.sol) to approve the `flywheelRewards` module for each `rewardToken`

If the rewards come from an ERC-4626 plugin strategy, use the [CERC20PluginRewardsDelegate](https://github.com/Rari-Capital/compound-protocol/blob/fuse-plugin-4626/contracts/CErc20PluginRewardsDelegate.sol) to approve the `flywheelRewards` module for each `rewardToken`. This should be upgraded from a [CERC20PluginDelegate](https://github.com/Rari-Capital/compound-protocol/blob/fuse-plugin-4626/contracts/CErc20PluginDelegate.sol).

Because approvals are cumulative and remain active on the proxy until used, this process can be repeated by applying iterative `_becomeImplementation` calls on the same RewardsDelegate to add support for multiple flywheels and reward tokens.

---

Powered by [forge-template](https://github.com/FrankieIsLost/forge-template)
