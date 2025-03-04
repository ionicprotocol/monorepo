'use client';

import { useState, useEffect } from 'react';

import {
  useAccount,
  useChainId,
  useWriteContract,
  useSimulateContract
} from 'wagmi';

import { Button } from '@ui/components/ui/button';
import { useToast } from '@ui/hooks/use-toast';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import { emissionsManagerAbi } from '@ionicprotocol/sdk';

// Mapping of chain IDs to emissions manager contract addresses
const EMISSIONS_MANAGER_ADDRESSES: Record<number, `0x${string}`> = {
  8453: '0x74Dd8c217C01463b915A7e62879A496b3A5c07a5', // Base
  34443: '0x2AA38965C8D37065Ed07EF7F5de6e341B4B9DAc7' // Mode
};

interface WhitelistButtonProps {
  chainId: number;
  isBlacklisted: boolean;
  onSuccess?: () => void;
}

export function WhitelistButton({
  chainId,
  isBlacklisted,
  onSuccess
}: WhitelistButtonProps) {
  const { address } = useAccount();
  const currentChainId = useChainId();
  const { writeContractAsync, isPending, isError } = useWriteContract();
  const { toast } = useToast();
  const [canWhitelist, setCanWhitelist] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const contractAddress = EMISSIONS_MANAGER_ADDRESSES[chainId];

  // Simulation data for the whitelistUser function
  const { data: simulationData, isFetching: isSimulationFetching } =
    useSimulateContract({
      address: contractAddress,
      abi: emissionsManagerAbi,
      functionName: 'whitelistUser',
      args: address ? [address] : undefined,
      chainId
    });

  // Determine if user can be whitelisted based on simulation
  useEffect(() => {
    const checkWhitelistability = async () => {
      if (!address || !isBlacklisted) {
        setCanWhitelist(false);
        return;
      }

      setIsSimulating(true);
      try {
        setCanWhitelist(!!simulationData?.request);
      } catch (error) {
        console.error('Whitelist simulation error:', error);
        setCanWhitelist(false);
      } finally {
        setIsSimulating(false);
      }
    };

    checkWhitelistability();
  }, [address, simulationData, isBlacklisted]);

  const handleWhitelist = async () => {
    if (!address || !contractAddress) return;

    // Switch chain if needed
    const isSwitched = await handleSwitchOriginChain(chainId, currentChainId);
    if (!isSwitched) {
      toast({
        title: 'Chain Switch Required',
        description: `Please switch to ${chainId === 8453 ? 'Base' : 'Mode'} to whitelist your address`,
        variant: 'destructive'
      });
      return;
    }

    try {
      const tx = await writeContractAsync({
        abi: emissionsManagerAbi,
        address: contractAddress,
        args: [address],
        functionName: 'whitelistUser',
        chainId
      });

      toast({
        title: 'Whitelist Transaction Submitted',
        description: 'Your whitelist transaction is being processed'
      });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      return tx;
    } catch (err) {
      console.error('Error whitelisting user:', err);
      toast({
        title: 'Whitelist Failed',
        description: 'There was an error processing your whitelist request',
        variant: 'destructive'
      });
      throw err;
    }
  };

  // Don't render anything if not blacklisted or can't whitelist
  if (
    !isBlacklisted ||
    (!canWhitelist && !isSimulating && !isSimulationFetching)
  ) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleWhitelist}
      disabled={
        isPending || isSimulating || isSimulationFetching || !canWhitelist
      }
      className="ml-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 border-red-900/50"
    >
      {isPending
        ? 'Whitelisting...'
        : isSimulating || isSimulationFetching
          ? 'Checking...'
          : 'Whitelist'}
    </Button>
  );
}
