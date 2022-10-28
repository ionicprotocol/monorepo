export interface AbstractReward {
  apy: number;
  updated_at: string;
}

export interface FlywheelReward extends AbstractReward {
  token: string;
  flywheel: string;
}

export interface ShareReward extends AbstractReward {}

export type Reward = FlywheelReward | ShareReward;
export type Rewards = Array<Reward>;
