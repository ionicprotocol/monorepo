import { useEffect, useState } from 'react';

import Image from 'next/image';

import { ArrowLeft } from 'lucide-react';

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

import { SupplyTab } from './tabs/SupplyTab';
import { WithdrawTab } from './tabs/WithdrawTab';

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
        className="bg-grayone"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
