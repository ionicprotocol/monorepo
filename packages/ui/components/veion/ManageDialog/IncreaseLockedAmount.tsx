import { formatEther } from 'viem';
import { useAccount, useBalance } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import { Separator } from '@ui/components/ui/separator';
import { toast } from '@ui/hooks/use-toast';
import { useVeIONManage } from '@ui/hooks/veion/useVeIONManage';
import { getAvailableStakingToken, getToken } from '@ui/utils/getStakingTokens';

import CustomTooltip from '../../CustomTooltip';
import MaxDeposit from '../../MaxDeposit';
import { usePrecisionSlider, PrecisionSlider } from '../../PrecisionSlider';

type IncreaseLockedAmountProps = {
  chain: string;
};

export function IncreaseLockedAmount({ chain }: IncreaseLockedAmountProps) {
  const { increaseAmount, isPending } = useVeIONManage(Number(chain));

  const utilizationMarks = [0, 25, 50, 75, 100];
  const token = getToken(+chain);
  const { address } = useAccount();

  const tokenAddress = getAvailableStakingToken(+chain, 'eth');

  const { data: tokenBalance } = useBalance({
    address,
    token: tokenAddress,
    chainId: +chain,
    query: {
      notifyOnChangeProps: ['data', 'error']
    }
  });

  const tokenValue = Number(formatEther((tokenBalance?.value || 0) as bigint));

  const {
    amount: veionAmount,
    percentage: sliderValue,
    handleAmountChange: handleInputChange,
    handlePercentageChange: handleSliderChange
  } = usePrecisionSlider({ maxValue: tokenValue });

  const handleIncrease = () => {
    if (!address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet',
        variant: 'destructive'
      });
      return;
    }

    increaseAmount({
      tokenAddress: tokenAddress as `0x${string}`,
      tokenId: tokenAddress,
      amount: veionAmount,
      tokenDecimals: tokenBalance?.decimals || 18
    });
  };

  return (
    <div className="flex flex-col gap-y-2 py-2 px-3">
      <MaxDeposit
        headerText={'Lock Amount'}
        max={String(tokenValue)}
        amount={String(veionAmount)}
        tokenName={'ion/eth LP'}
        token={token}
        handleInput={(val?: string) => handleInputChange(Number(val || 0))}
        chain={+chain}
      />
      <div className="w-full mx-auto mt-3 mb-5">
        <PrecisionSlider
          value={sliderValue}
          onChange={handleSliderChange}
          marks={utilizationMarks}
        />
      </div>
      <Separator className="bg-white/10 my-4" />

      <div className="flex w-full items-center justify-between text-xs text-white/50">
        <div className="flex items-center gap-2">
          VOTING POWER
          <CustomTooltip content="Your voting power diminishes each day closer to the end of the token lock period." />
        </div>
        <p>{tokenValue.toFixed(3)} veIon</p>
      </div>
      <div className="flex w-full items-center justify-between text-xs text-white/50">
        <div className="flex items-center gap-2">
          LP <CustomTooltip content="Info regarding the locked BLP." />
        </div>
        <p>{tokenValue.toFixed(3)} veIon</p>
      </div>
      <Button
        className="w-full bg-accent text-black mt-4"
        onClick={handleIncrease}
        disabled={isPending || !veionAmount || !address}
      >
        {isPending ? 'Increasing...' : 'Increase Locked Amount'}
      </Button>
    </div>
  );
}
