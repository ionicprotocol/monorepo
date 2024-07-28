import { Address } from "viem";

export interface AbstractReward {
  apy?: number;
  status?: "active" | "eol" | "paused" | "unknown";
  updated_at: string;
}

export interface PluginReward extends AbstractReward {
  plugin: Address;
}

export function isPluginReward(reward: any): reward is PluginReward {
  return reward.plugin !== undefined;
}

/**
 * Rewards accrued from a plugin distributed by a flywheel
 * Flywheel with Dynamic Rewards
 */
export interface PluginWithFlywheelReward extends AbstractReward {
  plugin: Address;
  flywheel: Address;
  token: Address;
}

export interface AssetReward extends AbstractReward {
  asset: Address;
}

export function isAssetReward(reward: any): reward is AssetReward {
  return reward.asset !== undefined;
}

/**
 * Rewards from a Flywheel only, so no plugin involved,
 * i.E. liquidity mining rewards with Static Rewards
 */
export interface FlywheelReward extends AbstractReward {
  token: Address;
  flywheel: Address;
}

export function isFlywheelReward(reward: any): reward is FlywheelReward {
  return reward.flywheel !== undefined && reward.token === undefined && reward.plugin === undefined;
}

export function isPluginWithFlywheelReward(reward: any): reward is PluginWithFlywheelReward {
  return reward.flywheel !== undefined && reward.token !== undefined && reward.plugin !== undefined;
}

export type Reward = PluginReward | PluginWithFlywheelReward | FlywheelReward | AssetReward;
