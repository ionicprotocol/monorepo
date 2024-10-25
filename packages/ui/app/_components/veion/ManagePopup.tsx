'use client';

import { useEffect, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { useChainId } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import { Input } from '@ui/components/ui/input';
import { Separator } from '@ui/components/ui/separator';
import { getToken } from '@ui/utils/getStakingTokens';

import AutoLock from './AutoLock';
import InfoPopover from './InfoPopover';
import LockDuration from './LockDuration';
import SliderComponent from '../popup/Slider';
import MaxDeposit from '../stake/MaxDeposit';
import Toggle from '../Toggle';

interface ManagePopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ManagePopup({
  isOpen,
  onOpenChange
}: ManagePopupProps) {
  const toggleArr = [
    'Increase',
    'Extend',
    'Delegate',
    'Merge',
    'Split',
    'Transfer'
  ];
  const maxtoken = '100'; // This will change in future

  const chainId = useChainId();
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const chain = querychain ? querychain : String(chainId);
  const [activeManageToggle, setActiveManageToggle] = useState<string>(
    toggleArr[0]
  );

  const [increaseVeionAmount, setIncreaseVeionAmount] = useState<string>('');
  const [extendDuration, setExtendDuration] = useState<string>('');
  const [delegateAddress, setDelegateAddress] = useState<string>('');
  const [splitTokenInto, setSplitTokenInto] = useState<number>(2);

  const [autoLock, setAutoLock] = useState<boolean>(false);
  const [utilization, setUtilization] = useState<number>(0);
  const [transferAddress, setTransferAddress] = useState<string>('');

  const [splitValuesArr, setSplitValuesArr] = useState(
    Array(splitTokenInto).fill(0)
  );

  // eslint-disable-next-line no-console
  console.log(extendDuration, delegateAddress, transferAddress);

  useEffect(() => {
    setUtilization(
      Number(((+increaseVeionAmount / Number(maxtoken)) * 100).toFixed(0)) || 0
    );
  }, [increaseVeionAmount]);

  const handleSubmit = () => {
    const result = splitValuesArr.map((value, index) => ({
      veionTokenNumber: index + 1,
      splitAmount: value
    }));

    // eslint-disable-next-line no-console
    console.log(result);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="bg-grayone border border-grayUnselect sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage veION #12</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 text-xs mb-3">
          <span className="text-white/50">Voting Power: 20.00 veION</span>
          <span className="text-white/50">Locked Until: 28 Aug 2023</span>
        </div>

        <div className="bg-graylite rounded-md my-3">
          <Toggle
            setActiveToggle={(val) => setActiveManageToggle(val)}
            arrText={toggleArr}
          />
        </div>

        {activeManageToggle === 'Increase' && (
          <div className="flex flex-col gap-y-2 py-2 px-3">
            <MaxDeposit
              headerText={'Lock Amount'}
              max={maxtoken}
              amount={increaseVeionAmount}
              tokenName={'ion/eth LP'}
              token={getToken(+chain)}
              handleInput={(val?: string) => {
                if (val !== undefined) {
                  setIncreaseVeionAmount(val);
                }
              }}
              chain={+chain}
            />
            <SliderComponent
              currentUtilizationPercentage={utilization}
              handleUtilization={(val?: number) => {
                if (!val) return;
                const veionval = (Number(val) / 100) * Number(maxtoken);
                setIncreaseVeionAmount(veionval.toString());
              }}
            />
            <div className="flex w-full items-center justify-between text-xs text-white/50">
              <div>
                VOTING POWER{' '}
                <InfoPopover content="Your voting power diminishes each day closer to the end of the token lock period." />
              </div>
              <p>0.00 veIon</p>
            </div>
            <div className="flex w-full items-center justify-between text-xs text-white/50">
              <div>
                LP <InfoPopover content="Info regarding the locked BLP." />
              </div>
              <p>67.90 veIon</p>
            </div>
            <Button className="w-full bg-accent text-black mt-4">
              Increase Locked Amount
            </Button>
          </div>
        )}

        {activeManageToggle === 'Extend' && (
          <div className="flex flex-col gap-y-2 py-2 px-3">
            <LockDuration setLockDuration={setExtendDuration} />
            <AutoLock
              autoLock={autoLock}
              setAutoLock={setAutoLock}
            />
            <Separator className="bg-white/10 my-5" />
            <div className="flex w-full items-center justify-between text-xs text-white/50">
              <div>
                VOTING POWER{' '}
                <InfoPopover content="Your voting power diminishes each day closer to the end of the token lock period." />
              </div>
              <p>0.00 veIon</p>
            </div>
            <div className="flex w-full items-center justify-between text-xs text-white/50">
              <div>
                LOCKED Until{' '}
                <InfoPopover content="Info regarding the locked BLP." />
              </div>
              <p>28 Aug 2023 &rarr; 28 Aug 2024</p>
            </div>
            <Button className="w-full bg-accent text-black mt-4">
              Extend Lock
            </Button>
          </div>
        )}

        {activeManageToggle === 'Delegate' && (
          <div className="flex flex-col gap-y-2 py-2 px-3">
            <p>Delegate Address</p>
            <Input
              placeholder="0x..."
              onChange={(e) => setDelegateAddress(e.target.value)}
            />
            <div className="border text-yellow-300 text-xs flex gap-3 rounded-md py-2 px-4 mt-2 border-yellow-300">
              <img
                alt="warn"
                className="h-5"
                src="/img/assets/warn.png"
              />
              <span>
                You may delegate your voting power to any user, without
                transferring the tokens. You may revoke it, but the user will
                still be able to vote until the end of the current voting
                period.
              </span>
            </div>
            <Button className="w-full bg-accent text-black mt-4">
              Delegate veION
            </Button>
          </div>
        )}

        {activeManageToggle === 'Merge' && (
          <div className="flex flex-col gap-y-2 py-2 px-3">
            <p className="text-[10px] text-white/50">veION</p>
            <p>#10990</p>
            <p className="text-[10px] text-white/50 mt-3">Merge To</p>
          </div>
        )}

        {activeManageToggle === 'Split' && (
          <div className="flex flex-col gap-y-2 py-2 px-3">
            <p className="text-[10px] mb-2 text-white/50">SPLIT TO</p>
            <div className="flex gap-2 text-sm">
              {[2, 3, 4].map((value) => (
                <Button
                  key={value}
                  variant={splitTokenInto === value ? 'default' : 'secondary'}
                  onClick={() => setSplitTokenInto(value)}
                >
                  {value} tokens
                </Button>
              ))}
            </div>
            {Array.from({ length: splitTokenInto }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col gap-y-2 py-2 px-3"
              >
                <p className="text-[10px] text-white/50">{index + 1} veION</p>
                <SliderComponent
                  currentUtilizationPercentage={splitValuesArr[index] || 0}
                  handleUtilization={(val?: number) => {
                    if (!val) return;
                    const updatedSplitValues = [...splitValuesArr];
                    updatedSplitValues[index] = val;
                    setSplitValuesArr(updatedSplitValues);
                  }}
                />
              </div>
            ))}
            <Button
              onClick={handleSubmit}
              className="w-full bg-accent text-black mt-4"
            >
              Split
            </Button>
          </div>
        )}

        {activeManageToggle === 'Transfer' && (
          <div className="flex flex-col gap-y-2 py-2 px-3">
            <p className="text-[10px] mb-2 text-white/50">TRANSFER ADDRESS</p>
            <Input
              placeholder="0x..."
              onChange={(e) => setTransferAddress(e.target.value)}
            />
            <div className="border text-yellow-300 text-xs flex gap-3 rounded-md py-2 px-4 mt-2 border-yellow-300">
              <img
                alt="warn"
                className="h-5"
                src="/img/assets/warn.png"
              />
              <span>
                Once you transfer the tokens, you lose access to them
                irrevocably.
              </span>
            </div>
            <Button className="w-full bg-accent text-black mt-4">
              Transfer veION
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
