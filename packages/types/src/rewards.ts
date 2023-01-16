export interface AbstractReward {
  apy?: number;
  status?: string;
  updated_at: string;
}

export interface PluginReward extends AbstractReward {
  plugin: string;
}

export function isPluginReward(reward: any): reward is PluginReward {
  return reward.plugin !== undefined;
}

/**
 * Rewards accrued from a plugin distributed by a flywheel
 * Flywheel with Dynamic Rewards
 */
export interface PluginWithFlywheelReward extends AbstractReward {
  plugin: string;
  flywheel: string;
  token: string;
}

export interface AssetReward extends AbstractReward {
  asset: string;
}

export function isAssetReward(reward: any): reward is AssetReward {
  return reward.asset !== undefined;
}

/**
 * Rewards from a Flywheel only, so no plugin involved,
 * i.E. liquidity mining rewards with Static Rewards
 */
export interface FlywheelReward extends AbstractReward {
  token: string;
  flywheel: string;
}

export function isFlywheelReward(reward: any): reward is FlywheelReward {
  return reward.flywheel !== undefined && reward.token === undefined && reward.plugin === undefined;
}

export function isPluginWithFlywheelReward(reward: any): reward is PluginWithFlywheelReward {
  return reward.flywheel !== undefined && reward.token !== undefined && reward.plugin !== undefined;
}

export type Reward = PluginReward | PluginWithFlywheelReward | FlywheelReward | AssetReward;
