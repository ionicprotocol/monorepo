import { useState, useMemo } from 'react';

import dynamic from 'next/dynamic';
import Image from 'next/image';

import { Portal } from '@radix-ui/react-portal';
import { formatEther, parseUnits, erc20Abi, parseEther } from 'viem';
import {
  useChainId,
  useAccount,
  useReadContract,
  useBalance,
  usePublicClient,
  useWalletClient
} from 'wagmi';

import { Button } from '@ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import { Separator } from '@ui/components/ui/separator';
import { useVeION } from '@ui/hooks/veion/useVeION';
import {
  getToken,
  getReservesABI,
  getReservesContract,
  getReservesArgs,
  getPoolToken,
  getSpenderContract
} from '@ui/utils/getStakingTokens';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import MaxDeposit from '../stake/MaxDeposit';

const Widget = dynamic(() => import('../stake/Widget'), {
  ssr: false
});

interface AddLiquidityDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  chain: number;
  selectedToken: 'eth' | 'mode' | 'weth';
}

export default function AddLiquidityDialog({
  isOpen,
  onOpenChange,
  chain,
  selectedToken
}: AddLiquidityDialogProps) {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const [maxDeposit, setMaxDeposit] = useState<{ ion: string; eth: string }>({
    ion: '',
    eth: ''
  });
  const [widgetPopup, setWidgetPopup] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addLiquidity } = useVeION(chainId);
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Get ION token address for the chain
  const ionTokenAddress = getToken(chain);

  // Fetch ION token balance
  const { data: ionBalance } = useBalance({
    address,
    token: ionTokenAddress,
    chainId: chain,
    query: {
      notifyOnChangeProps: ['data', 'error']
    }
  });

  // Fetch ETH/WETH balance
  const { data: ethBalance } = useBalance({
    address,
    token: selectedToken === 'eth' ? undefined : getPoolToken(selectedToken),
    chainId: chain,
    query: {
      notifyOnChangeProps: ['data', 'error']
    }
  });

  // Fetch reserves data
  const reserves = useReadContract({
    abi: getReservesABI(chain),
    address: getReservesContract(chain),
    args: getReservesArgs(chain, selectedToken),
    functionName: 'getReserves',
    chainId: chain,
    query: {
      enabled: true,
      notifyOnChangeProps: ['data', 'error'],
      placeholderData: [0n, 0n]
    }
  });

  // Calculate reserves for eth value
  function calculateReserves(ion: string, data: [bigint, bigint]) {
    if (ion && data) {
      const ethVal = (parseUnits(ion, 18) * data[1]) / data[0];
      return formatEther(ethVal);
    } else {
      return '0';
    }
  }

  // Handle reserves calculation
  useMemo(() => {
    let data: [bigint, bigint] = [0n, 0n];

    if (reserves.status === 'success' && reserves.data) {
      const resData = reserves.data as
        | [bigint, bigint, bigint]
        | [bigint, bigint];

      if (chain === 10) {
        // For Optimism, reserves are [WETH, ION], so we swap them
        data = [resData[1], resData[0]] as [bigint, bigint];
      } else {
        // For other chains, reserves are already in [ION, ETH] order
        data = resData as [bigint, bigint];
      }
    }

    if (data[0] > 0n && (maxDeposit.ion ?? '0')) {
      const deposits = calculateReserves(maxDeposit.ion, data);
      setMaxDeposit((p) => ({ ...p, eth: deposits }));
    } else {
      setMaxDeposit((p) => ({ ...p, eth: '' }));
    }
  }, [reserves.status, reserves.data, maxDeposit.ion, chain]);

  const handleAddLiquidity = async () => {
    try {
      const isSwitched = await handleSwitchOriginChain(chain, chainId);
      if (!isSwitched) return;

      if (!isConnected || !address) {
        console.warn('Wallet not connected');
        return;
      }

      const args = {
        tokenA: ionTokenAddress,
        tokenB: getPoolToken(selectedToken),
        stable: false,
        amountTokenADesired: parseUnits(maxDeposit.ion, 18),
        amounTokenAMin:
          parseEther(maxDeposit.ion) -
          (parseEther(maxDeposit.ion) * BigInt(5)) / BigInt(100),
        amountTokenBDesired: parseUnits(maxDeposit.eth, 18),
        amounTokenBMin:
          parseEther(maxDeposit.eth) -
          (parseEther(maxDeposit.eth) * BigInt(5)) / BigInt(100),
        to: address,
        deadline: Math.floor((Date.now() + 3600000) / 1000)
      };

      setIsLoading(true);

      // First approval
      const approvalA = await walletClient!.writeContract({
        abi: erc20Abi,
        account: walletClient?.account,
        address: args.tokenA,
        args: [getSpenderContract(chain), args.amountTokenADesired],
        functionName: 'approve'
      });

      await publicClient?.waitForTransactionReceipt({
        hash: approvalA
      });

      if (selectedToken !== 'eth') {
        const approvalB = await walletClient!.writeContract({
          abi: erc20Abi,
          account: walletClient?.account,
          address: args.tokenB,
          args: [getSpenderContract(chain), args.amountTokenBDesired],
          functionName: 'approve'
        });
        await publicClient?.waitForTransactionReceipt({
          hash: approvalB
        });
      }

      // Call veION contract's addLiquidity
      await addLiquidity({
        tokenAmount: maxDeposit.ion,
        tokenBAmount: maxDeposit.eth,
        selectedToken
      });

      setMaxDeposit({ ion: '', eth: '' });
    } catch (err) {
      console.warn(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => !widgetPopup && onOpenChange(open)}
      >
        <DialogContent className="bg-[#1C1D1F] sm:max-w-[425px] p-6">
          {/* Buy ION Token Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-semibold">Get</span>
                <div className="w-8 h-8 relative">
                  <Image
                    src="/img/symbols/32/color/ion.png"
                    alt="ION"
                    className="rounded-full"
                    fill
                    sizes="(max-width: 32px) 100vw"
                    priority
                  />
                </div>
                <span className="text-2xl font-semibold">ION Token</span>
              </div>
            </div>

            <Button
              variant="default"
              className="w-full bg-green-400 hover:bg-green-500 text-black font-semibold h-10"
              onClick={() => setWidgetPopup(true)}
            >
              Buy ION Token
            </Button>
          </div>

          <Separator className="my-6 bg-gray-800" />

          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Add ION Liquidity
              </DialogTitle>
            </DialogHeader>

            <MaxDeposit
              headerText="DEPOSIT"
              max={ionBalance ? formatEther(ionBalance.value) : '0'}
              amount={maxDeposit.ion}
              tokenName="ion"
              token={ionTokenAddress}
              handleInput={(val?: string) =>
                setMaxDeposit((prev) => ({ ...prev, ion: val || '' }))
              }
              chain={chain}
            />

            <MaxDeposit
              headerText="DEPOSIT"
              max={ethBalance ? formatEther(ethBalance.value) : '0'}
              amount={maxDeposit.eth}
              tokenName={selectedToken}
              token={getPoolToken(selectedToken)}
              chain={chain}
            />

            <Button
              variant="default"
              className="w-full bg-green-400 hover:bg-green-500 text-black font-semibold h-10"
              onClick={handleAddLiquidity}
              disabled={
                !isConnected || !maxDeposit.ion || !maxDeposit.eth || isLoading
              }
            >
              {isLoading ? 'Adding Liquidity...' : 'Provide Liquidity'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Portal>
        <Widget
          close={() => setWidgetPopup(false)}
          open={widgetPopup}
          chain={chain}
        />
      </Portal>
    </>
  );
}
