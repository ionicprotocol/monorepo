import { useState } from 'react';

import { ChevronDown } from 'lucide-react';
import { base, mode } from 'viem/chains';

import { Button } from '@ui/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@ui/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@ui/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@ui/components/ui/table';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { getToken } from '@ui/utils/getStakingTokens';

import MaxDeposit from '../MaxDeposit';
import NetworkDropdown from '../NetworkDropdown';

const sides = [
  { id: 'lend', name: 'Lend' },
  { id: 'borrow', name: 'Borrow' }
];

const MarketSelector = ({ isAcknowledged }: { isAcknowledged: boolean }) => {
  const { currentChain, balances } = useVeIONContext(); // Add veIonBalance
  const { veIon: veIonBalance } = balances;
  const [selectedSide, setSelectedSide] = useState(sides[0]);
  const [amount, setAmount] = useState<string>('0');

  return (
    <Card className="bg-grayone">
      <CardContent className="space-y-8 p-6">
        <CardHeader className="p-0">
          <CardTitle>Choose Market & Side</CardTitle>
        </CardHeader>

        <div className="flex items-center gap-4">
          <NetworkDropdown
            dropdownSelectedChain={currentChain}
            nopool
            enabledChains={[base.id, mode.id]}
            upcomingChains={['Optimism']}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 bg-grayUnselect px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-700">
                <span>{selectedSide.name}</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-grayone border-graylite">
              {sides.map((side) => (
                <DropdownMenuItem
                  key={side.id}
                  onClick={() => setSelectedSide(side)}
                  className="hover:bg-graylite cursor-pointer"
                >
                  {side.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* First Table - Balances */}
        <Table
          compact
          className="text-gray-400"
        >
          <TableHeader>
            <TableRow>
              <TableHead className="w-32" />
              <TableHead>TOTAL BALANCES</TableHead>
              <TableHead>YOUR BALANCE</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Supply</TableCell>
              <TableCell>16,009,106</TableCell>
              <TableCell>00.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Borrow</TableCell>
              <TableCell>10,007,070</TableCell>
              <TableCell>00.00</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* Second Table - Market Metrics */}
        <Table
          compact
          className="text-gray-400"
        >
          <TableHeader>
            <TableRow>
              <TableHead className="w-32" />
              <TableHead>APRS</TableHead>
              <TableHead>VOTES</TableHead>
              <TableHead>INCENTIVES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Supply</TableCell>
              <TableCell>5%</TableCell>
              <TableCell>7,712,972.73</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-[#C3FF56] rounded-full flex items-center justify-center text-black font-bold">
                    M
                  </div>
                  <span>$11.57</span>
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Borrow</TableCell>
              <TableCell>11.9%</TableCell>
              <TableCell>7,712,972.73</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-[#C3FF56] rounded-full flex items-center justify-center text-black font-bold">
                    M
                  </div>
                  <span>$11.57</span>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <MaxDeposit
          headerText="LOCK AMOUNT"
          max={String(veIonBalance)}
          amount={amount}
          tokenName="ion/weth"
          token={getToken(currentChain)}
          handleInput={(val?: string) => setAmount(val || '0')}
          chain={currentChain}
          showUtilizationSlider
        />

        <Button
          className="w-full bg-green-400 hover:bg-[#B3EF46] text-black transition-opacity rounded-2xl h-14 text-lg font-medium"
          disabled={!isAcknowledged}
          style={{ opacity: isAcknowledged ? 1 : 0.7 }}
        >
          Incentivize
        </Button>
      </CardContent>
    </Card>
  );
};

export default MarketSelector;
