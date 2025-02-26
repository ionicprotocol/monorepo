'use client';

import { useState, useMemo } from 'react';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

import { base, mode } from 'wagmi/chains';

import CustomTooltip from '@ui/components/CustomTooltip';
import { Card, CardContent } from '@ui/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@ui/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@ui/components/ui/table';
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

  return (
    <Card className="bg-gradient-to-br from-grayone to-black border border-white/10 shadow-xl backdrop-blur-lg">
      <CardContent className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-accent">
            Select Market
          </h2>
          <NetworkSelector
            dropdownSelectedChain={+currentChain}
            nopool={true}
            enabledChains={[mode.id, base.id]}
          />
        </div>

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
                    width={28}
                    height={28}
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

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white">Select Side</h2>
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
        </div>

        {selectedMarket && selectedMarketData && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                Market Balances
              </h2>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-white/80">Type</TableHead>
                    <TableHead className="text-white/80">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-white/5">
                    <TableCell className="text-white">Supply</TableCell>
                    <TableCell className="text-white">
                      <div>
                        {formatNumber(selectedMarketData.supply.total)}{' '}
                        {selectedMarketData.underlyingSymbol}
                      </div>
                      <div className="text-white/60">
                        {formatNumber(selectedMarketData.supply.totalUSD, true)}
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-white/5">
                    <TableCell className="text-white">Borrow</TableCell>
                    <TableCell className="text-white">
                      <div>
                        {formatNumber(selectedMarketData.borrow.total)}{' '}
                        {selectedMarketData.underlyingSymbol}
                      </div>
                      <div className="text-white/60">
                        {formatNumber(selectedMarketData.borrow.totalUSD, true)}
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                Market Metrics
              </h2>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-white/80">Type</TableHead>
                    <TableHead className="text-white/80">APR</TableHead>
                    <TableHead className="text-white/80">Votes</TableHead>
                    <TableHead className="text-white/80">Incentives</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-white/5">
                    <TableCell className="text-white">Supply</TableCell>
                    <TableCell className="text-white">
                      {selectedMarketData.supplyAPR.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-white">0</TableCell>
                    <TableCell className="text-white">0</TableCell>
                  </TableRow>
                  <TableRow className="border-white/5">
                    <TableCell className="text-white">Borrow</TableCell>
                    <TableCell className="text-white">
                      {selectedMarketData.borrowAPR.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-white">0</TableCell>
                    <TableCell className="text-white">0</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                Provide Incentives
              </h2>
              <MaxDeposit
                headerText="Incentivize Amount"
                tokenName={selectedToken} // Use local state for token
                tokenSelector={true}
                tokenArr={tokenOptions}
                chain={+currentChain}
                // handleInput={(val) => console.log('Amount:', val)} // Placeholder for amount handling
                onTokenChange={handleTokenChange} // Pass callback for token selection
              />
            </div>
          </div>
        )}

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
