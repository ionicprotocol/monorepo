import { Address, Hex } from "viem";

import { IonicSdk } from "../../IonicSdk";

export type StrategiesAndDatas = {
  strategies: Address[];
  datas: Hex[];
};

export const getRedemptionStrategiesAndDatas = async (
  sdk: IonicSdk,
  inputToken: Address,
  expectedOutputToken: Address
): Promise<[StrategiesAndDatas, string[]]> => {
  const liquidatorsRegistry = sdk.createILiquidatorsRegistry();
  const [strategies, datas] = await liquidatorsRegistry.read.getRedemptionStrategies([inputToken, expectedOutputToken]);

  return [
    {
      strategies: strategies as Address[],
      datas: datas as Hex[]
    },
    [] // TODO fix
  ];
};

export const getUniswapV2Router = (sdk: IonicSdk, asset: string): string => {
  return Object.values(sdk.chainConfig.liquidationDefaults.ASSET_SPECIFIC_ROUTER).includes(asset)
    ? sdk.chainConfig.liquidationDefaults.ASSET_SPECIFIC_ROUTER[asset]
    : sdk.chainConfig.liquidationDefaults.DEFAULT_ROUTER;
};
