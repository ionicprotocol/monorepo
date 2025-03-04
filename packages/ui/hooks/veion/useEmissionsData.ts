import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http, formatUnits } from 'viem';
import { base, mode } from 'viem/chains';
import {
  useAccount,
  useChainId,
  useWriteContract,
  useSimulateContract
} from 'wagmi';

import { useToast } from '@ui/hooks/use-toast';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import type { Address } from 'viem';

import { emissionsManagerAbi } from '@ionicprotocol/sdk';

// Mapping of chain IDs to emissions manager contract addresses
const EMISSIONS_MANAGER_ADDRESSES: Record<number, Address> = {
  8453: '0x74Dd8c217C01463b915A7e62879A496b3A5c07a5', // Base
  34443: '0x2AA38965C8D37065Ed07EF7F5de6e341B4B9DAc7' // Mode
};

// Pre-initialize public clients for supported chains
const publicClients = {
  [base.id]: createPublicClient({
    chain: base,
    transport: http()
  }),
  [mode.id]: createPublicClient({
    chain: mode,
    transport: http()
  })
};

// Number of decimals for the collateral token (typically 18 for most ERC20 tokens)
const COLLATERAL_DECIMALS = 18;

interface EmissionsData {
  collateralBp: bigint | undefined;
  collateralPercentage: string | undefined;
  totalCollateral: bigint | undefined;
  formattedTotalCollateral: string | undefined;
  isUserBlacklisted: boolean | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<any>;
  whitelistUser: {
    execute: () => Promise<`0x${string}` | void>;
    isPending: boolean;
    isSimulating: boolean;
    canWhitelist: boolean;
  };
}

export function useEmissionsData(chainId: number): EmissionsData {
  const { address } = useAccount();
  const currentChainId = useChainId();
  const { toast } = useToast();
  const { writeContractAsync, isPending } = useWriteContract();

  const contractAddress = EMISSIONS_MANAGER_ADDRESSES[chainId];
  const publicClient = publicClients[chainId as keyof typeof publicClients];

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['emissionsData', chainId, address],
    queryFn: async () => {
      if (!publicClient || !contractAddress) {
        throw new Error(
          `No public client or contract address for chain ID: ${chainId}`
        );
      }

      try {
        // Fetch collateralBp
        const collateralBp = await publicClient.readContract({
          address: contractAddress,
          abi: emissionsManagerAbi,
          functionName: 'collateralBp'
        });

        // Initialize with defaults
        let totalCollateral;
        let isUserBlacklisted = false;

        // Only fetch user-specific data if an address is available
        if (address) {
          // Fetch blacklist status and total collateral in parallel
          const [blacklistResult, collateralResult] = await Promise.all([
            publicClient.readContract({
              address: contractAddress,
              abi: emissionsManagerAbi,
              functionName: 'isUserBlacklisted',
              args: [address]
            }),
            publicClient.readContract({
              address: contractAddress,
              abi: emissionsManagerAbi,
              functionName: 'getUserTotalCollateral',
              args: [address]
            })
          ]);

          isUserBlacklisted = blacklistResult;
          totalCollateral = collateralResult;
        }

        return {
          collateralBp,
          totalCollateral,
          isUserBlacklisted
        };
      } catch (error) {
        console.error('Error fetching emissions data:', error);
        throw error;
      }
    },
    enabled: !!publicClient && !!contractAddress
  });

  // Simulation data for the whitelistUser function
  const { data: simulationData, isFetching: isSimulating } =
    useSimulateContract({
      address: contractAddress as `0x${string}`,
      abi: emissionsManagerAbi,
      functionName: 'whitelistUser',
      args: address ? [address] : undefined,
      chainId,
      query: {
        enabled: !!address && !!data?.isUserBlacklisted
      }
    });

  // Execute whitelist function
  const whitelistUser = async () => {
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
        address: contractAddress as `0x${string}`,
        args: [address],
        functionName: 'whitelistUser',
        chainId
      });

      toast({
        title: 'Whitelist Transaction Submitted',
        description: 'Your whitelist transaction is being processed'
      });

      // Refetch data after transaction
      await refetch();

      return tx;
    } catch (err) {
      console.error('Error whitelisting user:', err);
      toast({
        title: 'Whitelist Failed',
        description: 'There was an error processing your whitelist request',
        variant: 'destructive'
      });
    }
  };

  // Calculate human-readable percentage (10000 basis points = 100%)
  const collateralPercentage = data?.collateralBp
    ? ((Number(data.collateralBp) / 10000) * 100).toFixed(2) + '%'
    : undefined;

  // Format the total collateral with appropriate decimals
  const formattedTotalCollateral = data?.totalCollateral
    ? formatUnits(data.totalCollateral, COLLATERAL_DECIMALS)
    : undefined;

  const canWhitelist = Boolean(
    simulationData?.request && data?.isUserBlacklisted
  );

  return {
    collateralBp: data?.collateralBp,
    collateralPercentage,
    totalCollateral: data?.totalCollateral,
    formattedTotalCollateral,
    isUserBlacklisted: data?.isUserBlacklisted,
    isLoading,
    isError,
    refetch,
    whitelistUser: {
      execute: whitelistUser,
      isPending,
      isSimulating,
      canWhitelist
    }
  };
}
