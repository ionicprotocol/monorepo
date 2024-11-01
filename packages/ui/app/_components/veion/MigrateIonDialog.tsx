import { useState, useMemo } from 'react';

import Image from 'next/image';

import { formatEther } from 'viem';
import { base, optimism, mode } from 'viem/chains';
import { useChainId, useAccount, useBalance } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import { Separator } from '@ui/components/ui/separator';
import { useVeION } from '@ui/hooks/veion/useVeION';
import { getAvailableStakingToken } from '@ui/utils/getStakingTokens';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import NetworkDropdown from '../NetworkDropdown';
import SliderComponent from '../popup/Slider';
import MaxDeposit from '../stake/MaxDeposit';

interface MigrateIonDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  chain: string;
}

export default function MigrateIonDialog({
  isOpen,
  onOpenChange,
  chain
}: MigrateIonDialogProps) {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const [maxWithdrawl, setMaxWithdrawl] = useState<{
    ion: string;
    eth: string;
  }>({
    ion: '',
    eth: ''
  });
  const [utilization, setUtilization] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const { removeLiquidity, isPending } = useVeION(+chain);

  const stakingTokenAddress = getAvailableStakingToken(+chain, 'eth');

  const { data: withdrawalMaxToken } = useBalance({
    address,
    token: stakingTokenAddress,
    chainId: +chain,
    query: {
      notifyOnChangeProps: ['data', 'error']
    }
  });

  useMemo(() => {
    if (!maxWithdrawl.ion || !withdrawalMaxToken) return;
    const percent =
      (+maxWithdrawl.ion / Number(formatEther(withdrawalMaxToken.value))) * 100;
    setUtilization(Number(percent.toFixed(0)));
  }, [maxWithdrawl.ion, withdrawalMaxToken]);

  const handleWithdraw = async () => {
    try {
      const isSwitched = await handleSwitchOriginChain(+chain, chainId);
      if (!isSwitched) return;
      if (!isConnected) {
        console.warn('Wallet not connected');
        return;
      }

      setIsLoading(true);
      await removeLiquidity({
        liquidity: maxWithdrawl.ion,
        selectedToken: 'eth'
      });

      setMaxWithdrawl({ ion: '', eth: '' });
      setUtilization(0);
    } catch (err) {
      console.warn(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="bg-grayUnselect sm:max-w-[425px]">
        <DialogHeader className="flex flex-row items-center">
          <DialogTitle className="flex items-center gap-4">
            <p>Withdraw ION Liquidity</p>
            <NetworkDropdown
              dropdownSelectedChain={+chain}
              nopool
              enabledChains={[mode.id, base.id, optimism.id]}
            />
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <MaxDeposit
            headerText="WITHDRAW"
            max={
              withdrawalMaxToken ? formatEther(withdrawalMaxToken.value) : '0'
            }
            amount={maxWithdrawl.ion}
            tokenName="ion/eth"
            token={stakingTokenAddress}
            handleInput={(val?: string) =>
              setMaxWithdrawl((p) => ({
                ...p,
                ion: val || ''
              }))
            }
            chain={+chain}
          />

          <div className="my-6 w-[95%] mx-auto">
            <SliderComponent
              currentUtilizationPercentage={Number(utilization.toFixed(0))}
              handleUtilization={(val?: number) => {
                if (!val || !isConnected || !withdrawalMaxToken) return;
                const ionval =
                  (Number(val) / 100) *
                  Number(formatEther(withdrawalMaxToken.value));
                setMaxWithdrawl((p) => ({
                  ...p,
                  ion: ionval.toString()
                }));
              }}
            />
          </div>

          <Separator className="bg-white/10" />

          <div>
            <div className="flex w-full mt-2 items-center justify-between text-[11px] text-white/40">
              <span>AVAILABLE LP</span>
              <div>
                ION/ETH Balance:{' '}
                {withdrawalMaxToken
                  ? Number(
                      formatEther(withdrawalMaxToken.value)
                    ).toLocaleString('en-US', {
                      maximumFractionDigits: 6
                    })
                  : '0.0'}
              </div>
            </div>
            <div className="flex max-w-full mt-2 items-center justify-between text-md gap-x-1">
              <input
                className="focus:outline-none amount-field font-bold bg-transparent disabled:text-white/60 flex-auto flex w-full truncate"
                placeholder="0.0"
                type="number"
                value={maxWithdrawl.ion}
                disabled
              />
              <div className="ml-auto min-w-max px-0.5 flex items-center justify-end">
                <div className="flex items-center gap-1">
                  <div className="flex -space-x-2">
                    <Image
                      alt="ion logo"
                      className="w-5 h-5 inline-block"
                      src="/img/logo/ion.svg"
                      width={20}
                      height={20}
                      unoptimized
                    />
                    <Image
                      alt="eth logo"
                      className="w-5 h-5 inline-block"
                      src="/img/symbols/32/color/eth.png"
                      width={20}
                      height={20}
                      unoptimized
                    />
                  </div>
                  <span>ION/ETH</span>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleWithdraw}
            className="w-full bg-red-500 text-white hover:bg-red-600"
            disabled={
              !maxWithdrawl.ion ||
              Number(maxWithdrawl.ion) === 0 ||
              isLoading ||
              isPending
            }
          >
            {isLoading || isPending ? 'Withdrawing...' : 'Withdraw Liquidity'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
