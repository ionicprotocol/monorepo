import { ethers } from 'ethers';
import CTOKEN_ABI from '../abi/CToken.json';
import FLYWHEEL_ABI from '../abi/FlywheelCore.json';
import { flywheels } from '../assets';
import { config, supabase, SupportedChains } from '../config';

const updateFlywheelData = async (chainId: SupportedChains, rpcUrl: string) => {
  try {
    const provider = new ethers.providers.StaticJsonRpcProvider(rpcUrl);
    const supportedFlywheels = flywheels[chainId];

    for (const flywheel of supportedFlywheels) {
      const flywheelContract = new ethers.Contract(flywheel, FLYWHEEL_ABI, provider);
      // Naming is misleading, strategies => enabled markets
      const strategies = await flywheelContract.getAllStrategies();
      for (const strategy of strategies) {
        try {
          const marketContract = new ethers.Contract(strategy, CTOKEN_ABI, provider);

          const [state, rewardToken, totalSupply, underlyingAsset, pluginAddress] =
            await Promise.all([
              flywheelContract.callStatic.strategyState(strategy),
              flywheelContract.callStatic.rewardToken(),
              marketContract.callStatic.totalSupply(),
              marketContract.callStatic.underlying(),
              marketContract.callStatic.plugin(),
            ]);
          // console.log({
          //   state,
          //   rewardToken,
          //   totalSupply,
          //   underlyingAsset,
          //   pluginAddress,
          // });

          const index = state['index'];

          const { error } = await supabase.from(config.supabaseFlywheelTableName).insert([
            {
              totalAssets: index.toString(),
              totalSupply: totalSupply.toString(),
              rewardAddress: rewardToken.toLowerCase(),
              pluginAddress: pluginAddress.toLowerCase(),
              underlyingAddress: underlyingAsset.toLowerCase(),
              chain: chainId,
            },
          ]);
          if (error) {
            throw `Error occurred during saving data for flywheel's plugin ${pluginAddress}: ${error.message}`;
          } else {
            console.log(`Successfully saved data for flywheel's plugin ${pluginAddress}`);
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
};

export default updateFlywheelData;
