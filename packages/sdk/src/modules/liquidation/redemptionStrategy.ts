import { BytesLike } from "ethers";

import { IonicSdk } from "../../IonicSdk";

export type StrategiesAndDatas = {
  strategies: string[];
  datas: BytesLike[];
};

export const getRedemptionStrategiesAndDatas = async (
  sdk: IonicSdk,
  inputToken: string,
  expectedOutputToken: string
): Promise<[StrategiesAndDatas, string[]]> => {
  const liquidatorsRegistry = sdk.createILiquidatorsRegistry();
  const [strategies, datas, tokenPath] = await liquidatorsRegistry.getRedemptionStrategies(
    inputToken,
    expectedOutputToken
  );

  return [
    {
      strategies,
      datas
    },
    tokenPath
  ];
};

export const getUniswapV2Router = (sdk: IonicSdk, asset: string): string => {
  return Object.values(sdk.chainConfig.liquidationDefaults.ASSET_SPECIFIC_ROUTER).includes(asset)
    ? sdk.chainConfig.liquidationDefaults.ASSET_SPECIFIC_ROUTER[asset]
    : sdk.chainConfig.liquidationDefaults.DEFAULT_ROUTER;
};
