import { PluginData } from '@midas-capital/types';

export abstract class ExternalAPYProvider {
  abstract init(): Promise<void>;
  abstract getApy(pluginAddress: string, pluginData: PluginData): Promise<number>;
}
