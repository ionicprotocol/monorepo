export interface AbstractReward {
  apy?: number;
  updated_at: string;
}

export interface FlywheelReward extends AbstractReward {
  token: string;
  flywheel?: string;
}

export interface PluginReward extends AbstractReward {
  plugin: string;
}

export interface PluginWithFlywheelReward extends AbstractReward {
  plugin: string;
  flywheel?: string;
  token: string;
}

export type Reward = PluginReward | PluginWithFlywheelReward | FlywheelReward;
