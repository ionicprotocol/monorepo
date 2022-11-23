import { Reward } from '@midas-capital/types';
// import axios from 'axios';
// import { functionsAlert } from '../../../alert';
import { AbstractAssetAPYProvider } from './AbstractAssetAPYProvider';

class StakedDotAPYProvider extends AbstractAssetAPYProvider {
  async init() {}

  async getApy(assetAddress: string): Promise<Reward[]> {
    console.log(`fetching apy of ${assetAddress}`);
    return [];
  }
}

export default new StakedDotAPYProvider();
