import { Reward, Strategy, ThenaERC4626Plugin } from '@midas-capital/types';
import { functionsAlert } from '../../../alert';
import { AbstractPluginAPYProvider, APYProviderInitObject } from './AbstractPluginAPYProvider';
import { Contract, utils } from 'ethers';
import { chainIdToConfig } from '@midas-capital/chains';
import { SupportedChains } from '@midas-capital/types';
import { MidasSdk } from '@midas-capital/sdk';
import { JsonRpcProvider } from '@ethersproject/providers';
import { assetSymbols } from '@midas-capital/types';

const VOTER_V3_ADDRESS = '0x3A1D0952809F4948d15EBCe8d345962A282C4fCb';
const SECONDS_IN_A_DAY = 86400;
const DAYS_IN_A_YEAR = 365;

class ThenaAPYProvider extends AbstractPluginAPYProvider {
  private provider: APYProviderInitObject['provider'] | undefined;
  private chainId: SupportedChains | undefined;

  async init(initObj: APYProviderInitObject) {
    this.provider = initObj.provider;
    this.chainId = initObj.chainId;
  }

  async getApy(pluginAddress: string, pluginData: ThenaERC4626Plugin): Promise<Reward[]> {
    if (pluginData.strategy != Strategy.ThenaERC4626)
      throw `ThenaAPYProvider: Not a Thena Plugin ${pluginAddress}`;

    if (this.chainId === undefined) {
      throw 'ThenaAPYProvider: ChainId Not initialized';
    }

    const config = chainIdToConfig[this.chainId];
    const theAsset = config.assets.find((asset) => asset.symbol === assetSymbols.THE);

    if (!theAsset) {
      throw 'ThenaAPYProvider: THE asset is not defined in supported assets list';
    }

    const voterV3Contract = new Contract(
      VOTER_V3_ADDRESS,
      ['function gauges(address pool) view returns (address)'],
      this.provider
    );
    const gaugeAddress = await voterV3Contract.callStatic.gauges(pluginData.underlying);

    const gaugeV2Contract = new Contract(
      gaugeAddress,
      [
        'function rewardRate() external view returns (uint256)',
        'function totalSupply() external view returns (uint256)',
      ],
      this.provider
    );

    const sdk = new MidasSdk(
      new JsonRpcProvider(config.specificParams.metadata.rpcUrls.default.http[0]),
      config
    );
    const mpo = sdk.createMasterPriceOracle();
    const flywheelContract = sdk.createMidasFlywheel(pluginData.flywheel, sdk.provider);

    const [theUsdPriceBig, lpTokenUsdPriceBig, rewardRateBig, totalSupplyBig, rewardToken] = await Promise.all([
      mpo.callStatic.price(theAsset.underlying),
      mpo.callStatic.price(pluginData.underlying),
      gaugeV2Contract.callStatic.rewardRate(),
      gaugeV2Contract.callStatic.totalSupply(),
      flywheelContract.callStatic.rewardToken()
    ]);
    const rewardRate = Number(utils.formatUnits(rewardRateBig));
    const totalSupply = Number(utils.formatUnits(totalSupplyBig));

    const theUsdPrice = Number(utils.formatUnits(theUsdPriceBig));
    const lpTokenUsdPrice = Number(utils.formatUnits(lpTokenUsdPriceBig));

    const lpVaule = lpTokenUsdPrice * totalSupply;
    const totTheInYear = rewardRate * SECONDS_IN_A_DAY * DAYS_IN_A_YEAR;
    const totUsdDistributedInYear = totTheInYear * theUsdPrice;
    const apy = totUsdDistributedInYear / lpVaule;

    if (apy === 0) {
      await functionsAlert(`ThenaAPYProvider: ${pluginAddress}`, 'APY of Plugin is 0');
    }

    return [
      {
        apy: apy,
        plugin: pluginAddress,
        flywheel: pluginData.flywheel,
        token: rewardToken,
        updated_at: new Date().toISOString(),
      },
    ];
  }
}

export default new ThenaAPYProvider();
