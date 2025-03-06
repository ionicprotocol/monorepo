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
import { erc20Abi, isAddress } from 'viem';
import { useAccount, useReadContract, useSwitchChain } from 'wagmi';
import { base, mode } from 'wagmi/chains';

import TokenBalance from '@ui/components/markets/Cells/TokenBalance';
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

  const { chain } = useAccount();
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

  // Update the useMarketIncentives hook usage
  const {
    getMarketIncentives,
    getBribeAddress,
    // rewardTokens,
    rewardTokensInfo,
    isLoading: isIncentivesLoading,
    fetchRewardTokensForBribe
  } = useMarketIncentives(
    chainId,
    marketAddresses,
    selectedSide,
    selectedMarket
  );

  // Incentive submission hook
  const {
    submitIncentive,
    isApproving,
    isSubmitting,
    isConfirming,
    error: submissionError
  } = useIncentiveSubmission();

  // Set default token when reward tokens are loaded
  useEffect(() => {
    if (rewardTokensInfo && rewardTokensInfo.length > 0 && !selectedToken) {
      setSelectedToken(rewardTokensInfo[0]);
    }
  }, [rewardTokensInfo, selectedToken]);

  // Reset form when chain changes
  useEffect(() => {
    setSelectedMarket('');
    setSelectedSide('');
    setSelectedToken(undefined);
    setIncentiveAmount('');
  }, [currentChain]);

  // Transform raw market data to include votes and incentives
  const marketData = useMemo(() => {
    if (!rawMarketData) return [];

    return rawMarketData.map((market) => {
      const marketAddress = market.cTokenAddress;

      // Get votes and incentives data
      const supplyVotes = getMarketVotes(marketAddress, 'supply');
      const borrowVotes = getMarketVotes(marketAddress, 'borrow');
      const supplyIncentives = getMarketIncentives(marketAddress, 'supply');
      const borrowIncentives = getMarketIncentives(marketAddress, 'borrow');

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
          borrow: borrowIncentives
        }
      };
    });
  }, [rawMarketData, getMarketVotes, getMarketIncentives]);

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

            {isIncentivesLoading ? (
              <div className="relative p-6 border border-white/10 rounded-md bg-grayone animate-pulse">
                <div className="flex items-center justify-center space-x-2">
                  <Loader2
                    size={20}
                    className="text-accent animate-spin"
                  />
                  <div className="text-center text-white/60 text-sm">
                    Loading reward tokens...
                  </div>
                </div>
              </div>
            ) : rewardTokensInfo.length === 0 ? (
              <div className="p-6 border border-white/10 rounded-md bg-grayone/80">
                <div className="flex items-center justify-center">
                  <Info
                    size={20}
                    className="text-yellow-400 mr-2"
                  />
                  <span className="text-white/80 font-medium">
                    No Reward Tokens Available
                  </span>
                </div>
                <p className="mt-2 text-center text-white/60 text-sm">
                  There are currently no tokens available for incentives. Please
                  check back later or contact the Ionic team.
                </p>
              </div>
            ) : (
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
            )}

            {isWrongNetwork ? (
              // Show network switch button when on wrong network
              <Button
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold relative overflow-hidden transition-all duration-300"
                disabled={isSwitchingNetwork}
                onClick={() => switchChain({ chainId })}
              >
                {isSwitchingNetwork ? (
                  <div className="flex items-center justify-center">
                    <Loader2
                      size={18}
                      className="mr-2 animate-spin"
                    />
                    <span>
                      Switching to {chainId === 8453 ? 'Base' : 'Mode'}{' '}
                      network...
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>
                      Switch to {chainId === 8453 ? 'Base' : 'Mode'} Network
                      First
                    </span>
                  </div>
                )}
              </Button>
            ) : (
              // Show incentivize button when on correct network
              <Button
                className="w-full bg-accent hover:bg-accent/90 text-black font-semibold relative overflow-hidden transition-all duration-300"
                disabled={
                  !isFormComplete || isLoading || rewardTokensInfo.length === 0
                }
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
            )}
          </div>

          {selectedMarket && selectedMarketData ? (
            <div className="space-y-4">
              <div className="bg-black/30 rounded-md p-3 space-y-2">
                <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <Database
                    size={16}
                    className="text-accent"
                  />
                  Market Balances
                </h3>
                <div className="overflow-hidden rounded">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr>
                        <th className="bg-black/40 p-2 text-left font-medium text-white/80">
                          Type
                        </th>
                        <th className="bg-black/40 p-2 text-left font-medium text-white/80">
                          Total Market
                        </th>
                        <th className="bg-black/40 p-2 text-left font-medium text-white/80">
                          Your Position
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="bg-black/20 p-2 text-white/70 border-t border-white/5">
                          <div className="flex items-center gap-1">Supply</div>
                        </td>
                        <td className="bg-black/20 p-2 border-t border-white/5">
                          <TokenBalance
                            balance={selectedMarketData.supply.total}
                            balanceUSD={selectedMarketData.supply.totalUSD}
                            tokenName={selectedMarketData.underlyingSymbol}
                          />
                        </td>
                        <td className="bg-black/20 p-2 border-t border-white/5">
                          <TokenBalance
                            balance={selectedMarketData.supply.balance}
                            balanceUSD={selectedMarketData.supply.yourUSD}
                            tokenName={selectedMarketData.underlyingSymbol}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="bg-black/20 p-2 text-white/70 border-t border-white/5">
                          <div className="flex items-center gap-1">Borrow</div>
                        </td>
                        <td className="bg-black/20 p-2 border-t border-white/5">
                          <TokenBalance
                            balance={selectedMarketData.borrow.total}
                            balanceUSD={selectedMarketData.borrow.totalUSD}
                            tokenName={selectedMarketData.underlyingSymbol}
                          />
                        </td>
                        <td className="bg-black/20 p-2 border-t border-white/5">
                          <TokenBalance
                            balance={selectedMarketData.borrow.balance}
                            balanceUSD={selectedMarketData.borrow.yourUSD}
                            tokenName={selectedMarketData.underlyingSymbol}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

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
                        <td className="bg-black/20 p-2 border-t border-white/5">
                          <span className="text-purple-400 font-medium">
                            {(
                              selectedMarketData.incentives.supply || 0
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </span>
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
                        <td className="bg-black/20 p-2 border-t border-white/5">
                          <span className="text-purple-400 font-medium">
                            {(
                              selectedMarketData.incentives.borrow || 0
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </span>
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
