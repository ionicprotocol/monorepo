import { updateFlyWheelData, updatePluginsData } from './controllers';

const main = async () => {
  await updatePluginsData();
  await updateFlyWheelData();
};

main();
