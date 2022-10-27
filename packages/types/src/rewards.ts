export interface AbstractReward {
  apy: number;
}

export interface FlywheelReward extends AbstractReward {
  token: string;
  flywheel: string;
}

export interface ShareReward extends AbstractReward {}

export type Reward = FlywheelReward | ShareReward;
export type Rewards = Array<Reward>;
