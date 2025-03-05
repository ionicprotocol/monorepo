import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http, formatUnits } from 'viem';
import { base, mode } from 'viem/chains';
import {
  useAccount,
  useChainId,
  useWriteContract,
  useSimulateContract
} from 'wagmi';

import { getVeIonContract } from '@ui/constants/veIon';
import { useToast } from '@ui/hooks/use-toast';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import { useUsdPrice } from '../useUsdPrices';

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
// Maximum basis points constant from the contract
const MAXIMUM_BASIS_POINTS = 10000;

interface EmissionsData {
  collateralBp: bigint | undefined;
  collateralPercentage: string | undefined;
  collateralPercentageNumeric: number | undefined;
  totalCollateral: bigint | undefined;
  formattedTotalCollateral: string | undefined;
  veIonValue: bigint | undefined;
  formattedVeIonValue: string | undefined;
  veIonBalanceUsd: number; // Added for consistency with display
  actualRatio: number | undefined;
  isUserBlacklisted: boolean | undefined;
  isLoading: boolean;
  isError: boolean;
  totalCollateralUsd: number | undefined;
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
  const veIonContract = getVeIonContract(chainId);

  // Get ETH price using the existing hook
  const { data: ethPriceData } = useUsdPrice(chainId);
  const ethPrice = ethPriceData || 0;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['emissionsData', chainId, address, ethPrice],
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
        let veIonValue;
        let isUserBlacklisted = false;

        // Only fetch user-specific data if an address is available
        if (address) {
          // Fetch blacklist status and total collateral in parallel
          const [blacklistResult, collateralResult, veIonAddress] =
            await Promise.all([
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
              }),
              publicClient.readContract({
                address: contractAddress,
                abi: emissionsManagerAbi,
                functionName: 'veION'
              })
            ]);

          isUserBlacklisted = blacklistResult;
          totalCollateral = collateralResult;

          // Fetch the veION value if the veION address is valid
          console.log('veIonAddress', veIonAddress);
          if (
            veIonAddress &&
            veIonAddress !== '0x0000000000000000000000000000000000000000'
          ) {
            try {
              veIonValue = await publicClient.readContract({
                address: veIonAddress,
                abi: veIonContract.abi,
                functionName: 'getTotalEthValueOfTokens',
                args: [address]
              });
            } catch (error) {
              console.error('Error fetching veION value:', error);
              // Keep the default undefined value
            }
          }
        }

        return {
          collateralBp,
          totalCollateral,
          veIonValue,
          isUserBlacklisted
        };
      } catch (error) {
        console.error('Error fetching emissions data:', error);
        throw error;
      }
    },
    enabled: !!publicClient && !!contractAddress && !!address
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
    ? ((Number(data.collateralBp) / MAXIMUM_BASIS_POINTS) * 100).toFixed(2) +
      '%'
    : undefined;

  // Add numeric percentage for easier comparison (without the % symbol)
  const collateralPercentageNumeric = data?.collateralBp
    ? (Number(data.collateralBp) / MAXIMUM_BASIS_POINTS) * 100
    : undefined;

  // Format the total collateral with appropriate decimals (ETH)
  const formattedTotalCollateral = data?.totalCollateral
    ? formatUnits(data.totalCollateral, COLLATERAL_DECIMALS)
    : undefined;

  // Format the veION value with appropriate decimals (ETH)
  const formattedVeIonValue = data?.veIonValue
    ? formatUnits(data.veIonValue, COLLATERAL_DECIMALS)
    : undefined;

  // Calculate USD values using the SAME exchange rate for both
  const totalCollateralEth = formattedTotalCollateral
    ? parseFloat(formattedTotalCollateral)
    : 0;

  const veIonValueEth = formattedVeIonValue
    ? parseFloat(formattedVeIonValue)
    : 0;

  // Convert to USD using the same exchange rate
  const totalCollateralUsd = totalCollateralEth * ethPrice;
  const veIonBalanceUsd = veIonValueEth * ethPrice;

  // Calculate the actual ratio using the same formula as the contract
  // (userLPValue * MAXIMUM_BASIS_POINTS) / userCollateralValue >= collateralBp
  // In percentage terms: (userLPValue / userCollateralValue) * 100 >= (collateralBp / MAXIMUM_BASIS_POINTS) * 100
  let actualRatio: number | undefined = undefined;
  if (data?.totalCollateral && data.totalCollateral > 0n && data?.veIonValue) {
    const lpValueBigInt = data.veIonValue;
    const collateralValueBigInt = data.totalCollateral;

    // To avoid precision loss, we'll do the multiplication before the division
    // and then convert to number for display
    if (collateralValueBigInt > 0n) {
      const ratioBigInt =
        (lpValueBigInt * BigInt(MAXIMUM_BASIS_POINTS)) / collateralValueBigInt;
      actualRatio = Number(ratioBigInt) / 100; // Convert basis points to percentage
    }
  }

  const canWhitelist = Boolean(
    simulationData?.request && data?.isUserBlacklisted
  );

  return {
    collateralBp: data?.collateralBp,
    collateralPercentage,
    collateralPercentageNumeric,
    totalCollateral: data?.totalCollateral,
    formattedTotalCollateral,
    veIonValue: data?.veIonValue,
    formattedVeIonValue,
    veIonBalanceUsd,
    totalCollateralUsd,
    actualRatio,
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
