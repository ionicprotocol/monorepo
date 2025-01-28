import { useState } from 'react';

import { formatEther } from 'viem';
import { useAccount, useBalance } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import { Separator } from '@ui/components/ui/separator';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useVeIONManage } from '@ui/hooks/veion/useVeIONManage';
import { getAvailableStakingToken, getToken } from '@ui/utils/getStakingTokens';

import CustomTooltip from '../../CustomTooltip';
import MaxDeposit from '../../MaxDeposit';

type IncreaseProps = {
  chain: string;
};

export function Increase({ chain }: IncreaseProps) {
  const { increaseAmount, isPending } = useVeIONManage(Number(chain));
  const { selectedManagePosition } = useVeIONContext();

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

  const handleIncrease = async () => {
    if (!address || !selectedManagePosition) return;

    await increaseAmount({
      tokenAddress: tokenAddress as `0x${string}`,
      tokenId: +selectedManagePosition.id,
      amount: +amount,
      tokenDecimals: tokenBalance?.decimals || 18
    });
  };

  const [amount, setAmount] = useState<string>('');

  return (
    <div className="flex flex-col gap-y-2 py-2 px-3">
      <MaxDeposit
        headerText={'Lock Amount'}
        max={String(tokenValue)}
        amount={amount}
        tokenName={'ion/eth'}
        token={token}
        handleInput={(val) => setAmount(val || '0')}
        chain={+chain}
        showUtilizationSlider
      />
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
        disabled={isPending || amount === '0' || !address}
      >
        {isPending ? 'Increasing...' : 'Increase Locked Amount'}
      </Button>
    </div>
  );
}
