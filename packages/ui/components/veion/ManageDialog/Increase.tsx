import { useState } from 'react';

import { useAccount } from 'wagmi';

import CustomTooltip from '@ui/components/CustomTooltip';
import MaxDeposit from '@ui/components/MaxDeposit';
import TransactionButton from '@ui/components/TransactionButton';
import { Separator } from '@ui/components/ui/separator';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useVeIONManage } from '@ui/hooks/veion/useVeIONManage';
import { getToken } from '@ui/utils/getStakingTokens';

export function Increase() {
  const { selectedManagePosition } = useVeIONContext();
  const chain = Number(selectedManagePosition?.chainId);
  const { handleIncrease, tokenValue } = useVeIONManage(Number(chain));
  const { address } = useAccount();
  const token = getToken(chain);

  const [amount, setAmount] = useState<string>('');

  const onIncrease = async () => {
    try {
      const success = await handleIncrease(+amount);
      if (success) {
        setAmount('');
      }
      return { success };
    } catch (error) {
      console.error('Transaction failed:', error);
      return { success: false };
    }
  };

  return (
    <div className="flex flex-col gap-y-2 py-2 px-3">
      <MaxDeposit
        headerText={'Lock Amount'}
        max={String(tokenValue)}
        amount={amount}
        tokenName={chain === 34443 ? 'ion/mode' : 'ion/eth'}
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
        <p>{selectedManagePosition?.votingPower.toFixed(5)} veION</p>
      </div>
      <div className="flex w-full items-center justify-between text-xs text-white/50">
        <div className="flex items-center gap-2">
          LP <CustomTooltip content="Info regarding the locked BLP." />
        </div>
        <p>{selectedManagePosition?.lockedBLP.amount}</p>
      </div>

      <TransactionButton
        onSubmit={onIncrease}
        isDisabled={amount === '0' || !address || !amount}
        buttonText="Increase Locked Amount"
        targetChainId={chain}
      />
    </div>
  );
}
