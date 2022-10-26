import { AbstractPlugin } from '@midas-capital/types';

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

export abstract class AbstractAPYProvider {
  abstract init(): Promise<void>;
  abstract getApy(pluginAddress: string, pluginData: AbstractPlugin): Promise<Rewards>;
}
