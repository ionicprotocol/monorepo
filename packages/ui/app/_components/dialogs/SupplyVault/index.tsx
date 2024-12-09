import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { formatUnits } from 'viem';
import { useBalance } from 'wagmi';
import { Button } from '@ui/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@ui/components/ui/card';
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
import type { VaultRowData } from '@ui/hooks/market/useSupplyVaults';
import { WithdrawTab } from './tabs/WithdrawTab';
import { SupplyTab } from './tabs/SupplyTab';

interface SupplyVaultDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedVaultData: VaultRowData;
  chainId: number;
}

export default function SupplyVaultDialog({
  isOpen,
  setIsOpen,
  selectedVaultData,
  chainId
}: SupplyVaultDialogProps) {
  const [activeTab, setActiveTab] = useState('supply');

  useEffect(() => {
    if (!isOpen) {
      setActiveTab('supply');
    }
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogContent
        maxWidth="800px"
        className="bg-grayUnselect"
        fullWidth
      >
        <DialogHeader>
          <button
            onClick={() => setIsOpen(false)}
            className="absolute left-4 top-4"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <DialogTitle className="text-center">
            {activeTab === 'supply' ? 'Supply' : 'Withdraw'}{' '}
            {selectedVaultData.asset}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <Tabs
            defaultValue="supply"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="supply">Supply</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            </TabsList>

            <TabsContent value="supply">
              <SupplyTab
                selectedVaultData={selectedVaultData}
                chainId={chainId}
              />
            </TabsContent>

            <TabsContent value="withdraw">
              <WithdrawTab
                selectedVaultData={selectedVaultData}
                chainId={chainId}
              />
            </TabsContent>
          </Tabs>

          <Card className="bg-darkthree border-none">
            <CardHeader>
              <CardTitle className="text-lg">Strategy Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>SUPPLY ASSET</span>
                <div className="flex items-center gap-2">
                  <Image
                    src={`/img/symbols/32/color/${selectedVaultData.asset.toLowerCase()}.png`}
                    alt={selectedVaultData.asset}
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                  <span>{selectedVaultData.underlyingSymbol}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span>APR</span>
                <span>4.49%</span>
              </div>
              <div className="flex justify-between">
                <span>TOTAL SUPPLY</span>
                <span>$582,462.04</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
