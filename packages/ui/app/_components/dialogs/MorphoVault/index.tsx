import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { base } from 'viem/chains';
import { useChainId } from 'wagmi';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@ui/components/ui/tabs';
import { useMorphoProtocol } from '@ui/hooks/earn/useMorphoProtocol';
import { SupplyTab } from './tabs/SupplyTab';
import { WithdrawTab } from './tabs/WithdrawTab';

interface MorphoDialogProps {
  asset: string[];
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export function MorphoDialog({ asset, isOpen, setIsOpen }: MorphoDialogProps) {
  const [maxWithdraw, setMaxWithdraw] = useState<bigint>(BigInt(0));
  const { getMaxWithdraw, isLoading, isConnected } = useMorphoProtocol();

  const assetSymbol = asset[0] as 'USDC' | 'WETH';

  const fetchMaxWithdraw = useCallback(async () => {
    if (isConnected && !isLoading) {
      const max = await getMaxWithdraw(assetSymbol);
      setMaxWithdraw(max);
    }
  }, [isConnected, isLoading, assetSymbol, getMaxWithdraw]);

  useEffect(() => {
    fetchMaxWithdraw();
  }, [fetchMaxWithdraw]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        setIsOpen?.(val);
      }}
    >
      <DialogContent
        maxWidth="500px"
        className="bg-grayUnselect p-4"
        fullWidth
      >
        <DialogHeader>
          <DialogTitle>
            <div className="flex w-20 mx-auto relative text-center">
              <Image
                alt="modlogo"
                className="mx-auto"
                height={32}
                src={`/img/symbols/32/color/${asset[0]?.toLowerCase()}.png`}
                width={32}
              />
            </div>
          </DialogTitle>
        </DialogHeader>
        <Tabs
          defaultValue="supply"
          className="p-1"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="supply">Supply</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>
          <TabsContent
            value="supply"
            className="p-1"
          >
            <SupplyTab
              assetSymbol={assetSymbol}
              onSuccess={fetchMaxWithdraw}
            />
          </TabsContent>
          <TabsContent
            value="withdraw"
            className="p-1"
          >
            <WithdrawTab
              assetSymbol={assetSymbol}
              maxWithdraw={maxWithdraw}
              onSuccess={fetchMaxWithdraw}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
