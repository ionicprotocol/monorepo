import { useState } from 'react';

import Image from 'next/image';

import { base, optimism, mode } from 'viem/chains';
import { useChainId, useAccount } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import { Separator } from '@ui/components/ui/separator';
import { getToken } from '@ui/utils/getStakingTokens';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import NetworkDropdown from '../NetworkDropdown';
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
  const { isConnected } = useAccount();
  const [migrateAmount, setMigrateAmount] = useState<string>('');
  const [migratedLp] = useState<string>('0.0');
  const maxtoken = '0.00';

  async function handleMigrate() {
    try {
      const isSwitched = await handleSwitchOriginChain(+chain, chainId);
      if (!isSwitched) return;
      if (!isConnected) {
        console.warn('Wallet not connected');
        return;
      }

      // eslint-disable-next-line no-console
      console.log('Migrating:', migrateAmount);
    } catch (err) {
      console.warn(err);
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="bg-grayUnselect sm:max-w-[425px]">
        <DialogHeader className="flex flex-row items-center">
          <DialogTitle className="flex items-center gap-4">
            <p>Migrate ION Liquidity</p>
            <NetworkDropdown
              dropdownSelectedChain={+chain}
              nopool
              enabledChains={[mode.id, base.id, optimism.id]}
            />
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <MaxDeposit
            headerText="MIGRATE"
            max={maxtoken}
            amount={migrateAmount}
            tokenName="ION/WETH"
            token={getToken(+chain)}
            handleInput={(val?: string) => {
              setMigrateAmount(val || '');
            }}
            chain={+chain}
          />

          <Separator className="bg-white/10" />

          <div>
            <div className="flex w-full mt-2 items-center justify-between text-[11px] text-white/40">
              <span>MIGRATED LP</span>
              <div>ION/WETH Balance: {migratedLp}</div>
            </div>
            <div className="flex max-w-full mt-2 items-center justify-between text-md gap-x-1">
              <input
                className="focus:outline-none amount-field font-bold bg-transparent disabled:text-white/60 flex-auto flex w-full truncate"
                placeholder="0.0"
                type="number"
                value={migratedLp}
                disabled
              />
              <div className="ml-auto min-w-max px-0.5 flex items-center justify-end">
                <div className="flex items-center gap-1">
                  <div className="flex -space-x-2">
                    <Image
                      alt="ion logo"
                      className="w-5 h-5 inline-block"
                      src="/img/logo/ion.svg"
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null;
                        currentTarget.src = '/img/logo/ion.svg';
                      }}
                      width={20}
                      height={20}
                      unoptimized
                    />
                    <Image
                      alt="weth logo"
                      className="w-5 h-5 inline-block"
                      src="/img/symbols/32/color/weth.png"
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null;
                        currentTarget.src = '/img/logo/ion.svg';
                      }}
                      width={20}
                      height={20}
                      unoptimized
                    />
                  </div>
                  <span>ION/WETH</span>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleMigrate}
            className="w-full bg-[#90EDB3] text-black hover:bg-[#90EDB3]/90"
            disabled={!migrateAmount || Number(migrateAmount) === 0}
          >
            Withdraw Liquidity
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
