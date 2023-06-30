import { useQuery } from '@tanstack/react-query';
import { type BigNumber, constants } from 'ethers';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

export interface SwapTokenType {
  underlyingDecimals: BigNumber;
  underlyingSymbol: string;
  underlyingToken: string;
}

export function useSwapAmount(inputToken?: string, amount?: BigNumber, outputToken?: string) {
  const { address, currentSdk } = useMultiMidas();

  return useQuery<BigNumber | null>(
    ['useSwapAmount', inputToken, amount, outputToken, currentSdk?.chainId, address],
    async () => {
      if (currentSdk && inputToken && amount?.gt(constants.Zero) && outputToken && address) {
        try {
          const token = currentSdk.getEIP20TokenInstance(inputToken);
          const hasApprovedEnough = (
            await token.callStatic.allowance(
              address,
              currentSdk.chainDeployment.LiquidatorsRegistry.address
            )
          ).gte(amount);

          if (!hasApprovedEnough) {
            await currentSdk.approveLiquidatorsRegistry(inputToken);
          }

          return await currentSdk.getSwapAmount(inputToken, amount, outputToken);
        } catch (e) {
          console.error(
            'Could not get swap amount',
            { amount, chainId: currentSdk.chainId, inputToken, outputToken },
            e
          );

          return null;
        }
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled: !!inputToken && !!amount && !!outputToken && !!currentSdk && !!address,
      staleTime: Infinity,
    }
  );
}
