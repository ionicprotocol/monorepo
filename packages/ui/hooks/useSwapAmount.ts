import { useQuery } from '@tanstack/react-query';
import { type BigNumber, constants } from 'ethers';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export interface SwapTokenType {
  underlyingDecimals: BigNumber;
  underlyingSymbol: string;
  underlyingToken: string;
}

export function useSwapAmount(
  inputToken?: string,
  amount?: BigNumber,
  outputToken?: string,
  balance?: BigNumber | null
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
        currentSdk &&
        inputToken &&
        amount?.gt(constants.Zero) &&
        outputToken &&
        address &&
        balance &&
        balance.gte(amount)
      ) {
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
