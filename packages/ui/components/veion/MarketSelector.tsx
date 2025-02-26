'use client';

import { useState, useMemo } from 'react';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

import { base, mode } from 'wagmi/chains';

import CustomTooltip from '@ui/components/CustomTooltip';
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

const NetworkSelector = dynamic(
  () => import('@ui/components/markets/NetworkSelector'),
  { ssr: false }
);
const MaxDeposit = dynamic(() => import('../MaxDeposit'), { ssr: false });

interface MarketSelectorProps {
  isAcknowledged: boolean;
}

interface MarketData {
  asset: string;
  underlyingSymbol: string;
  cTokenAddress: string;
  supply: { total: number; totalUSD: number };
  borrow: { total: number; totalUSD: number };
  supplyAPR: number;
  borrowAPR: number;
}

const MarketSelector = ({ isAcknowledged }: MarketSelectorProps) => {
  const searchParams = useSearchParams();
  const queryChain = searchParams.get('chain');
  const currentChain = queryChain || base.id.toString();
  const poolId = currentChain === mode.id.toString() ? '1' : '0';
  const { marketData, isLoading } = useMarketData(poolId, currentChain);

  const [selectedMarket, setSelectedMarket] = useState<string>('');
  const [selectedSide, setSelectedSide] = useState<'' | 'borrow' | 'supply'>(
    ''
  );
  const [selectedToken, setSelectedToken] = useState<string>(
    currentChain === mode.id.toString() ? 'mode' : 'ion' // Default token based on chain
  );
  const [incentiveAmount, setIncentiveAmount] = useState<string>('');

  const marketOptions = useMemo(() => {
    if (!marketData) return [];
    return marketData.map((market: MarketData) => ({
      value: market.cTokenAddress,
      label: market.asset,
      symbol: market.underlyingSymbol,
      address: market.cTokenAddress
    }));
  }, [marketData]);

  const selectedMarketData = useMemo(() => {
    return marketData?.find(
      (market: MarketData) => market.cTokenAddress === selectedMarket
    );
  }, [marketData, selectedMarket]);

  const tokenOptions = useMemo(() => {
    return currentChain === mode.id.toString()
      ? ['mode', 'ion']
      : ['ion', 'eth'];
  }, [currentChain]);

  const formatNumber = (num: number, isUSD: boolean = false) =>
    isUSD
      ? `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : num.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });

  const handleTokenChange = (token: string) => {
    setSelectedToken(token);
  };

  const handleInput = (val: string) => {
    setIncentiveAmount(val);
  };

  const isFormComplete =
    selectedMarket && selectedSide && incentiveAmount && isAcknowledged;

  return (
    <Card className="bg-gradient-to-br from-grayone to-black border border-white/10 shadow-xl backdrop-blur-lg">
      <CardContent className="space-y-5 p-5">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-accent">
            Select Market
          </h2>
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
              onValueChange={setSelectedMarket}
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
              onValueChange={(value) =>
                setSelectedSide(value as 'borrow' | 'supply')
              }
              disabled={!selectedMarket || !isAcknowledged}
            >
              <SelectTrigger className="w-full bg-grayone border-white/10 text-white shadow-inner">
                <SelectValue placeholder="Choose supply or borrow" />
              </SelectTrigger>
              <SelectContent className="bg-grayone border-white/10 text-white shadow-lg">
                <SelectItem value="supply">Supply</SelectItem>
                <SelectItem value="borrow">Borrow</SelectItem>
              </SelectContent>
            </Select>

            <MaxDeposit
              headerText="Incentivize Amount"
              tokenName={selectedToken}
              tokenSelector={true}
              tokenArr={tokenOptions}
              chain={+currentChain}
              handleInput={(val?: string) => handleInput(val || '')}
              onTokenChange={handleTokenChange}
            />

            <Button
              className="w-full bg-accent hover:bg-accent/90 text-black font-semibold"
              disabled={!isFormComplete}
            >
              Incentivize
            </Button>
          </div>

          {selectedMarket && selectedMarketData ? (
            <div className="space-y-4">
              <div className="bg-black/30 rounded-md p-3 space-y-2">
                <h3 className="text-sm font-medium text-white/80">
                  Market Balances
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between bg-black/20 p-2 rounded">
                    <span className="text-white/70">Supply:</span>
                    <span className="text-white font-medium">
                      {formatNumber(selectedMarketData.supply.total)}{' '}
                      {selectedMarketData.underlyingSymbol}
                    </span>
                  </div>
                  <div className="flex justify-between bg-black/20 p-2 rounded">
                    <span className="text-white/70">Supply USD:</span>
                    <span className="text-white font-medium">
                      {formatNumber(selectedMarketData.supply.totalUSD, true)}
                    </span>
                  </div>
                  <div className="flex justify-between bg-black/20 p-2 rounded">
                    <span className="text-white/70">Borrow:</span>
                    <span className="text-white font-medium">
                      {formatNumber(selectedMarketData.borrow.total)}{' '}
                      {selectedMarketData.underlyingSymbol}
                    </span>
                  </div>
                  <div className="flex justify-between bg-black/20 p-2 rounded">
                    <span className="text-white/70">Borrow USD:</span>
                    <span className="text-white font-medium">
                      {formatNumber(selectedMarketData.borrow.totalUSD, true)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 rounded-md p-3 space-y-2">
                <h3 className="text-sm font-medium text-white/80">APR Rates</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between bg-black/20 p-2 rounded">
                    <span className="text-white/70">Supply APR:</span>
                    <span className="text-green-400 font-medium">
                      {selectedMarketData.supplyAPR.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between bg-black/20 p-2 rounded">
                    <span className="text-white/70">Borrow APR:</span>
                    <span className="text-red-400 font-medium">
                      {selectedMarketData.borrowAPR.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-black/30 rounded-md p-4 flex items-center justify-center">
              <p className="text-white/60 text-sm text-center">
                Select a market to view detailed information
              </p>
            </div>
          )}
        </div>

        <div className="bg-black/30 rounded-md p-3 text-white/80 text-sm">
          <p>
            Choose the market, pool and side to provide incentives to. ION
            emissions allocated by the voters will be given to all the veION
            token holders.
          </p>
        </div>

        {!isAcknowledged && (
          <div className="text-white/60 text-sm">
            <CustomTooltip content="You must acknowledge the Epoch Info terms before selecting markets or providing incentives.">
              <span className="underline cursor-help">
                Acknowledge required
              </span>
            </CustomTooltip>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketSelector;
