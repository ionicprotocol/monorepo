export interface AbstractReward {
  apy?: number;
  updated_at: string;
}

export interface PluginReward extends AbstractReward {
  plugin: string;
}

export function isPluginReward(reward: any): reward is PluginReward {
  return reward.plugin !== undefined;
}

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

export interface FlywheelReward extends AbstractReward {
  token: string;
  flywheel: string;
}

export function isFlywheelReward(reward: any): reward is FlywheelReward {
  return reward.flywheel !== undefined && reward.token === undefined;
}

export function isPluginWithFlywheelReward(reward: any): reward is PluginWithFlywheelReward {
  return reward.flywheel !== undefined && reward.token !== undefined;
}

export type Reward = PluginReward | PluginWithFlywheelReward | FlywheelReward | AssetReward;
