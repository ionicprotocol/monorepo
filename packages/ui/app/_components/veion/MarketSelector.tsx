import { useState } from 'react';

import Image from 'next/image';

import { ChevronDown } from 'lucide-react';

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

import MaxDeposit from '../stake/MaxDeposit';

// Define networks data
const networks = [
  { id: 'mode', name: 'Mode', logo: '/img/logo/MODE.png' },
  { id: 'base', name: 'Base', logo: '/img/logo/BASE.png' },
  { id: 'op', name: 'Optimism', logo: '/img/logo/OP.png' }
];

const sides = [
  { id: 'lend', name: 'Lend' },
  { id: 'borrow', name: 'Borrow' }
];

const MarketSelector = ({ isAcknowledged }: { isAcknowledged: boolean }) => {
  const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);
  const [selectedSide, setSelectedSide] = useState(sides[0]);

  return (
    <Card className="bg-grayone">
      <CardContent className="space-y-6 p-6">
        <CardHeader className="p-0">
          <CardTitle>Choose Market & Side</CardTitle>
        </CardHeader>

        <div className="flex items-center gap-4">
          {/* Network Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 bg-graylite p-2 rounded-lg cursor-pointer hover:bg-graylite/80">
                <Image
                  src={selectedNetwork.logo}
                  alt={selectedNetwork.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span>{selectedNetwork.name}</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-grayone border-graylite">
              {networks.map((network) => (
                <DropdownMenuItem
                  key={network.id}
                  onClick={() => setSelectedNetwork(network)}
                  className="flex items-center gap-2 hover:bg-graylite cursor-pointer"
                >
                  <Image
                    src={network.logo}
                    alt={network.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  {network.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Side Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 bg-graylite p-2 rounded-lg cursor-pointer hover:bg-graylite/80">
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

        <div className="grid grid-cols-2 gap-4 text-white/60">
          <div>
            <div className="flex justify-between">
              <span>Supply</span>
              <span>16,009,106</span>
            </div>
            <div className="flex justify-between">
              <span>Borrow</span>
              <span>10,007,070</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between">
              <span>YOUR BALANCE</span>
              <span>00.00</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-white/60">
          <div>
            <div>APRS</div>
            <div>Supply 5%</div>
            <div>Borrow 11.9%</div>
          </div>
          <div>
            <div>VOTES</div>
            <div>7,712,972.73</div>
            <div>7,712,972.73</div>
          </div>
          <div>
            <div>INCENTIVES</div>
            <div>$11.57</div>
            <div>$11.57</div>
          </div>
        </div>

        <MaxDeposit
          headerText={`${selectedNetwork.name} Balance: 00.00`}
          chain={1}
          tokenName={selectedNetwork.name.toUpperCase()}
        />

        <Button
          className="w-full bg-green-400 text-black transition-opacity"
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
