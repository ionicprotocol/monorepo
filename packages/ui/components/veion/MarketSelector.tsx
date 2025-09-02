'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

import {
  Coins,
  Info,
  Database,
  Percent,
  LineChart,
  CircleDollarSign,
  Loader2
} from 'lucide-react';
import { erc20Abi, isAddress, formatUnits } from 'viem';
import { useAccount, useReadContract, useSwitchChain, useBalance } from 'wagmi';
import { base, mode } from 'wagmi/chains';

import { Button } from '@ui/components/ui/button';
import { Card, CardContent } from '@ui/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@ui/components/ui/select';
import { useMarketData } from '@ui/hooks/market/useMarketData';
import { useToast } from '@ui/hooks/use-toast';
import { useIncentiveSubmission } from '@ui/hooks/veion/useIncentiveSubmission';
import type { RewardTokenInfo } from '@ui/hooks/veion/useMarketIncentives';
import { useMarketIncentives } from '@ui/hooks/veion/useMarketIncentives';
import { useMarketVotes } from '@ui/hooks/veion/useMarketVotes';

const NetworkSelector = dynamic(
  () => import('@ui/components/markets/NetworkSelector'),
  { ssr: false }
);
const MaxDeposit = dynamic(() => import('../MaxDeposit'), { ssr: false });

interface MarketSelectorProps {
  isAcknowledged: boolean;
}

const MarketSelector = ({ isAcknowledged }: MarketSelectorProps) => {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const queryChain = searchParams.get('chain');
  const currentChain = queryChain || base.id.toString();
  const chainId = parseInt(currentChain);
  const poolId = currentChain === mode.id.toString() ? '1' : '0';

  const { chain, address } = useAccount();
  const { switchChain, isPending: isSwitchingNetwork } = useSwitchChain();
  const isWrongNetwork = chain?.id !== chainId;

  // Get market data
  const { marketData: rawMarketData, isLoading: isMarketDataLoading } =
    useMarketData(poolId, currentChain);

  // State variables
  const [selectedMarket, setSelectedMarket] = useState<string>('');
  const [selectedSide, setSelectedSide] = useState<'' | 'borrow' | 'supply'>(
    ''
  );
  const [selectedToken, setSelectedToken] = useState<RewardTokenInfo>();
  const [incentiveAmount, setIncentiveAmount] = useState<string>('');
  const [maxDepositKey, setMaxDepositKey] = useState<number>(0);

  // Extract all market addresses from raw market data
  const marketAddresses = useMemo(() => {
    if (!rawMarketData || !rawMarketData.length) return [];
    return rawMarketData.map((market) => market.cTokenAddress);
  }, [rawMarketData]);

  // Get votes data for all markets
  const { getMarketVotes, isLoading: isVotesLoading } = useMarketVotes(
    chainId,
    marketAddresses
  );

  // Define default token addresses
  const defaultTokenAddresses = useMemo(
    () => ({
      USDC:
        chainId === 8453
          ? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
          : '0xd988097fb8612cc24eeC14542bC03424c656005f',
      WETH:
        chainId === 8453
          ? '0x4200000000000000000000000000000000000006'
          : '0x4200000000000000000000000000000000000006',
      ION:
        chainId === 8453
          ? '0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5'
          : '0x18470019bf0e94611f15852f7e93cf5d65bc34ca'
    }),
    [chainId]
  );

  // Fetch balances for default tokens
  const { data: usdcBalance } = useBalance({
    address,
    token: defaultTokenAddresses.USDC as `0x${string}`,
    chainId,
    query: { enabled: !!address }
  });

  const { data: wethBalance } = useBalance({
    address,
    token: defaultTokenAddresses.WETH as `0x${string}`,
    chainId,
    query: { enabled: !!address }
  });

  const { data: ionBalance, error: ionBalanceError } = useBalance({
    address,
    token: defaultTokenAddresses.ION as `0x${string}`,
    chainId,
    query: { enabled: !!address }
  });

  // Debug ION balance fetching
  useEffect(() => {
    console.log('=== ION BALANCE DEBUG ===');
    console.log('Chain ID:', chainId);
    console.log('ION Address:', defaultTokenAddresses.ION);
    console.log('User Address:', address);
    console.log('ION Balance Data:', ionBalance);
    console.log('ION Balance Error:', ionBalanceError);
    console.log('=== END ION DEBUG ===');
  }, [
    chainId,
    defaultTokenAddresses.ION,
    address,
    ionBalance,
    ionBalanceError
  ]);

  // Default reward tokens that are always available
  const defaultRewardTokens: RewardTokenInfo[] = useMemo(
    () => [
      {
        symbol: 'USDC',
        address: defaultTokenAddresses.USDC,
        balance: usdcBalance
          ? formatUnits(usdcBalance.value, usdcBalance.decimals)
          : '0',
        name: 'USD Coin',
        cgId: 'usd-coin',
        decimals: 6,
        underlying_address: defaultTokenAddresses.USDC
      },
      {
        symbol: 'WETH',
        address: defaultTokenAddresses.WETH,
        balance: wethBalance
          ? formatUnits(wethBalance.value, wethBalance.decimals)
          : '0',
        name: 'Wrapped Ether',
        cgId: 'weth',
        decimals: 18,
        underlying_address: defaultTokenAddresses.WETH
      },
      {
        symbol: 'ION',
        address: defaultTokenAddresses.ION,
        balance: ionBalance
          ? formatUnits(ionBalance.value, ionBalance.decimals)
          : '0',
        name: 'Ionic Protocol',
        cgId: 'ionic-protocol',
        decimals: 18,
        underlying_address: defaultTokenAddresses.ION
      }
    ],
    [defaultTokenAddresses, usdcBalance, wethBalance, ionBalance]
  );

  // Update the useMarketIncentives hook usage to include getMarketIncentivesUsd
  const {
    getMarketIncentives,
    getMarketIncentivesUsd,
    getBribeAddress,
    rewardTokensInfo: hookRewardTokens,
    isLoading: isIncentivesLoading,
    fetchRewardTokensForBribe
  } = useMarketIncentives(
    chainId,
    marketAddresses,
    selectedSide,
    selectedMarket
  );

  // Always ensure default tokens are available, supplement with hook tokens
  const rewardTokensInfo = useMemo(() => {
    // Always start with our default tokens
    let finalTokens = [...defaultRewardTokens];

    // Debug logging
    console.log('=== TOKEN DEBUG ===');
    console.log('Default tokens count:', defaultRewardTokens.length);
    console.log(
      'Default tokens:',
      defaultRewardTokens.map((t) => `${t.symbol} (${t.balance})`)
    );
    console.log('Hook tokens count:', hookRewardTokens.length);
    console.log(
      'Hook tokens:',
      hookRewardTokens.map((t) => `${t.symbol} (${t.balance})`)
    );

    // Only merge if hook has tokens, otherwise stick with defaults
    if (hookRewardTokens.length > 0) {
      const combinedTokens = [...defaultRewardTokens];

      // Add additional tokens from the hook (e.g., EUSD)
      hookRewardTokens.forEach((hookToken) => {
        const existingIndex = combinedTokens.findIndex(
          (token) =>
            token.address.toLowerCase() === hookToken.address.toLowerCase()
        );

        if (existingIndex >= 0) {
          // Update existing token with hook balance data, but preserve our token metadata
          combinedTokens[existingIndex] = {
            ...combinedTokens[existingIndex],
            balance:
              hookToken.balance && hookToken.balance !== '0'
                ? hookToken.balance
                : combinedTokens[existingIndex].balance
          };
        } else {
          // Add new token from hook (like EUSD)
          combinedTokens.push(hookToken);
        }
      });

      finalTokens = combinedTokens;
    }

    console.log('Final tokens count:', finalTokens.length);
    console.log(
      'Final tokens:',
      finalTokens.map((t) => `${t.symbol} (${t.balance})`)
    );
    console.log('=== END DEBUG ===');

    return finalTokens;
  }, [defaultRewardTokens, hookRewardTokens]);

  // Incentive submission hook
  const {
    submitIncentive,
    isApproving,
    isSubmitting,
    isConfirming,
    error: submissionError
  } = useIncentiveSubmission();

  // Transform raw market data to include votes, incentives and USD values
  const marketData = useMemo(() => {
    if (!rawMarketData) return [];

    return rawMarketData.map((market) => {
      const marketAddress = market.cTokenAddress;

      // Get votes and incentives data
      const supplyVotes = getMarketVotes(marketAddress, 'supply');
      const borrowVotes = getMarketVotes(marketAddress, 'borrow');
      const supplyIncentives = getMarketIncentives(marketAddress, 'supply');
      const borrowIncentives = getMarketIncentives(marketAddress, 'borrow');

      // Get incentives USD values
      const supplyIncentivesUsd = getMarketIncentivesUsd(
        marketAddress,
        'supply'
      );
      const borrowIncentivesUsd = getMarketIncentivesUsd(
        marketAddress,
        'borrow'
      );

      return {
        asset: market.asset,
        underlyingSymbol: market.underlyingSymbol,
        cTokenAddress: market.cTokenAddress,
        supply: {
          total: market.supply?.total || 0,
          totalUSD: market.supply?.totalUSD || 0,
          yourUSD: market.supply?.balanceUSD || 0,
          balance: market.supply?.balance || 0
        },
        borrow: {
          total: market.borrow?.total || 0,
          totalUSD: market.borrow?.totalUSD || 0,
          yourUSD: market.borrow?.balanceUSD || 0,
          balance: market.borrow?.balance || 0
        },
        supplyAPR: market.supplyAPR || 0,
        borrowAPR: market.borrowAPR || 0,
        votes: {
          supply: supplyVotes,
          borrow: borrowVotes
        },
        incentives: {
          supply: supplyIncentives,
          borrow: borrowIncentives,
          supplyUsd: supplyIncentivesUsd,
          borrowUsd: borrowIncentivesUsd
        }
      };
    });
  }, [
    rawMarketData,
    getMarketVotes,
    getMarketIncentives,
    getMarketIncentivesUsd
  ]);

  // Market options for dropdown
  const marketOptions = useMemo(() => {
    if (!marketData) return [];
    return marketData.map((market) => ({
      value: market.cTokenAddress,
      label: market.asset,
      symbol: market.underlyingSymbol,
      address: market.cTokenAddress
    }));
  }, [marketData]);

  // Selected market data
  const selectedMarketData = useMemo(() => {
    return marketData?.find(
      (market) => market.cTokenAddress === selectedMarket
    );
  }, [marketData, selectedMarket]);

  // Handle token selection change
  const handleTokenChange = (token: string) => {
    const tokenInfo = rewardTokensInfo.find((t) => t.symbol === token);
    if (tokenInfo) {
      setSelectedToken(tokenInfo);
    }
  };

  // Update the side selection handler
  const handleSideChange = (value: string) => {
    const newSide = value as 'borrow' | 'supply';
    setSelectedSide(newSide);
    // Reset token when side changes
    setSelectedToken(undefined);
    setIncentiveAmount('');
  };

  // Update the market selection handler
  const handleMarketChange = (value: string) => {
    setSelectedMarket(value);
    // Reset side, token, and amount when market changes
    setSelectedSide('');
    setSelectedToken(undefined);
    setIncentiveAmount('');
  };

  // Handle incentive amount input
  const handleInput = (val: string) => {
    setIncentiveAmount(val);
  };

  // Handle form submission
  const { data: tokenDecimals } = useReadContract({
    address: selectedToken?.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'decimals',
    query: {
      enabled: !!selectedToken && isAddress(selectedToken.address)
    }
  });

  const refreshState = useCallback(async () => {
    if (!selectedMarket || !selectedSide) return;

    const bribeAddress = getBribeAddress(
      selectedMarket,
      selectedSide
    ) as `0x${string}`;

    if (!bribeAddress) return;

    setIncentiveAmount('');

    setMaxDepositKey((prevKey) => prevKey + 1);

    setTimeout(async () => {
      try {
        await fetchRewardTokensForBribe(bribeAddress);
      } catch (err) {
        console.error('Error refreshing token balances:', err);
      }
    }, 2000);
  }, [
    selectedMarket,
    selectedSide,
    getBribeAddress,
    fetchRewardTokensForBribe
  ]);

  const handleSubmit = async () => {
    if (
      !selectedMarket ||
      !selectedSide ||
      !incentiveAmount ||
      !selectedToken
    ) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    // Get the bribe address for the selected market and side
    const bribeAddress = getBribeAddress(
      selectedMarket,
      selectedSide
    ) as `0x${string}`;

    if (!bribeAddress) {
      toast({
        title: 'Error',
        description: 'Bribe address not found for the selected market and side',
        variant: 'destructive'
      });
      return;
    }

    // Start the process
    toast({
      title: 'Processing',
      description: 'Starting incentive submission process...'
    });

    // Send the incentive - network switching will happen first if needed
    const result = await submitIncentive({
      bribeAddress,
      tokenAddress: selectedToken.address as `0x${string}`,
      amount: incentiveAmount,
      tokenDecimals: Number(tokenDecimals) || 18
    });

    if (result.success) {
      toast({
        title: 'Success',
        description: 'Incentive successfully submitted!'
      });

      refreshState();
    } else {
      toast({
        title: 'Error',
        description: `Failed to submit incentive: ${result.error || submissionError || 'Unknown error'}`,
        variant: 'destructive'
      });

      // If network switching failed, show additional guidance
      if (result.error?.includes('network')) {
        toast({
          title: 'Network Error',
          description: 'Please try switching networks manually and try again',
          variant: 'destructive'
        });
      }
    }
  };

  useEffect(() => {
    if (rewardTokensInfo.length > 0 && !selectedToken) {
      setSelectedToken(rewardTokensInfo[0]);
    } else if (selectedToken) {
      const updatedToken = rewardTokensInfo.find(
        (token) => token.address === selectedToken.address
      );
      if (updatedToken && updatedToken.balance !== selectedToken.balance) {
        setSelectedToken(updatedToken);
      }
    }
  }, [rewardTokensInfo, selectedToken]);

  // Custom formatter for USD values
  const formatUsd = (value: number) => {
    if (!value || value === 0) return '$0.00';
    if (value < 0.01) return '<$0.01';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const isLoading =
    isMarketDataLoading ||
    isVotesLoading ||
    isIncentivesLoading ||
    isApproving ||
    isSubmitting ||
    isConfirming;

  const isFormComplete =
    selectedMarket && selectedSide && incentiveAmount && isAcknowledged;

  return (
    <Card className="bg-gradient-to-br from-grayone to-black border border-white/10 shadow-xl backdrop-blur-lg">
      <CardContent className="space-y-5 p-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-accent">
              Select Market
            </h2>
          </div>
          <NetworkSelector
            dropdownSelectedChain={+currentChain}
            nopool={true}
            enabledChains={[mode.id, base.id]}
          />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Select
              value={selectedMarket}
              onValueChange={handleMarketChange}
              disabled={isLoading || !isAcknowledged}
            >
              <SelectTrigger className="w-full bg-grayone border-white/10 text-white shadow-inner">
                <SelectValue placeholder="Choose a market" />
              </SelectTrigger>
              <SelectContent className="bg-grayone border-white/10 text-white shadow-lg">
                {marketOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="hover:text-black aria-selected:text-black"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={`/img/symbols/32/color/${option.symbol.toLowerCase()}.png`}
                        alt={option.label}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span>
                        {option.label} ({option.symbol})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedSide}
              onValueChange={handleSideChange}
              disabled={!selectedMarket || !isAcknowledged || isLoading}
            >
              <SelectTrigger className="w-full bg-grayone border-white/10 text-white shadow-inner">
                <div className="flex items-center gap-2">
                  <SelectValue placeholder="Choose supply or borrow" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-grayone border-white/10 text-white shadow-lg">
                <SelectItem
                  value="supply"
                  className="hover:text-black focus:text-black active:text-black data-[highlighted=true]:text-black aria-selected:text-black"
                >
                  <div className="flex items-center gap-2">
                    <span>Supply</span>
                  </div>
                </SelectItem>
                <SelectItem
                  value="borrow"
                  className="hover:text-black focus:text-black active:text-black data-[highlighted=true]:text-black aria-selected:text-black"
                >
                  <div className="flex items-center gap-2">
                    <span>Borrow</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <MaxDeposit
              key={maxDepositKey}
              headerText="Incentivize Amount"
              tokenName={selectedToken?.symbol}
              tokenSelector={true}
              tokenArr={rewardTokensInfo.map((token) => token.symbol)}
              max={selectedToken?.balance || '0'}
              chain={+currentChain}
              handleInput={(val?: string) => handleInput(val || '')}
              onTokenChange={handleTokenChange}
              showUtilizationSlider
              amount={incentiveAmount}
            />

            <Button
              className="w-full bg-accent hover:bg-accent/90 text-black font-semibold relative overflow-hidden transition-all duration-300"
              disabled={isApproving || isSubmitting || isConfirming}
              onClick={handleSubmit}
            >
              {isApproving || isSubmitting || isConfirming ? (
                <div className="flex items-center justify-center">
                  <Loader2
                    size={18}
                    className="mr-2 animate-spin"
                  />
                  <span>
                    {isApproving
                      ? 'Approving tokens...'
                      : isSubmitting
                        ? 'Submitting incentive...'
                        : 'Confirming transaction...'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <CircleDollarSign
                    size={18}
                    className="mr-2"
                  />
                  <span>Incentivize</span>
                </div>
              )}
            </Button>
          </div>

          {selectedMarket && selectedMarketData ? (
            <div className="space-y-4">
              {/* Market Balances table remains the same... */}

              <div className="bg-black/30 rounded-md p-3 space-y-2">
                <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <LineChart
                    size={16}
                    className="text-accent"
                  />
                  APR Rates & Incentives
                </h3>
                <div className="overflow-hidden rounded">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr>
                        <th className="bg-black/40 p-2 text-left font-medium text-white/80">
                          Type
                        </th>
                        <th className="bg-black/40 p-2 text-left font-medium text-white/80">
                          APR
                        </th>
                        <th className="bg-black/40 p-2 text-left font-medium text-white/80">
                          Votes
                        </th>
                        <th className="bg-black/40 p-2 text-left font-medium text-white/80">
                          Incentives
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="bg-black/20 p-2 text-white/70 border-t border-white/5">
                          <div className="flex items-center gap-1">Supply</div>
                        </td>
                        <td className="bg-black/20 p-2 border-t border-white/5">
                          <span className="text-green-400 font-medium flex items-center gap-1">
                            <Percent size={12} />
                            {selectedMarketData.supplyAPR.toFixed(2)}%
                          </span>
                        </td>
                        <td className="bg-black/20 p-2 border-t border-white/5">
                          <span className="text-blue-400 font-medium">
                            {(
                              selectedMarketData.votes.supply.value || 0
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </span>
                        </td>
                        {/* Updated incentives cell with USD value */}
                        <td className="bg-black/20 p-2 border-t border-white/5">
                          <div className="flex flex-col">
                            <span className="text-purple-400 font-medium">
                              {(
                                selectedMarketData.incentives.supply || 0
                              ).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </span>
                            <span className="text-purple-300/70 text-[10px] mt-0.5">
                              {formatUsd(
                                selectedMarketData.incentives.supplyUsd || 0
                              )}
                            </span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="bg-black/20 p-2 text-white/70 border-t border-white/5">
                          <div className="flex items-center gap-1">Borrow</div>
                        </td>
                        <td className="bg-black/20 p-2 border-t border-white/5">
                          <span className="text-red-400 font-medium flex items-center gap-1">
                            <Percent size={12} />
                            {selectedMarketData.borrowAPR.toFixed(2)}%
                          </span>
                        </td>
                        <td className="bg-black/20 p-2 border-t border-white/5">
                          <span className="text-blue-400 font-medium">
                            {(
                              selectedMarketData.votes.borrow.value || 0
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </span>
                        </td>
                        {/* Updated incentives cell with USD value */}
                        <td className="bg-black/20 p-2 border-t border-white/5">
                          <div className="flex flex-col">
                            <span className="text-purple-400 font-medium">
                              {(
                                selectedMarketData.incentives.borrow || 0
                              ).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </span>
                            <span className="text-purple-300/70 text-[10px] mt-0.5">
                              {formatUsd(
                                selectedMarketData.incentives.borrowUsd || 0
                              )}
                            </span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-black/30 rounded-md p-4 flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-grayone/60 border border-white/5">
                <Database
                  size={32}
                  className="text-white/60"
                />
              </div>
              <p className="text-white/80 font-medium">Market Information</p>
              <p className="text-white/60 text-sm text-center max-w-xs">
                Select a market from the dropdown above to view detailed
                information about balances, APR rates, and current incentives
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketSelector;
