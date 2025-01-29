import { parseUnits, erc20Abi, formatEther } from 'viem';
import {
  useAccount,
  usePublicClient,
  useWalletClient,
  useBalance
} from 'wagmi';

import { getVeIonContract } from '@ui/constants/veIon';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { getAvailableStakingToken } from '@ui/utils/getStakingTokens';

import { useContractWrite } from '../useContractWrite';

export function useVeIONManage(chain: number) {
  const veIonContract = getVeIonContract(chain);
  const { write, isPending } = useContractWrite();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { selectedManagePosition, locks } = useVeIONContext();
  const tokenAddress = getAvailableStakingToken(chain, 'eth');

  // Token balance handling
  const { data: tokenBalance, refetch: refetchBalance } = useBalance({
    address,
    token: tokenAddress,
    chainId: chain,
    query: {
      notifyOnChangeProps: ['data', 'error']
    }
  });

  const tokenValue = Number(formatEther((tokenBalance?.value || 0n) as bigint));

  const getContractConfig = (functionName: string, args: any[]) => {
    if (!veIonContract) {
      console.error('Contract not initialized');
      throw new Error('Contract not initialized');
    }
    return {
      address: veIonContract.address,
      abi: veIonContract.abi,
      functionName,
      args
    };
  };

  const checkAllowance = async (
    tokenAddress: `0x${string}`,
    owner: `0x${string}`,
    amount: bigint
  ) => {
    if (!veIonContract) throw new Error('Contract not initialized');
    if (!publicClient) throw new Error('Public client not initialized');

    const allowance = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [owner, veIonContract.address]
    });

    return allowance >= amount;
  };

  async function increaseAmount({
    tokenAddress,
    tokenId,
    amount,
    tokenDecimals
  }: {
    tokenAddress: `0x${string}`;
    tokenId: number;
    amount: number;
    tokenDecimals: number;
  }) {
    if (address && publicClient && walletClient) {
      const parsedAmount = parseUnits(String(amount), tokenDecimals);

      const hasAllowance = await checkAllowance(
        tokenAddress,
        address,
        parsedAmount
      );

      if (!hasAllowance) {
        const approvalTx = await walletClient.writeContract({
          abi: erc20Abi,
          account: walletClient.account,
          address: tokenAddress,
          args: [veIonContract.address, parsedAmount],
          functionName: 'approve'
        });

        await publicClient.waitForTransactionReceipt({ hash: approvalTx });
      }

      return write(
        getContractConfig('increaseAmount', [
          tokenAddress,
          BigInt(tokenId),
          parsedAmount,
          true
        ]),
        {
          successMessage: 'Successfully increased locked amount',
          errorMessage: 'Failed to increase locked amount'
        }
      );
    }
  }

  function extendLock({
    tokenId,
    lockDuration
  }: {
    tokenId: number;
    lockDuration: number;
  }) {
    return write(
      getContractConfig('increaseUnlockTime', [
        tokenAddress,
        BigInt(tokenId),
        BigInt(lockDuration)
      ]),
      {
        successMessage: 'Successfully extended lock duration',
        errorMessage: 'Failed to extend lock duration'
      }
    );
  }

  function delegate({
    fromTokenId,
    toTokenId,
    lpToken,
    amount
  }: {
    fromTokenId: number;
    toTokenId: number;
    lpToken: `0x${string}`;
    amount: bigint;
  }) {
    return write(
      getContractConfig('delegate', [fromTokenId, toTokenId, lpToken, amount]),
      {
        successMessage: 'Successfully delegated voting power',
        errorMessage: 'Failed to delegate voting power'
      }
    );
  }

  function merge({
    fromTokenId,
    toTokenId
  }: {
    fromTokenId: string;
    toTokenId: string;
  }) {
    return write(getContractConfig('merge', [fromTokenId, toTokenId]), {
      successMessage: 'Successfully merged positions',
      errorMessage: 'Failed to merge positions'
    });
  }

  function split({ from, amount }: { from: number; amount: bigint }) {
    const config = getContractConfig('split', [
      tokenAddress,
      BigInt(from),
      amount
    ]);

    return write(config, {
      successMessage: 'Successfully split veION position',
      errorMessage: 'Failed to split veION position'
    });
  }

  function transfer({
    from,
    to,
    tokenId
  }: {
    from: `0x${string}`;
    to: `0x${string}`;
    tokenId: number;
  }) {
    return write(getContractConfig('transferFrom', [from, to, tokenId]), {
      successMessage: 'Successfully transferred veION',
      errorMessage: 'Failed to transfer veION'
    });
  }

  type Position = {
    id: string;
    amount: string;
    isPermanent: boolean;
  };

  async function getOwnedTokenIds(
    ownerAddress: `0x${string}`
  ): Promise<Position[]> {
    if (!publicClient || !veIonContract) {
      throw new Error('Client or contract not initialized');
    }

    try {
      const tokenIds = await publicClient.readContract({
        address: veIonContract.address,
        abi: veIonContract.abi,
        functionName: 'getOwnedTokenIds',
        args: [ownerAddress]
      });

      const positions = await Promise.all(
        tokenIds.map(async (id) => {
          const [assets, balances, boosts] = await publicClient.readContract({
            address: veIonContract.address,
            abi: veIonContract.abi,
            functionName: 'balanceOfNFT',
            args: [id]
          });

          const lockInfo = await publicClient.readContract({
            address: veIonContract.address,
            abi: veIonContract.abi,
            functionName: 's_locked',
            args: [id, 2]
          });

          const tokenIndex = assets.findIndex(
            (asset: string) =>
              asset.toLowerCase() === tokenAddress?.toLowerCase()
          );

          return {
            id: id.toString(),
            amount: tokenIndex !== -1 ? balances[tokenIndex].toString() : '0',
            isPermanent: lockInfo.isPermanent
          };
        })
      );

      return positions;
    } catch (error) {
      console.error('Error fetching owned token IDs:', error);
      throw error;
    }
  }

  function withdraw({ tokenId }: { tokenId: number }) {
    return write(
      getContractConfig('withdraw', [tokenAddress, BigInt(tokenId)]),
      {
        successMessage: 'Successfully withdrew veION',
        errorMessage: 'Failed to withdraw veION'
      }
    );
  }

  function unlockPermanent({ tokenId }: { tokenId: number }) {
    return write(
      getContractConfig('unlockPermanent', [tokenAddress, BigInt(tokenId)]),
      {
        successMessage: 'Successfully unlocked veION',
        errorMessage: 'Failed to unlock veION'
      }
    );
  }

  function lockPermanent({ tokenId }: { tokenId: number }) {
    return write(
      getContractConfig('lockPermanent', [tokenAddress, BigInt(tokenId)]),
      {
        successMessage: 'Successfully locked veION',
        errorMessage: 'Failed to lock veION'
      }
    );
  }

  // handlers

  async function handleIncrease(amount: number) {
    if (!address || !selectedManagePosition || !tokenBalance) return;

    try {
      await increaseAmount({
        tokenAddress: tokenAddress as `0x${string}`,
        tokenId: +selectedManagePosition.id,
        amount: amount,
        tokenDecimals: tokenBalance.decimals || 18
      });

      await Promise.all([locks.refetch?.(), refetchBalance()]);
      return true;
    } catch (error) {
      console.error('Error increasing amount:', error);
      return false;
    }
  }

  async function handleExtend({ lockDuration }: { lockDuration: number }) {
    if (!address || !selectedManagePosition) return false;

    try {
      await extendLock({
        tokenId: +selectedManagePosition.id,
        lockDuration
      });

      await locks.refetch?.();
      return true;
    } catch (error) {
      console.error('Error extending lock:', error);
      return false;
    }
  }

  async function handleMerge({ toTokenId }: { toTokenId: string }) {
    if (!address || !selectedManagePosition) return false;

    try {
      await merge({
        fromTokenId: selectedManagePosition.id,
        toTokenId
      });

      await locks.refetch?.();
      return true;
    } catch (error) {
      console.error('Error merging positions:', error);
      return false;
    }
  }

  async function handleSplit({
    from,
    amount
  }: {
    from: number;
    amount: bigint;
  }) {
    if (!address) return false;

    try {
      await split({ from, amount });
      await locks.refetch?.();
      return true;
    } catch (error) {
      console.error('Error splitting position:', error);
      return false;
    }
  }

  async function handleTransfer({ to }: { to: `0x${string}` }) {
    if (!address || !selectedManagePosition) return false;

    try {
      await transfer({
        from: address,
        to,
        tokenId: +selectedManagePosition.id
      });
      await locks.refetch?.();
      return true;
    } catch (error) {
      console.error('Error transferring position:', error);
      return false;
    }
  }

  async function handleUnlockPermanent() {
    if (!address || !selectedManagePosition) return false;

    try {
      await unlockPermanent({
        tokenId: +selectedManagePosition.id
      });
      await locks.refetch?.();
      return true;
    } catch (error) {
      console.error('Error unlocking permanent position:', error);
      return false;
    }
  }

  async function handleLockPermanent() {
    if (!address || !selectedManagePosition) return false;

    try {
      await lockPermanent({
        tokenId: +selectedManagePosition.id
      });
      await locks.refetch?.();
      return true;
    } catch (error) {
      console.error('Error locking permanent position:', error);
      return false;
    }
  }

  async function handleWithdraw() {
    if (!address || !selectedManagePosition) return false;

    try {
      await withdraw({
        tokenId: +selectedManagePosition.id
      });
      await locks.refetch?.();
      return true;
    } catch (error) {
      console.error('Error withdrawing position:', error);
      return false;
    }
  }

  async function handleDelegate({
    toTokenId,
    amount
  }: {
    toTokenId: number;
    amount: bigint;
  }) {
    if (!address || !selectedManagePosition || !tokenAddress) return false;

    try {
      await delegate({
        fromTokenId: +selectedManagePosition.id,
        toTokenId,
        lpToken: tokenAddress as `0x${string}`,
        amount
      });
      await locks.refetch?.();
      return true;
    } catch (error) {
      console.error('Error delegating position:', error);
      return false;
    }
  }

  return {
    getOwnedTokenIds,
    tokenValue,
    // handlers
    handleIncrease,
    handleExtend,
    handleMerge,
    handleSplit,
    handleTransfer,
    handleUnlockPermanent,
    handleLockPermanent,
    handleWithdraw,
    handleDelegate
  };
}
