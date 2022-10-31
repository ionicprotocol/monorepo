import { AbstractPlugin, Reward } from '@midas-capital/types';
export abstract class AbstractAPYProvider {
  abstract init(): Promise<void>;
  abstract getApy(pluginAddress: string, pluginData: AbstractPlugin): Promise<Reward[]>;
}
