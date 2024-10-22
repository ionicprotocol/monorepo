'use client';

import { useState, useMemo } from 'react';

import { Button } from '@ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import { Separator } from '@ui/components/ui/separator';

import AutoLock from './AutoLock';
import DateSlider from './LockDuration';
import SliderComponent from '../popup/Slider';

interface ExtendVeionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExtendVeion({
  isOpen,
  onOpenChange
}: ExtendVeionProps) {
  const [veIonAmount, setVeIonAmount] = useState('');
  const [utilization, setUtilization] = useState(0);
  const [lockDuration, setLockDuration] = useState('');
  const [autoLock, setAutoLock] = useState(false);
  const maxtoken = 100;

  // eslint-disable-next-line no-console
  console.log('lockDuration', lockDuration);
  useMemo(() => {
    setUtilization(Number(((+veIonAmount / maxtoken) * 100).toFixed(0)) ?? 0);
  }, [veIonAmount]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="bg-grayone border border-grayUnselect sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Extend veION</DialogTitle>
        </DialogHeader>

        <div className="flex gap-5 text-xs">
          <span className="text-white/50">Voting Power: 20.00 veION</span>
          <span className="text-white/50">Locked Until: 28 Aug 2023</span>
        </div>

        <div className="space-y-4">
          <SliderComponent
            currentUtilizationPercentage={utilization}
            handleUtilization={(val?: number) => {
              if (!val) return;
              const veionval = (val / 100) * maxtoken;
              setVeIonAmount(veionval.toString());
            }}
          />
          <DateSlider setLockDuration={setLockDuration} />
          <AutoLock
            autoLock={autoLock}
            setAutoLock={setAutoLock}
          />

          <Separator className="bg-white/10" />

          <div className="space-y-2">
            <div className="text-xs flex justify-between text-white/50">
              <span>Voting Power</span>
              <span>0.00 &rarr; 120</span>
            </div>
            <div className="text-xs flex justify-between text-white/50">
              <span>Locked Until</span>
              <span>09 Sep 2023 &rarr; 09 Sep 2024</span>
            </div>
          </div>

          <Button className="w-full bg-accent text-black">Extend Lock</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
