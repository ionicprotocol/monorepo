import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { Address } from 'viem';

export interface SwapTokenType {
  underlyingDecimals: bigint;
  underlyingSymbol: string;
  underlyingToken: string;
}

export function useSwapAmount(
  inputToken?: Address,
  amount?: bigint,
  outputToken?: Address,
  balance?: bigint | null
) {
  const { address, currentSdk } = useMultiIonic();

  return useQuery(
    [
      'useSwapAmount',
      inputToken,
      amount,
      outputToken,
      currentSdk?.chainId,
      address
    ],
    async () => {
      if (
        amount &&
        currentSdk &&
        inputToken &&
        amount > 0n &&
        outputToken &&
        address &&
        balance &&
        balance >= amount
      ) {
        try {
          const token = currentSdk.getEIP20TokenInstance(inputToken);
          const hasApprovedEnough =
            (await token.read.allowance([
              address,
              currentSdk.chainDeployment.LiquidatorsRegistry.address as Address
            ])) >= amount;

          if (!hasApprovedEnough) {
            await currentSdk.approveLiquidatorsRegistry(inputToken);
          }

          const { outputAmount, slippage } =
            await currentSdk.getAmountOutAndSlippageOfSwap(
              inputToken,
              amount,
              outputToken
            );

          return { outputAmount, slippage };
        } catch (e) {
          console.error(
            'Could not get swap amount and slippage',
            {
              amount,
              chainId: currentSdk.chainId,
              inputToken,
              outputToken
            },
            e
          );

          console.error(JSON.stringify(e));

          return null;
        }
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled:
        !!inputToken && !!amount && !!outputToken && !!currentSdk && !!address,
      staleTime: Infinity
    }
  );
}
