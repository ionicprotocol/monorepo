export interface AbstractReward {
  apy: number;
  updated_at: string;
}

export interface FlywheelReward extends AbstractReward {
  token: string;
  flywheel: string;
}

export type ShareReward = AbstractReward;

export type Reward = ShareReward | FlywheelReward;
