import { ethers } from 'ethers';
import FLYWHEEL_ABI from '../abi/flywheel.json';
import PLUGIN_ABI from '../abi/plugins.json';
import { flywheels } from '../assets';
import { config, supabase } from '../config';

const updateFlyWheelData = async () => {
  try {
    const provider = new ethers.providers.StaticJsonRpcProvider(config.rpcUrl);

    const supportedChain: keyof typeof flywheels = config.chain;
    const supportedFlywheels = flywheels[supportedChain] as any;

    for (const flywheel of supportedFlywheels) {
      const flywheelContract = new ethers.Contract(flywheel, FLYWHEEL_ABI, provider);
      const strategies = await flywheelContract.getAllStrategies();
      for (const strategy of strategies) {
        try {
          const pluginContract = new ethers.Contract(strategy, PLUGIN_ABI, provider);
          const state = await flywheelContract.strategyState(strategy);
          const flywheelAsset = await flywheelContract.rewardToken();
          const totalSupply = await pluginContract.totalSupply();
          const underlyingAsset = await pluginContract.asset();
          const index = state['index'];
          const pricePerShare = totalSupply ? index / totalSupply : 0;
          const { error } = await supabase.from('apy_flywheel').insert([
            {
              totalAssets: index.toString(),
              totalSupply: totalSupply.toString(),
              pricePerShare: pricePerShare.toString(),
              rewardAddress: flywheelAsset.toLowerCase(),
              pluginAddress: strategy.toLowerCase(),
              underlyingAddress: underlyingAsset.toLowerCase(),
              chain: config.chain,
            },
          ]);
          if (error) {
            console.log(
              `Error occurred during savin data for flywheel's plugin ${strategy}: ${error.message}`
            );
          } else {
            console.log(`Successfully saved data for flywheel's plugin ${strategy}`);
          }
        } catch (err) {
          console.log(err);
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
};

export default updateFlyWheelData;
